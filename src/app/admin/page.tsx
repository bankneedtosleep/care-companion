import { adminSetRequestStatus, signOut } from "@/app/actions";
import { AppHeader } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
  pending: { label: "รอการตอบรับ", color: "bg-pastel-yellow" },
  accepted: { label: "ตอบรับแล้ว", color: "bg-pastel-mint" },
  in_progress: { label: "กำลังให้บริการ", color: "bg-pastel-blue" },
  completed: { label: "เสร็จสิ้น", color: "bg-pastel-lilac" },
  cancelled: { label: "ยกเลิก", color: "bg-pastel-peach" },
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
    <main className="min-h-screen bg-cream px-5 py-5 text-ink sm:px-8 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <AppHeader
          label="ผู้ดูแลระบบ"
          labelClassName="bg-pastel-lilac text-ink"
          href="/admin"
          action={<form action={signOut}><button className="btn-cartoon bg-white px-3.5 py-2 text-xs text-ink" type="submit">ออกจากระบบ</button></form>}
        />
        {params.error ? <p className="mt-6 card-cartoon-sm bg-pastel-peach px-4 py-3 text-sm font-bold text-ink" role="alert">{params.error}</p> : null}
        {params.notice ? <p className="mt-6 card-cartoon-sm bg-pastel-mint px-4 py-3 text-sm font-bold text-ink" role="status">อัปเดตสถานะคำขอเรียบร้อยแล้ว</p> : null}

        <section className="mt-9 flex flex-col gap-5 border-b-4 border-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="badge-cartoon bg-pastel-lilac text-ink">ศูนย์ควบคุม</span>
            <h1 className="mt-4 text-4xl font-black text-ink sm:text-5xl">ภาพรวมแพลตฟอร์ม</h1>
            <p className="mt-3 max-w-xl text-sm font-bold leading-7 text-ink/50 sm:text-base">ติดตามคำขอบริการ ผู้ใช้งาน และสถานะการให้บริการจากพื้นที่เดียว</p>
          </div>
          <div className="card-cartoon-sm bg-pastel-mint flex items-center gap-3 px-4 py-3">
            <span className="icon-circle !h-9 !w-9 !border-[3px] bg-white text-ink font-black text-sm">✓</span>
            <div><p className="text-xs font-bold text-ink/50">สิทธิ์การเข้าถึง</p><p className="text-sm font-black text-ink">ผู้ดูแลระบบ</p></div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="ตัวชี้วัดหลัก">
          {[
            { label: "Customer", value: customers, helper: "บัญชีผู้ใช้บริการ", color: "bg-pastel-mint" },
            { label: "Companion", value: companions, helper: "บัญชีผู้ช่วยร่วมทาง", color: "bg-pastel-pink" },
            { label: "คำขอที่กำลังดำเนินการ", value: active, helper: "รอรับงานและกำลังให้บริการ", color: "bg-pastel-yellow" },
            { label: "บริการเสร็จสิ้น", value: completed, helper: "ประวัติการเดินทางทั้งหมด", color: "bg-pastel-blue" },
          ].map((metric) => <article key={metric.label} className={`card-cartoon ${metric.color} p-6`}><p className="text-sm font-bold text-ink/60">{metric.label}</p><p className="mt-5 text-4xl font-black text-ink">{metric.value}</p><p className="mt-3 text-xs font-bold leading-5 text-ink/40">{metric.helper}</p></article>)}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="card-cartoon bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">จัดการคำขอบริการ</h2>
                <p className="mt-1 text-sm font-bold text-ink/50">ตรวจสอบเส้นทางและปรับสถานะเมื่อต้องดูแลเป็นพิเศษ</p>
              </div>
              <span className="badge-cartoon bg-pastel-yellow text-ink">{requests.length} รายการ</span>
            </div>
            {requests.length === 0 ? <div className="mt-7 card-cartoon-sm border-dashed bg-pastel-mint/30 p-7 text-center text-sm font-bold text-ink/50">ยังไม่มีคำขอบริการในระบบ</div> : <div className="mt-7 grid gap-3">{requests.slice(0, 12).map((request) => <article key={request.id} className="card-cartoon-sm bg-cream p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black text-ink/50">{formatDate(request.service_date)} · {request.start_time.slice(0, 5)} น.</p><h3 className="mt-2 font-black">{request.errand_type}</h3><p className="mt-2 text-sm font-bold text-ink/60">{request.origin} → {request.destination}</p><p className="mt-2 text-xs font-bold text-ink/40">Customer: {names.get(request.customer_id) || shortId(request.customer_id)} · Companion: {request.companion_id ? names.get(request.companion_id) || shortId(request.companion_id) : "ยังไม่มี"}</p></div><span className={`badge-cartoon ${statusStyle[request.status].color} text-ink`}>{statusStyle[request.status].label}</span></div><form action={adminSetRequestStatus} className="mt-4 flex flex-wrap gap-2 border-t-3 border-ink/10 pt-4"><input type="hidden" name="request_id" value={request.id} /><label className="sr-only" htmlFor={`status-${request.id}`}>เปลี่ยนสถานะคำขอ</label><select id={`status-${request.id}`} name="next_status" defaultValue={request.status} className="input-cartoon min-h-9 text-xs"><option value="pending">รอการตอบรับ</option><option value="accepted">ตอบรับแล้ว</option><option value="in_progress">กำลังให้บริการ</option><option value="completed">เสร็จสิ้น</option><option value="cancelled">ยกเลิก</option></select><button className="btn-cartoon shadow-[0_3px_0_#2C2A3A] bg-ink px-3.5 py-2 text-xs text-white" type="submit">บันทึก</button></form></article>)}</div>}
          </article>
          <aside className="card-cartoon bg-ink p-6 text-white sm:p-8">
            <span className="badge-cartoon border-white/20 bg-white/10 text-cartoon-mint">แนวทางการดูแล</span>
            <h2 className="mt-5 text-2xl font-black">ดูแลชุมชนด้วยข้อมูลที่จำเป็น</h2>
            <ul className="mt-5 grid gap-4 text-sm font-bold leading-7 text-white/60">
              <li>เปลี่ยนสถานะเป็น "ตอบรับแล้ว" ได้เมื่อมี Companion ถูกเลือกเท่านั้น</li>
              <li>ไม่เปิดเผยเบอร์โทรศัพท์และอีเมลของผู้ใช้ในรายชื่อสาธารณะ</li>
              <li>การกำหนดบัญชี Admin ทำโดยเจ้าของโครงการใน Supabase เท่านั้น</li>
            </ul>
          </aside>
        </section>

        <section className="mt-8 pb-10">
          <div>
            <span className="badge-cartoon bg-pastel-blue text-ink">บัญชีล่าสุด</span>
            <h2 className="mt-4 text-2xl font-black">ผู้ใช้งานบนแพลตฟอร์ม</h2>
          </div>
          <div className="mt-6 overflow-hidden card-cartoon bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-pastel-yellow text-xs font-black text-ink"><tr><th className="px-5 py-4">ผู้ใช้</th><th className="px-5 py-4">บทบาท</th><th className="px-5 py-4">อีเมล</th><th className="px-5 py-4">รหัสบัญชี</th></tr></thead>
                <tbody>{accounts.slice(0, 12).map((account) => <tr key={account.id} className="border-t-3 border-ink/10"><td className="px-5 py-4 font-black text-ink">{names.get(account.id) || "ยังไม่ได้ตั้งชื่อ"}</td><td className="px-5 py-4"><span className={`badge-cartoon border-2 ${account.role === "admin" ? "bg-pastel-lilac" : account.role === "companion" ? "bg-pastel-pink" : "bg-pastel-mint"} text-ink`}>{account.role === "customer" ? "Customer" : account.role === "companion" ? "Companion" : "Admin"}</span></td><td className="px-5 py-4 font-bold text-ink/60">{account.email}</td><td className="px-5 py-4 font-mono text-xs text-ink/40">{shortId(account.id)}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
