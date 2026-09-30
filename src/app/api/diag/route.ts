import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Try to insert a dummy message to see if RLS blocks ANON key
  const { data, error } = await supabase.from("messages").insert({
    request_id: "00000000-0000-0000-0000-000000000000",
    sender_id: "00000000-0000-0000-0000-000000000000",
    content: "test",
  }).select();

  return NextResponse.json({ data, error });
}
