"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { dismissNotificationsAction } from "@/lib/activity/actions";
import type { NotificationItem } from "@/lib/activity/store";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsBell({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function clear() {
    setBusy(true);
    await dismissNotificationsAction();
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={{ position: "relative", border: "none", background: "none", padding: 6, cursor: "pointer", color: "var(--color-ink)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 4.5 1.5 6 2 6.5H4c.5-.5 2-2 2-6.5Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {items.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              padding: "0 3px",
              borderRadius: "var(--radius-pill)",
              background: "var(--color-red)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 20 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: 320,
              maxHeight: 400,
              overflowY: "auto",
              background: "var(--color-canvas)",
              border: "1px solid var(--color-linen)",
              borderRadius: "var(--radius-card-sm)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
              zIndex: 30,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid var(--color-linen)" }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>Notifications</span>
              {items.length > 0 && (
                <button
                  onClick={clear}
                  disabled={busy}
                  style={{ border: "none", background: "none", color: "var(--color-violet)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <div style={{ padding: "20px 14px", fontSize: 13, color: "var(--color-stone)" }}>Nothing new.</div>
            ) : (
              items.map((n) => (
                <div key={n.id} style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-linen)", fontSize: 13 }}>
                  <div>{n.text}</div>
                  <div style={{ fontSize: 11, color: "var(--color-stone)", marginTop: 2 }}>{timeAgo(n.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
