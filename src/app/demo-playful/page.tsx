import { CartoonIcon, CompanionProfileCard, CustomerBookingWizard, CuteDashboardNav } from "@/components/playful-ui";
import { CalendarDays, Home, MapPinned, UserRound, Check } from "lucide-react";

export default function DemoPlayfulPage() {
  return (
    <main className="min-h-screen bg-[#F8F4EF] px-4 py-8 text-[#2C2A3A]">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="rounded-[2.5rem] border-4 border-[#2C2A3A] bg-[#D9F7E8] p-6 shadow-[0_10px_0_#2C2A3A]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#5A5A68]">Cute & Playful Theme</p>
              <h1 className="mt-2 text-4xl font-black">Care Companion</h1>
            </div>
            <div className="flex items-center gap-3">
              <CartoonIcon className="bg-[#DFF3FF]">
                <Home className="h-5 w-5" strokeWidth={3} />
              </CartoonIcon>
              <CartoonIcon className="bg-[#FFF4C2]">
                <CalendarDays className="h-5 w-5" strokeWidth={3} />
              </CartoonIcon>
              <CartoonIcon className="bg-[#FDE7F3]">
                <UserRound className="h-5 w-5" strokeWidth={3} />
              </CartoonIcon>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <CustomerBookingWizard />
          <div className="space-y-6">
            <CompanionProfileCard />
            <div className="rounded-[2rem] border-4 border-[#2C2A3A] bg-[#F7F2EF] p-4 shadow-[0_10px_0_#2C2A3A]">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#5A5A68]">Quick access</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[{ icon: Home, label: "Home", color: "bg-[#DFF3FF]" }, { icon: MapPinned, label: "Map", color: "bg-[#D9F7E8]" }, { icon: CalendarDays, label: "Booked", color: "bg-[#FFF4C2]" }, { icon: Check, label: "Ready", color: "bg-[#FDE7F3]" }].map(({ icon: Icon, label, color }) => (
                  <div key={label} className={`flex items-center gap-3 rounded-[1.5rem] border-4 border-[#2C2A3A] p-3 ${color}`}>
                    <span className="grid h-11 w-11 place-items-center rounded-full border-4 border-[#2C2A3A] bg-white">
                      <Icon className="h-5 w-5" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-black text-[#2C2A3A]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <CuteDashboardNav />
      </div>
    </main>
  );
}
