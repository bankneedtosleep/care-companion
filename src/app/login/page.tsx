import { signInWithGoogle } from "@/app/auth/actions";
import { Brand } from "@/components/brand";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; role?: string }> }) {
  const { error, role } = await searchParams;
  const selectedRole = role === "companion" ? "companion" : "customer";
  const isCompanion = selectedRole === "companion";
  const heading = isCompanion ? "เริ่มต้นช่วยเหลือใครสักคน" : "เดินทางอย่างอุ่นใจ";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f3ee] px-5 py-7 text-[#1b3a35] sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#dfeee7] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-96 w-96 rounded-full bg-[#f7d2b4] blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-32 h-64 w-64 -translate-x-1/2 rounded-full border border-[#e4d5c9]/70 blur-2xl" />

      <div className="absolute left-5 top-5 sm:left-8 sm:top-7"><Brand compact /></div>

      <div className="relative mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-6xl items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-[0_30px_80px_rgba(27,58,53,0.12)] backdrop-blur-md sm:p-10">
          <div className="text-center lg:text-left">
            <span className={`inline-flex rounded-full px-3.5 py-2 text-xs font-bold ${isCompanion ? "bg-[#fce0d0] text-[#a75d38]" : "bg-[#e3f1ea] text-[#1d6658]"}`}>
              {isCompanion ? "สำหรับ Companion" : "สำหรับผู้ใช้บริการ"}
            </span>
            <p className="mt-7 text-xs font-bold tracking-[0.24em] text-[#1d7665]">CARE COMPANION</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[#153c34] sm:text-5xl">{heading}</h1>
            <p className="mt-4 text-base leading-7 text-[#5d726a]">เข้าสู่ระบบด้วย Google เพื่อเริ่มต้นการเดินทางหรือช่วยเหลืออย่างอุ่นใจและปลอดภัย</p>
          </div>

          {error === "supabase-not-configured" ? (
            <p className="mt-7 rounded-2xl border border-[#f1cbba] bg-[#fff1ea] px-4 py-3 text-sm leading-6 text-[#a65335]">
              ยังไม่ได้ตั้งค่า Supabase กรุณาเติมค่าในไฟล์ .env.local ก่อนเข้าสู่ระบบ
            </p>
          ) : null}

          <form action={signInWithGoogle} className="mt-8">
            <input type="hidden" name="role" value={selectedRole} />
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[#d7e7df] bg-[#fdfcfb] px-5 text-base font-bold text-[#173d38] shadow-[0_10px_20px_rgba(21,60,52,0.08)] transition hover:-translate-y-0.5 hover:border-[#7cb6a5] hover:bg-[#f3faf6]"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f3f5f1] text-sm font-black text-[#4285f4] shadow-inner">G</span>
              เข้าสู่ระบบด้วย Google
            </button>
          </form>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "คำขอ 24/7", value: "24/7" },
              { label: "ปลอดภัย", value: "Verified" },
              { label: "ตอบรับเร็ว", value: "2 min" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[#ecf1ed] bg-[#f8faf8] p-3 text-center">
                <p className="text-lg font-bold text-[#153c34]">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[#6f817a]">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-[#ebf0ec] pt-5 text-center text-xs leading-6 text-[#7e8f89] lg:text-left">
            บริการนี้เป็นการช่วยเดินทางและทำธุระทั่วไปเท่านั้น ไม่ใช่บริการทางการแพทย์
          </div>
        </section>

        <section className="relative hidden min-h-[480px] items-center justify-center lg:flex">
          <div className="absolute h-[30rem] w-[30rem] rounded-full bg-[#f3d1b6]/80 blur-3xl" />
          <div className="relative h-[480px] w-full max-w-[520px]">
            <div className="absolute left-8 top-16 h-52 w-52 rounded-[2.5rem] bg-[#f3d9c6] shadow-[0_25px_55px_rgba(153,92,64,0.2)]" />
            <div className="absolute left-24 top-24 h-52 w-52 rounded-[2.5rem] bg-[#d7e9df] shadow-[0_25px_55px_rgba(44,88,75,0.16)]" />
            <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-[3rem] bg-[#ebf0ee] shadow-[0_25px_55px_rgba(27,58,53,0.12)]" />
            <div className="absolute bottom-10 left-6 h-28 w-28 rounded-full bg-[#f7b18d] shadow-[0_18px_35px_rgba(163,96,64,0.18)]" />
            <div className="absolute bottom-8 right-10 h-28 w-28 rounded-full bg-[#d7e9df] shadow-[0_18px_35px_rgba(42,92,76,0.16)]" />

            <div className="absolute left-1/2 top-14 h-56 w-52 -translate-x-1/2 rounded-[2.5rem] bg-[#f7f0ea] shadow-[inset_0_-12px_20px_rgba(175,111,73,0.08),0_30px_60px_rgba(27,58,53,0.14)]">
              <div className="absolute left-1/2 top-5 h-16 w-16 -translate-x-1/2 rounded-full bg-[#f0caa8]" />
              <div className="absolute bottom-12 left-12 h-20 w-16 rounded-[1.2rem] bg-[#d8c9b5]" />
              <div className="absolute bottom-12 right-12 h-20 w-16 rounded-[1.2rem] bg-[#c2d7d1]" />
              <div className="absolute bottom-10 left-10 h-16 w-20 rounded-[1.5rem] bg-[#f6b890]" />
              <div className="absolute bottom-10 right-10 h-16 w-20 rounded-[1.5rem] bg-[#e8d8bf]" />
              <div className="absolute bottom-2 left-1/2 h-14 w-28 -translate-x-1/2 rounded-[1.8rem] bg-[#f5d7bf]" />
            </div>

            <div className="absolute bottom-20 left-1/2 z-10 w-[250px] -translate-x-1/2 rounded-[1.6rem] border border-white/70 bg-white/90 p-4 shadow-[0_20px_48px_rgba(27,58,53,0.14)] backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a8b85]">Matching</p>
                  <p className="mt-1 text-base font-bold text-[#173d38]">Companion ready</p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e2f1ea] text-[#1d7665]">✓</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
