"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookMeetingAction } from "@/lib/meetings/actions";
import type { Lead } from "@/lib/leads/types";
import { inputStyle, primaryButtonStyle, TextInput } from "@/components/forms";

export default function BookMeetingForm({ lead, leads }: { lead?: Lead; leads?: Lead[] }) {
  const router = useRouter();
  const [leadId, setLeadId] = useState(lead?.id ?? leads?.[0]?.id ?? "");
  const [timeText, setTimeText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!leadId) {
      setError("Add a brand first.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await bookMeetingAction(leadId, timeText);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage(`Booked for ${res.whenLabel}.`);
    setTimeText("");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {!lead && leads && (
          <select value={leadId} onChange={(e) => setLeadId(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
            {leads.length === 0 && <option value="">No brands yet</option>}
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        )}
        <div style={{ flex: 1, minWidth: 220 }}>
          <TextInput value={timeText} onChange={setTimeText} placeholder='e.g. "next Tuesday at 2pm"' />
        </div>
        <button style={{ ...primaryButtonStyle, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={submit}>
          {busy ? "Booking…" : "Book call"}
        </button>
      </div>
      {message && <span style={{ fontSize: 13, color: "var(--color-fog)" }}>{message}</span>}
      {error && <span style={{ fontSize: 13, color: "#B91C1C" }}>{error}</span>}
    </div>
  );
}
