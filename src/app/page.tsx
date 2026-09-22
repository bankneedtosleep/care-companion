import Link from "next/link";
import { Brand } from "@/components/brand";

const steps = [
  { number: "01", title: "เล่าเรื่องธุระของคุณ", text: "บอกวันเวลา จุดเริ่มต้น ปลายทาง และรายละเอียดที่อยากให้ช่วย" },
  { number: "02", title: "พบคนที่เหมาะ", text: "เลือกดู Companion ตามพื้นที่ ความถนัด และช่วงเวลาที่สะดวก" },
  { number: "03", title: "ไปด้วยกันอย่างอุ่นใจ", text: "ติดตามสถานะคำขอจนภารกิจของคุณเสร็จเรียบร้อย" },
];

const values = [
  { icon: "⌁", title: "เลือกได้ด้วยตัวเอง", text: "คุณตัดสินใจทุกขั้นตอน เลือกเฉพาะคนและเวลาที่สบายใจ" },
  { icon: "♡", title: "ใกล้ชิดและเข้าใจ", text: "สร้างพื้นที่ให้คนในชุมชนช่วยเหลือกันในเรื่องเล็ก ๆ ของชีวิต" },
  { icon: "✓", title: "ชัดเจนทุกการเดินทาง", text: "เห็นรายละเอียดและสถานะคำขอได้อย่างเป็นระเบียบ" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f4] text-[#153c34]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Brand />
        <div className="hidden items-center gap-7 text-sm font-semibold text-[#5f746b] md:flex">
          <a className="transition hover:text-[#1d7665]" href="#how-it-works">วิธีใช้งาน</a>
          <a className="transition hover:text-[#1d7665]" href="#our-promise">ความตั้งใจของเรา</a>
        </div>
        <Link href="/login" className="rounded-full bg-[#153c34] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(21,60,52,0.15)] transition hover:-translate-y-0.5 hover:bg-[#1d6658] sm:px-5">
          เข้าสู่ระบบ
        </Link>
      </nav>

      <section className="relative isolate mx-auto grid max-w-7xl items-center gap-12 px-5 pb-18 pt-10 sm:px-8 sm:pb-24 lg:min-h-[calc(100svh-82px)] lg:grid-cols-[1.06fr_0.94fr] lg:gap-16 lg:px-10">
        <div className="pointer-events-none absolute -left-36 top-12 -z-10 h-96 w-96 rounded-full bg-[#dcefe7] blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-12 -z-10 h-80 w-80 rounded-full bg-[#fbe0d3] blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c9e1d6] bg-white/80 px-4 py-2 text-xs font-bold tracking-wide text-[#1d6658] shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#f28b64]" /> อยู่ข้างคุณในทุกธุระ
          </p>
          <h1 className="mt-7 text-[clamp(3.15rem,7vw,6.15rem)] font-semibold leading-[1.03] tracking-[-0.06em] text-[#153c34]">
            ไปไหนก็ได้<br />
            <span className="relative z-0 whitespace-nowrap text-[#1d7665] after:absolute after:-bottom-1 after:left-0 after:-z-10 after:h-3 after:w-full after:rounded-full after:bg-[#f7cbb7]/70">เมื่อมีคนไปด้วย</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-8 text-[#5b7067] sm:text-lg">
            แพลตฟอร์มที่เชื่อมโยงคุณกับ Companion ที่พร้อมช่วยเดินทางและทำธุระทั่วไป ให้ทุกก้าวนอกบ้านเบาลงอีกนิด
          </p>
          <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
            <Link href="/login?role=customer" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#1d7665] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(29,118,101,0.22)] transition hover:-translate-y-0.5 hover:bg-[#155f52]">
              ฉันต้องการผู้ช่วย <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
            <Link href="/login?role=companion" className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#b8d8ca] bg-white px-6 py-3.5 text-sm font-bold text-[#1d6658] shadow-sm transition hover:-translate-y-0.5 hover:border-[#75af9d] hover:bg-[#edf7f1]">
              ฉันอยากเป็น Companion <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <div className="mt-9 flex items-center gap-4 text-xs text-[#70847b]">
            <div className="flex -space-x-2">
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#f7f8f4] bg-[#f6caae] text-[#754934]">อ</span>
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#f7f8f4] bg-[#b8ded0] text-[#276a5b]">ม</span>
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#f7f8f4] bg-[#e6d5ef] text-[#70558e]">พ</span>
            </div>
            <span><strong className="text-[#35564b]">คนในชุมชน</strong> พร้อมช่วยเหลือกัน</span>
          </div>
        </div>

        <div className="relative mx-auto h-[395px] w-full max-w-[500px] sm:h-[510px]">
          <div className="absolute inset-x-7 bottom-0 top-7 rounded-[2.5rem] bg-[#dcefe7] sm:inset-x-10 sm:top-10" />
          <div className="absolute inset-x-4 bottom-4 top-0 overflow-hidden rounded-[2.25rem] border-[5px] border-white bg-[#e4f1eb] shadow-[0_24px_56px_rgba(21,60,52,0.18)] sm:inset-x-8 sm:bottom-8">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559234938-b60fff04894d?auto=format&fit=crop&w=1000&q=85')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#153c34]/70 via-[#153c34]/5 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-[1.35rem] border border-white/80 bg-white/92 p-2 shadow-[0_12px_28px_rgba(21,60,52,0.2)] backdrop-blur sm:bottom-8 sm:left-8 sm:right-8">
              <div className="px-3 py-2">
                <p className="text-[11px] font-medium text-[#70847b]">Companion ของคุณ</p>
                <p className="mt-1 text-sm font-bold text-[#153c34]">พร้อมช่วยเสมอ</p>
              </div>
              <div className="rounded-xl bg-[#1d7665] px-3 py-2.5 text-white shadow-sm sm:px-4">
                <p className="text-[11px] text-[#d9f1e8]">สถานะการจับคู่</p>
                <p className="mt-1 text-sm font-bold">กำลังค้นหา...</p>
              </div>
            </div>
          </div>
          <div className="absolute right-8 top-6 z-10 rounded-2xl border border-white/90 bg-white/95 px-4 py-3 shadow-[0_12px_26px_rgba(21,60,52,0.13)] backdrop-blur sm:right-10 sm:top-10">
            <p className="text-[11px] font-medium text-[#70847b]">วันนี้มีคนพร้อมช่วย</p>
            <p className="mt-1 text-lg font-bold text-[#153c34]">24 คน</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#dbe7df] bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#1d7665]">ง่ายในสามขั้นตอน</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.05em] text-[#153c34] sm:text-4xl">ความช่วยเหลือที่เริ่มจากการรับฟัง</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#70847b]">ทุกขั้นตอนออกแบบให้ชัดเจน เป็นมิตร และเข้าถึงง่ายสำหรับทุกวัย</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.number} className={`rounded-[1.65rem] border border-[#dbe7df] p-7 transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(21,60,52,0.08)] ${index === 1 ? "bg-[#eaf5f0]" : "bg-[#f9fbf8]"}`}>
                <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-white text-sm font-bold text-[#1d7665] shadow-sm">{step.number}</span>
                <h3 className="mt-7 text-xl font-semibold tracking-[-0.03em] text-[#153c34]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f746b]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="our-promise" className="bg-[#153c34] px-5 py-20 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#9ed3c2]">OUR PROMISE</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-4xl">เราอยู่ที่นี่เพื่อช่วยให้<br />ชีวิตประจำวันเดินต่อได้</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#c7dfd5]">Care Companion ให้บริการช่วยเดินทางและทำธุระทั่วไป ไม่ใช่บริการทางการแพทย์หรือการดูแลรักษาผู้ป่วย</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {values.map((value) => (
              <article key={value.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#8bc7b6]/15 text-lg text-[#9ed3c2]">{value.icon}</span>
                <h3 className="mt-5 text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#c7dfd5]">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
