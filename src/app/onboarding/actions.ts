"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function chooseRole(formData: FormData) {
  const role = formData.get("role");
  if (role !== "customer" && role !== "companion") redirect("/onboarding?error=invalid-role");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/login?error=supabase-not-configured");
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.rpc("set_my_role", { selected_role: role });
  if (error) redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  redirect(`/${role}`);
}
