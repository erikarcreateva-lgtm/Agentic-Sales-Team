"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { enqueueFollowupAction, enqueueOutreachAction, enqueueProposalAction, enqueueResearchAction } from "@/lib/jobs/actions";
import { primaryButtonStyle, secondaryButtonStyle } from "@/components/forms";

type Kind = "outreach" | "proposal" | "follow-up" | "research";

const ENQUEUE: Record<Kind, (leadId: string) => Promise<{ ok: boolean; error?: string }>> = {
  outreach: enqueueOutreachAction,
  proposal: enqueueProposalAction,
  "follow-up": enqueueFollowupAction,
  research: enqueueResearchAction,
};

export default function RunJobButton({
  kind,
  leadId,
  label,
  busyLabel,
  variant = "primary",
}: {
  kind: Kind;
  leadId: string;
  label: string;
  busyLabel: string;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    const enqueued = await ENQUEUE[kind](leadId);
    if (!enqueued.ok) {
      setBusy(false);
      setError(enqueued.error ?? "Something went wrong.");
      return;
    }
    let remaining = 1;
    let guard = 0;
    while (remaining > 0 && guard < 20) {
      const res = await fetch("/api/jobs/run", { method: "POST" });
      const data = await res.json().catch(() => ({ remaining: 0 }));
      remaining = data.remaining ?? 0;
      guard++;
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <button style={{ ...(variant === "primary" ? primaryButtonStyle : secondaryButtonStyle), opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={run}>
        {busy ? busyLabel : label}
      </button>
      {error && <span style={{ fontSize: 12, color: "#B91C1C" }}>{error}</span>}
    </div>
  );
}
