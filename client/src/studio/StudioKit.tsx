/**
 * STUDIO KIT v2 — primitif UI yang tenang dan mudah dibaca.
 * Fokus: hierarki jelas, kontras aman, tanpa spark/animasi berlebihan.
 */
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({
  icon: Icon,
  children,
  className,
}: {
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("st-eyebrow", className)}>
      {Icon ? <Icon size={12} /> : null}
      {children}
    </p>
  );
}

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "live" | "draft" | "accent";
  children: ReactNode;
}) {
  return (
    <span className="st-pill" data-tone={tone}>
      {children}
    </span>
  );
}

type PanelProps = {
  id?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Panel({
  id,
  eyebrow,
  icon,
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: PanelProps) {
  return (
    <section id={id} className={cn("st-panel", className)}>
      {title || eyebrow ? (
        <header className="st-panel-head">
          <div className="min-w-0">
            {eyebrow ? <Eyebrow icon={icon}>{eyebrow}</Eyebrow> : null}
            {title ? <h2 className="st-title">{title}</h2> : null}
            {description ? <p className="st-sub">{description}</p> : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <div className={cn("st-panel-body", bodyClassName)}>{children}</div>
    </section>
  );
}

export type StatTone = "neutral" | "live" | "warn" | "info";

const toneMap: Record<StatTone, string> = {
  neutral: "#a1a1aa",
  live: "#86efac",
  warn: "#fde68a",
  info: "#7dd3fc",
};

export function Stat({
  icon: Icon,
  kicker,
  value,
  label,
  tone = "neutral",
  href,
}: {
  icon: LucideIcon;
  kicker: string;
  value: ReactNode;
  label: string;
  tone?: StatTone;
  href?: string;
}) {
  const Wrapper = (href ? "a" : "div") as any;
  return (
    <Wrapper
      href={href}
      className="st-stat"
      style={{ "--st-glow": toneMap[tone] } as CSSProperties}
    >
      <div className="st-stat-top">
        <span className="st-stat-k">{kicker}</span>
        <Icon size={14} style={{ color: toneMap[tone] }} />
      </div>
      <p className="st-stat-v">{value}</p>
      <p className="st-stat-l">{label}</p>
    </Wrapper>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <section className="st-stats">{children}</section>;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="st-empty">
      <Icon size={20} className="text-zinc-600" />
      <b>{title}</b>
      {description ? <span>{description}</span> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function StudioHero({
  kicker,
  title,
  lead,
  actions,
  aside,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="st-hero st-rise">
      <div className="st-hero-grid">
        <div className="min-w-0">
          <Eyebrow>{kicker}</Eyebrow>
          <h1>{title}</h1>
          {lead ? <p>{lead}</p> : null}
          {actions ? (
            <div className="mt-5 flex flex-wrap gap-2">{actions}</div>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </header>
  );
}

export type StudioTabItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
};

export function StudioTabs({
  items,
  value,
  onChange,
}: {
  items: StudioTabItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav className="st-tabs st-rise" aria-label="Studio sections">
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          className="st-tab"
          data-active={value === item.id}
          aria-current={value === item.id ? "page" : undefined}
          onClick={() => onChange(item.id)}
        >
          {item.icon ? <item.icon size={14} /> : null}
          {item.label}
          {typeof item.count === "number" ? <span>{item.count}</span> : null}
        </button>
      ))}
    </nav>
  );
}

export function StudioButton({
  variant = "ghost",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "primary";
}) {
  return (
    <button
      {...props}
      data-variant={variant}
      className={cn("st-btn", className)}
    />
  );
}

export function StudioLink({
  variant = "ghost",
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "ghost" | "primary";
}) {
  return (
    <a {...props} data-variant={variant} className={cn("st-btn", className)} />
  );
}

export function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="st-section">
      <div className="st-section-title">{label}</div>
      {hint ? <p className="st-field-hint mb-4">{hint}</p> : null}
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

export function HelpCallout({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "warn" | "live";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-[12px] leading-5",
        tone === "warn" &&
          "border-amber-200/20 bg-amber-200/[0.06] text-amber-100/80",
        tone === "live" &&
          "border-emerald-200/20 bg-emerald-200/[0.06] text-emerald-100/80",
        tone === "neutral" &&
          "border-zinc-800 bg-zinc-900/50 text-zinc-400"
      )}
    >
      {children}
    </div>
  );
}
