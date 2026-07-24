"use client";
import { useMemo, useState } from "react";
import type { Meeting } from "@/lib/meetings/types";
import type { Lead } from "@/lib/leads/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildGridDays(monthCursor: Date): Date[] {
  const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export default function CalendarView({ meetings, leads }: { meetings: Meeting[]; leads: Lead[] }) {
  const [monthCursor, setMonthCursor] = useState(() => new Date(meetings[0]?.whenAt ?? Date.now()));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);

  const meetingsByDay = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const key = localDateKey(new Date(m.whenAt));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [meetings]);

  const gridDays = useMemo(() => buildGridDays(monthCursor), [monthCursor]);
  const todayKey = localDateKey(new Date());
  const monthLabel = monthCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function changeMonth(delta: number) {
    setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
    setSelectedKey(null);
  }

  const shown = selectedKey
    ? [{ key: selectedKey, meetings: meetingsByDay.get(selectedKey) ?? [] }]
    : [...meetingsByDay.entries()]
        .filter(([key]) => key >= todayKey)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([key, m]) => ({ key, meetings: m }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card)", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={() => changeMonth(-1)} aria-label="Previous month" style={navButtonStyle}>
            ‹
          </button>
          <span style={{ fontSize: 16, fontWeight: 800 }}>{monthLabel}</span>
          <button onClick={() => changeMonth(1)} aria-label="Next month" style={navButtonStyle}>
            ›
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ fontSize: 11, fontWeight: 700, color: "var(--color-stone)", textAlign: "center", padding: "4px 0" }}>
              {w}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {gridDays.map((d) => {
            const key = localDateKey(d);
            const inMonth = d.getMonth() === monthCursor.getMonth();
            const dayMeetings = meetingsByDay.get(key) ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                onClick={() => setSelectedKey(isSelected ? null : key)}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  borderRadius: "var(--radius-btn)",
                  border: isToday ? "1.5px solid var(--color-red)" : "1px solid transparent",
                  background: isSelected ? "var(--color-ink)" : "transparent",
                  color: isSelected ? "#fff" : inMonth ? "var(--color-ink)" : "var(--color-linen)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: isToday ? 800 : 500,
                }}
              >
                <span>{d.getDate()}</span>
                {dayMeetings.length > 0 && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: isSelected ? "#fff" : "var(--color-red)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{selectedKey ? formatDayHeading(selectedKey) : "Upcoming"}</h2>
        {shown.every((g) => g.meetings.length === 0) && (
          <p style={{ fontSize: 13, color: "var(--color-stone)" }}>
            {selectedKey ? "No calls booked that day." : "No calls booked yet — book one above and it'll show up here."}
          </p>
        )}
        {shown.map(
          (g) =>
            g.meetings.length > 0 && (
              <div key={g.key}>
                {!selectedKey && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-stone)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                    {formatDayHeading(g.key)}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {g.meetings.map((m) => {
                    const brand = m.leadId ? leadById.get(m.leadId) : null;
                    return (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--color-linen)", borderRadius: "var(--radius-card-sm)", padding: "12px 16px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-red)", flex: "none", width: 100 }}>
                          {new Date(m.whenAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{m.title}</div>
                          {brand?.company && <div style={{ fontSize: 12, color: "var(--color-fog)" }}>{brand.company}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}

function formatDayHeading(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

const navButtonStyle = {
  border: "1px solid var(--color-linen)",
  background: "var(--color-canvas)",
  borderRadius: "var(--radius-pill)",
  width: 32,
  height: 32,
  fontSize: 16,
  cursor: "pointer",
  color: "var(--color-ink)",
} as const;
