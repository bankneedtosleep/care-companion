"use client";

import type { ReactNode } from "react";
import { CalendarDays, Home, MapPinned, UserRound, Check, ArrowRight, Clock3, MapPin, Sparkles } from "lucide-react";

export function CartoonIcon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#2C2A3A] bg-[#FDE7F3] shadow-[0_4px_0_#2C2A3A] ${className}`}>
      {children}
    </div>
  );
}

export function CustomerBookingWizard() {
  return (
    <div className="mx-auto max-w-4xl rounded-[2.5rem] border-4 border-[#2C2A3A] bg-[#FFFDF7] p-5 shadow-[0_10px_0_#2C2A3A]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#6A6A7A]">Booking flow</p>
          <h2 className="mt-2 text-3xl font-black text-[#2C2A3A]">Plan your ride</h2>
        </div>
        <div className="rounded-full border-4 border-[#2C2A3A] bg-[#D9F7E8] px-4 py-2 text-sm font-black text-[#2C2A3A]">
          3 steps
        </div>
      </div>

      <div className="mb-7 grid gap-3 sm:grid-cols-3">
        {[
          { step: "1", label: "Destination", active: true },
          { step: "2", label: "Date & Time", active: false },
          { step: "3", label: "Need Help With", active: false },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 rounded-[1.6rem] border-4 border-[#2C2A3A] p-3 ${
              item.active ? "bg-[#DFF3FF]" : "bg-[#F7F2EF]"
            }`}
          >
            <div className="grid h-10 w-10 place-items-center rounded-full border-4 border-[#2C2A3A] bg-[#FFF4C2] text-sm font-black">
              {item.step}
            </div>
            <span className="text-sm font-black text-[#2C2A3A]">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="rounded-[2rem] border-4 border-[#2C2A3A] bg-[#FDE7F3] p-5">
          <label className="mb-3 flex items-center gap-3 text-base font-black text-[#2C2A3A]">
            <MapPin className="h-6 w-6" strokeWidth={2.5} />
            Destination
          </label>
          <input
            aria-label="Destination"
            placeholder="Where do you want to go?"
            className="h-16 w-full rounded-[1.4rem] border-4 border-[#2C2A3A] bg-[#FFFDF7] px-4 text-base font-bold text-[#2C2A3A] outline-none placeholder:text-[#6A6A7A]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[2rem] border-4 border-[#2C2A3A] bg-[#DFF3FF] p-5">
            <label className="mb-3 flex items-center gap-3 text-base font-black text-[#2C2A3A]">
              <CalendarDays className="h-6 w-6" strokeWidth={2.5} />
              Date
            </label>
            <input
              type="date"
              aria-label="Date"
              className="h-16 w-full rounded-[1.4rem] border-4 border-[#2C2A3A] bg-[#FFFDF7] px-4 text-base font-bold text-[#2C2A3A] outline-none"
            />
          </div>

          <div className="rounded-[2rem] border-4 border-[#2C2A3A] bg-[#FFF4C2] p-5">
            <label className="mb-3 flex items-center gap-3 text-base font-black text-[#2C2A3A]">
              <Clock3 className="h-6 w-6" strokeWidth={2.5} />
              Time
            </label>
            <input
              type="time"
              aria-label="Time"
              className="h-16 w-full rounded-[1.4rem] border-4 border-[#2C2A3A] bg-[#FFFDF7] px-4 text-base font-bold text-[#2C2A3A] outline-none"
            />
          </div>
        </div>

        <div className="rounded-[2rem] border-4 border-[#2C2A3A] bg-[#D9F7E8] p-5">
          <label className="mb-4 flex items-center gap-3 text-base font-black text-[#2C2A3A]">
            <Sparkles className="h-6 w-6" strokeWidth={2.5} />
            Need Help With
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Hospital",
              "Bank",
              "Shopping",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className="active:translate-y-1 active:shadow-none rounded-[1.4rem] border-4 border-[#2C2A3A] bg-[#FFFDF7] px-4 py-3 text-base font-black text-[#2C2A3A] shadow-[0_6px_0_#2C2A3A] transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
        <button
          type="button"
          className="rounded-full border-4 border-[#2C2A3A] bg-[#F7F2EF] px-6 py-3 text-base font-black text-[#2C2A3A] shadow-[0_6px_0_#2C2A3A] transition active:translate-y-1 active:shadow-none"
        >
          Back
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-full border-4 border-[#2C2A3A] bg-[#B9F1C2] px-6 py-3 text-base font-black text-[#2C2A3A] shadow-[0_6px_0_#2C2A3A] transition active:translate-y-1 active:shadow-none"
        >
          Next step
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function CompanionProfileCard() {
  return (
    <div className="mx-auto max-w-md rounded-[2rem] border-4 border-[#2C2A3A] bg-[#FDE7F3] p-5 shadow-[0_12px_0_#2C2A3A] transition hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-[#2C2A3A] bg-[#DFF3FF] text-2xl font-black text-[#2C2A3A]">
          P
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5A5A68]">Companion</p>
          <h3 className="mt-1 text-3xl font-black text-[#2C2A3A]">Pim</h3>
          <p className="text-sm font-bold text-[#5A5A68]">5 years experience</p>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border-4 border-[#2C2A3A] bg-[#FFFDF7] p-4">
        <p className="text-sm font-bold text-[#5A5A68]">About</p>
        <p className="mt-2 text-base font-bold leading-7 text-[#2C2A3A]">
          Friendly helper who loves guiding elderly customers to appointments and daily errands with patience.
        </p>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#5A5A68]">Skills</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Hospital support", bg: "bg-[#D9F7E8]" },
            { label: "Bank help", bg: "bg-[#FFF4C2]" },
            { label: "Friendly chat", bg: "bg-[#DFF3FF]" },
            { label: "Travel escort", bg: "bg-[#F9C7A7]" },
          ].map((tag) => (
            <span key={tag.label} className={`rounded-full border-4 border-[#2C2A3A] px-3 py-2 text-xs font-black text-[#2C2A3A] ${tag.bg}`}>
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-4 border-[#2C2A3A] bg-[#B9F1C2] px-5 py-3 text-lg font-black text-[#2C2A3A] shadow-[0_8px_0_#2C2A3A] transition hover:animate-[bounce_0.7s_ease-in-out] active:translate-y-1 active:shadow-none"
      >
        <Check className="h-5 w-5" strokeWidth={2.5} />
        Accept
      </button>
    </div>
  );
}

export function CuteDashboardNav() {
  const items = [
    { label: "Home", icon: Home, active: true, color: "bg-[#DFF3FF]" },
    { label: "Schedule", icon: CalendarDays, active: false, color: "bg-[#FFF4C2]" },
    { label: "Profile", icon: UserRound, active: false, color: "bg-[#FDE7F3]" },
    { label: "Map", icon: MapPinned, active: false, color: "bg-[#D9F7E8]" },
  ];

  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] border-4 border-[#2C2A3A] bg-[#FFFDF7] p-3 shadow-[0_10px_0_#2C2A3A]">
      <nav className="flex items-center justify-between gap-2 sm:gap-4">
        {items.map(({ label, icon: Icon, active, color }) => (
          <button
            key={label}
            type="button"
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[1.5rem] border-4 border-[#2C2A3A] px-3 py-3 text-center transition ${
              active ? `${color} animate-floaty` : "bg-[#F7F2EF]"
            }`}
          >
            <span className="grid h-11 w-11 place-items-center rounded-full border-4 border-[#2C2A3A] bg-white">
              <Icon className="h-5 w-5" strokeWidth={3} />
            </span>
            <span className="text-xs font-black text-[#2C2A3A]">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
