import { useEffect, useState } from "react";
import "./ScrambleText.css";

const glyphs = "AN01//+*~";

export function ScrambleText({ text, className = "", as: Tag = "span", delay = 60 }: { text: string; className?: string; as?: "span" | "p" | "h1" | "h2" | "h3"; delay?: number }) {
  const [value, setValue] = useState(text);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setValue(text); return; }
    let frame = 0;
    const total = Math.max(text.length * 2, 12);
    const timer = window.setInterval(() => {
      frame += 1;
      const reveal = Math.floor((frame / total) * text.length);
      setValue(Array.from(text, (character, index) => character === "\n" || index < reveal ? character : glyphs[(index + frame) % glyphs.length]).join(""));
      if (frame >= total) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [text]);
  return <Tag className={`an-scramble ${className}`} style={{ animationDelay: `${delay}ms` }} aria-label={text}><span aria-hidden="true">{value}</span></Tag>;
}
