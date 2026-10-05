import { ArrowUpRight } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "wouter";
import "./EditorialKit.css";

/* ============================================================
   EDITORIAL KIT
   Komponen reusable yang dipakai halaman Indonesia & Inggris.
   Semua komponen aman SSR: tidak ada akses window saat render.
   ============================================================ */

const isInternal = (href: string) =>
  href.startsWith("/") && !href.startsWith("//");

export function SmartLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  if (isInternal(href)) {
    return (
      <Link className={className} href={href} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <a
      className={className}
      href={href}
      aria-label={ariaLabel}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export function EditorialSection({
  id,
  eyebrow,
  title,
  lede,
  aside,
  panel = false,
  className = "",
  children,
  headingLevel = 2,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  panel?: boolean;
  className?: string;
  children?: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const headingId = id ? `${id}-title` : undefined;
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <section
      id={id}
      className={`ed-section${panel ? " ed-section--panel" : ""} ${className}`.trim()}
      aria-labelledby={title ? headingId : undefined}
    >
      <div className="ed-shell">
        {(title || eyebrow || lede || aside) && (
          <div className="ed-head">
            <div>
              {eyebrow ? <p className="ed-head__eyebrow">{eyebrow}</p> : null}
              {title ? (
                <Heading className="ed-head__title" id={headingId}>
                  {title}
                </Heading>
              ) : null}
            </div>
            <div className="ed-head__aside">
              {lede ? <p className="ed-head__lede">{lede}</p> : null}
              {aside}
            </div>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function SignalIndicator({ label }: { label: string }) {
  return <span className="ed-signal-dot">{label}</span>;
}

export function Waveform({ bars = 12 }: { bars?: number }) {
  return (
    <span className="ed-wave" aria-hidden="true">
      {Array.from({ length: bars }).map((_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

export type SignalRow = {
  label: string;
  value: string;
  note?: string;
  href?: string;
  actionLabel?: string;
};

export function CurrentSignalBoard({
  rows,
  actionFallback = "BUKA",
}: {
  rows: SignalRow[];
  actionFallback?: string;
}) {
  if (!rows.length) return null;
  return (
    <div className="ed-signal-board">
      {rows.map(row => (
        <div className="ed-signal-row" key={row.label}>
          <div>
            <span className="ed-signal-row__label">{row.label}</span>
            <p className="ed-signal-row__value">{row.value}</p>
            {row.note ? (
              <p className="ed-signal-row__note">{row.note}</p>
            ) : null}
          </div>
          {row.href ? (
            <SmartLink className="ed-signal-row__go" href={row.href}>
              {row.actionLabel || actionFallback} <ArrowUpRight size={13} />
            </SmartLink>
          ) : (
            <span className="ed-signal-row__go">
              <Waveform bars={8} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function MediaCard({
  href,
  image,
  imageAlt,
  meta,
  title,
  copy,
  index,
  actionLabel,
  square = false,
}: {
  href: string;
  image?: string;
  imageAlt: string;
  meta?: string;
  title: string;
  copy?: string;
  index?: string;
  actionLabel: string;
  square?: boolean;
}) {
  return (
    <SmartLink className="ed-card" href={href}>
      {image ? (
        <div
          className={`ed-card__media${square ? " ed-card__media--square" : ""}`}
        >
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
        </div>
      ) : null}
      <div className="ed-card__body">
        {index ? <span className="ed-card__index">{index}</span> : null}
        {meta ? <span className="ed-card__meta">{meta}</span> : null}
        <h3 className="ed-card__title">{title}</h3>
        {copy ? <p className="ed-card__copy">{copy}</p> : null}
        <span className="ed-card__go">
          {actionLabel} <ArrowUpRight size={13} />
        </span>
      </div>
    </SmartLink>
  );
}

export function CtaPanel({
  eyebrow,
  title,
  copy,
  actions,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  copy: string;
  actions: ReactNode;
  id?: string;
}) {
  return (
    <section className="ed-section" id={id}>
      <div className="ed-shell">
        <div className="ed-cta">
          <div>
            {eyebrow ? <p className="ed-head__eyebrow">{eyebrow}</p> : null}
            <h2 className="ed-cta__title">{title}</h2>
            <p className="ed-cta__copy">{copy}</p>
          </div>
          <div className="ed-cta__actions">{actions}</div>
        </div>
      </div>
    </section>
  );
}

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="ed-empty">
      <SignalIndicator label="STANDBY" />
      <h3 className="ed-empty__title">{title}</h3>
      <p className="ed-empty__copy">{copy}</p>
      {action}
    </div>
  );
}

export function AudioPlayerShell({
  title,
  provider,
  children,
}: {
  title: string;
  provider: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const panelId = `audio-shelf-${useId()}`;
  return (
    <div className="ed-player" data-player-state={open ? "loading" : "idle"}>
      <div className="ed-player__bar">
        <button
          className="ed-player__toggle"
          type="button"
          aria-controls={panelId}
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
        >
          <span className="ed-player__title">
            {provider} — {title}
          </span>
          <span aria-hidden="true" className="ed-player__chevron">
            {open ? "−" : "+"}
          </span>
        </button>
        <Waveform bars={10} />
      </div>
      <div id={panelId} className="ed-player__shelf" data-player-shelf="true">
        <div className="ed-player__body">{children}</div>
      </div>
    </div>
  );
}

/* -- Countdown -------------------------------------------------
   SSR merender label statis; angka baru diisi setelah mount
   supaya tidak ada hydration mismatch. */
export function EventCountdown({
  target,
  labels,
  idleLabel,
}: {
  target: string;
  labels: [string, string, string, string];
  idleLabel: string;
}) {
  const targetTime = useMemo(() => new Date(target).getTime(), [target]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(targetTime)) return;
    setNow(Date.now());
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interval = window.setInterval(
      () => setNow(Date.now()),
      reduced ? 60_000 : 1_000
    );
    return () => window.clearInterval(interval);
  }, [targetTime]);

  if (Number.isNaN(targetTime)) return null;
  const diff = now === null ? null : Math.max(0, targetTime - now);
  const units =
    diff === null
      ? [null, null, null, null]
      : [
          Math.floor(diff / 86_400_000),
          Math.floor(diff / 3_600_000) % 24,
          Math.floor(diff / 60_000) % 60,
          Math.floor(diff / 1000) % 60,
        ];

  return (
    <div
      className="ed-countdown"
      role="timer"
      aria-live="off"
      aria-label={idleLabel}
    >
      {units.map((value, index) => (
        <div className="ed-countdown__unit" key={labels[index]}>
          <span className="ed-countdown__value">
            {value === null ? "—" : String(value).padStart(2, "0")}
          </span>
          <span className="ed-countdown__label">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

/* -- Timeline --------------------------------------------------
   Item pertama terbuka saat SSR sehingga crawler tetap melihat isi. */
export type TimelineEntry = {
  year: string;
  title: string;
  copy: string;
  links?: { label: string; href: string }[];
};

export function EditorialTimeline({
  entries,
  openLabel,
  closeLabel,
}: {
  entries: TimelineEntry[];
  openLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState<number>(0);
  if (!entries.length) return null;
  return (
    <ol className="ed-timeline">
      {entries.map((entry, index) => {
        const isOpen = open === index;
        const panelId = `ed-timeline-panel-${index}`;
        return (
          <li
            className="ed-timeline__item"
            key={`${entry.year}-${entry.title}`}
          >
            <button
              type="button"
              className="ed-timeline__button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? -1 : index)}
            >
              <span className="ed-timeline__year">{entry.year}</span>
              <span className="ed-timeline__title">{entry.title}</span>
              <span className="ed-timeline__state">
                {isOpen ? closeLabel : openLabel}
              </span>
            </button>
            <div className="ed-timeline__panel" id={panelId} hidden={!isOpen}>
              <p className="ed-timeline__copy">{entry.copy}</p>
              {entry.links?.length ? (
                <div className="ed-timeline__links">
                  {entry.links.map(link => (
                    <SmartLink
                      className="ed-button--ghost"
                      href={link.href}
                      key={link.href}
                    >
                      {link.label} <ArrowUpRight size={13} />
                    </SmartLink>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function FilterBar({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  label: string;
}) {
  if (options.length < 2) return null;
  return (
    <div className="ed-filters" role="group" aria-label={label}>
      {options.map(option => (
        <button
          key={option}
          type="button"
          className="ed-filter"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export const editorialStyle = (vars: Record<string, string>) =>
  vars as CSSProperties;
