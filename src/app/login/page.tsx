import { signInWithGoogle } from "@/app/auth/actions";
import { Brand } from "@/components/brand";
import Image from "next/image";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; role?: string }> }) {
  const { error, role } = await searchParams;
  const isCompanion = role === "companion";
  const isCustomer = role === "customer";
  const hasRole = isCompanion || isCustomer;
  
  const heading = isCompanion ? "เริ่มต้นช่วยเหลือใครสักคน" : isCustomer ? "เดินทางอย่างอุ่นใจ" : "ยินดีต้อนรับสู่ Care Companion";

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream px-5 py-7 text-ink sm:px-8 lg:px-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-pastel-mint/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-96 w-96 rounded-full bg-pastel-peach/40 blur-3xl" />

      <div className="absolute left-5 top-5 sm:left-8 sm:top-7"><Brand compact /></div>

      <div className="relative mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-6xl items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="card-cartoon bg-white p-7 sm:p-10">
          <div className="text-center lg:text-left">
            <span className={`badge-cartoon ${isCompanion ? "bg-pastel-peach" : isCustomer ? "bg-pastel-mint" : "bg-pastel-yellow"} text-ink`}>
              {isCompanion ? "สำหรับ Companion" : isCustomer ? "สำหรับผู้ใช้บริการ" : "เข้าสู่ระบบ / สมัครสมาชิก"}
            </span>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-ink/50">CARE COMPANION</p>
            <h1 className="mt-4 text-4xl font-black text-ink sm:text-5xl">{heading}</h1>
            <p className="mt-4 text-base font-bold leading-7 text-ink/60">เข้าสู่ระบบด้วย Google เพื่อเริ่มต้นการเดินทางหรือช่วยเหลืออย่างอุ่นใจและปลอดภัย</p>
          </div>

          {error === "supabase-not-configured" ? (
            <p className="mt-7 card-cartoon-sm bg-pastel-peach px-4 py-3 text-sm font-bold leading-6 text-ink">
              ยังไม่ได้ตั้งค่า Supabase กรุณาเติมค่าในไฟล์ .env.local ก่อนเข้าสู่ระบบ
            </p>
          ) : null}

          {hasRole ? (
            <form action={signInWithGoogle} className="mt-8">
              <input type="hidden" name="role" value={role} />
              <button
                type="submit"
                className="btn-cartoon flex h-14 w-full items-center justify-center gap-3 bg-white px-5 text-base text-ink"
              >
                <span className="icon-circle !h-8 !w-8 !border-[3px] bg-pastel-blue text-sm font-black text-[#4285f4]">G</span>
                เข้าสู่ระบบด้วย Google
              </button>
            </form>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <form action={signInWithGoogle}>
                <input type="hidden" name="role" value="customer" />
                <button type="submit" className="btn-cartoon flex w-full flex-col items-center justify-center gap-1 bg-pastel-mint px-4 py-4 text-ink hover:-translate-y-1">
                  <span className="text-xs font-bold text-ink/60">เข้าสู่ระบบเป็น</span>
                  <span className="text-lg font-black">ผู้ใช้บริการ</span>
                </button>
              </form>
              <form action={signInWithGoogle}>
                <input type="hidden" name="role" value="companion" />
                <button type="submit" className="btn-cartoon flex w-full flex-col items-center justify-center gap-1 bg-pastel-peach px-4 py-4 text-ink hover:-translate-y-1">
                  <span className="text-xs font-bold text-ink/60">เข้าสู่ระบบเป็น</span>
                  <span className="text-lg font-black">Companion</span>
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "คำขอ 24/7", value: "24/7", color: "bg-pastel-yellow" },
              { label: "ปลอดภัย", value: "Verified", color: "bg-pastel-mint" },
              { label: "ตอบรับเร็ว", value: "2 min", color: "bg-pastel-blue" },
            ].map((stat) => (
              <div key={stat.label} className={`card-cartoon-sm ${stat.color} p-3 text-center`}>
                <p className="text-lg font-black text-ink">{stat.value}</p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.08em] text-ink/50">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t-3 border-ink/10 pt-5 text-center text-xs font-bold leading-6 text-ink/40 lg:text-left">
            บริการนี้เป็นการช่วยเดินทางและทำธุระทั่วไปเท่านั้น ไม่ใช่บริการทางการแพทย์
          </div>
        </section>

        <section className="relative hidden items-center justify-center lg:flex">
          <div className="card-cartoon overflow-hidden p-4">
            <Image
              src="/hero-illustration.png"
              alt="เพื่อนร่วมทาง"
              width={500}
              height={420}
              className="w-full rounded-[1.5rem] border-4 border-ink object-cover"
            />
            <div className="mt-4 card-cartoon-sm bg-pastel-mint p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/50">Matching</p>
                <p className="mt-1 text-base font-black text-ink">Companion ready</p>
              </div>
              <span className="icon-circle !border-[3px] bg-pastel-mint text-ink">✓</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
