import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const cookieStore = await cookies();
  const requestedRole = requestUrl.searchParams.get("role") ?? cookieStore.get("care-companion-role")?.value;
  const role = requestedRole === "customer" || requestedRole === "companion" ? requestedRole : null;
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && role) {
      await supabase.rpc("set_my_role", { selected_role: role });
    }
    if (user) {
      const { data: account } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
      if (account?.role === "admin" || account?.role === "customer" || account?.role === "companion") {
        const response = NextResponse.redirect(new URL(`/${account.role}`, requestUrl.origin));
        response.cookies.delete("care-companion-role");
        return response;
      }
    }
  }
  return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
}
