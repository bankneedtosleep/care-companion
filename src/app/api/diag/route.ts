import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: reqs } = await supabase.from("requests").select("id, customer_id, errand_type");
  const { data: users } = await supabase.from("users").select("id, role");

  return NextResponse.json({ reqs, users });
}
