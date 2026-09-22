import Link from "next/link";
import { AppHeader } from "@/components/brand";

const timeline = [
  { label: "คำขอรับเข้าระบบ", time: "09:15", state: "complete", detail: "Customer ส่งข้อมูลและเลือกวันเวลาเรียบร้อย" },
  { label: "จับคู่ Companion", time: "09:28", state: "complete", detail: "มี Companion พร้อมช่วยเลือกได้ทันที" },
  { label: "กำลังเดินทาง", time: "10:00", state: "active", detail: "Companion กำลังนำทางและช่วยเหลือในเส้นทาง" },
  { label: "เสร็จสิ้นบริการ", time: "11:10", state: "upcoming", detail: "รอการยืนยันจาก Customer ก่อนปิดงาน" },
];

const facts = [
  { label: "ประเภทบริการ", value: "ซื้อของ/ทำธุระทั่วไป" },
  { label: "ระยะเวลาโดยประมาณ", value: "1 ชั่วโมง 45 นาที" },
  { label: "จุดเริ่มต้น", value: "บ้านเลขที่ 14 ซอย 8" },
  { label: "ปลายทาง", value: "ตลาดสด คลองเตย" },
];

export default function ServiceStatusPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] px-5 py-5 text-[#153c34] sm:px-8 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <AppHeader
          label="สถานะบริการ"
          labelClassName="bg-[#e1f0e9] text-[#1d6658]"
          action={
            <Link href="/customer" className="rounded-full border border-[#c8ddd2] bg-white px-3.5 py-2 text-xs font-bold text-[#356156] transition hover:bg-[#eef7f2]">
              กลับสู่หน้าหลัก
            </Link>
          }
        />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] bg-[#153c34] p-6 text-white shadow-[0_24px_70px_rgba(21,60,52,0.16)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold tracking-[0.14em] text-[#a9d5c5]">SERVICE STATUS</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">กำลังให้บริการ</h1>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#dfeee7] px-3.5 py-2 text-xs font-bold text-[#1d6658]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1d7665]" />
                Active
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/12 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#b9d9cf]">Customer</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2d0b0] text-lg font-bold text-[#5b3828]">อ</span>
                  <div>
                    <p className="text-lg font-semibold">ออมทรัพย์</p>
                    <p className="text-sm text-[#d0e1da]">ผู้ใช้บริการ</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/12 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#b9d9cf]">Companion</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dfeee7] text-lg font-bold text-[#1d6658]">ป</span>
                  <div>
                    <p className="text-lg font-semibold">ปิ่น</p>
                    <p className="text-sm text-[#d0e1da]">สายช่วยเดินทาง</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-[#dbe7df] bg-white p-6 shadow-[0_10px_30px_rgba(21,60,52,0.04)] sm:p-8">
            <p className="text-sm font-bold text-[#1d7665]">ข้อมูลปัจจุบัน</p>
            <div className="mt-6 space-y-4">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-2xl bg-[#f8faf8] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#758980]">{fact.label}</p>
                  <p className="mt-2 text-base font-semibold text-[#153c34]">{fact.value}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[1.75rem] border border-[#dbe7df] bg-white p-6 shadow-[0_10px_30px_rgba(21,60,52,0.04)] sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#1d7665]">Timeline</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">สถานะการให้บริการ</h2>
              </div>
              <span className="rounded-full bg-[#f4f6f2] px-3 py-1.5 text-xs font-bold text-[#5f746b]">Live</span>
            </div>

            <div className="mt-8 space-y-5">
              {timeline.map((item, index) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`grid h-5 w-5 place-items-center rounded-full border-4 ${
                        item.state === "complete"
                          ? "border-[#dfeee7] bg-[#1d7665]"
                          : item.state === "active"
                            ? "border-[#f6d5b8] bg-[#f2b790]"
                            : "border-[#ebeeea] bg-[#f5f7f5]"
                      }`}
                    />
                    {index < timeline.length - 1 ? <div className="mt-2 h-16 w-px bg-[#dfe7e1]" /> : null}
                  </div>

                  <div className="flex-1 rounded-2xl bg-[#f8faf8] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[#153c34]">{item.label}</p>
                      <span className="text-xs font-bold text-[#70847b]">{item.time}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#5f746b]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-[1.75rem] bg-[#fbe5d9] p-6 sm:p-8">
            <p className="text-sm font-bold text-[#633d2d]">สิ่งที่ Customer จะเห็น</p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-[#895c48]">
              <li>• ติดตาม Companion คนที่เข้ามาช่วยได้แบบเรียลไทม์</li>
              <li>• ตรวจสอบความคืบหน้าและเวลาที่คาดว่าจะเสร็จ</li>
              <li>• รับการแจ้งเตือนเมื่อลูกค้าและ Companion ตกลงเรื่องเสร็จสิ้น</li>
            </ul>
            <div className="mt-6 rounded-2xl bg-white/70 p-4 text-xs leading-6 text-[#8d6554]">
              การบริการนี้ออกแบบสำหรับช่วยเดินทางและปฏิบัติงานทั่วไปเท่านั้น ไม่ใช่การดูแลทางการแพทย์
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
