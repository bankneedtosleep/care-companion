import {
  createServiceRequest,
  selectCompanion,
  signOut,
  transitionServiceRequest,
} from "@/app/actions";
import { AppHeader } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
  pending: { label: "กำลังรอการตอบรับ", className: "bg-[#fff0e8] text-[#a65335]" },
  accepted: { label: "มี Companion ตอบรับแล้ว", className: "bg-[#e1f0e9] text-[#1d6658]" },
  in_progress: { label: "กำลังให้บริการ", className: "bg-[#e8edf9] text-[#49638f]" },
  completed: { label: "เสร็จสิ้น", className: "bg-[#edf1ed] text-[#52695f]" },
  cancelled: { label: "ยกเลิกแล้ว", className: "bg-[#f3eceb] text-[#875e59]" },
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
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-5 text-[#153c34] sm:px-8 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <AppHeader
          label="พื้นที่ของผู้ใช้บริการ"
          labelClassName="bg-[#e1f0e9] text-[#1d6658]"
          action={
            <form action={signOut}>
              <button className="rounded-full border border-[#c8ddd2] px-3.5 py-2 text-xs font-bold text-[#356156] transition hover:bg-white" type="submit">
                ออกจากระบบ
              </button>
            </form>
          }
        />

        {params.error ? (
          <p className="mt-6 rounded-2xl border border-[#f2c9bb] bg-[#fff0ea] px-4 py-3 text-sm text-[#9b4c31]" role="alert">{params.error}</p>
        ) : null}
        {params.notice ? (
          <p className="mt-6 rounded-2xl border border-[#c6e2d5] bg-[#eff9f4] px-4 py-3 text-sm font-medium text-[#236352]" role="status">
            {params.notice === "request-created" ? "ส่งคำขอเรียบร้อยแล้ว เราจะแจ้งสถานะที่นี่" : params.notice === "companion-selected" ? "ส่งคำขอถึง Companion ที่เลือกแล้ว" : "อัปเดตสถานะเรียบร้อยแล้ว"}
          </p>
        ) : null}

        <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[#153c34] px-6 py-8 text-white shadow-[0_24px_70px_rgba(21,60,52,0.16)] sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[30px] border-[#72b6a2]/20" />
          <div className="pointer-events-none absolute bottom-0 right-24 h-28 w-28 translate-y-12 rounded-full bg-[#f3a077]/20 blur-2xl" />
          <div className="relative max-w-2xl">
            <p className="text-sm font-bold tracking-[0.14em] text-[#a9d5c5]">พื้นที่ของคุณ</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">วันนี้มีธุระอะไร<br className="hidden sm:block" /> ให้เราช่วยดูแล?</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#d3e7df] sm:text-base">ระบุปลายทางและเวลาที่สะดวก เลือก Companion ได้เอง หรือเปิดคำขอเพื่อรอคนที่เหมาะสมตอบรับ</p>
            <a href="#new-request" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-[#153c34] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#e1f0e9]">
              สร้างคำขอใหม่ <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="สรุปการใช้งาน">
          {[
            { label: "คำขอที่กำลังดำเนินการ", value: activeCount, detail: "ติดตามทุกขั้นตอนได้ที่นี่", tone: "bg-white" },
            { label: "บริการที่เสร็จสิ้น", value: completedCount, detail: "ประวัติการเดินทางของคุณ", tone: "bg-white" },
            { label: "Companion ที่เคยเลือก", value: savedCount, detail: "เลือกซ้ำได้ในคำขอถัดไป", tone: "bg-[#e1f0e9]" },
          ].map((item) => (
            <article key={item.label} className={`${item.tone} rounded-[1.5rem] border border-[#dbe7df] p-5 shadow-[0_8px_28px_rgba(21,60,52,0.04)]`}>
              <p className="text-sm font-medium text-[#5f746b]">{item.label}</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#153c34]">{item.value}</p>
              <p className="mt-2 text-xs text-[#70847b]">{item.detail}</p>
            </article>
          ))}
        </section>

        <section id="new-request" className="mt-8 scroll-mt-6 rounded-[1.75rem] border border-[#dbe7df] bg-white p-6 shadow-[0_10px_30px_rgba(21,60,52,0.04)] sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#1d7665]">สร้างคำขอบริการ</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">บอกรายละเอียดให้ชัดเจน แล้วออกเดินทางอย่างอุ่นใจ</h2>
            </div>
            <p className="text-xs leading-5 text-[#70847b]">เป็นบริการช่วยเดินทางและทำธุระทั่วไป ไม่ใช่บริการทางการแพทย์</p>
          </div>

          <form action={createServiceRequest} className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-[#35564b]">ประเภทของธุระ
              <select name="errand_type" required defaultValue="" className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium text-[#153c34]">
                <option value="" disabled>เลือกประเภท</option>
                <option value="พบแพทย์ตามนัด">พบแพทย์ตามนัด</option>
                <option value="ติดต่อหน่วยงาน">ติดต่อหน่วยงาน / ธนาคาร</option>
                <option value="ซื้อของจำเป็น">ซื้อของจำเป็น</option>
                <option value="ทำธุระทั่วไป">ทำธุระทั่วไป</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#35564b]">วันที่ต้องการใช้บริการ
              <input name="service_date" type="date" min={today} required className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#35564b]">เวลาเริ่มต้น
              <input name="start_time" type="time" required className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#35564b]">ระยะเวลาโดยประมาณ
              <select name="duration_minutes" defaultValue="120" className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium">
                <option value="60">ประมาณ 1 ชั่วโมง</option>
                <option value="120">ประมาณ 2 ชั่วโมง</option>
                <option value="180">ประมาณ 3 ชั่วโมง</option>
                <option value="240">มากกว่า 3 ชั่วโมง</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#35564b]">จุดเริ่มต้น
              <input name="origin" required maxLength={160} placeholder="เช่น บ้าน หรือจุดนัดพบ" className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium placeholder:font-normal placeholder:text-[#94a59d]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#35564b]">จุดหมายปลายทาง
              <input name="destination" required maxLength={160} placeholder="เช่น โรงพยาบาล หรือธนาคาร" className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium placeholder:font-normal placeholder:text-[#94a59d]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#35564b] md:col-span-2">เลือก Companion (ไม่บังคับ)
              <select name="companion_id" defaultValue="" className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium">
                <option value="">เปิดคำขอ เพื่อรอ Companion ที่เหมาะสม</option>
                {companions.map((companion) => <option key={companion.id} value={companion.id}>{companion.full_name || "Companion"}{companion.service_areas?.length ? ` · ${companion.service_areas.join(", ")}` : ""}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#35564b] md:col-span-2">รายละเอียดเพิ่มเติม (ถ้ามี)
              <textarea name="details" maxLength={800} rows={4} placeholder="บอกสิ่งที่อยากให้ Companion ทราบ เช่น จุดนัดพบหรือข้อควรระวัง" className="resize-y rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 py-3 text-sm font-medium placeholder:font-normal placeholder:text-[#94a59d]" />
            </label>
            <div className="md:col-span-2 flex flex-col gap-3 border-t border-[#e5eee8] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[#70847b]">กรุณาตรวจสอบวัน เวลา และสถานที่ก่อนส่งคำขอ</p>
              <button type="submit" className="inline-flex justify-center rounded-full bg-[#1d7665] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(29,118,101,0.2)] transition hover:-translate-y-0.5 hover:bg-[#155f52]">ส่งคำขอ</button>
            </div>
          </form>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[1.75rem] border border-[#dbe7df] bg-white p-6 shadow-[0_10px_30px_rgba(21,60,52,0.04)] sm:p-8">
            <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-[-0.03em]">คำขอและสถานะการเดินทาง</h2><p className="mt-1 text-sm text-[#70847b]">ทุกการเปลี่ยนแปลงจะแสดงไว้ที่นี่</p></div><span className="rounded-full bg-[#f4f6f2] px-3 py-1.5 text-xs font-bold text-[#5f746b]">{requests.length} รายการ</span></div>
            {requests.length === 0 ? (
              <div className="mt-7 rounded-2xl border border-dashed border-[#cbded4] bg-[#f7fbf8] p-7 text-center"><p className="font-bold text-[#35564b]">ยังไม่มีคำขอบริการ</p><p className="mt-2 text-sm text-[#70847b]">เริ่มจากกรอกรายละเอียดด้านบนได้เลย</p></div>
            ) : (
              <div className="mt-7 grid gap-4">
                {requests.map((request) => {
                  const status = statusStyle[request.status];
                  return <article key={request.id} className="rounded-2xl border border-[#e1ebe5] bg-[#fbfcfa] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold tracking-[0.12em] text-[#1d7665]">{formatDate(request.service_date)} · {request.start_time.slice(0, 5)} น.</p><h3 className="mt-2 text-lg font-semibold">{request.errand_type}</h3></div><span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}>{status.label}</span></div>
                    <p className="mt-3 text-sm leading-6 text-[#5f746b]">{request.origin} <span aria-hidden="true">→</span> {request.destination} · ประมาณ {request.duration_minutes} นาที</p>
                    {request.details ? <p className="mt-2 text-sm leading-6 text-[#70847b]">{request.details}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e5eee8] pt-4">
                      {request.status === "pending" && !request.companion_id ? <details className="group"><summary className="cursor-pointer list-none rounded-full border border-[#bcd5ca] px-3.5 py-2 text-xs font-bold text-[#1d6658] transition hover:bg-[#eaf5f0]">เลือก Companion <span className="ml-1 group-open:hidden">+</span></summary><form action={selectCompanion} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="request_id" value={request.id} /><select name="companion_id" required defaultValue="" className="min-h-10 rounded-xl border border-[#cfe0d6] bg-white px-3 text-xs"><option value="" disabled>เลือกจากรายชื่อ</option>{companions.map((companion) => <option key={companion.id} value={companion.id}>{companion.full_name || "Companion"}</option>)}</select><button className="rounded-xl bg-[#1d7665] px-3.5 py-2 text-xs font-bold text-white" type="submit">ส่งให้คนนี้</button></form></details> : null}
                      {(request.status === "pending" || request.status === "accepted") ? <form action={transitionServiceRequest}><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="next_status" value="cancelled" /><button className="rounded-full px-3.5 py-2 text-xs font-bold text-[#a65335] transition hover:bg-[#fff0ea]" type="submit">ยกเลิกคำขอ</button></form> : null}
                    </div>
                  </article>;
                })}
              </div>
            )}
          </article>

          <aside className="rounded-[1.75rem] bg-[#fbe5d9] p-6 sm:p-8"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-xl text-[#bd6544]">✓</span><h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#633d2d]">ก่อนส่งคำขอ</h2><ul className="mt-4 grid gap-3 text-sm leading-6 text-[#895c48]"><li>ตรวจสอบวัน เวลา และสถานที่ให้ถูกต้อง</li><li>ระบุรายละเอียดที่จำเป็นต่อการเดินทางเท่านั้น</li><li>เลือก Companion ได้ตามความสบายใจ หรือรอการตอบรับ</li></ul><p className="mt-6 border-t border-[#efcabc] pt-5 text-xs leading-5 text-[#9f6751]">ข้อมูลติดต่อส่วนตัวจะไม่แสดงในรายชื่อสาธารณะ</p></aside>
        </section>

        <section className="mt-8 pb-10"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-[#1d7665]">รายชื่อ Companion</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">เลือกคนที่ช่วยให้คุณมั่นใจ</h2></div><p className="text-sm text-[#70847b]">แสดงเฉพาะข้อมูลที่พร้อมเผยแพร่</p></div>
          {companions.length === 0 ? <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#cbded4] bg-white p-7 text-center text-sm text-[#70847b]">ยังไม่มี Companion ที่เผยแพร่โปรไฟล์ในขณะนี้</div> : <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{companions.map((companion) => <article key={companion.id} className="flex flex-col rounded-[1.5rem] border border-[#dbe7df] bg-white p-6 shadow-[0_8px_28px_rgba(21,60,52,0.04)]"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e1f0e9] text-lg font-bold text-[#1d7665]">{(companion.full_name || "C").slice(0, 1)}</span><div><h3 className="font-semibold text-[#153c34]">{companion.full_name || "Companion"}</h3><p className="mt-1 text-xs text-[#70847b]">{companion.availability || "สอบถามช่วงเวลาที่สะดวก"}</p></div></div><p className="mt-4 text-sm leading-6 text-[#5f746b]">{companion.bio || "กำลังจัดเตรียมข้อมูลแนะนำตัว"}</p>{companion.skills?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{companion.skills.slice(0, 4).map((skill) => <span key={skill} className="rounded-full bg-[#f0f6f2] px-2.5 py-1 text-[11px] font-bold text-[#356156]">{skill}</span>)}</div> : null}{companion.service_areas?.length ? <p className="mt-4 text-xs font-medium text-[#70847b]">พื้นที่: {companion.service_areas.join(", ")}</p> : null}</article>)}</div>}
        </section>
      </div>
    </main>
  );
}
