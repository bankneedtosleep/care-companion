import {
  createServiceRequest,
  selectCompanion,
  signOut,
  transitionServiceRequest,
} from "@/app/actions";
import Link from "next/link";
import { AppHeader } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type ServiceRequest = {
  id: string;
  companion_id: string | null;
  errand_type: string;
  service_date: string;
  start_time: string;
  origin: string;
  destination: string;
  duration_minutes: number;
  details: string | null;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
};

type Companion = {
  id: string;
  full_name: string | null;
  bio: string | null;
  experience: string | null;
  skills: string[] | null;
  service_areas: string[] | null;
  availability: string | null;
};

const statusStyle = {
  pending: { label: "กำลังรอการตอบรับ", color: "bg-pastel-yellow" },
  accepted: { label: "มี Companion ตอบรับแล้ว", color: "bg-pastel-mint" },
  in_progress: { label: "กำลังให้บริการ", color: "bg-pastel-blue" },
  completed: { label: "เสร็จสิ้น", color: "bg-pastel-lilac" },
  cancelled: { label: "ยกเลิกแล้ว", color: "bg-pastel-peach" },
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

export default async function CustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const [params, supabase] = await Promise.all([searchParams, createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!account || account.role !== "customer") {
    redirect("/onboarding");
  }

  const [requestsResult, companionsResult] = await Promise.all([
    supabase.from("requests").select("*").order("service_date", { ascending: true }).order("start_time", { ascending: true }),
    supabase.rpc("list_companions"),
  ]);
  const requests = (requestsResult.data ?? []) as ServiceRequest[];
  const companions = (companionsResult.data ?? []) as Companion[];
  const activeCount = requests.filter((request) => ["pending", "accepted", "in_progress"].includes(request.status)).length;
  const completedCount = requests.filter((request) => request.status === "completed").length;
  const savedCount = new Set(requests.map((request) => request.companion_id).filter(Boolean)).size;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-cream px-5 py-5 text-ink sm:px-8 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <AppHeader
          label="พื้นที่ของผู้ใช้บริการ"
          labelClassName="bg-pastel-mint text-ink"
          href="/customer"
          action={
            <form action={signOut}>
              <button className="btn-cartoon bg-white px-3.5 py-2 text-xs text-ink" type="submit">
                ออกจากระบบ
              </button>
            </form>
          }
        />

        {params.error ? (
          <p className="mt-6 card-cartoon-sm bg-pastel-peach px-4 py-3 text-sm font-bold text-ink" role="alert">{params.error}</p>
        ) : null}
        {params.notice ? (
          <p className="mt-6 card-cartoon-sm bg-pastel-mint px-4 py-3 text-sm font-bold text-ink" role="status">
            {params.notice === "request-created" ? "ส่งคำขอเรียบร้อยแล้ว เราจะแจ้งสถานะที่นี่" : params.notice === "companion-selected" ? "ส่งคำขอถึง Companion ที่เลือกแล้ว" : "อัปเดตสถานะเรียบร้อยแล้ว"}
          </p>
        ) : null}

        {/* Hero banner */}
        <section className="relative mt-8 overflow-hidden card-cartoon bg-ink px-6 py-8 text-white sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-10 -top-20 h-8 w-8 rounded-full bg-cartoon-mint/20" />
          <div className="pointer-events-none absolute bottom-0 right-24 h-5 w-5 rounded-full bg-pastel-peach/30" />
          <div className="relative max-w-2xl">
            <span className="badge-cartoon border-white/20 bg-white/10 text-cartoon-mint">พื้นที่ของคุณ</span>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">วันนี้มีธุระอะไร<br className="hidden sm:block" /> ให้เราช่วยดูแล?</h1>
            <p className="mt-5 max-w-xl text-sm font-bold leading-7 text-white/60 sm:text-base">ระบุปลายทางและเวลาที่สะดวก เลือก Companion ได้เอง หรือเปิดคำขอเพื่อรอคนที่เหมาะสมตอบรับ</p>
            <a href="#new-request" className="btn-cartoon mt-8 inline-flex items-center gap-2 bg-cartoon-mint px-5 py-3.5 text-sm text-ink">
              สร้างคำขอใหม่ →
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="สรุปการใช้งาน">
          {[
            { label: "คำขอที่กำลังดำเนินการ", value: activeCount, detail: "ติดตามทุกขั้นตอนได้ที่นี่", color: "bg-pastel-blue" },
            { label: "บริการที่เสร็จสิ้น", value: completedCount, detail: "ประวัติการเดินทางของคุณ", color: "bg-pastel-lilac" },
            { label: "Companion ที่เคยเลือก", value: savedCount, detail: "เลือกซ้ำได้ในคำขอถัดไป", color: "bg-pastel-mint" },
          ].map((item) => (
            <article key={item.label} className={`card-cartoon ${item.color} p-5`}>
              <p className="text-sm font-bold text-ink/60">{item.label}</p>
              <p className="mt-4 text-4xl font-black text-ink">{item.value}</p>
              <p className="mt-2 text-xs font-bold text-ink/40">{item.detail}</p>
            </article>
          ))}
        </section>

        {/* Create request form */}
        <section id="new-request" className="mt-8 scroll-mt-6 card-cartoon bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="badge-cartoon bg-pastel-yellow text-ink">สร้างคำขอบริการ</span>
              <h2 className="mt-4 text-2xl font-black">บอกรายละเอียดให้ชัดเจน แล้วออกเดินทางอย่างอุ่นใจ</h2>
            </div>
            <p className="text-xs font-bold leading-5 text-ink/40">เป็นบริการช่วยเดินทางและทำธุระทั่วไป ไม่ใช่บริการทางการแพทย์</p>
          </div>

          <form action={createServiceRequest} className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-ink">ประเภทของธุระ
              <select name="errand_type" required defaultValue="" className="input-cartoon h-12">
                <option value="" disabled>เลือกประเภท</option>
                <option value="พบแพทย์ตามนัด">พบแพทย์ตามนัด</option>
                <option value="ติดต่อหน่วยงาน">ติดต่อหน่วยงาน / ธนาคาร</option>
                <option value="ซื้อของจำเป็น">ซื้อของจำเป็น</option>
                <option value="ทำธุระทั่วไป">ทำธุระทั่วไป</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-ink">วันที่ต้องการใช้บริการ
              <input name="service_date" type="date" min={today} required className="input-cartoon h-12" />
            </label>
            <label className="grid gap-2 text-sm font-black text-ink">เวลาเริ่มต้น
              <input name="start_time" type="time" required className="input-cartoon h-12" />
            </label>
            <label className="grid gap-2 text-sm font-black text-ink">ระยะเวลาโดยประมาณ
              <select name="duration_minutes" defaultValue="120" className="input-cartoon h-12">
                <option value="60">ประมาณ 1 ชั่วโมง</option>
                <option value="120">ประมาณ 2 ชั่วโมง</option>
                <option value="180">ประมาณ 3 ชั่วโมง</option>
                <option value="240">มากกว่า 3 ชั่วโมง</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-ink">จุดเริ่มต้น
              <input name="origin" required maxLength={160} placeholder="เช่น บ้าน หรือจุดนัดพบ" className="input-cartoon h-12 placeholder:font-bold placeholder:text-ink/30" />
            </label>
            <label className="grid gap-2 text-sm font-black text-ink">จุดหมายปลายทาง
              <input name="destination" required maxLength={160} placeholder="เช่น โรงพยาบาล หรือธนาคาร" className="input-cartoon h-12 placeholder:font-bold placeholder:text-ink/30" />
            </label>
            <label className="grid gap-2 text-sm font-black text-ink md:col-span-2">เลือก Companion (ไม่บังคับ)
              <select name="companion_id" defaultValue="" className="input-cartoon h-12">
                <option value="">เปิดคำขอ เพื่อรอ Companion ที่เหมาะสม</option>
                {companions.map((companion) => <option key={companion.id} value={companion.id}>{companion.full_name || "Companion"}{companion.service_areas?.length ? ` · ${companion.service_areas.join(", ")}` : ""}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-ink md:col-span-2">รายละเอียดเพิ่มเติม (ถ้ามี)
              <textarea name="details" maxLength={800} rows={4} placeholder="บอกสิ่งที่อยากให้ Companion ทราบ เช่น จุดนัดพบหรือข้อควรระวัง" className="input-cartoon resize-y py-3 placeholder:font-bold placeholder:text-ink/30" />
            </label>
            <div className="md:col-span-2 flex flex-col gap-3 border-t-3 border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold leading-5 text-ink/40">กรุณาตรวจสอบวัน เวลา และสถานที่ก่อนส่งคำขอ</p>
              <button type="submit" className="btn-cartoon bg-cartoon-mint px-6 py-3.5 text-sm text-ink">ส่งคำขอ</button>
            </div>
          </form>
        </section>

        {/* Requests list */}
        <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="card-cartoon bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">คำขอและสถานะการเดินทาง</h2>
                <p className="mt-1 text-sm font-bold text-ink/50">ทุกการเปลี่ยนแปลงจะแสดงไว้ที่นี่</p>
              </div>
              <span className="badge-cartoon bg-pastel-yellow text-ink">{requests.length} รายการ</span>
            </div>
            {requests.length === 0 ? (
              <div className="mt-7 card-cartoon-sm border-dashed bg-pastel-mint/30 p-7 text-center">
                <p className="font-black text-ink">ยังไม่มีคำขอบริการ</p>
                <p className="mt-2 text-sm font-bold text-ink/50">เริ่มจากกรอกรายละเอียดด้านบนได้เลย</p>
              </div>
            ) : (
              <div className="mt-7 grid gap-4">
                {requests.map((request) => {
                  const status = statusStyle[request.status];
                  return <article key={request.id} className="card-cartoon-sm bg-cream p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black text-ink/50">{formatDate(request.service_date)} · {request.start_time.slice(0, 5)} น.</p>
                        <h3 className="mt-2 text-lg font-black">{request.errand_type}</h3>
                      </div>
                      <span className={`badge-cartoon ${status.color} text-ink`}>{status.label}</span>
                    </div>
                    <p className="mt-3 text-sm font-bold leading-6 text-ink/60">{request.origin} → {request.destination} · ประมาณ {request.duration_minutes} นาที</p>
                    {request.details ? <p className="mt-2 text-sm font-bold leading-6 text-ink/40">{request.details}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2 border-t-3 border-ink/10 pt-4">
                      <Link href={`/status?id=${request.id}`} className="btn-cartoon shadow-[0_3px_0_#2C2A3A] bg-pastel-blue px-3.5 py-2 text-xs text-ink">ติดตามสถานะ</Link>
                      {request.status === "pending" && !request.companion_id ? <details className="group"><summary className="btn-cartoon shadow-[0_3px_0_#2C2A3A] cursor-pointer list-none bg-white px-3.5 py-2 text-xs text-ink">เลือก Companion <span className="ml-1 group-open:hidden">+</span></summary><form action={selectCompanion} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="request_id" value={request.id} /><select name="companion_id" required defaultValue="" className="input-cartoon min-h-10 text-xs"><option value="" disabled>เลือกจากรายชื่อ</option>{companions.map((companion) => <option key={companion.id} value={companion.id}>{companion.full_name || "Companion"}</option>)}</select><button className="btn-cartoon shadow-[0_3px_0_#2C2A3A] bg-cartoon-mint px-3.5 py-2 text-xs text-ink" type="submit">ส่งให้คนนี้</button></form></details> : null}
                      {(request.status === "pending" || request.status === "accepted") ? <form action={transitionServiceRequest}><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="next_status" value="cancelled" /><button className="btn-cartoon shadow-[0_3px_0_#2C2A3A] bg-pastel-peach px-3.5 py-2 text-xs text-ink" type="submit">ยกเลิกคำขอ</button></form> : null}
                    </div>
                  </article>;
                })}
              </div>
            )}
          </article>

          <aside className="card-cartoon bg-pastel-peach p-6 sm:p-8">
            <span className="icon-circle bg-white text-ink font-black">!</span>
            <h2 className="mt-5 text-xl font-black text-ink">ก่อนส่งคำขอ</h2>
            <ul className="mt-4 grid gap-3 text-sm font-bold leading-6 text-ink/70">
              <li>ตรวจสอบวัน เวลา และสถานที่ให้ถูกต้อง</li>
              <li>ระบุรายละเอียดที่จำเป็นต่อการเดินทางเท่านั้น</li>
              <li>เลือก Companion ได้ตามความสบายใจ หรือรอการตอบรับ</li>
            </ul>
            <p className="mt-6 border-t-3 border-ink/10 pt-5 text-xs font-bold leading-5 text-ink/40">ข้อมูลติดต่อส่วนตัวจะไม่แสดงในรายชื่อสาธารณะ</p>
          </aside>
        </section>

        {/* Companion list */}
        <section className="mt-8 pb-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="badge-cartoon bg-pastel-blue text-ink">รายชื่อ Companion</span>
              <h2 className="mt-4 text-2xl font-black">เลือกคนที่ช่วยให้คุณมั่นใจ</h2>
            </div>
            <p className="text-sm font-bold text-ink/40">แสดงเฉพาะข้อมูลที่พร้อมเผยแพร่</p>
          </div>
          {companions.length === 0 ? <div className="mt-6 card-cartoon border-dashed bg-pastel-mint/30 p-7 text-center text-sm font-bold text-ink/50">ยังไม่มี Companion ที่เผยแพร่โปรไฟล์ในขณะนี้</div> : <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{companions.map((companion) => <article key={companion.id} className="card-cartoon bg-white p-6 flex flex-col"><div className="flex items-start gap-3"><span className="icon-circle bg-pastel-mint text-lg font-black text-ink">{(companion.full_name || "C").slice(0, 1)}</span><div><h3 className="font-black text-ink">{companion.full_name || "Companion"}</h3><p className="mt-1 text-xs font-bold text-ink/40">{companion.availability || "สอบถามช่วงเวลาที่สะดวก"}</p></div></div><p className="mt-4 text-sm font-bold leading-6 text-ink/60">{companion.bio || "กำลังจัดเตรียมข้อมูลแนะนำตัว"}</p>{companion.skills?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{companion.skills.slice(0, 4).map((skill) => <span key={skill} className="badge-cartoon border-2 bg-pastel-yellow text-ink">{skill}</span>)}</div> : null}{companion.service_areas?.length ? <p className="mt-4 text-xs font-bold text-ink/40">พื้นที่: {companion.service_areas.join(", ")}</p> : null}</article>)}</div>}
        </section>
      </div>
    </main>
  );
}
