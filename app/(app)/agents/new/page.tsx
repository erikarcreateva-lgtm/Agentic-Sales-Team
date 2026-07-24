import AgentForm from "@/components/AgentForm";

export default function NewAgentPage() {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Build a new helper</h1>
      <p style={{ fontSize: 14, color: "var(--color-fog)", marginBottom: 26 }}>Give it a name, a job, and at least one capability.</p>
      <AgentForm mode="create" initial={{ name: "", role: "", color: "#0EA5E9", goal: "", capabilities: [] }} />
    </div>
  );
}
