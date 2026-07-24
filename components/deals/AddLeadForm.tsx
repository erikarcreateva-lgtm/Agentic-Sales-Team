"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addLeadAction } from "@/lib/leads/actions";
import type { AgentRecord } from "@/lib/agents/types";
import { Field, inputStyle, primaryButtonStyle, TextInput } from "@/components/forms";

export default function AddLeadForm({ agents }: { agents: AgentRecord[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("");
  const [agentId, setAgentId] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    await addLeadAction({ name: name.trim(), company: company || undefined, email: email || undefined, platform: platform || undefined, agentId: agentId || undefined });
    setName("");
    setCompany("");
    setEmail("");
    setPlatform("");
    setAgentId("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, alignItems: "end" }}>
      <Field label="Brand / contact name">
        <TextInput value={name} onChange={setName} placeholder="Acme Supplements" />
      </Field>
      <Field label="Company">
        <TextInput value={company} onChange={setCompany} placeholder="Acme Inc." />
      </Field>
      <Field label="Email">
        <TextInput value={email} onChange={setEmail} placeholder="hello@acme.com" />
      </Field>
      <Field label="Platform">
        <TextInput value={platform} onChange={setPlatform} placeholder="Instagram" />
      </Field>
      <Field label="Assign to">
        <select value={agentId} onChange={(e) => setAgentId(e.target.value)} style={inputStyle}>
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>
      <button style={{ ...primaryButtonStyle, opacity: name.trim() && !saving ? 1 : 0.5 }} disabled={!name.trim() || saving} onClick={submit}>
        {saving ? "Adding…" : "Add brand"}
      </button>
    </div>
  );
}
