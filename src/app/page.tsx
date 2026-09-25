"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Brand } from "@/components/brand";
import { IconMapHeart, IconPeopleHands, IconShieldCheck, IconStar, IconHandshake, IconClipboard } from "@/components/cartoon-icons";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "เล่าเรื่องธุระของคุณ",
    text: "บอกวันเวลา จุดเริ่มต้น ปลายทาง และรายละเอียดที่อยากให้ช่วย",
    color: "bg-pastel-pink",
    Icon: IconMapHeart,
  },
  {
    number: "02",
    title: "พบคนที่เหมาะ",
    text: "เลือกดู Companion ตามพื้นที่ ความถนัด และช่วงเวลาที่สะดวก",
    color: "bg-pastel-blue",
    Icon: IconPeopleHands,
  },
  {
    number: "03",
    title: "ไปด้วยกันอย่างอุ่นใจ",
    text: "ติดตามสถานะคำขอจนภารกิจของคุณเสร็จเรียบร้อย",
    color: "bg-pastel-mint",
    Icon: IconShieldCheck,
  },
];

const values = [
  {
    title: "เลือกได้ด้วยตัวเอง",
    text: "คุณตัดสินใจทุกขั้นตอน เลือกเฉพาะคนและเวลาที่สบายใจ",
    color: "bg-pastel-yellow",
    Icon: IconStar,
  },
  {
    title: "ใกล้ชิดและเข้าใจ",
    text: "สร้างพื้นที่ให้คนในชุมชนช่วยเหลือกันในเรื่องเล็ก ๆ ของชีวิต",
    color: "bg-pastel-lilac",
    Icon: IconHandshake,
  },
  {
    title: "ชัดเจนทุกการเดินทาง",
    text: "เห็นรายละเอียดและสถานะคำขอได้อย่างเป็นระเบียบผ่านแอปพลิเคชัน",
    color: "bg-pastel-peach",
    Icon: IconClipboard,
  },
];

