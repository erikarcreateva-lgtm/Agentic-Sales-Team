"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { primaryButtonStyle } from "@/components/forms";

export default function DiscoverBrandsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/scrape", { method: "POST" });
    const data = await res.json().catch(() => ({ found: 0 }));
    setBusy(false);
    setMessage(data.found ? `Found ${data.found} new brand${data.found === 1 ? "" : "s"} — check them below.` : "Nothing new found this time.");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button style={{ ...primaryButtonStyle, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={run}>
        {busy ? "Searching the web…" : "Discover brands"}
      </button>
      {message && <span style={{ fontSize: 13, color: "var(--color-fog)" }}>{message}</span>}
    </div>
  );
}
