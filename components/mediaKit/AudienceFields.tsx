import type { Audience } from "@/lib/mediaKit/types";
import { Field, TextInput } from "@/components/forms";

export default function AudienceFields({ audience, onChange }: { audience: Audience; onChange: (a: Audience) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
      <Field label="Age range">
        <TextInput value={audience.age} onChange={(v) => onChange({ ...audience, age: v })} placeholder="18-24" />
      </Field>
      <Field label="Location">
        <TextInput value={audience.geo} onChange={(v) => onChange({ ...audience, geo: v })} placeholder="Mostly US & UK" />
      </Field>
      <Field label="Gender split">
        <TextInput value={audience.gender} onChange={(v) => onChange({ ...audience, gender: v })} placeholder="65% female" />
      </Field>
    </div>
  );
}
