import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import "./ScrambleText.css";

const glyphs = "AN01//+*~";

export function ScrambleText({ text, className = "", as: Tag = "span", delay = 60, interactive = false, duration = 2400, id }: { text: string; className?: string; as?: "span" | "p" | "h1" | "h2" | "h3"; delay?: number; interactive?: boolean; duration?: number; id?: string }) {
  const [value, setValue] = useState(text);
  const timer = useRef<number | null>(null);
  const isReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const run = useCallback(() => {
    if (isReduced()) { setValue(text); return; }
    if (timer.current) window.clearInterval(timer.current);
    const startedAt = performance.now();
    timer.current = window.setInterval(() => {
      const progress = Math.min((performance.now() - startedAt) / duration, 1);
      const reveal = Math.floor(progress * text.length);
      setValue(Array.from(text, (character, index) => character === "\n" || index < reveal ? character : glyphs[(index * 3 + Math.floor(progress * 97)) % glyphs.length]).join(""));
      if (progress >= 1 && timer.current) { window.clearInterval(timer.current); timer.current = null; }
    }, 33);
  }, [duration, text]);
  useEffect(() => {
    const kickoff = window.setTimeout(run, delay);
    return () => { window.clearTimeout(kickoff); if (timer.current) window.clearInterval(timer.current); };
  }, [delay, run]);
  const onKeyDown = (event: KeyboardEvent) => { if (interactive && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); run(); } };
  return <Tag id={id} className={`an-scramble ${interactive ? "an-scramble-interactive" : ""} ${className}`} style={{ animationDelay: `${delay}ms` }} aria-label={text} {...(interactive ? { role: "button", tabIndex: 0, onClick: run, onKeyDown } : {})}><span aria-hidden="true">{value}</span></Tag>;
}
