import Link from "next/link";
import { chooseRole } from "@/app/onboarding/actions";
import { Brand } from "@/components/brand";

const roles = [
  {
    name: "ฉันต้องการผู้ช่วย",
    description: "สร้างคำขอและพบ Companion ที่เหมาะกับธุระของคุณ",
    role: "customer",
    cardColor: "bg-pastel-mint",
    iconBg: "bg-cartoon-mint",
  },
  {
    name: "ฉันอยากเป็น Companion",
    description: "แบ่งปันเวลาและช่วยให้การเดินทางของใครสักคนง่ายขึ้น",
    role: "companion",
    cardColor: "bg-pastel-pink",
    iconBg: "bg-pastel-peach",
  },
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-cream px-5 py-6 text-ink sm:px-8 sm:py-7">
      <div className="mx-auto max-w-5xl">
        <Brand compact />
        <section className="relative mt-12 card-cartoon bg-white p-7 sm:mt-16 sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-pastel-mint/30 blur-2xl" />
          <div className="relative max-w-2xl">
            <span className="badge-cartoon bg-pastel-yellow text-ink">เริ่มต้นใช้งาน</span>
            <h1 className="mt-6 text-4xl font-black text-ink sm:text-5xl">คุณกำลังมองหาอะไรอยู่?</h1>
            <p className="mt-4 max-w-xl text-sm font-bold leading-7 text-ink/60 sm:text-base">เลือกบทบาทเพื่อให้เราเตรียมพื้นที่ใช้งานที่เหมาะกับคุณ</p>
          </div>

          <div className="relative mt-10 grid gap-6 md:grid-cols-2">
            {roles.map((item) => (
              <form key={item.role} action={chooseRole}>
                <input type="hidden" name="role" value={item.role} />
                <button
                  className={`group card-cartoon ${item.cardColor} min-h-72 w-full p-7 text-left transition hover:-translate-y-2`}
                  type="submit"
                >
                  <span className={`icon-circle ${item.iconBg} text-lg font-black text-ink`}>
                    {item.role === "customer" ? "?" : "!"}
                  </span>
                  <h2 className="mt-10 text-2xl font-black text-ink">{item.name}</h2>
                  <p className="mt-3 max-w-sm text-sm font-bold leading-7 text-ink/60">{item.description}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-black text-ink">
                    เลือกบทบาทนี้ <span className="transition group-hover:translate-x-2">→</span>
                  </span>
                </button>
              </form>
            ))}
          </div>
        </section>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-ink/60 transition hover:text-ink">← กลับหน้าแรก</Link>
      </div>
    </main>
  );
}
