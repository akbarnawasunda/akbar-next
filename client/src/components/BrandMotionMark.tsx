import "./BrandMotionMark.css";

type BrandMotionMarkProps = {
  src?: string;
  locale?: "id" | "en";
};

/** Lightweight inline monogram. It remains crisp without loading or animating a large image. */
export function BrandMotionMark({ locale = "id" }: BrandMotionMarkProps) {
  const label = locale === "en" ? "Akbar Nawasunda monogram" : "Monogram Akbar Nawasunda";

  return (
    <div className="an-rmx-particle-hero an-rmx-static-mark" role="img" aria-label={label}>
      <svg className="an-rmx-monogram" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
        <path className="an-rmx-monogram-ring" d="M120 18a102 102 0 1 1 0 204 102 102 0 0 1 0-204Z" />
        <path className="an-rmx-monogram-line" d="M56 174 105 62l38 86 21-46 20 72M82 133h50" />
        <path className="an-rmx-monogram-line an-rmx-monogram-accent" d="m143 148 21-46 20 72" />
        <text x="120" y="201" textAnchor="middle">AN / RMX</text>
      </svg>
    </div>
  );
}
