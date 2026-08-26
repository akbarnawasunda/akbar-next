import type { ReactNode } from "react";
import { useHorizontalScrollSequence } from "@/hooks/useHorizontalScrollSequence";
import "./HorizontalReleaseSequence.css";

type HorizontalReleaseSequenceProps = {
  children: ReactNode;
  className?: string;
  label?: string;
  locale?: "id" | "en";
  itemCount?: number;
};

export function HorizontalReleaseSequence({
  children,
  className = "",
  label,
  locale = "id",
  itemCount,
}: HorizontalReleaseSequenceProps) {
  const ref = useHorizontalScrollSequence<HTMLElement>();
  const accessibleLabel = label || (locale === "en" ? "Release catalog" : "Katalog rilisan");
  return (
    <section
      ref={ref}
      className={`nf-horizontal-release-sequence ${className}`.trim()}
      aria-label={accessibleLabel}
    >
      <div className="nf-horizontal-release-sticky">
        {children}
        <div className="nf-horizontal-release-progress" aria-hidden="true">
          <span className="nf-horizontal-release-progress-label">
            {locale === "en" ? "SCROLL / MOVE THROUGH CATALOG" : "SCROLL / HABISKAN KATALOG"}
          </span>
          <span className="nf-horizontal-release-progress-line"><i /></span>
          <span className="nf-horizontal-release-progress-count">01—{itemCount ? String(itemCount).padStart(2, "0") : "END"}</span>
        </div>
      </div>
    </section>
  );
}
