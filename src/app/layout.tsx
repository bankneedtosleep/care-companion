import type { Metadata } from "next";
import { Geist, Geist_Mono, Mali, Noto_Sans_Thai, Nunito } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
});

const mali = Mali({
  variable: "--font-mali",
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Care Companion | ไปไหนก็ได้ เมื่อมีคนไปด้วย",
  description: "แพลตฟอร์มเชื่อมโยงผู้ต้องการความช่วยเหลือกับ Companion",
  icons: { icon: "/care-companion-mark.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${notoThai.variable} ${mali.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
