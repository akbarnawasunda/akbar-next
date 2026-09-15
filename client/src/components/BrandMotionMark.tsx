import { useEffect, useState } from "react";
import "./BrandMotionMark.css";

const FALLBACK_RMX_MARK = "/assets/akbar-rmx-mark-fallback.jpg";

type BrandMotionMarkProps = {
  src: string;
  locale?: "id" | "en";
};

/** Static brand mark for the public site. No drawing surface, WebGL, animation loop, or particle work. */
export function BrandMotionMark({ src, locale = "id" }: BrandMotionMarkProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const alt = locale === "en" ? "Akbar Nawasunda RMX mark" : "Logo RMX Akbar Nawasunda";

  useEffect(() => setImageSrc(src), [src]);

  return (
    <div className="an-rmx-particle-hero an-rmx-static-mark" role="img" aria-label={alt}>
      <img
        src={imageSrc}
        alt={alt}
        width={720}
        height={720}
        loading="lazy"
        decoding="async"
        onError={() => setImageSrc(FALLBACK_RMX_MARK)}
      />
    </div>
  );
}
