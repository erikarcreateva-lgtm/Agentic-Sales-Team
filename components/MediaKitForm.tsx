"use client";
import { useState } from "react";
import { saveMediaKit } from "@/lib/mediaKit/actions";
import type { CreatorProfileInput } from "@/lib/mediaKit/types";
import PlatformsEditor from "./mediaKit/PlatformsEditor";
import AudienceFields from "./mediaKit/AudienceFields";
import { Field, NumberInput, primaryButtonStyle, TextArea, TextInput } from "@/components/forms";

export default function MediaKitForm({ initial }: { initial: CreatorProfileInput }) {
  const [profile, setProfile] = useState<CreatorProfileInput>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save() {
    setSaving(true);
    await saveMediaKit(profile);
    setSaving(false);
    setSavedAt(Date.now());
  }

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 28 }}>
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Niche & bio</h2>
        <Field label="Your niche">
          <TextInput value={profile.niche} onChange={(v) => setProfile({ ...profile, niche: v })} placeholder="Fitness & wellness" />
        </Field>
        <Field label="Bio">
          <TextArea value={profile.bio} onChange={(v) => setProfile({ ...profile, bio: v })} rows={4} />
        </Field>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Platforms</h2>
        <PlatformsEditor platforms={profile.platforms} onChange={(platforms) => setProfile({ ...profile, platforms })} />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Audience & voice</h2>
        <AudienceFields audience={profile.audience} onChange={(audience) => setProfile({ ...profile, audience })} />
        <Field label="Tone / vibe">
          <TextArea value={profile.tone} onChange={(v) => setProfile({ ...profile, tone: v })} rows={3} />
        </Field>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Deals & rates</h2>
        <Field label="Brands you've worked with before">
          <TextArea value={profile.pastDeals} onChange={(v) => setProfile({ ...profile, pastDeals: v })} rows={3} />
        </Field>
        <Field label="Rate floor" hint="The minimum you'll accept per deliverable, in dollars.">
          <NumberInput value={profile.rateFloor} onChange={(v) => setProfile({ ...profile, rateFloor: v })} placeholder="500" />
        </Field>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button style={{ ...primaryButtonStyle, opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save Media Kit"}
        </button>
        {savedAt && !saving && <span style={{ fontSize: 13, color: "var(--color-fog)" }}>Saved</span>}
      </div>
    </div>
  );
}
