"use client";
import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { importLeadsCsvAction } from "@/lib/leads/actions";
import type { AgentRecord } from "@/lib/agents/types";
import { inputStyle, secondaryButtonStyle } from "@/components/forms";

export default function CsvImportForm({ agents }: { agents: AgentRecord[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [agentId, setAgentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  function pickFile() {
    fileRef.current?.click();
  }

  function onFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result ?? "");
      const res = await importLeadsCsvAction(text, agentId || undefined);
      setBusy(false);
      setResult(res.ok ? `Imported ${res.count} brand${res.count === 1 ? "" : "s"}.` : "Import failed.");
      router.refresh();
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <select value={agentId} onChange={(e) => setAgentId(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
        <option value="">Assign to: unassigned</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            Assign to: {a.name}
          </option>
        ))}
      </select>
      <button style={secondaryButtonStyle} disabled={busy} onClick={pickFile}>
        {busy ? "Importing…" : "Import CSV"}
      </button>
      <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFileChosen} style={{ display: "none" }} />
      {result && <span style={{ fontSize: 13, color: "var(--color-fog)" }}>{result}</span>}
    </div>
  );
}
