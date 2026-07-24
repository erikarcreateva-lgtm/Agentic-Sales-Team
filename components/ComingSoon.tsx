export default function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-linen)",
        borderRadius: "var(--radius-card)",
        padding: "var(--space-80) var(--space-32)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-12)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-violet)",
          background: "#f3effb",
          padding: "4px 12px",
          borderRadius: "var(--radius-pill)",
        }}
      >
        Coming soon
      </span>
      <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>{title}</h1>
      <p style={{ fontSize: 15, color: "var(--color-fog)", maxWidth: 440, margin: 0 }}>{body}</p>
    </div>
  );
}
