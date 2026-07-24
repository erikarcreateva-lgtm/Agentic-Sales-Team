"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string; // raw SVG path/shape markup
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>' },
  { href: "/deals", label: "Brand deals", icon: '<path d="M3 7h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 7l2.5-3.5h13L21 7"/><path d="M9.5 13h5"/>' },
  { href: "/agents", label: "Agents", icon: '<circle cx="8.5" cy="8" r="3.1"/><path d="M3 20a5.5 5.5 0 0 1 11 0"/><circle cx="17.5" cy="9" r="2.3"/><path d="M14.5 20a4 4 0 0 1 7-2.6"/>' },
  { href: "/chat", label: "Chat", icon: '<path d="M4 4.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4.5 4V16H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"/>' },
  { href: "/calendar", label: "Calendar", icon: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 9.5h17"/><path d="M8 3v4M16 3v4"/>' },
  { href: "/analytics", label: "Analytics", icon: '<path d="M4 5v15h16"/><path d="m7.5 14.5 3-3.5 3 2 4-5.5"/>' },
  { href: "/profile", label: "Profile", icon: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>' },
  { href: "/settings", label: "Settings", icon: '<path d="M4 6h9M17 6h3M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>' },
];

function NavIcon({ shape, size = 18 }: { shape: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none" }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: shape }}
    />
  );
}

export default function AppFrameShell({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMobileNavOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
    else setQuery("");
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  function goTo(href: string) {
    router.push(href);
    setSearchOpen(false);
    setMobileNavOpen(false);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop sidebar */}
      <aside className="app-sidebar">
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", height: 44 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--color-red)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 15,
              flex: "none",
            }}
          >
            A
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Agentic Sales Team</span>
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 18 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-btn)",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--color-ink)" : "var(--color-fog)",
                  background: active ? "var(--color-linen)" : "transparent",
                }}
              >
                <NavIcon shape={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(33,25,34,0.4)", zIndex: 40 }}
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            style={{ background: "var(--color-canvas)", width: 260, height: "100%", padding: "var(--space-20)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: "var(--radius-btn)",
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                      color: active ? "var(--color-ink)" : "var(--color-fog)",
                      background: active ? "var(--color-linen)" : "transparent",
                    }}
                  >
                    <NavIcon shape={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "var(--color-canvas)",
            borderBottom: "1px solid var(--color-linen)",
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 var(--space-24)",
          }}
        >
          <button
            className="app-hamburger"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            style={{ border: "none", background: "none", padding: 6, cursor: "pointer", color: "var(--color-ink)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            style={{
              flex: 1,
              maxWidth: 360,
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid var(--color-linen)",
              borderRadius: "var(--radius-input)",
              padding: "9px 14px",
              background: "var(--color-canvas)",
              color: "var(--color-stone)",
              fontSize: 14,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <NavIcon shape='<circle cx="10.5" cy="10.5" r="6"/><path d="m20 20-5-5"/>' size={16} />
            Search
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-linen)" }}>Ctrl K</span>
          </button>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span className="app-username" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
              {name || email}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <main style={{ flex: 1, maxWidth: "var(--max-width)", width: "100%", margin: "0 auto", padding: "var(--space-32) var(--space-24)" }}>
          {children}
        </main>
      </div>

      {/* Search modal */}
      {searchOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(33,25,34,0.4)", zIndex: 50, display: "flex", justifyContent: "center", paddingTop: "12vh" }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{ background: "var(--color-canvas)", borderRadius: "var(--radius-card-sm)", width: "min(520px, 90vw)", height: "fit-content", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px", borderBottom: "1px solid var(--color-linen)" }}>
              <NavIcon shape='<circle cx="10.5" cy="10.5" r="6"/><path d="m20 20-5-5"/>' size={17} />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results[0]) goTo(results[0].href);
                }}
                placeholder="Go to a section…"
                style={{ flex: 1, border: "none", outline: "none", fontSize: 16, fontFamily: "var(--font-sans)" }}
              />
            </div>
            <div style={{ padding: 8, maxHeight: 320, overflowY: "auto" }}>
              {results.length === 0 && (
                <div style={{ padding: "16px 12px", fontSize: 14, color: "var(--color-stone)" }}>No matches.</div>
              )}
              {results.map((item) => (
                <button
                  key={item.href}
                  onClick={() => goTo(item.href)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 12px",
                    border: "none",
                    background: "transparent",
                    borderRadius: "var(--radius-btn)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--color-ink)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <NavIcon shape={item.icon} size={16} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
