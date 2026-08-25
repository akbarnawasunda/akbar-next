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
};

const LOCAL_FALLBACK = officialBrand.logoFallback;

export function ResilientArtworkImage({
  src,
  backupSrc,
  alt,
  className = "",
  loading = "lazy",
  decoding = "async",
  fetchPriority = "low",
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

  return (
    <img
      className={`an-resilient-artwork ${fallbackMode !== "none" ? "is-fallback" : ""} ${className}`}
      src={source}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
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
