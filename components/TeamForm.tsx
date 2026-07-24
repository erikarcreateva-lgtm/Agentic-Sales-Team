"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeamAction, updateTeamAction } from "@/lib/teams/actions";
import type { AgentRecord, TeamInput } from "@/lib/agents/types";
import { Field, primaryButtonStyle, TextArea, TextInput } from "@/components/forms";

export default function TeamForm({
  mode,
  teamId,
  initial,
  availableAgents,
}: {
  mode: "create" | "edit";
  teamId?: string;
  initial: TeamInput;
  availableAgents: AgentRecord[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [goal, setGoal] = useState(initial.goal);
  const [members, setMembers] = useState<Set<string>>(new Set(initial.members));
  const [saving, setSaving] = useState(false);

  function toggleMember(id: string) {
    setMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const canSubmit = name.trim().length > 0 && members.size > 0;

  async function submit() {
    setSaving(true);
    const input: TeamInput = { name: name.trim(), description, goal, members: [...members] };
    if (mode === "create") {
      await createTeamAction(input);
    } else if (teamId) {
      await updateTeamAction(teamId, input);
    }
    setSaving(false);
    router.push("/agents");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 560 }}>
      <Field label="Team name">
        <TextInput value={name} onChange={setName} placeholder="e.g. Fitness Outreach" />
      </Field>
      <Field label="Description" hint="Optional — what this team is for.">
        <TextArea value={description} onChange={setDescription} rows={2} />
      </Field>
      <Field label="Goal" hint="Optional — a sentence describing what success looks like.">
        <TextArea value={goal} onChange={setGoal} rows={2} placeholder="Build a book of 20 fitness brands" />
      </Field>
      <Field label="Members" hint="Pick the helpers on this team.">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {availableAgents.map((a) => (
            <label
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                border: "1px solid var(--color-linen)",
                borderRadius: "var(--radius-btn)",
                cursor: "pointer",
              }}
            >
              <input type="checkbox" checked={members.has(a.id)} onChange={() => toggleMember(a.id)} />
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: a.color,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {a.initials}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</span>
              <span style={{ fontSize: 12, color: "var(--color-stone)" }}>{a.role}</span>
            </label>
          ))}
        </div>
      </Field>
      <div>
        <button style={{ ...primaryButtonStyle, opacity: canSubmit && !saving ? 1 : 0.5 }} disabled={!canSubmit || saving} onClick={submit}>
          {saving ? "Saving…" : mode === "create" ? "Create team" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
