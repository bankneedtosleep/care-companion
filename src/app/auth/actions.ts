"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

function resolveAppOrigin(headersList: Headers) {
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";

  const forwardedProto = headersList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = headersList.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? headersList.get("host") ?? "localhost:3000";
  const proto = forwardedProto ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

export async function signInWithGoogle(formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/login?error=supabase-not-configured");
  }
  const requestedRole = formData.get("role");
  const role = requestedRole === "customer" || requestedRole === "companion" ? requestedRole : "";
  const supabase = await createClient();
  const origin = resolveAppOrigin(await headers());
  const cookieStore = await cookies();
  if (role) {
    cookieStore.set("care-companion-role", role, {
      httpOnly: true,
      maxAge: 600,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  if (data.url) redirect(data.url);
}
