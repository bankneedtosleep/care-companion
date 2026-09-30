"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/browser";

export function ChatBox({
  requestId,
  currentUserId,
  partnerName,
}: {
  requestId: string;
  currentUserId: string;
  partnerName: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [dbError, setDbError] = useState<string | null>(null);
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    supabase
      .from("messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setDbError("ไม่สามารถโหลดแชทได้: " + error.message);
        else if (data) setMessages(data);
      });

    // Realtime channel
    const channel = supabase
      .channel(`chat-${requestId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `request_id=eq.${requestId}` }, (payload) => {
        setMessages((prev) => prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]);
      })
      .on("broadcast", { event: "new_message" }, (payload) => {
        setMessages((prev) => prev.some((m) => m.id === payload.payload.id) ? prev : [...prev, payload.payload]);
      })
      .subscribe();

    // Foolproof fallback: Poll every 3 seconds
    const interval = setInterval(() => {
      supabase
        .from("messages")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (data) {
            setMessages((prev) => data.length > prev.length ? data : prev);
          }
        });
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [requestId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    setDbError(null);

    const { data, error } = await supabase.from("messages").insert({
      request_id: requestId,
      sender_id: currentUserId,
      content: msg,
    }).select().single();
    
    if (error) {
      setDbError(`ส่งข้อความไม่สำเร็จ: ${error.message} (กรุณารัน SQL สร้างตาราง messages)`);
    } else if (data) {
      setMessages((prev) => prev.some((m) => m.id === data.id) ? prev : [...prev, data]);
      supabase.channel(`chat-${requestId}`).send({ type: "broadcast", event: "new_message", payload: data }).catch(() => {});
    }
  }

  return (
    <div className="card-cartoon bg-white flex flex-col h-[480px]">
      <div className="p-5 bg-pastel-yellow border-b-4 border-ink/10 flex items-center justify-between">
        <h3 className="font-black text-ink text-lg">💬 แชทกับ {partnerName}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-cream/30">
        {dbError ? (
          <div className="card-cartoon-sm bg-pastel-peach p-4 text-center text-sm font-bold text-ink">
            {dbError}
          </div>
        ) : null}
        {messages.length === 0 && !dbError ? (
          <div className="text-center my-auto">
            <span className="icon-circle bg-pastel-mint text-ink font-black text-xl mb-3">👋</span>
            <p className="text-sm font-bold text-ink/50">เริ่มต้นพูดคุยเพื่อเตรียมพร้อมเดินทาง</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-2.5 text-sm font-bold max-w-[85%] rounded-2xl ${isMe ? "bg-cartoon-mint text-ink rounded-tr-sm" : "bg-white border-2 border-ink/10 text-ink rounded-tl-sm shadow-sm"}`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 bg-white border-t-4 border-ink/10 flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="พิมพ์ข้อความที่นี่..."
          className="input-cartoon flex-1 min-h-12 text-sm"
        />
        <button type="submit" className="btn-cartoon bg-ink text-white px-6 py-2 text-sm shadow-[0_4px_0_#2C2A3A] active:translate-y-1 active:shadow-none">
          ส่ง
        </button>
      </form>
    </div>
  );
}
