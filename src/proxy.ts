import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const protectedPath = ["/customer", "/companion", "/admin", "/onboarding"].find((path) => request.nextUrl.pathname.startsWith(path));

  if (!user && protectedPath) return NextResponse.redirect(new URL("/login", request.url));

  if (user && protectedPath && protectedPath !== "/onboarding") {
    const { data: account } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
    if (account?.role !== protectedPath.slice(1)) return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return response;
}

export const config = { matcher: ["/customer/:path*", "/companion/:path*", "/admin/:path*", "/onboarding/:path*"] };
