"use client";
import { useState, useTransition } from "react";
import { updateNotificationPref } from "@/lib/settings/actions";
import { NOTIFICATION_PREF_LABELS, type NotificationPrefs } from "@/lib/settings/types";

export default function NotificationToggles({ initial }: { initial: NotificationPrefs }) {
  const [prefs, setPrefs] = useState(initial);
  const [, startTransition] = useTransition();

  function toggle(key: keyof NotificationPrefs) {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    startTransition(() => {
      updateNotificationPref(key, next);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card-sm)", overflow: "hidden" }}>
      {(Object.keys(NOTIFICATION_PREF_LABELS) as (keyof NotificationPrefs)[]).map((key, i) => {
        const meta = NOTIFICATION_PREF_LABELS[key];
        const on = prefs[key];
        return (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "18px 20px",
              borderTop: i === 0 ? "none" : "1px solid var(--color-linen)",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{meta.label}</div>
              <div style={{ fontSize: 13, color: "var(--color-fog)", marginTop: 2 }}>{meta.body}</div>
            </div>
            <button
              role="switch"
              aria-checked={on}
              aria-label={meta.label}
              onClick={() => toggle(key)}
              style={{
                flex: "none",
                width: 44,
                height: 26,
                borderRadius: "var(--radius-pill)",
                border: "none",
                cursor: "pointer",
                background: on ? "var(--color-red)" : "var(--color-linen)",
                position: "relative",
                transition: "background 0.15s ease",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: on ? 21 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                  transition: "left 0.15s ease",
                }}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
