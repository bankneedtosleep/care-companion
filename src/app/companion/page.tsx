import {
  acceptServiceRequest,
  saveCompanionProfile,
  signOut,
  transitionServiceRequest,
} from "@/app/actions";
import { AvatarUploader } from "@/components/avatar-uploader";
import { AppHeader } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  experience: string | null;
  skills: string[] | null;
  service_areas: string[] | null;
  availability: string | null;
};

type ServiceRequest = {
  id: string;
  customer_id: string;
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

const statusStyle = {
  pending: { label: "เปิดรับ Companion", className: "bg-[#fff0e8] text-[#a65335]" },
  accepted: { label: "คุณตอบรับแล้ว", className: "bg-[#e1f0e9] text-[#1d6658]" },
  in_progress: { label: "กำลังให้บริการ", className: "bg-[#e8edf9] text-[#49638f]" },
  completed: { label: "เสร็จสิ้น", className: "bg-[#edf1ed] text-[#52695f]" },
  cancelled: { label: "ยกเลิกแล้ว", className: "bg-[#f3eceb] text-[#875e59]" },
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export default async function CompanionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const [params, supabase] = await Promise.all([searchParams, createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, requestsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("requests").select("*").order("service_date", { ascending: true }).order("start_time", { ascending: true }),
  ]);
  const profile = (profileResult.data ?? {}) as Profile;
  const requests = (requestsResult.data ?? []) as ServiceRequest[];
  const profileFields = [profile.full_name, profile.bio, profile.availability, profile.skills?.length, profile.service_areas?.length];
  const profileProgress = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
  const openRequests = requests.filter((request) => request.status === "pending");
  const assignedRequests = requests.filter((request) => request.companion_id === user.id && ["accepted", "in_progress"].includes(request.status));
  const completedCount = requests.filter((request) => request.companion_id === user.id && request.status === "completed").length;

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-5 text-[#153c34] sm:px-8 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <AppHeader
          label="พื้นที่ของ Companion"
          labelClassName="bg-[#fbe5d9] text-[#a65335]"
          action={<form action={signOut}><button className="rounded-full border border-[#c8ddd2] px-3.5 py-2 text-xs font-bold text-[#356156] transition hover:bg-white" type="submit">ออกจากระบบ</button></form>}
        />
        {params.error ? <p className="mt-6 rounded-2xl border border-[#f2c9bb] bg-[#fff0ea] px-4 py-3 text-sm text-[#9b4c31]" role="alert">{params.error}</p> : null}
        {params.notice ? <p className="mt-6 rounded-2xl border border-[#c6e2d5] bg-[#eff9f4] px-4 py-3 text-sm font-medium text-[#236352]" role="status">{params.notice === "profile-saved" ? "บันทึกโปรไฟล์เรียบร้อยแล้ว" : params.notice === "request-accepted" ? "ตอบรับคำขอเรียบร้อยแล้ว" : "อัปเดตสถานะเรียบร้อยแล้ว"}</p> : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#153c34] px-6 py-9 text-white shadow-[0_24px_70px_rgba(21,60,52,0.16)] sm:px-10 sm:py-12"><div className="pointer-events-none absolute -right-16 -top-14 h-60 w-60 rounded-full border-[28px] border-[#8bc7b6]/20" /><div className="relative max-w-xl"><p className="text-sm font-bold tracking-[0.14em] text-[#a9d5c5]">พื้นที่ของคุณ</p><h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">ช่วยให้การไปธุระของใครสักคน<br className="hidden sm:block" /> ง่ายขึ้นในทุกวัน</h1><p className="mt-5 max-w-lg text-sm leading-7 text-[#d3e7df] sm:text-base">เติมโปรไฟล์ให้ชัดเจน แล้วเลือกตอบรับเฉพาะคำขอที่เหมาะกับเวลา พื้นที่ และความถนัดของคุณ</p><a href="#available-requests" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-[#153c34] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#e1f0e9]">ดูคำขอที่เปิดอยู่ <span aria-hidden="true">→</span></a></div></div>
          <aside className="rounded-[2rem] border border-[#dbe7df] bg-white p-6 shadow-[0_10px_30px_rgba(21,60,52,0.04)] sm:p-8"><div className="flex items-center justify-between"><span className="text-sm font-bold text-[#153c34]">ความพร้อมของคุณ</span><span className="inline-flex items-center gap-2 rounded-full bg-[#e1f0e9] px-3 py-1.5 text-xs font-bold text-[#1d6658]"><i className="h-2 w-2 rounded-full bg-[#1d7665]" />พร้อมเริ่มต้น</span></div><div className="mt-7 rounded-2xl bg-[#f4f7f3] p-5"><div className="flex items-end justify-between"><p className="text-xs font-bold tracking-[0.12em] text-[#70847b]">โปรไฟล์ที่สมบูรณ์</p><p className="text-2xl font-semibold tracking-[-0.05em]">{profileProgress}%</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dce9e2]"><div className="h-full rounded-full bg-[#1d7665]" style={{ width: `${profileProgress}%` }} /></div><p className="mt-3 text-sm leading-6 text-[#70847b]">โปรไฟล์ที่มีพื้นที่ ความถนัด และเวลาว่าง ช่วยให้เลือกงานที่ใช่ได้เร็วขึ้น</p></div><dl className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#fff7f2] p-4"><dt className="text-xs text-[#9f6751]">คำขอเปิดอยู่</dt><dd className="mt-1 text-2xl font-semibold text-[#633d2d]">{openRequests.length}</dd></div><div className="rounded-xl bg-[#f0f6f2] p-4"><dt className="text-xs text-[#54816f]">กำลังดูแล</dt><dd className="mt-1 text-2xl font-semibold text-[#1d6658]">{assignedRequests.length}</dd></div></dl></aside>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[1.75rem] border border-[#dbe7df] bg-white p-6 shadow-[0_10px_30px_rgba(21,60,52,0.04)] sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-[#1d7665]">โปรไฟล์สาธารณะ</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">บอกเล่าเรื่องราวที่ Customer ควรรู้</h2><p className="mt-2 text-sm leading-6 text-[#70847b]">ไม่แสดงเบอร์โทรศัพท์ในรายชื่อสาธารณะ</p></div><AvatarUploader userId={user.id} initialUrl={profile.avatar_url} fullName={profile.full_name} /></div>
            <form action={saveCompanionProfile} className="mt-7 grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold text-[#35564b]">ชื่อที่แสดงแก่ Customer<input name="full_name" required maxLength={100} defaultValue={profile.full_name ?? ""} className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium" /></label><label className="grid gap-2 text-sm font-bold text-[#35564b]">ช่วงเวลาที่สะดวก<input name="availability" required maxLength={160} defaultValue={profile.availability ?? ""} placeholder="เช่น เสาร์–อาทิตย์ 09:00–17:00" className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium placeholder:font-normal" /></label><label className="grid gap-2 text-sm font-bold text-[#35564b]">พื้นที่ที่ให้บริการ<input name="service_areas" maxLength={300} defaultValue={profile.service_areas?.join(", ") ?? ""} placeholder="คั่นแต่ละพื้นที่ด้วยเครื่องหมาย ," className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium placeholder:font-normal" /></label><label className="grid gap-2 text-sm font-bold text-[#35564b]">ความถนัด<input name="skills" maxLength={300} defaultValue={profile.skills?.join(", ") ?? ""} placeholder="เช่น พาไปโรงพยาบาล, ใช้รถเข็น" className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium placeholder:font-normal" /></label><label className="grid gap-2 text-sm font-bold text-[#35564b] sm:col-span-2">แนะนำตัว<textarea name="bio" required maxLength={500} rows={3} defaultValue={profile.bio ?? ""} placeholder="เล่าแนวทางการช่วยเหลือและสิ่งที่ทำให้คุณเหมาะกับบทบาทนี้" className="resize-y rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 py-3 text-sm font-medium placeholder:font-normal" /></label><label className="grid gap-2 text-sm font-bold text-[#35564b] sm:col-span-2">ประสบการณ์ (ไม่บังคับ)<textarea name="experience" maxLength={500} rows={2} defaultValue={profile.experience ?? ""} placeholder="เช่น เคยอาสาพาผู้สูงอายุไปทำธุระ" className="resize-y rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 py-3 text-sm font-medium placeholder:font-normal" /></label><label className="grid gap-2 text-sm font-bold text-[#35564b]">เบอร์โทรศัพท์ (เก็บเป็นข้อมูลส่วนตัว)<input name="phone" type="tel" maxLength={30} defaultValue={profile.phone ?? ""} className="h-12 rounded-xl border border-[#d6e4dc] bg-[#fbfcfa] px-3 text-sm font-medium" /></label><div className="flex items-end"><button type="submit" className="w-full rounded-full bg-[#1d7665] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(29,118,101,0.2)] transition hover:-translate-y-0.5 hover:bg-[#155f52]">บันทึกโปรไฟล์</button></div></form>
          </article>
          <aside className="rounded-[1.75rem] bg-[#fbe5d9] p-6 sm:p-8"><p className="text-sm font-bold text-[#633d2d]">การช่วยเหลือที่ปลอดภัย</p><ul className="mt-4 grid gap-4 text-sm leading-7 text-[#895c48]"><li>เลือกเฉพาะงานที่คุณเดินทางและช่วยเหลือได้จริง</li><li>ตรวจสอบวัน เวลา สถานที่ และรายละเอียดก่อนตอบรับ</li><li>บริการนี้ไม่ใช่การรักษาหรือการดูแลทางการแพทย์</li></ul><p className="mt-6 border-t border-[#efcabc] pt-5 text-xs leading-5 text-[#9f6751]">คำขอที่คุณตอบรับแล้วจะปรากฏในรายการ “กำลังดูแล”</p></aside>
        </section>

        <section id="available-requests" className="mt-8 scroll-mt-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-[#1d7665]">คำขอที่เปิดอยู่</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">เลือกงานที่เหมาะกับคุณ</h2></div><p className="text-sm text-[#70847b]">แสดงวัน เวลา เส้นทาง และรายละเอียดก่อนตัดสินใจ</p></div>
          {openRequests.length === 0 ? <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#cbded4] bg-white p-7 text-center"><p className="font-bold text-[#35564b]">ยังไม่มีคำขอที่เปิดอยู่</p><p className="mt-2 text-sm text-[#70847b]">กลับมาตรวจสอบอีกครั้งในภายหลังได้เสมอ</p></div> : <div className="mt-6 grid gap-4 lg:grid-cols-2">{openRequests.map((request) => <article key={request.id} className="rounded-[1.5rem] border border-[#dbe7df] bg-white p-6 shadow-[0_8px_28px_rgba(21,60,52,0.04)]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-[0.12em] text-[#1d7665]">{formatDate(request.service_date)} · {request.start_time.slice(0, 5)} น.</p><h3 className="mt-2 text-lg font-semibold">{request.errand_type}</h3></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle.pending.className}`}>{request.companion_id === user.id ? "เลือกคุณไว้แล้ว" : statusStyle.pending.label}</span></div><p className="mt-4 text-sm leading-6 text-[#5f746b]">{request.origin} <span aria-hidden="true">→</span> {request.destination}</p><p className="mt-1 text-sm text-[#70847b]">ใช้เวลาประมาณ {request.duration_minutes} นาที</p>{request.details ? <p className="mt-4 rounded-xl bg-[#f7faf8] p-3 text-sm leading-6 text-[#5f746b]">{request.details}</p> : null}<form action={acceptServiceRequest} className="mt-5"><input type="hidden" name="request_id" value={request.id} /><button className="rounded-full bg-[#153c34] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1d6658]" type="submit">{request.companion_id === user.id ? "ตอบรับคำขอนี้" : "ฉันพร้อมช่วย"}</button></form></article>)}</div>}
        </section>

        <section className="mt-8 pb-10"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[#1d7665]">กำลังดูแล</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">ติดตามบริการที่คุณตอบรับ</h2></div><span className="rounded-full bg-[#e1f0e9] px-3 py-1.5 text-xs font-bold text-[#1d6658]">เสร็จสิ้นแล้ว {completedCount}</span></div>{assignedRequests.length === 0 ? <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#cbded4] bg-white p-7 text-center text-sm text-[#70847b]">เมื่อคุณตอบรับคำขอ รายละเอียดและปุ่มอัปเดตสถานะจะอยู่ที่นี่</div> : <div className="mt-6 grid gap-4 md:grid-cols-2">{assignedRequests.map((request) => <article key={request.id} className="rounded-[1.5rem] border border-[#dbe7df] bg-white p-6 shadow-[0_8px_28px_rgba(21,60,52,0.04)]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-[0.12em] text-[#1d7665]">{formatDate(request.service_date)} · {request.start_time.slice(0, 5)} น.</p><h3 className="mt-2 text-lg font-semibold">{request.errand_type}</h3></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle[request.status].className}`}>{statusStyle[request.status].label}</span></div><p className="mt-4 text-sm leading-6 text-[#5f746b]">{request.origin} <span aria-hidden="true">→</span> {request.destination}</p><form action={transitionServiceRequest} className="mt-5"><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="next_status" value={request.status === "accepted" ? "in_progress" : "completed"} /><button className="rounded-full bg-[#1d7665] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#155f52]" type="submit">{request.status === "accepted" ? "เริ่มให้บริการ" : "ทำเครื่องหมายว่าเสร็จสิ้น"}</button></form></article>)}</div>}</section>
      </div>
    </main>
  );
}
