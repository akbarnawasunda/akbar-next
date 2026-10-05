/**
 * STUDIO KIT — primitif UI untuk workspace owner (/admin, /studio, /assets).
 * Semua permukaan studio memakai komponen ini supaya ritme, radius, dan
 * tipografi tetap satu bahasa dan tidak lagi ditulis ulang per halaman.
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

const toneGlow: Record<string, string> = {
  cyan: "rgba(110,231,240,0.2)",
  violet: "rgba(167,139,250,0.2)",
  amber: "rgba(255,210,122,0.18)",
  mint: "rgba(127,242,195,0.18)",
  coral: "rgba(255,159,138,0.18)",
};

const toneColor: Record<string, string> = {
  cyan: "#6ee7f0",
  violet: "#b39cff",
  amber: "#ffd27a",
  mint: "#7ff2c3",
  coral: "#ff9f8a",
};

export type StatTone = keyof typeof toneGlow;

export function Stat({
  icon: Icon,
  kicker,
  value,
  label,
  tone = "cyan",
  spark,
  href,
}: {
  icon: LucideIcon;
  kicker: string;
  value: ReactNode;
  label: string;
  tone?: StatTone;
  spark?: number[];
  href?: string;
}) {
  const Wrapper = (href ? "a" : "article") as "a";
  return (
    <Wrapper
      href={href}
      className="st-stat"
      style={{ "--st-glow": toneGlow[tone] } as CSSProperties}
    >
      <div className="st-stat-top" style={{ color: toneColor[tone] }}>
        <Icon size={16} />
        <span className="st-stat-k">{kicker}</span>
      </div>
      <p className="st-stat-v">{value}</p>
      <p className="st-stat-l">{label}</p>
      {spark?.length ? (
        <div className="st-spark" aria-hidden>
          {spark.map((point, index) => (
            <i
              key={index}
              style={{
                height: `${Math.max(8, Math.min(100, point))}%`,
                animationDelay: `${index * 40}ms`,
                background: `linear-gradient(180deg, ${toneColor[tone]}bb, ${toneColor[tone]}14)`,
              }}
            />
          ))}
        </div>
      ) : null}
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
      <Icon size={22} className="text-white/25" />
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
          <Eyebrow>
            <span className="studio-dot" />
            {kicker}
          </Eyebrow>
          <h1>{title}</h1>
          {lead ? <p>{lead}</p> : null}
          {actions ? (
            <div className="mt-6 flex flex-wrap gap-2">{actions}</div>
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
