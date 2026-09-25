import Link from "next/link";
import { AppHeader } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type RequestStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

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
  status: RequestStatus;
  updated_at: string;
};

type Profile = { id: string; full_name: string | null; avatar_url: string | null; bio: string | null };

const statusLabels: Record<RequestStatus, string> = {
  pending: "กำลังรอการตอบรับ",
  accepted: "ตอบรับแล้ว",
  in_progress: "กำลังให้บริการ",
  completed: "เสร็จสิ้นแล้ว",
  cancelled: "ยกเลิกแล้ว",
};

const statusOrder: RequestStatus[] = ["pending", "accepted", "in_progress", "completed"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function timelineFor(status: RequestStatus) {
  if (status === "cancelled") {
    return [{ label: "คำขอถูกยกเลิก", detail: "คำขอนี้ไม่อยู่ในขั้นตอนการให้บริการแล้ว", state: "active" as const }];
  }

  const activeIndex = statusOrder.indexOf(status);
  return [
    { label: "ส่งคำขอแล้ว", detail: "ระบบได้รับรายละเอียดวันเวลาและเส้นทางของคุณแล้ว", state: "complete" as const },
    { label: "จับคู่ Companion", detail: status === "pending" ? "กำลังรอ Companion ที่เหมาะสมตอบรับ" : "มี Companion รับคำขอของคุณแล้ว", state: activeIndex > 0 ? "complete" as const : "active" as const },
    { label: "กำลังให้บริการ", detail: status === "in_progress" ? "Companion กำลังดูแลการเดินทางของคุณ" : "จะแสดงเมื่อเริ่มออกเดินทาง", state: activeIndex > 2 ? "complete" as const : activeIndex === 2 ? "active" as const : "upcoming" as const },
    { label: "เสร็จสิ้นบริการ", detail: status === "completed" ? "ภารกิจนี้เสร็จเรียบร้อยแล้ว" : "รอการยืนยันเมื่อบริการจบลง", state: status === "completed" ? "complete" as const : "upcoming" as const },
  ];
}

export default async function ServiceStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const [{ id }, supabase] = await Promise.all([searchParams, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let requestQuery = supabase
    .from("requests")
    .select("id, customer_id, companion_id, errand_type, service_date, start_time, origin, destination, duration_minutes, details, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1);
  if (id) requestQuery = requestQuery.eq("id", id);
  const { data } = await requestQuery.maybeSingle();
  const request = data as ServiceRequest | null;

  if (!request) {
    return (
      <main className="min-h-screen bg-cream px-5 py-5 text-ink sm:px-8 sm:py-7">
        <div className="mx-auto max-w-3xl">
          <AppHeader label="สถานะบริการ" labelClassName="bg-pastel-mint text-ink" href="/customer" />
          <section className="mt-12 card-cartoon bg-white p-8 text-center sm:p-12">
            <div className="icon-circle mx-auto bg-pastel-yellow text-2xl font-black text-ink">?</div>
            <h1 className="mt-6 text-3xl font-black">ยังไม่พบคำขอบริการ</h1>
            <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-7 text-ink/50">สร้างคำขอจากหน้าหลักก่อน แล้วกลับมาติดตามสถานะได้ที่นี่</p>
            <Link href="/customer" className="btn-cartoon mt-7 inline-flex bg-cartoon-mint px-5 py-3 text-sm text-ink">กลับไปหน้าผู้ใช้บริการ</Link>
          </section>
        </div>
      </main>
    );
  }

  const profileIds = [request.customer_id, request.companion_id].filter(Boolean) as string[];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url, bio").in("id", profileIds);
  const profileMap = new Map((profiles as Profile[] | null ?? []).map((profile) => [profile.id, profile]));
  const customer = profileMap.get(request.customer_id);
  const companion = request.companion_id ? profileMap.get(request.companion_id) : null;
  const timeline = timelineFor(request.status);
  const backHref = user.id === request.customer_id ? "/customer" : "/companion";

  return (
    <main className="min-h-screen bg-cream px-5 py-5 text-ink sm:px-8 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <AppHeader label="สถานะบริการ" labelClassName="bg-pastel-mint text-ink" href={backHref} action={<Link href={backHref} className="btn-cartoon bg-white px-3.5 py-2 text-xs text-ink">กลับสู่หน้าหลัก</Link>} />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-cartoon bg-ink p-6 text-white sm:p-8 relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-14 h-8 w-8 rounded-full bg-cartoon-mint/20" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <span className="badge-cartoon border-white/20 bg-white/10 text-cartoon-mint">SERVICE STATUS</span>
                <h1 className="mt-6 text-4xl font-black sm:text-5xl">{statusLabels[request.status]}</h1>
                <p className="mt-4 text-sm font-bold text-white/50">{formatDate(request.service_date)} · {request.start_time.slice(0, 5)} น.</p>
              </div>
              <span className="badge-cartoon bg-pastel-mint text-ink shrink-0">{request.status === "in_progress" ? "กำลังดำเนินการ" : request.status === "completed" ? "เสร็จสิ้น" : "อัปเดตแล้ว"}</span>
            </div>
            <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
              <div className="card-cartoon-sm border-white/20 bg-white/5 shadow-none p-4">
                <p className="text-xs font-bold text-white/40">ผู้ใช้บริการ</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="icon-circle border-white/30 bg-pastel-peach text-lg font-black text-ink">{(customer?.full_name || "ค").slice(0, 1)}</span>
                  <p className="text-lg font-black">{customer?.full_name || "Customer"}</p>
                </div>
              </div>
              <div className="card-cartoon-sm border-white/20 bg-white/5 shadow-none p-4">
                <p className="text-xs font-bold text-white/40">Companion</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="icon-circle border-white/30 bg-pastel-mint text-lg font-black text-ink">{(companion?.full_name || "รอ").slice(0, 1)}</span>
                  <p className="text-lg font-black">{companion?.full_name || "กำลังรอการจับคู่"}</p>
                </div>
              </div>
            </div>
          </div>
          <aside className="card-cartoon bg-white p-6 sm:p-8">
            <span className="badge-cartoon bg-pastel-yellow text-ink">รายละเอียดคำขอ</span>
            <div className="mt-6 grid gap-3">
              <div className="card-cartoon-sm bg-pastel-yellow/30 p-4"><p className="text-[11px] font-black text-ink/50">ประเภทบริการ</p><p className="mt-2 font-black">{request.errand_type}</p></div>
              <div className="card-cartoon-sm bg-pastel-blue/30 p-4"><p className="text-[11px] font-black text-ink/50">เส้นทาง</p><p className="mt-2 text-sm font-black leading-6">{request.origin} → {request.destination}</p></div>
              <div className="card-cartoon-sm bg-pastel-mint/30 p-4"><p className="text-[11px] font-black text-ink/50">ระยะเวลาโดยประมาณ</p><p className="mt-2 font-black">{request.duration_minutes} นาที</p></div>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="card-cartoon bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="badge-cartoon bg-pastel-blue text-ink">TIMELINE</span>
                <h2 className="mt-4 text-2xl font-black">ความคืบหน้าของบริการ</h2>
              </div>
              <span className="badge-cartoon bg-pastel-yellow text-ink">อัปเดตล่าสุด</span>
            </div>
            <div className="mt-8 space-y-5">
              {timeline.map((item, index) => <div key={item.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`grid h-6 w-6 place-items-center rounded-full border-4 ${item.state === "complete" ? "border-cartoon-mint bg-ink" : item.state === "active" ? "border-pastel-peach bg-pastel-yellow" : "border-ink/10 bg-cream"}`} />
                  {index < timeline.length - 1 ? <div className="mt-2 h-16 w-1 rounded-full bg-ink/10" /> : null}
                </div>
                <div className={`flex-1 card-cartoon-sm ${item.state === "complete" ? "bg-pastel-mint/30" : item.state === "active" ? "bg-pastel-yellow/30" : "bg-cream"} p-4`}>
                  <p className="font-black text-ink">{item.label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-ink/60">{item.detail}</p>
                </div>
              </div>)}
            </div>
          </article>
          <aside className="card-cartoon bg-pastel-peach p-6 sm:p-8">
            <span className="icon-circle bg-white text-ink font-black">!</span>
            <p className="mt-5 text-sm font-black text-ink">ข้อมูลสำคัญ</p>
            <p className="mt-4 text-sm font-bold leading-7 text-ink/70">ระบบจะแสดงสถานะจากคำขอจริงของคุณ เมื่อ Companion ตอบรับหรือเริ่มให้บริการ ข้อมูลจะอัปเดตในหน้านี้</p>
            {request.details ? <div className="mt-6 card-cartoon-sm bg-white/70 p-4"><p className="text-xs font-black text-ink/50">รายละเอียดเพิ่มเติม</p><p className="mt-2 text-sm font-bold leading-6 text-ink/70">{request.details}</p></div> : null}
            <p className="mt-6 border-t-3 border-ink/10 pt-5 text-xs font-bold leading-5 text-ink/40">บริการนี้ช่วยเดินทางและทำธุระทั่วไปเท่านั้น ไม่ใช่บริการทางการแพทย์</p>
          </aside>
        </section>
      </div>
    </main>
  );
}
