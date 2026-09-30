import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("TEST PAGE: NO USER LOGGED IN");
    return <div>No user logged in</div>;
  }

  console.log("TEST PAGE: LOGGED IN AS", user.id);
  const { data: profs } = await supabase.from("profiles").select("*");
  console.log("TEST PAGE: PROFILES FETCHED:", profs?.length);

  const { data: msgs } = await supabase.from("messages").select("*");
  console.log("TEST PAGE: MESSAGES FETCHED:", msgs?.length);

  return <div>Check terminal</div>;
}
