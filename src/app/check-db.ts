"use server";
import { createClient } from "@/lib/supabase/server";

export async function checkDatabaseSetup() {
  const supabase = await createClient();
  
  const results = {
    messagesTable: false,
    messagesError: null as any,
    phoneColumn: false,
    phoneError: null as any,
    profilesData: null as any,
  };

  // Check messages table
  const { error: msgErr } = await supabase.from("messages").select("id").limit(1);
  if (msgErr) {
    results.messagesError = msgErr;
  } else {
    results.messagesTable = true;
  }

  // Check phone column
  const { data: profData, error: profErr } = await supabase.from("profiles").select("id, phone").limit(1);
  if (profErr) {
    results.phoneError = profErr;
  } else {
    results.phoneColumn = true;
    results.profilesData = profData;
  }

  return results;
}
