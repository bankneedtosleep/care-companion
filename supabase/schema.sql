do $$ begin
  create type public.user_role as enum ('customer', 'companion', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.request_status as enum ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references public.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  experience text,
  skills text[] not null default '{}',
  service_areas text[] not null default '{}',
  availability text,
  updated_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  companion_id uuid references public.users(id) on delete set null,
  errand_type text not null,
  service_date date not null,
  start_time time not null,
  origin text not null,
  destination text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  details text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists requests_customer_id_idx on public.requests(customer_id);
create index if not exists requests_companion_id_idx on public.requests(companion_id);
create index if not exists requests_status_date_idx on public.requests(status, service_date);

create or replace function public.set_my_role(selected_role public.user_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  if selected_role not in ('customer', 'companion') then
    raise exception 'Only customer or companion roles can be selected during onboarding';
  end if;
  if exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Admin roles can only be changed by a project owner';
  end if;
  update public.users set role = selected_role where id = auth.uid();
end;
$$;

revoke all on function public.set_my_role(public.user_role) from public;
grant execute on function public.set_my_role(public.user_role) to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.requests enable row level security;

drop policy if exists "Users can view their own account" on public.users;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Profiles are publicly readable" on public.profiles;
drop policy if exists "Customers create their own requests" on public.requests;
drop policy if exists "Participants view requests" on public.requests;
drop policy if exists "Customers update their requests" on public.requests;

create policy "Users can view their own account" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Customers create their own requests" on public.requests for insert with check (auth.uid() = customer_id);
create policy "Participants view requests" on public.requests for select using (auth.uid() = customer_id or auth.uid() = companion_id);
create policy "Customers update their requests" on public.requests for update using (auth.uid() = customer_id);

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Business rules and access controls -------------------------------------------------
-- Admin accounts are intentionally assigned by a project owner in Supabase, never from
-- the client. This helper keeps the RLS policies below from recursively querying users.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_role(expected_role public.user_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = expected_role
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.has_role(public.user_role) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_role(public.user_role) to authenticated;

-- Only the carefully selected public Companion fields are exposed. Phone numbers and
-- emails stay private until the platform's service flow makes them necessary.
create or replace function public.list_companions()
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  bio text,
  experience text,
  skills text[],
  service_areas text[],
  availability text
)
language sql stable security definer set search_path = public as $$
  select p.id, p.full_name, p.avatar_url, p.bio, p.experience, p.skills,
    p.service_areas, p.availability
  from public.profiles p
  inner join public.users u on u.id = p.id
  where u.role = 'companion'
  order by coalesce(p.full_name, '');
$$;

revoke all on function public.list_companions() from public;
grant execute on function public.list_companions() to anon, authenticated;

-- Request mutations run in these functions so that a user cannot skip a step, take
-- someone else's assigned service, or alter a request by forging a direct database call.
create or replace function public.select_companion(
  p_request_id uuid,
  p_companion_id uuid
)
returns void language plpgsql security definer set search_path = public as $$
declare
  service_request public.requests%rowtype;
begin
  if not public.has_role('customer') then
    raise exception 'Only customers can select a Companion';
  end if;

  select * into service_request from public.requests where id = p_request_id for update;
  if not found or service_request.customer_id <> auth.uid() then
    raise exception 'Request not found';
  end if;
  if service_request.status <> 'pending' then
    raise exception 'A Companion can only be selected while the request is pending';
  end if;
  if not exists (select 1 from public.users where id = p_companion_id and role = 'companion') then
    raise exception 'The selected user is not a Companion';
  end if;

  update public.requests set companion_id = p_companion_id, updated_at = now()
  where id = p_request_id;
end;
$$;

create or replace function public.accept_service_request(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  service_request public.requests%rowtype;
begin
  if not public.has_role('companion') then
    raise exception 'Only Companions can accept a request';
  end if;

  select * into service_request from public.requests where id = p_request_id for update;
  if not found or service_request.status <> 'pending' then
    raise exception 'This request is no longer available';
  end if;
  if service_request.companion_id is not null and service_request.companion_id <> auth.uid() then
    raise exception 'This request was selected for another Companion';
  end if;

  update public.requests
  set companion_id = auth.uid(), status = 'accepted', updated_at = now()
  where id = p_request_id;
end;
$$;

create or replace function public.transition_service_request(
  p_request_id uuid,
  p_next_status public.request_status
)
returns void language plpgsql security definer set search_path = public as $$
declare
  service_request public.requests%rowtype;
begin
  select * into service_request from public.requests where id = p_request_id for update;
  if not found then
    raise exception 'Request not found';
  end if;

  if service_request.customer_id = auth.uid() then
    if p_next_status <> 'cancelled' or service_request.status not in ('pending', 'accepted') then
      raise exception 'Customers can only cancel a pending or accepted request';
    end if;
  elsif service_request.companion_id = auth.uid() and public.has_role('companion') then
    if not (
      (service_request.status = 'accepted' and p_next_status = 'in_progress') or
      (service_request.status = 'in_progress' and p_next_status = 'completed')
    ) then
      raise exception 'This service transition is not available';
    end if;
  else
    raise exception 'You do not have permission to update this request';
  end if;

  update public.requests set status = p_next_status, updated_at = now()
  where id = p_request_id;
end;
$$;

create or replace function public.admin_set_request_status(
  p_request_id uuid,
  p_next_status public.request_status
)
returns void language plpgsql security definer set search_path = public as $$
declare
  service_request public.requests%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Admin access is required';
  end if;

  select * into service_request from public.requests where id = p_request_id for update;
  if not found then
    raise exception 'Request not found';
  end if;
  if p_next_status in ('accepted', 'in_progress', 'completed') and service_request.companion_id is null then
    raise exception 'Assign a Companion before changing to this status';
  end if;

  update public.requests
  set status = p_next_status,
      companion_id = case when p_next_status = 'pending' then null else companion_id end,
      updated_at = now()
  where id = p_request_id;
end;
$$;

revoke all on function public.select_companion(uuid, uuid) from public;
revoke all on function public.accept_service_request(uuid) from public;
revoke all on function public.transition_service_request(uuid, public.request_status) from public;
revoke all on function public.admin_set_request_status(uuid, public.request_status) from public;
grant execute on function public.select_companion(uuid, uuid) to authenticated;
grant execute on function public.accept_service_request(uuid) to authenticated;
grant execute on function public.transition_service_request(uuid, public.request_status) to authenticated;
grant execute on function public.admin_set_request_status(uuid, public.request_status) to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists requests_set_updated_at on public.requests;
create trigger requests_set_updated_at before update on public.requests
for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop policy if exists "Users can view their own account" on public.users;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Profiles are publicly readable" on public.profiles;
drop policy if exists "Customers create their own requests" on public.requests;
drop policy if exists "Participants view requests" on public.requests;
drop policy if exists "Customers update their requests" on public.requests;

create policy "Users view their own account" on public.users
for select to authenticated using (auth.uid() = id);
create policy "Admins view all accounts" on public.users
for select to authenticated using (public.is_admin());

create policy "Users view their own profile" on public.profiles
for select to authenticated using (auth.uid() = id);
create policy "Users update their own profile" on public.profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles
for select to authenticated using (public.is_admin());
create policy "Admins update all profiles" on public.profiles
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Customers create their own requests" on public.requests
for insert to authenticated with check (auth.uid() = customer_id and public.has_role('customer'));
create policy "Customers view their requests" on public.requests
for select to authenticated using (auth.uid() = customer_id);
create policy "Companions view available or assigned requests" on public.requests
for select to authenticated using (
  public.has_role('companion') and (
    companion_id = auth.uid() or (status = 'pending' and companion_id is null)
  )
);
create policy "Admins view all requests" on public.requests
for select to authenticated using (public.is_admin());

drop policy if exists "Avatar images are publicly readable" on storage.objects;
drop policy if exists "Users upload their own avatar" on storage.objects;
drop policy if exists "Users update their own avatar" on storage.objects;
drop policy if exists "Users delete their own avatar" on storage.objects;

create policy "Avatar images are publicly readable" on storage.objects
for select using (bucket_id = 'avatars');
create policy "Users upload their own avatar" on storage.objects
for insert to authenticated with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "Users update their own avatar" on storage.objects
for update to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "Users delete their own avatar" on storage.objects
for delete to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
