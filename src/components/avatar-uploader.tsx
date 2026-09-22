"use client";

import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";

type AvatarUploaderProps = {
  userId: string;
  initialUrl: string | null;
  fullName: string | null;
};

export function AvatarUploader({ userId, initialUrl, fullName }: AvatarUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setMessage("เลือกไฟล์รูปภาพขนาดไม่เกิน 5 MB");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setMessage("");
    const supabase = createClient();
    const objectPath = `${userId}/avatar`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(objectPath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

    if (uploadError) {
      setMessage(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(objectPath);
    const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
    const { error: profileError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);
    setIsUploading(false);
    event.target.value = "";

    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    setImageUrl(avatarUrl);
    setMessage("อัปโหลดรูปโปรไฟล์แล้ว");
    router.refresh();
  }

  const initial = (fullName || "C").slice(0, 1);

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div
        aria-label="รูปโปรไฟล์"
        className={`grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-[#e1f0e9] text-lg font-bold text-[#1d7665] ${imageUrl ? "bg-cover bg-center text-transparent" : ""}`}
        style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
      >
        {initial}
      </div>
      <div>
        <input ref={inputRef} className="sr-only" id="avatar" type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} />
        <label htmlFor="avatar" className="cursor-pointer rounded-full border border-[#bcd5ca] px-3.5 py-2 text-xs font-bold text-[#1d6658] transition hover:bg-[#eaf5f0]">
          {isUploading ? "กำลังอัปโหลด…" : "เปลี่ยนรูป"}
        </label>
        {message ? <p className="mt-2 max-w-32 text-[11px] leading-4 text-[#70847b]" aria-live="polite">{message}</p> : null}
      </div>
    </div>
  );
}
