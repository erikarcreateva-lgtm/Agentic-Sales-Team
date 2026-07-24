"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAgentAction, updateAgentAction } from "@/lib/agents/actions";
import type { AgentInput } from "@/lib/agents/types";
import { CAPABILITIES, type CapabilityId } from "@/lib/agentTypes";
import { AGENT_COLORS, initialsFromName } from "@/components/agents/palette";
import { Field, primaryButtonStyle, TextArea, TextInput } from "@/components/forms";

export default function AgentForm({
  mode,
  agentId,
  isPreset,
  initial,
}: {
  mode: "create" | "edit";
  agentId?: string;
  isPreset?: boolean;
  initial: Omit<AgentInput, "initials">;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [role, setRole] = useState(initial.role);
  const [color, setColor] = useState(initial.color);
  const [goal, setGoal] = useState(initial.goal);
  const [capabilities, setCapabilities] = useState<Set<CapabilityId>>(new Set(initial.capabilities));
  const [saving, setSaving] = useState(false);

  function toggleCapability(id: CapabilityId) {
    if (isPreset) return;
    setCapabilities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const canSubmit = name.trim().length > 0 && role.trim().length > 0 && (isPreset || capabilities.size > 0);

  async function submit() {
    setSaving(true);
    const input: AgentInput = { name: name.trim(), initials: initialsFromName(name), role: role.trim(), color, goal, capabilities: [...capabilities] };
    if (mode === "create") {
      const res = await createAgentAction(input);
      setSaving(false);
      if (res.ok) router.push(`/agents/${res.id}`);
      return;
    }
    if (agentId) {
      const patch = isPreset ? { name: input.name, initials: input.initials, role: input.role, color: input.color, goal: input.goal } : input;
      await updateAgentAction(agentId, patch);
    }
    setSaving(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 560 }}>
      <Field label="Name">
        <TextInput value={name} onChange={setName} placeholder="e.g. Jordan Reyes" />
      </Field>
      <Field label="Role" hint="A short label for what this helper does.">
        <TextInput value={role} onChange={setRole} placeholder="e.g. Negotiator" />
      </Field>
      <Field label="Color">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {AGENT_COLORS.map((c) => (
            <button
              key={c}
              aria-label={c}
              onClick={() => setColor(c)}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: c,
                border: color === c ? "3px solid var(--color-ink)" : "3px solid transparent",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </Field>
      <Field label="What can it do?" hint={isPreset ? "Presets keep their one job." : "Pick one or more capabilities."}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CAPABILITIES.map((cap) => (
            <label
              key={cap.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                border: "1px solid var(--color-linen)",
                borderRadius: "var(--radius-btn)",
                opacity: isPreset && !capabilities.has(cap.id) ? 0.5 : 1,
                cursor: isPreset ? "default" : "pointer",
              }}
            >
              <input type="checkbox" checked={capabilities.has(cap.id)} disabled={isPreset} onChange={() => toggleCapability(cap.id)} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{cap.label}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Goal" hint="Optional — a sentence describing what success looks like.">
        <TextArea value={goal} onChange={setGoal} rows={3} placeholder="Book 5 qualified calls a month" />
      </Field>
      <div>
        <button style={{ ...primaryButtonStyle, opacity: canSubmit && !saving ? 1 : 0.5 }} disabled={!canSubmit || saving} onClick={submit}>
          {saving ? "Saving…" : mode === "create" ? "Create helper" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
