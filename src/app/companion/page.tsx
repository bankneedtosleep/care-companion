import {
  acceptServiceRequest,
  saveCompanionProfile,
  signOut,
  transitionServiceRequest,
} from "@/app/actions";
import { AvatarUploader } from "@/components/avatar-uploader";
import { AppHeader } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
  pending: { label: "เปิดรับ Companion", color: "bg-pastel-yellow" },
  accepted: { label: "คุณตอบรับแล้ว", color: "bg-pastel-mint" },
  in_progress: { label: "กำลังให้บริการ", color: "bg-pastel-blue" },
  completed: { label: "เสร็จสิ้น", color: "bg-pastel-lilac" },
  cancelled: { label: "ยกเลิกแล้ว", color: "bg-pastel-peach" },
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

  const { data: account } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!account || account.role !== "companion") {
    redirect("/onboarding");
  }

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
    <main className="min-h-screen bg-cream px-5 py-5 text-ink sm:px-8 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <AppHeader
          label="พื้นที่ของ Companion"
          labelClassName="bg-pastel-pink text-ink"
          href="/companion"
          action={<form action={signOut}><button className="btn-cartoon bg-white px-3.5 py-2 text-xs text-ink" type="submit">ออกจากระบบ</button></form>}
        />
        {params.error ? <p className="mt-6 card-cartoon-sm bg-pastel-peach px-4 py-3 text-sm font-bold text-ink" role="alert">{params.error}</p> : null}
        {params.notice ? <p className="mt-6 card-cartoon-sm bg-pastel-mint px-4 py-3 text-sm font-bold text-ink" role="status">{params.notice === "profile-saved" ? "บันทึกโปรไฟล์เรียบร้อยแล้ว" : params.notice === "request-accepted" ? "ตอบรับคำขอเรียบร้อยแล้ว" : "อัปเดตสถานะเรียบร้อยแล้ว"}</p> : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card-cartoon bg-ink px-6 py-9 text-white sm:px-10 sm:py-12 relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-14 h-8 w-8 rounded-full bg-cartoon-mint/20" />
            <div className="relative max-w-xl">
              <span className="badge-cartoon border-white/20 bg-white/10 text-cartoon-mint">พื้นที่ของคุณ</span>
              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">ช่วยให้การไปธุระของใครสักคน<br className="hidden sm:block" /> ง่ายขึ้นในทุกวัน</h1>
              <p className="mt-5 max-w-lg text-sm font-bold leading-7 text-white/60 sm:text-base">เติมโปรไฟล์ให้ชัดเจน แล้วเลือกตอบรับเฉพาะคำขอที่เหมาะกับเวลา พื้นที่ และความถนัดของคุณ</p>
              <a href="#available-requests" className="btn-cartoon mt-8 inline-flex items-center gap-2 bg-cartoon-mint px-5 py-3.5 text-sm text-ink">ดูคำขอที่เปิดอยู่ →</a>
            </div>
          </div>
          <aside className="card-cartoon bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-ink">ความพร้อมของคุณ</span>
              <span className="badge-cartoon bg-pastel-mint text-ink">พร้อมเริ่มต้น</span>
            </div>
            <div className="mt-7 card-cartoon-sm bg-pastel-yellow p-5">
              <div className="flex items-end justify-between"><p className="text-xs font-black text-ink/50">โปรไฟล์ที่สมบูรณ์</p><p className="text-2xl font-black">{profileProgress}%</p></div>
              <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-white"><div className="h-full rounded-full bg-cartoon-mint" style={{ width: `${profileProgress}%` }} /></div>
              <p className="mt-3 text-sm font-bold leading-6 text-ink/50">โปรไฟล์ที่มีพื้นที่ ความถนัด และเวลาว่าง ช่วยให้เลือกงานที่ใช่ได้เร็วขึ้น</p>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3">
              <div className="card-cartoon-sm bg-pastel-peach p-4"><dt className="text-xs font-bold text-ink/50">คำขอเปิดอยู่</dt><dd className="mt-1 text-2xl font-black text-ink">{openRequests.length}</dd></div>
              <div className="card-cartoon-sm bg-pastel-mint p-4"><dt className="text-xs font-bold text-ink/50">กำลังดูแล</dt><dd className="mt-1 text-2xl font-black text-ink">{assignedRequests.length}</dd></div>
            </dl>
          </aside>
        </section>

        {/* Profile form */}
        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="card-cartoon bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="badge-cartoon bg-pastel-blue text-ink">โปรไฟล์สาธารณะ</span>
                <h2 className="mt-4 text-2xl font-black">บอกเล่าเรื่องราวที่ Customer ควรรู้</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-ink/50">ไม่แสดงเบอร์โทรศัพท์ในรายชื่อสาธารณะ</p>
              </div>
              <AvatarUploader userId={user.id} initialUrl={profile.avatar_url} fullName={profile.full_name} />
            </div>
            <form action={saveCompanionProfile} className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-ink">ชื่อที่แสดงแก่ Customer<input name="full_name" required maxLength={100} defaultValue={profile.full_name ?? ""} className="input-cartoon h-12" /></label>
              <label className="grid gap-2 text-sm font-black text-ink">ช่วงเวลาที่สะดวก<input name="availability" required maxLength={160} defaultValue={profile.availability ?? ""} placeholder="เช่น เสาร์–อาทิตย์ 09:00–17:00" className="input-cartoon h-12 placeholder:font-bold placeholder:text-ink/30" /></label>
              <label className="grid gap-2 text-sm font-black text-ink">พื้นที่ที่ให้บริการ<input name="service_areas" maxLength={300} defaultValue={profile.service_areas?.join(", ") ?? ""} placeholder="คั่นแต่ละพื้นที่ด้วยเครื่องหมาย ," className="input-cartoon h-12 placeholder:font-bold placeholder:text-ink/30" /></label>
              <label className="grid gap-2 text-sm font-black text-ink">ความถนัด<input name="skills" maxLength={300} defaultValue={profile.skills?.join(", ") ?? ""} placeholder="เช่น พาไปโรงพยาบาล, ใช้รถเข็น" className="input-cartoon h-12 placeholder:font-bold placeholder:text-ink/30" /></label>
              <label className="grid gap-2 text-sm font-black text-ink sm:col-span-2">แนะนำตัว<textarea name="bio" required maxLength={500} rows={3} defaultValue={profile.bio ?? ""} placeholder="เล่าแนวทางการช่วยเหลือและสิ่งที่ทำให้คุณเหมาะกับบทบาทนี้" className="input-cartoon resize-y py-3 placeholder:font-bold placeholder:text-ink/30" /></label>
              <label className="grid gap-2 text-sm font-black text-ink sm:col-span-2">ประสบการณ์ (ไม่บังคับ)<textarea name="experience" maxLength={500} rows={2} defaultValue={profile.experience ?? ""} placeholder="เช่น เคยอาสาพาผู้สูงอายุไปทำธุระ" className="input-cartoon resize-y py-3 placeholder:font-bold placeholder:text-ink/30" /></label>
              <label className="grid gap-2 text-sm font-black text-ink">เบอร์โทรศัพท์ (เก็บเป็นข้อมูลส่วนตัว)<input name="phone" type="tel" maxLength={30} defaultValue={profile.phone ?? ""} className="input-cartoon h-12" /></label>
              <div className="flex items-end"><button type="submit" className="btn-cartoon w-full bg-cartoon-mint px-5 py-3.5 text-sm text-ink">บันทึกโปรไฟล์</button></div>
            </form>
          </article>
          <aside className="card-cartoon bg-pastel-pink p-6 sm:p-8">
            <span className="icon-circle bg-white text-ink font-black">!</span>
            <p className="mt-5 text-sm font-black text-ink">การช่วยเหลือที่ปลอดภัย</p>
            <ul className="mt-4 grid gap-4 text-sm font-bold leading-7 text-ink/70">
              <li>เลือกเฉพาะงานที่คุณเดินทางและช่วยเหลือได้จริง</li>
              <li>ตรวจสอบวัน เวลา สถานที่ และรายละเอียดก่อนตอบรับ</li>
              <li>บริการนี้ไม่ใช่การรักษาหรือการดูแลทางการแพทย์</li>
            </ul>
            <p className="mt-6 border-t-3 border-ink/10 pt-5 text-xs font-bold leading-5 text-ink/40">คำขอที่คุณตอบรับแล้วจะปรากฏในรายการ "กำลังดูแล"</p>
          </aside>
        </section>

        {/* Open requests */}
        <section id="available-requests" className="mt-8 scroll-mt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="badge-cartoon bg-pastel-yellow text-ink">คำขอที่เปิดอยู่</span>
              <h2 className="mt-4 text-2xl font-black">เลือกงานที่เหมาะกับคุณ</h2>
            </div>
            <p className="text-sm font-bold text-ink/40">แสดงวัน เวลา เส้นทาง และรายละเอียดก่อนตัดสินใจ</p>
          </div>
          {openRequests.length === 0 ? <div className="mt-6 card-cartoon border-dashed bg-pastel-mint/30 p-7 text-center"><p className="font-black text-ink">ยังไม่มีคำขอที่เปิดอยู่</p><p className="mt-2 text-sm font-bold text-ink/50">กลับมาตรวจสอบอีกครั้งในภายหลังได้เสมอ</p></div> : <div className="mt-6 grid gap-4 lg:grid-cols-2">{openRequests.map((request) => <article key={request.id} className="card-cartoon bg-white p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-ink/50">{formatDate(request.service_date)} · {request.start_time.slice(0, 5)} น.</p><h3 className="mt-2 text-lg font-black">{request.errand_type}</h3></div><span className={`badge-cartoon ${statusStyle.pending.color} text-ink`}>{request.companion_id === user.id ? "เลือกคุณไว้แล้ว" : statusStyle.pending.label}</span></div><p className="mt-4 text-sm font-bold leading-6 text-ink/60">{request.origin} → {request.destination}</p><p className="mt-1 text-sm font-bold text-ink/40">ใช้เวลาประมาณ {request.duration_minutes} นาที</p>{request.details ? <p className="mt-4 card-cartoon-sm bg-pastel-yellow/30 p-3 text-sm font-bold leading-6 text-ink/60">{request.details}</p> : null}<form action={acceptServiceRequest} className="mt-5"><input type="hidden" name="request_id" value={request.id} /><button className="btn-cartoon bg-cartoon-mint px-4 py-2.5 text-xs text-ink" type="submit">{request.companion_id === user.id ? "ตอบรับคำขอนี้" : "ฉันพร้อมช่วย"}</button></form></article>)}</div>}
        </section>

        {/* Assigned requests */}
        <section className="mt-8 pb-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="badge-cartoon bg-pastel-blue text-ink">กำลังดูแล</span>
              <h2 className="mt-4 text-2xl font-black">ติดตามบริการที่คุณตอบรับ</h2>
            </div>
            <span className="badge-cartoon bg-pastel-mint text-ink">เสร็จสิ้นแล้ว {completedCount}</span>
          </div>
          {assignedRequests.length === 0 ? <div className="mt-6 card-cartoon border-dashed bg-pastel-blue/30 p-7 text-center text-sm font-bold text-ink/50">เมื่อคุณตอบรับคำขอ รายละเอียดและปุ่มอัปเดตสถานะจะอยู่ที่นี่</div> : <div className="mt-6 grid gap-4 md:grid-cols-2">{assignedRequests.map((request) => <article key={request.id} className="card-cartoon bg-white p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-ink/50">{formatDate(request.service_date)} · {request.start_time.slice(0, 5)} น.</p><h3 className="mt-2 text-lg font-black">{request.errand_type}</h3></div><span className={`badge-cartoon ${statusStyle[request.status].color} text-ink`}>{statusStyle[request.status].label}</span></div><p className="mt-4 text-sm font-bold leading-6 text-ink/60">{request.origin} → {request.destination}</p><div className="mt-5 flex flex-wrap gap-2"><Link href={`/status?id=${request.id}`} className="btn-cartoon shadow-[0_3px_0_#2C2A3A] bg-pastel-blue px-4 py-2.5 text-xs text-ink">ดูรายละเอียด</Link><form action={transitionServiceRequest}><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="next_status" value={request.status === "accepted" ? "in_progress" : "completed"} /><button className="btn-cartoon shadow-[0_3px_0_#2C2A3A] bg-cartoon-mint px-4 py-2.5 text-xs text-ink" type="submit">{request.status === "accepted" ? "เริ่มให้บริการ" : "ทำเครื่องหมายว่าเสร็จสิ้น"}</button></form></div></article>)}</div>}
        </section>
      </div>
    </main>
  );
}
