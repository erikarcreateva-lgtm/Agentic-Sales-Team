"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessageAction } from "@/lib/chat/actions";
import type { ChatMessage } from "@/lib/chat/types";
import type { AgentRecord } from "@/lib/agents/types";
import { inputStyle, primaryButtonStyle } from "@/components/forms";

export default function ChatThread({ messages, agents }: { messages: ChatMessage[]; agents: AgentRecord[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const agentById = new Map(agents.map((a) => [a.id, a]));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setText("");
    await sendChatMessageAction(value);
    setSending(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "70vh", border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--color-stone)" }}>Try &quot;@Research find me some fitness brands&quot; to get started.</p>
        )}
        {messages.map((m) => {
          const agent = m.agentId ? agentById.get(m.agentId) : null;
          const isMe = m.who === "me";
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 4 }}>
              {!isMe && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: agent?.color ?? "var(--color-stone)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {agent?.initials ?? "AI"}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fog)" }}>{agent?.name ?? "Team"}</span>
                </div>
              )}
              <div
                style={{
                  maxWidth: "75%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-btn)",
                  background: isMe ? "var(--color-ink)" : "var(--color-linen)",
                  color: isMe ? "#fff" : "var(--color-ink)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {sending && <div style={{ fontSize: 12, color: "var(--color-stone)", fontStyle: "italic" }}>Working on it…</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 10, padding: 16, borderTop: "1px solid var(--color-linen)" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type something here"
          style={{ ...inputStyle, flex: 1 }}
          disabled={sending}
        />
        <button style={{ ...primaryButtonStyle, opacity: sending ? 0.6 : 1 }} disabled={sending} onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
