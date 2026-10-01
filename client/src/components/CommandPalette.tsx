import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import "./CommandPalette.css";

const commands = [
  ["Musik", "/music"],
  ["Visual", "/visuals"],
  ["Jadwal live", "/live"],
  ["Arsip / Universe", "/universe"],
  ["Tentang Akbar", "/about"],
  ["Inquiry booking", "/inquire?type=booking"],
  ["EPK", "/epk"],
] as const;

export function CommandPalette() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(value => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);
  if (!open) return null;
  const results = commands.filter(([label]) =>
    label.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div
      className="an-command-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        className="an-command"
        role="dialog"
        aria-modal="true"
        aria-label="Lompat ke halaman"
      >
        <label htmlFor="an-command-input">CARI DI AKBAR NAWASUNDA</label>
        <input
          id="an-command-input"
          autoFocus
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Musik, visual, inquiry…"
        />
        <div className="an-command-results" role="listbox">
          {results.map(([label, href]) => (
            <button
              key={href}
              type="button"
              role="option"
              onClick={() => {
                setOpen(false);
                navigate(href);
              }}
            >
              {label}
              <span>{href}</span>
            </button>
          ))}
        </div>
        <p>ESC tutup · ⌘K / CTRL K buka</p>
      </section>
    </div>
  );
}
