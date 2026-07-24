import { PLATFORM_OPTIONS, type PlatformEntry } from "@/lib/mediaKit/types";
import { inputStyle, NumberInput, TextInput } from "@/components/forms";

export default function PlatformsEditor({
  platforms,
  onChange,
}: {
  platforms: PlatformEntry[];
  onChange: (platforms: PlatformEntry[]) => void;
}) {
  function update(i: number, patch: Partial<PlatformEntry>) {
    onChange(platforms.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function remove(i: number) {
    onChange(platforms.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...platforms, { platform: PLATFORM_OPTIONS[0], handle: "", followers: null, engagementRate: null }]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {platforms.map((p, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            gap: 10,
            alignItems: "end",
            border: "1px solid var(--color-linen)",
            borderRadius: "var(--radius-card-sm)",
            padding: 14,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--color-stone)" }}>Platform</span>
            <select value={p.platform} onChange={(e) => update(i, { platform: e.target.value })} style={inputStyle}>
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--color-stone)" }}>Handle</span>
            <TextInput value={p.handle} onChange={(v) => update(i, { handle: v })} placeholder="yourhandle" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--color-stone)" }}>Followers</span>
            <NumberInput value={p.followers} onChange={(v) => update(i, { followers: v })} placeholder="12000" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--color-stone)" }}>Engagement %</span>
            <NumberInput value={p.engagementRate} onChange={(v) => update(i, { engagementRate: v })} placeholder="4.2" />
          </label>
          <button
            onClick={() => remove(i)}
            aria-label="Remove platform"
            style={{ border: "none", background: "none", color: "var(--color-stone)", cursor: "pointer", padding: 10, fontSize: 13, fontWeight: 700 }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={add}
        style={{
          alignSelf: "flex-start",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--color-violet)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 0",
        }}
      >
        + Add a platform
      </button>
    </div>
  );
}