export default function Home() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
        if (data) {
          setUserRole(data.role);
        }
      }
      setIsLoading(false);
    }
    checkUser();
  }, []);

  return (
    <main className="min-h-screen bg-cream text-ink overflow-hidden">
      {/* ── Navbar ───────────────────────────────── */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Brand />
        <div className="hidden items-center gap-7 text-sm font-black text-ink/70 md:flex">
          <a className="transition hover:text-ink" href="#how-it-works">วิธีใช้งาน</a>
          <a className="transition hover:text-ink" href="#our-promise">ความตั้งใจของเรา</a>
        </div>
        {isLoading ? (
          <div className="h-10 w-24 animate-pulse rounded-full bg-ink/10" />
        ) : userRole ? (
          <Link
            href={userRole === "admin" ? "/admin" : userRole === "companion" ? "/companion" : "/customer"}
            className="btn-cartoon flex items-center gap-2 bg-pastel-mint px-5 py-2.5 text-sm text-ink"
          >
            <span className="icon-circle !h-5 !w-5 !border-2 bg-white text-[10px] font-black text-ink">
              {userRole === "companion" ? "C" : userRole === "customer" ? "U" : "A"}
            </span>
            <span>
              {userRole === "companion" ? "พื้นที่ Companion" : userRole === "customer" ? "พื้นที่ผู้ใช้บริการ" : "พื้นที่แอดมิน"}
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="btn-cartoon bg-cartoon-mint px-5 py-2.5 text-sm text-ink"
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </nav>

      {/* ── Hero Section ─────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pb-24 lg:grid lg:min-h-[calc(100svh-82px)] lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-10">
        {/* Soft decorative blobs */}
        <div className="pointer-events-none absolute -left-20 top-10 h-48 w-48 rounded-full bg-pastel-mint/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-32 h-40 w-40 rounded-full bg-pastel-pink/30 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl"
        >
          <span className="badge-cartoon bg-pastel-yellow text-ink">
            <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-ink bg-cartoon-mint" />
            อยู่ข้างคุณในทุกธุระ
          </span>

          <h1 className="mt-7 text-[clamp(2.6rem,6.5vw,5.5rem)] font-black leading-[1.08] text-ink">
            ไปไหนก็ได้<br />
            <span className="relative inline-block text-ink">
              เมื่อมีคนไปด้วย
              <span className="absolute -bottom-1 left-0 -z-10 h-4 w-full rounded-full bg-cartoon-mint" />
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base font-bold leading-8 text-ink/60 sm:text-lg">
            แพลตฟอร์มที่เชื่อมโยงคุณกับ Companion ที่พร้อมช่วยเดินทางและทำธุระทั่วไป ให้ทุกก้าวนอกบ้านเบาลงอีกนิด
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login?role=customer"
              className="btn-cartoon bg-cartoon-mint px-7 py-4 text-center text-sm text-ink"
            >
              ฉันต้องการผู้ช่วย →
            </Link>
            <Link
              href="/login?role=companion"
              className="btn-cartoon bg-pastel-pink px-7 py-4 text-center text-sm text-ink"
            >
              ฉันอยากเป็น Companion
            </Link>
          </div>

          <div className="mt-9 flex items-center gap-4 text-sm font-bold text-ink/60">
            <div className="flex -space-x-2">
              <span className="icon-circle !h-9 !w-9 !border-[3px] bg-pastel-peach text-xs font-black">อ</span>
              <span className="icon-circle !h-9 !w-9 !border-[3px] bg-pastel-blue text-xs font-black">ม</span>
              <span className="icon-circle !h-9 !w-9 !border-[3px] bg-pastel-lilac text-xs font-black">พ</span>
            </div>
            <span><strong className="text-ink">คนในชุมชน</strong> พร้อมช่วยเหลือกัน</span>
          </div>
        </motion.div>

        {/* Hero Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto mt-10 w-full max-w-lg lg:mt-0"
        >
          <div className="card-cartoon relative overflow-hidden p-4">
            <Image
              src="/hero-illustration.png"
              alt="Companion เดินไปด้วยกัน"
              width={600}
              height={500}
              className="w-full rounded-[1.5rem] border-4 border-ink object-cover"
              priority
            />
            {/* Floating badge */}
            <div className="absolute -right-2 top-6 card-cartoon-sm bg-pastel-yellow animate-floaty px-4 py-3 sm:-right-4 sm:top-10">
              <p className="text-[11px] font-black text-ink/60">วันนี้มีคนพร้อมช่วย</p>
              <p className="mt-1 text-xl font-black text-ink">24 คน</p>
            </div>
            {/* Bottom status card */}
            <div className="absolute -bottom-3 left-4 right-4 card-cartoon-sm bg-pastel-mint flex items-center justify-between p-3 sm:left-6 sm:right-6">
              <div className="px-2">
                <p className="text-[11px] font-bold text-ink/60">Companion ของคุณ</p>
                <p className="mt-0.5 text-sm font-black text-ink">พร้อมช่วยเสมอ</p>
              </div>
              <div className="card-cartoon-sm bg-pastel-yellow !shadow-[0_3px_0_#2C2A3A] px-3 py-2">
                <p className="text-[10px] font-bold text-ink/60">สถานะ</p>
                <p className="text-xs font-black text-ink">กำลังค้นหา...</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── How It Works ─────────────────────────── */}
      <section id="how-it-works" className="border-y-4 border-ink bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="badge-cartoon bg-pastel-blue text-ink">ง่ายในสามขั้นตอน</span>
            <h2 className="mt-6 text-3xl font-black text-ink sm:text-4xl">
              ความช่วยเหลือที่เริ่มจากการรับฟัง
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-bold leading-7 text-ink/60">
              ทุกขั้นตอนออกแบบให้ชัดเจน เป็นมิตร และเข้าถึงง่ายสำหรับทุกวัย
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`card-cartoon ${step.color} p-7 transition hover:-translate-y-2`}
              >
                <step.Icon size={56} />
                <h3 className="mt-5 text-xl font-black text-ink">{step.title}</h3>
                <p className="mt-3 text-sm font-bold leading-7 text-ink/60">{step.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Promise ──────────────────────────── */}
      <section id="our-promise" className="relative bg-ink px-5 py-20 text-white sm:px-8 lg:px-10 overflow-hidden">
        {/* Small decorative dots */}
        <div className="pointer-events-none absolute right-12 top-14 h-6 w-6 rounded-full bg-cartoon-mint/30" />
        <div className="pointer-events-none absolute right-24 top-24 h-4 w-4 rounded-full bg-pastel-pink/30" />
        <div className="pointer-events-none absolute left-10 bottom-16 h-5 w-5 rounded-full bg-pastel-yellow/30" />
        <div className="pointer-events-none absolute left-20 bottom-28 h-3 w-3 rounded-full bg-pastel-blue/30" />

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="badge-cartoon border-white/20 bg-white/10 text-cartoon-mint">OUR PROMISE</span>
              <h2 className="mt-6 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
                เราอยู่ที่นี่เพื่อช่วยให้<br className="hidden sm:block"/>ชีวิตประจำวันเดินต่อได้
              </h2>
            </div>
            <p className="max-w-sm text-sm font-bold leading-7 text-white/50">
              Care Companion ให้บริการช่วยเดินทางและทำธุระทั่วไป ไม่ใช่บริการทางการแพทย์หรือการดูแลรักษาผู้ป่วย
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((value, index) => (
              <motion.article
                key={value.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`card-cartoon ${value.color} p-7 text-ink`}
              >
                <value.Icon size={48} />
                <h3 className="mt-4 text-xl font-black">{value.title}</h3>
                <p className="mt-3 text-sm font-bold leading-7 text-ink/60">{value.text}</p>
              </motion.article>
            ))}
          </div>

          {/* Community illustration */}
          <div className="mx-auto mt-16 max-w-md">
            <Image
              src="/community-illustration.png"
              alt="ชุมชนที่ช่วยเหลือกัน"
              width={800}
              height={400}
              className="w-full h-auto rounded-[2rem] border-4 border-white/20 object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="border-t-4 border-ink bg-cream py-10 text-center">
        <p className="text-sm font-bold text-ink/40">© {new Date().getFullYear()} Care Companion. ทุกสิทธิ์สงวนไว้</p>
      </footer>
    </main>
  );
}
