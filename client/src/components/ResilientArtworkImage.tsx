import { useEffect, useState } from "react";
import { officialBrand } from "@/content/artistPlatform";
import "./ResilientArtworkImage.css";

type ResilientArtworkImageProps = {
  src?: string;
  backupSrc?: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  decoding?: "async" | "sync" | "auto";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
};

const LOCAL_FALLBACK = officialBrand.logoFallback;

// High-efficiency mapping for mobile data savings without quality degradation
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

export function ResilientArtworkImage({
  src,
  backupSrc,
  alt,
  className = "",
  loading = "lazy",
  decoding = "async",
  fetchPriority = "low",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
}: ResilientArtworkImageProps) {
  const initialSource = src || backupSrc || LOCAL_FALLBACK;
  const [source, setSource] = useState(initialSource);
  const [fallbackMode, setFallbackMode] = useState<"none" | "backup" | "local">(
    initialSource === LOCAL_FALLBACK ? "local" : "none",
  );

  useEffect(() => {
    const nextSource = src || backupSrc || LOCAL_FALLBACK;
    setSource(nextSource);
    setFallbackMode(nextSource === LOCAL_FALLBACK ? "local" : "none");
  }, [backupSrc, src]);

  const mobileSource = MOBILE_OPTIMIZED_VARIANTS[source];

  if (mobileSource && fallbackMode === "none") {
    return (
      <picture className="an-resilient-picture">
        <source media="(max-width: 640px)" srcSet={mobileSource} type="image/webp" />
        <img
          className={`an-resilient-artwork ${className}`}
          src={source}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          sizes={sizes}
          data-image-state={fallbackMode}
          onError={() => {
            if (backupSrc && source !== backupSrc) {
              setSource(backupSrc);
              setFallbackMode("backup");
              return;
            }
            if (source !== LOCAL_FALLBACK) {
              setSource(LOCAL_FALLBACK);
              setFallbackMode("local");
            }
          }}
        />
      </picture>
    );
  }

  return (
    <img
      className={`an-resilient-artwork ${fallbackMode !== "none" ? "is-fallback" : ""} ${className}`}
      src={source}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      sizes={sizes}
      data-image-state={fallbackMode}
      onError={() => {
        if (fallbackMode === "none" && backupSrc && source !== backupSrc) {
          setSource(backupSrc);
          setFallbackMode("backup");
          return;
        }
        if (source !== LOCAL_FALLBACK) {
          setSource(LOCAL_FALLBACK);
          setFallbackMode("local");
        }
      }}
    />
  );
}
