import { adminSetRequestStatus, signOut } from "@/app/actions";
import { AppHeader } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Account = { id: string; email: string; role: "customer" | "companion" | "admin"; created_at: string };
type Profile = { id: string; full_name: string | null };
type ServiceRequest = {
  id: string;
  customer_id: string;
  companion_id: string | null;
  errand_type: string;
  service_date: string;
  start_time: string;
  origin: string;
  destination: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  created_at: string;
};

const statusStyle = {
  pending: { label: "รอการตอบรับ", className: "bg-[#fff0e8] text-[#a65335]" },
  accepted: { label: "ตอบรับแล้ว", className: "bg-[#e1f0e9] text-[#1d6658]" },
  in_progress: { label: "กำลังให้บริการ", className: "bg-[#e8edf9] text-[#49638f]" },
  completed: { label: "เสร็จสิ้น", className: "bg-[#edf1ed] text-[#52695f]" },
  cancelled: { label: "ยกเลิก", className: "bg-[#f3eceb] text-[#875e59]" },
} as const;

function shortId(id: string) {
  return `${id.slice(0, 8)}…`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const [params, supabase] = await Promise.all([searchParams, createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentAccount } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (currentAccount?.role !== "admin") redirect("/onboarding");

  const [accountsResult, profilesResult, requestsResult] = await Promise.all([
    supabase.from("users").select("id, email, role, created_at").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name"),
    supabase.from("requests").select("*").order("created_at", { ascending: false }),
  ]);
  const accounts = (accountsResult.data ?? []) as Account[];
  const profiles = (profilesResult.data ?? []) as Profile[];
  const requests = (requestsResult.data ?? []) as ServiceRequest[];
  const names = new Map(profiles.map((profile) => [profile.id, profile.full_name]));
  const customers = accounts.filter((account) => account.role === "customer").length;
  const companions = accounts.filter((account) => account.role === "companion").length;
  const active = requests.filter((request) => ["pending", "accepted", "in_progress"].includes(request.status)).length;
  const completed = requests.filter((request) => request.status === "completed").length;

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-5 text-[#153c34] sm:px-8 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <AppHeader
          label="ผู้ดูแลระบบ"
          labelClassName="bg-[#eee7f6] text-[#70558e]"
          action={<form action={signOut}><button className="rounded-full border border-[#d8cdea] px-3.5 py-2 text-xs font-bold text-[#70558e] transition hover:bg-white" type="submit">ออกจากระบบ</button></form>}
        />
        {params.error ? <p className="mt-6 rounded-2xl border border-[#f2c9bb] bg-[#fff0ea] px-4 py-3 text-sm text-[#9b4c31]" role="alert">{params.error}</p> : null}
        {params.notice ? <p className="mt-6 rounded-2xl border border-[#c6e2d5] bg-[#eff9f4] px-4 py-3 text-sm font-medium text-[#236352]" role="status">อัปเดตสถานะคำขอเรียบร้อยแล้ว</p> : null}

        <section className="mt-9 flex flex-col gap-5 border-b border-[#dbe7df] pb-8 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-bold tracking-[0.14em] text-[#1d7665]">ศูนย์ควบคุม</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#153c34] sm:text-5xl">ภาพรวมแพลตฟอร์ม</h1><p className="mt-3 max-w-xl text-sm leading-7 text-[#5f746b] sm:text-base">ติดตามคำขอบริการ ผู้ใช้งาน และสถานะการให้บริการจากพื้นที่เดียว</p></div><div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_24px_rgba(21,60,52,0.04)]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e1f0e9] text-[#1d7665]">✓</span><div><p className="text-xs text-[#70847b]">สิทธิ์การเข้าถึง</p><p className="text-sm font-bold text-[#153c34]">ผู้ดูแลระบบ</p></div></div></section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="ตัวชี้วัดหลัก">{[
          { label: "Customer", value: customers, helper: "บัญชีผู้ใช้บริการ", accent: "bg-white" },
          { label: "Companion", value: companions, helper: "บัญชีผู้ช่วยร่วมทาง", accent: "bg-white" },
          { label: "คำขอที่กำลังดำเนินการ", value: active, helper: "รอรับงานและกำลังให้บริการ", accent: "bg-white" },
          { label: "บริการเสร็จสิ้น", value: completed, helper: "ประวัติการเดินทางทั้งหมด", accent: "bg-[#e1f0e9]" },
        ].map((metric) => <article key={metric.label} className={`${metric.accent} rounded-[1.5rem] border border-[#dbe7df] p-6 shadow-[0_8px_28px_rgba(21,60,52,0.04)]`}><p className="text-sm font-medium text-[#5f746b]">{metric.label}</p><p className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#153c34]">{metric.value}</p><p className="mt-3 text-xs leading-5 text-[#70847b]">{metric.helper}</p></article>)}</section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-[1.75rem] border border-[#dbe7df] bg-white p-6 shadow-[0_10px_30px_rgba(21,60,52,0.04)] sm:p-8"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-[-0.03em]">จัดการคำขอบริการ</h2><p className="mt-1 text-sm text-[#70847b]">ตรวจสอบเส้นทางและปรับสถานะเมื่อต้องดูแลเป็นพิเศษ</p></div><span className="rounded-full bg-[#f4f6f2] px-3 py-1.5 text-xs font-bold text-[#5f746b]">{requests.length} รายการ</span></div>
            {requests.length === 0 ? <div className="mt-7 rounded-2xl border border-dashed border-[#cbded4] bg-[#f7fbf8] p-7 text-center text-sm text-[#70847b]">ยังไม่มีคำขอบริการในระบบ</div> : <div className="mt-7 grid gap-3">{requests.slice(0, 12).map((request) => <article key={request.id} className="rounded-2xl border border-[#e1ebe5] bg-[#fbfcfa] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold tracking-[0.12em] text-[#1d7665]">{formatDate(request.service_date)} · {request.start_time.slice(0, 5)} น.</p><h3 className="mt-2 font-semibold">{request.errand_type}</h3><p className="mt-2 text-sm text-[#5f746b]">{request.origin} <span aria-hidden="true">→</span> {request.destination}</p><p className="mt-2 text-xs text-[#70847b]">Customer: {names.get(request.customer_id) || shortId(request.customer_id)} · Companion: {request.companion_id ? names.get(request.companion_id) || shortId(request.companion_id) : "ยังไม่มี"}</p></div><span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle[request.status].className}`}>{statusStyle[request.status].label}</span></div><form action={adminSetRequestStatus} className="mt-4 flex flex-wrap gap-2 border-t border-[#e5eee8] pt-4"><input type="hidden" name="request_id" value={request.id} /><label className="sr-only" htmlFor={`status-${request.id}`}>เปลี่ยนสถานะคำขอ</label><select id={`status-${request.id}`} name="next_status" defaultValue={request.status} className="min-h-9 rounded-xl border border-[#cfe0d6] bg-white px-3 text-xs font-medium"><option value="pending">รอการตอบรับ</option><option value="accepted">ตอบรับแล้ว</option><option value="in_progress">กำลังให้บริการ</option><option value="completed">เสร็จสิ้น</option><option value="cancelled">ยกเลิก</option></select><button className="rounded-xl bg-[#153c34] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#1d6658]" type="submit">บันทึก</button></form></article>)}</div>}
          </article>
          <aside className="rounded-[1.75rem] bg-[#153c34] p-6 text-white shadow-[0_18px_48px_rgba(21,60,52,0.14)] sm:p-8"><span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#b9dfd1]">แนวทางการดูแล</span><h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">ดูแลชุมชนด้วยข้อมูลที่จำเป็น</h2><ul className="mt-5 grid gap-4 text-sm leading-7 text-[#c7dfd5]"><li>เปลี่ยนสถานะเป็น “ตอบรับแล้ว” ได้เมื่อมี Companion ถูกเลือกเท่านั้น</li><li>ไม่เปิดเผยเบอร์โทรศัพท์และอีเมลของผู้ใช้ในรายชื่อสาธารณะ</li><li>การกำหนดบัญชี Admin ทำโดยเจ้าของโครงการใน Supabase เท่านั้น</li></ul></aside>
        </section>

        <section className="mt-8 pb-10"><div><p className="text-sm font-bold text-[#1d7665]">บัญชีล่าสุด</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">ผู้ใช้งานบนแพลตฟอร์ม</h2></div><div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#dbe7df] bg-white shadow-[0_8px_28px_rgba(21,60,52,0.04)]"><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-[#f4f7f3] text-xs text-[#5f746b]"><tr><th className="px-5 py-4 font-bold">ผู้ใช้</th><th className="px-5 py-4 font-bold">บทบาท</th><th className="px-5 py-4 font-bold">อีเมล</th><th className="px-5 py-4 font-bold">รหัสบัญชี</th></tr></thead><tbody>{accounts.slice(0, 12).map((account) => <tr key={account.id} className="border-t border-[#edf2ee]"><td className="px-5 py-4 font-semibold text-[#153c34]">{names.get(account.id) || "ยังไม่ได้ตั้งชื่อ"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${account.role === "admin" ? "bg-[#eee7f6] text-[#70558e]" : account.role === "companion" ? "bg-[#fff0e8] text-[#a65335]" : "bg-[#e1f0e9] text-[#1d6658]"}`}>{account.role === "customer" ? "Customer" : account.role === "companion" ? "Companion" : "Admin"}</span></td><td className="px-5 py-4 text-[#5f746b]">{account.email}</td><td className="px-5 py-4 font-mono text-xs text-[#70847b]">{shortId(account.id)}</td></tr>)}</tbody></table></div></div></section>
      </div>
    </main>
  );
}
