"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMediaKit } from "@/lib/mediaKit/actions";
import { isMediaKitComplete } from "@/lib/mediaKit/helpers";
import { EMPTY_PROFILE_INPUT, type CreatorProfileInput } from "@/lib/mediaKit/types";
import PlatformsEditor from "./mediaKit/PlatformsEditor";
import AudienceFields from "./mediaKit/AudienceFields";
import { Field, NumberInput, primaryButtonStyle, secondaryButtonStyle, TextArea, TextInput } from "@/components/forms";

const STEPS = ["Your niche", "Your platforms", "Your audience & voice", "Deals & rates"];

export default function OnboardingWizard({ initial }: { initial: CreatorProfileInput }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<CreatorProfileInput>(initial ?? EMPTY_PROFILE_INPUT);
  const [saving, setSaving] = useState(false);

  const last = step === STEPS.length - 1;
  const complete = isMediaKitComplete(profile);

  async function finish() {
    setSaving(true);
    await saveMediaKit(profile);
    router.push("/dashboard");
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "var(--space-48) var(--space-24)" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {STEPS.map((label, i) => (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ height: 4, borderRadius: 2, background: i <= step ? "var(--color-red)" : "var(--color-linen)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: i === step ? "var(--color-ink)" : "var(--color-stone)" }}>{label}</span>
          </div>
        ))}
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>Let&apos;s build your Media Kit</h1>
      <p style={{ fontSize: 14, color: "var(--color-fog)", margin: "0 0 28px" }}>
        This is what every AI helper reads before it writes a word — so pitches sound like you, not a template.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, minHeight: 260 }}>
        {step === 0 && (
          <>
            <Field label="What's your niche?" hint="e.g. Fitness & wellness, beauty, gaming, personal finance">
              <TextInput value={profile.niche} onChange={(v) => setProfile({ ...profile, niche: v })} placeholder="Fitness & wellness" />
            </Field>
            <Field label="A short bio" hint="A couple of sentences — who you are and what you make content about.">
              <TextArea value={profile.bio} onChange={(v) => setProfile({ ...profile, bio: v })} placeholder="I make..." rows={4} />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 13, color: "var(--color-fog)", margin: 0 }}>Add at least one platform — your handle and follower count.</p>
            <PlatformsEditor platforms={profile.platforms} onChange={(platforms) => setProfile({ ...profile, platforms })} />
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: 13, color: "var(--color-fog)", margin: 0 }}>A rough sense of who follows you — exact numbers aren&apos;t needed.</p>
            <AudienceFields audience={profile.audience} onChange={(audience) => setProfile({ ...profile, audience })} />
            <Field label="Your tone / vibe" hint="How pitches should sound when they're written in your voice.">
              <TextArea value={profile.tone} onChange={(v) => setProfile({ ...profile, tone: v })} placeholder="Warm, funny, no corporate speak" rows={3} />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="Brands you've worked with before" hint="Optional — helps agents pitch at the right level.">
              <TextArea value={profile.pastDeals} onChange={(v) => setProfile({ ...profile, pastDeals: v })} placeholder="Gymshark, Fabletics..." rows={3} />
            </Field>
            <Field label="Your rate floor" hint="The minimum you'll accept per deliverable, in dollars.">
              <NumberInput value={profile.rateFloor} onChange={(v) => setProfile({ ...profile, rateFloor: v })} placeholder="500" />
            </Field>
          </>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        <button style={secondaryButtonStyle} disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Back
        </button>
        {!last ? (
          <button style={primaryButtonStyle} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
            Next
          </button>
        ) : (
          <button style={{ ...primaryButtonStyle, opacity: complete && !saving ? 1 : 0.5 }} disabled={!complete || saving} onClick={finish}>
            {saving ? "Saving…" : "Finish setup"}
          </button>
        )}
      </div>
      {last && !complete && (
        <p style={{ fontSize: 13, color: "var(--color-stone)", marginTop: 10 }}>
          Fill in your niche, at least one platform, and a rate floor to finish.
        </p>
      )}
    </div>
  );
}
