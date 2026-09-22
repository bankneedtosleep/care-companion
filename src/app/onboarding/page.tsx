import Link from "next/link";
import { chooseRole } from "@/app/onboarding/actions";
import { Brand } from "@/components/brand";

const roles = [
  {
    name: "ฉันต้องการผู้ช่วย",
    description: "สร้างคำขอและพบ Companion ที่เหมาะกับธุระของคุณ",
    role: "customer",
    icon: "⌁",
    className: "bg-[#153c34] text-white hover:bg-[#1d6658]",
    iconClassName: "bg-white/10 text-[#bfe3d6]",
    descriptionClassName: "text-[#c7dfd5]",
  },
  {
    name: "ฉันอยากเป็น Companion",
    description: "แบ่งปันเวลาและช่วยให้การเดินทางของใครสักคนง่ายขึ้น",
    role: "companion",
    icon: "♡",
    className: "border border-[#cde1d6] bg-white text-[#153c34] hover:border-[#78af9e] hover:bg-[#f4faf7]",
    iconClassName: "bg-[#e1f0e9] text-[#1d7665]",
    descriptionClassName: "text-[#5f746b]",
  },
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f4] px-5 py-6 text-[#153c34] sm:px-8 sm:py-7">
      <div className="mx-auto max-w-5xl">
        <Brand compact />
        <section className="relative mt-12 overflow-hidden rounded-[2rem] border border-[#dbe7df] bg-white p-7 shadow-[0_18px_50px_rgba(21,60,52,0.07)] sm:mt-16 sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#e1f0e9] blur-2xl" />
          <div className="relative max-w-2xl">
            <p className="text-sm font-bold tracking-[0.16em] text-[#1d7665]">เริ่มต้นใช้งาน</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#153c34] sm:text-5xl">คุณกำลังมองหาอะไรอยู่?</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#5f746b] sm:text-base">เลือกบทบาทเพื่อให้เราเตรียมพื้นที่ใช้งานที่เหมาะกับคุณ</p>
          </div>

          <div className="relative mt-10 grid gap-5 md:grid-cols-2">
            {roles.map((item) => (
              <form key={item.role} action={chooseRole}>
                <input type="hidden" name="role" value={item.role} />
                <button className={`group min-h-72 w-full rounded-[1.65rem] p-7 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(21,60,52,0.12)] ${item.className}`} type="submit">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${item.iconClassName}`}>{item.icon}</span>
                  <h2 className="mt-12 text-2xl font-semibold tracking-[-0.04em]">{item.name}</h2>
                  <p className={`mt-3 max-w-sm text-sm leading-7 ${item.descriptionClassName}`}>{item.description}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold">เลือกบทบาทนี้ <span className="transition group-hover:translate-x-1">→</span></span>
                </button>
              </form>
            ))}
          </div>
        </section>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#5f746b] transition hover:text-[#1d7665]">← กลับหน้าแรก</Link>
      </div>
    </main>
  );
}
