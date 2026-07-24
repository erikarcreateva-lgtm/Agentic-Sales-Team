import type { ChangeEvent, CSSProperties, ReactNode } from "react";

export const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--color-linen)",
  borderRadius: "var(--radius-input)",
  padding: "11px 14px",
  fontSize: 15,
  fontFamily: "var(--font-sans)",
  color: "var(--color-ink)",
  background: "var(--color-canvas)",
};

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>{label}</span>
      {children}
      {hint ? <span style={{ fontSize: 12, color: "var(--color-stone)" }}>{hint}</span> : null}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
    />
  );
}

export function NumberInput({ value, onChange, placeholder }: { value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <input
      type="number"
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        onChange(v === "" ? null : Number(v));
      }}
      style={inputStyle}
    />
  );
}

export const primaryButtonStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  padding: "12px 22px",
  borderRadius: "var(--radius-btn)",
  background: "var(--color-red)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

export const secondaryButtonStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  padding: "12px 22px",
  borderRadius: "var(--radius-btn)",
  background: "transparent",
  color: "var(--color-ink)",
  border: "1px solid var(--color-linen)",
  cursor: "pointer",
};

export const dangerButtonStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  padding: "10px 18px",
  borderRadius: "var(--radius-btn)",
  background: "transparent",
  color: "#B91C1C",
  border: "1px solid #f3c9c9",
  cursor: "pointer",
};
