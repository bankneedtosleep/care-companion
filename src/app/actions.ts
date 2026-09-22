"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Role = "customer" | "companion" | "admin";

async function accountFor(role?: Role) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!account || (role && account.role !== role)) redirect("/onboarding");
  return { supabase, user, role: account.role as Role };
}

function text(value: FormDataEntryValue | null, maximum: number) {
  return String(value ?? "").trim().slice(0, maximum);
}

function list(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function problem(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createServiceRequest(formData: FormData) {
  const { supabase, user } = await accountFor("customer");
  const errandType = text(formData.get("errand_type"), 80);
  const serviceDate = text(formData.get("service_date"), 10);
  const startTime = text(formData.get("start_time"), 5);
  const origin = text(formData.get("origin"), 160);
  const destination = text(formData.get("destination"), 160);
  const details = text(formData.get("details"), 800);
  const duration = Number(formData.get("duration_minutes"));
  const companionId = text(formData.get("companion_id"), 80);

  if (!errandType || !origin || !destination || !/^\d{4}-\d{2}-\d{2}$/.test(serviceDate) || !/^\d{2}:\d{2}$/.test(startTime)) {
    problem("/customer", "กรุณากรอกข้อมูลการเดินทางให้ครบถ้วน");
  }
  if (!Number.isInteger(duration) || duration < 30 || duration > 720) {
    problem("/customer", "ระยะเวลาควรอยู่ระหว่าง 30–720 นาที");
  }

  const { data: request, error } = await supabase
    .from("requests")
    .insert({
      customer_id: user.id,
      errand_type: errandType,
      service_date: serviceDate,
      start_time: startTime,
      origin,
      destination,
      duration_minutes: duration,
      details: details || null,
    })
    .select("id")
    .single();

  if (error || !request) problem("/customer", error?.message ?? "ไม่สามารถสร้างคำขอได้");

  if (companionId) {
    const { error: selectionError } = await supabase.rpc("select_companion", {
      p_request_id: request.id,
      p_companion_id: companionId,
    });
    if (selectionError) problem("/customer", selectionError.message);
  }

  revalidatePath("/customer");
  revalidatePath("/companion");
  redirect("/customer?notice=request-created");
}

export async function selectCompanion(formData: FormData) {
  const { supabase } = await accountFor("customer");
  const requestId = text(formData.get("request_id"), 80);
  const companionId = text(formData.get("companion_id"), 80);
  if (!requestId || !companionId) problem("/customer", "ไม่พบคำขอหรือ Companion ที่เลือก");

  const { error } = await supabase.rpc("select_companion", {
    p_request_id: requestId,
    p_companion_id: companionId,
  });
  if (error) problem("/customer", error.message);

  revalidatePath("/customer");
  revalidatePath("/companion");
  redirect("/customer?notice=companion-selected");
}

export async function acceptServiceRequest(formData: FormData) {
  const { supabase } = await accountFor("companion");
  const requestId = text(formData.get("request_id"), 80);
  if (!requestId) problem("/companion", "ไม่พบคำขอที่ต้องการตอบรับ");

  const { error } = await supabase.rpc("accept_service_request", { p_request_id: requestId });
  if (error) problem("/companion", error.message);

  revalidatePath("/customer");
  revalidatePath("/companion");
  revalidatePath("/admin");
  redirect("/companion?notice=request-accepted");
}

export async function transitionServiceRequest(formData: FormData) {
  const { supabase, role } = await accountFor();
  const requestId = text(formData.get("request_id"), 80);
  const nextStatus = text(formData.get("next_status"), 20);
  const destination = role === "companion" ? "/companion" : role === "customer" ? "/customer" : "/admin";

  if (!requestId || !["in_progress", "completed", "cancelled"].includes(nextStatus)) {
    problem(destination, "สถานะที่เลือกไม่ถูกต้อง");
  }

  const { error } = await supabase.rpc("transition_service_request", {
    p_request_id: requestId,
    p_next_status: nextStatus,
  });
  if (error) problem(destination, error.message);

  revalidatePath("/customer");
  revalidatePath("/companion");
  revalidatePath("/admin");
  redirect(`${destination}?notice=status-updated`);
}

export async function saveCompanionProfile(formData: FormData) {
  const { supabase, user } = await accountFor("companion");
  const fullName = text(formData.get("full_name"), 100);
  const bio = text(formData.get("bio"), 500);
  const experience = text(formData.get("experience"), 500);
  const phone = text(formData.get("phone"), 30);
  const availability = text(formData.get("availability"), 160);

  if (!fullName || !bio || !availability) {
    problem("/companion", "กรุณาระบุชื่อ คำแนะนำตัว และช่วงเวลาที่สะดวก");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      bio,
      experience: experience || null,
      phone: phone || null,
      skills: list(formData.get("skills")),
      service_areas: list(formData.get("service_areas")),
      availability,
    })
    .eq("id", user.id);

  if (error) problem("/companion", error.message);
  revalidatePath("/companion");
  revalidatePath("/customer");
  redirect("/companion?notice=profile-saved");
}

export async function adminSetRequestStatus(formData: FormData) {
  const { supabase } = await accountFor("admin");
  const requestId = text(formData.get("request_id"), 80);
  const nextStatus = text(formData.get("next_status"), 20);
  if (!requestId || !["pending", "accepted", "in_progress", "completed", "cancelled"].includes(nextStatus)) {
    problem("/admin", "สถานะที่เลือกไม่ถูกต้อง");
  }

  const { error } = await supabase.rpc("admin_set_request_status", {
    p_request_id: requestId,
    p_next_status: nextStatus,
  });
  if (error) problem("/admin", error.message);

  revalidatePath("/customer");
  revalidatePath("/companion");
  revalidatePath("/admin");
  redirect("/admin?notice=status-updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
