import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useSignatureState } from "@/signature/useSignature";
import "./SignalType.css";

/**
 * Kinetic editorial type — utility bersama untuk halaman ID dan EN.
 *
 * Semua teks dirender penuh di HTML (SSR aman, bisa dibaca tanpa JavaScript).
 * Gerakannya murni CSS: `animation-timeline: view()` saat didukung, diam saat
 * tidak didukung, dan langsung tampil penuh saat reduced motion.
 */

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "p" | "div";

export function SignalHeading({
  as = "h2",
  lines,
  children,
  className = "",
  id,
}: {
  as?: HeadingLevel;
  lines?: string[];
  children?: ReactNode;
  className?: string;
  id?: string;
}) {
  const Tag = as as ElementType;
  if (!lines?.length) {
    return (
      <Tag id={id} className={`an-signal-heading ${className}`.trim()}>
        <span className="an-signal-heading-line">
          <span>{children}</span>
        </span>
      </Tag>
    );
  }
  return (
    <Tag id={id} className={`an-signal-heading ${className}`.trim()}>
      {lines.map((line, index) => (
        <span
          className="an-signal-heading-line"
          key={`${line}-${index}`}
          style={{ ["--signal-line-index" as string]: index }}
        >
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

export function SignalIndex({
  index,
  label,
  className = "",
}: {
  index: string | number;
  label: string;
  className?: string;
}) {
  const formatted =
    typeof index === "number" ? String(index).padStart(2, "0") : index;
  return (
    <p className={`an-signal-index ${className}`.trim()}>
      <span className="an-signal-index-number">{formatted}</span>
      <i aria-hidden="true" />
      <span className="an-signal-index-label">{label}</span>
    </p>
  );
}

export function RevealLines({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`an-signal-reveal ${className}`.trim()}>{children}</div>
  );
}

/**
 * Angka editorial dengan `tabular-nums`. Nilai akhir selalu ada di HTML;
 * animasi hitung hanya berjalan di viewport dan di luar reduced motion.
 */
export function TabularCounter({
  value,
  label,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const reduced = useSignatureState(snapshot => snapshot.capability.reducedMotion);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduced || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    let cancelled = false;
    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        const started = performance.now();
        const duration = 900;
        const tick = (now: number) => {
          if (cancelled) return;
          const progress = Math.min(1, (now - started) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        setDisplay(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, value]);

  return (
    <span className={`an-tabular-counter ${className}`.trim()}>
      <span className="an-tabular-counter-value" ref={ref}>
        {prefix}
        {display}
        {suffix}
      </span>
      {label ? <span className="an-tabular-counter-label">{label}</span> : null}
    </span>
  );
}
