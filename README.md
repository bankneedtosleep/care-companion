# Care Companion

เว็บแอปสำหรับเชื่อมโยงผู้ที่ต้องการผู้ช่วยเดินทางและทำธุระทั่วไป (Customer) กับผู้ให้บริการร่วมเดินทาง (Companion) โดยไม่ใช่บริการทางการแพทย์หรือการดูแลรักษาผู้ป่วย

## สิ่งที่ทำได้

- หน้า Landing ที่อธิบายบริการและให้เลือกเส้นทาง Customer / Companion ได้ชัดเจน
- Google-only sign-in ผ่าน Supabase Authentication พร้อม role-based route protection
- Customer สร้างคำขอโดยระบุประเภทธุระ วัน เวลา ต้นทาง ปลายทาง ระยะเวลา รายละเอียด และเลือก Companion ได้
- Customer ติดตามสถานะและยกเลิกคำขอที่ยังไม่เริ่มบริการได้
- Companion สร้างโปรไฟล์ ระบุประสบการณ์ ความถนัด พื้นที่ และเวลาที่สะดวก อัปโหลดรูปผ่าน Supabase Storage และตอบรับงาน
- Workflow ที่บังคับตามลำดับ: `pending → accepted → in_progress → completed` (หรือยกเลิกโดย Customer ก่อนเริ่มงาน)
- Admin dashboard แสดงผู้ใช้ คำขอ และสถิติจริง พร้อมเครื่องมือปรับสถานะกรณีต้องดูแล
- RLS และ database functions ป้องกันการข้ามขั้นตอน/แก้ไขคำขอของผู้อื่น รวมถึงไม่เผยแพร่เบอร์โทรศัพท์หรืออีเมลในรายชื่อ Companion

## Tech stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Authentication (Google OAuth), PostgreSQL และ Storage
- Vercel สำหรับ deployment

## เริ่มต้นใช้งาน

```bash
npm install
copy .env.example .env.local
npm run dev
```

กำหนดค่าใน `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

จากนั้นใน Supabase Dashboard:

1. เปิด Google provider ที่ **Authentication → Providers**
2. เพิ่ม redirect URL `http://localhost:3000/auth/callback` และ `<your-vercel-url>/auth/callback`
3. รันไฟล์ [`supabase/schema.sql`](supabase/schema.sql) ใน SQL Editor เพื่อสร้างตาราง, trigger, Storage bucket, RLS และ workflow functions (ไฟล์รันซ้ำได้สำหรับ schema ชุดนี้)
4. เข้าสู่ระบบด้วยบัญชีที่ต้องการให้เป็นผู้ดูแลหนึ่งครั้ง แล้วรันคำสั่งนี้ใน SQL Editor:

   ```sql
   update public.users
   set role = 'admin'
   where email = 'admin@example.com';
   ```

บัญชี Admin ถูกกำหนดในฐานข้อมูลเท่านั้น และไม่สามารถยกระดับสิทธิ์จากหน้า onboarding ได้

## Route หลัก

- `/` — หน้าแนะนำที่เข้าชมได้โดยไม่ต้อง login
- `/login` — Google sign-in
- `/onboarding` — เลือกบทบาท Customer หรือ Companion หลัง login
- `/customer` — สร้างคำขอ เลือก Companion และติดตามบริการ
- `/companion` — จัดการโปรไฟล์ รับงาน และอัปเดตสถานะการบริการ
- `/admin` — ภาพรวมผู้ใช้งานและคำขอทั้งหมด (เฉพาะ Admin)
- `/auth/callback` — แลก OAuth code เป็น Supabase session

## โครงสร้างสำคัญ

```text
src/app/actions.ts             # Server Actions ที่ตรวจ role ก่อนเขียนข้อมูล
src/app/customer/page.tsx      # Customer workflow
src/app/companion/page.tsx     # Companion profile, upload และ service workflow
src/app/admin/page.tsx         # Admin dashboard
src/components/avatar-uploader.tsx
src/middleware.ts              # session refresh และ route gate
supabase/schema.sql            # schema, RLS, Storage policies, business rules
```

## ตรวจสอบและ Deploy

```bash
npm run lint
npm run build
```

เพิ่ม environment variables เดียวกับ `.env.local` ใน Vercel แล้ว deploy จาก GitHub repository. ก่อนส่งงานให้ทดสอบ Google login ด้วย URL บน Vercel, ลองสร้างคำขอด้วย Customer และตอบรับ/เปลี่ยนสถานะด้วย Companion คนละบัญชี.
