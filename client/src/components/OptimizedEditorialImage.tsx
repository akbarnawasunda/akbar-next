import { useEffect, useState } from "react";
import { officialBrand } from "@/content/artistPlatform";
import "./OptimizedEditorialImage.css";

export type OptimizedEditorialImageProps = {
  src?: string;
  backupSrc?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain" | "fill";
};

// Maps known high-res desktop images to mobile-optimized lighter WebP counterparts
const MOBILE_OPTIMIZED_VARIANTS: Record<string, string> = {
  "/assets/akbar-night-frequency-stage-optimized.webp": "/assets/akbar-night-frequency-stage-mobile-optimized.webp",
  "/assets/akbar-night-frequency-stage.webp": "/assets/akbar-night-frequency-stage-mobile-optimized.webp",
  "/assets/akbar-night-frequency-hero-optimized.webp": "/assets/akbar-night-frequency-hero-mobile-optimized.webp",
  "/assets/akbar-night-frequency-hero.webp": "/assets/akbar-night-frequency-hero-mobile-optimized.webp",
  "/assets/akbar-nawasunda-official-portrait.webp": "/assets/akbar-official-portrait-optimized.webp",
  "/assets/akbar-nawasunda-official-portrait.jpg": "/assets/akbar-official-portrait-optimized.webp",
  "/assets/akbar-official-portrait.webp": "/assets/akbar-official-portrait-optimized.webp",
  "/assets/akbar-social-preview.webp": "/assets/akbar-social-preview-optimized.webp",
};

export function OptimizedEditorialImage({
  src,
  backupSrc,
  alt,
  className = "",
  width,
  height,
  aspectRatio,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px",
  objectFit = "cover",
}: OptimizedEditorialImageProps) {
  const initialSource = src || backupSrc || officialBrand.logoFallback;
  const [currentSrc, setCurrentSrc] = useState(initialSource);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const next = src || backupSrc || officialBrand.logoFallback;
    setCurrentSrc(next);
    setIsLoaded(false);
    setHasError(false);
  }, [src, backupSrc]);

  const mobileSrc = MOBILE_OPTIMIZED_VARIANTS[currentSrc] || currentSrc;

  return (
    <div
      className={`an-opt-img-container ${isLoaded ? "is-loaded" : "is-loading"} ${className}`}
      style={{
        ...(aspectRatio ? { aspectRatio } : {}),
        ...(width && height && !aspectRatio ? { aspectRatio: `${width} / ${height}` } : {}),
      }}
    >
      {/* Micro-shimmer placeholder while decoding */}
      {!isLoaded && <div className="an-opt-img-shimmer" aria-hidden="true" />}

      <picture>
        {mobileSrc !== currentSrc && (
          <source
            media="(max-width: 640px)"
            srcSet={mobileSrc}
            type="image/webp"
          />
        )}
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          style={{ objectFit }}
          className={`an-opt-img-element ${isLoaded ? "has-faded-in" : ""}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (!hasError && backupSrc && currentSrc !== backupSrc) {
              setCurrentSrc(backupSrc);
              setHasError(true);
            } else if (currentSrc !== officialBrand.logoFallback) {
              setCurrentSrc(officialBrand.logoFallback);
              setHasError(true);
            }
            setIsLoaded(true);
          }}
        />
      </picture>
    </div>
  );
}
