import { useEffect, useState } from "react";
import { officialBrand } from "@/content/artistPlatform";
import {
  IMAGE_SIZES,
  aspectRatioOf,
  fallbackChain,
  intrinsicSize,
  loadingPolicy,
  pictureSourcesFor,
  srcSetFor,
  type ImageSizePreset,
} from "@/lib/responsiveImage";
import "./OptimizedEditorialImage.css";

export type OptimizedEditorialImageProps = {
  src?: string;
  backupSrc?: string;
  alt: string;
  className?: string;
  /** Ukuran intrinsik; kalau kosong diambil dari manifest aset lokal. */
  width?: number;
  height?: number;
  aspectRatio?: string;
  /** Hanya untuk gambar above-the-fold (hero). Default lazy. */
  priority?: boolean;
  sizes?: string;
  /** Preset `sizes` supaya pemanggil tidak menebak nilai sendiri. */
  sizePreset?: ImageSizePreset;
  objectFit?: "cover" | "contain" | "fill";
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
  sizes,
  sizePreset = "artwork",
  objectFit = "cover",
}: OptimizedEditorialImageProps) {
  const chain = fallbackChain(src, backupSrc, officialBrand.logoFallback);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setIsLoaded(false);
  }, [src, backupSrc]);

  const currentSrc = chain[Math.min(sourceIndex, chain.length - 1)];
  const known = intrinsicSize(currentSrc);
  const resolvedWidth = width ?? known?.[0];
  const resolvedHeight = height ?? known?.[1];
  const resolvedRatio =
    aspectRatio ??
    (resolvedWidth && resolvedHeight
      ? `${resolvedWidth} / ${resolvedHeight}`
      : aspectRatioOf(currentSrc));
  const sources = pictureSourcesFor(currentSrc);
  const srcSet = srcSetFor(currentSrc);
  const { loading, fetchPriority } = loadingPolicy(priority);
  const resolvedSizes =
    sizes ?? (srcSet || sources.length ? IMAGE_SIZES[sizePreset] : undefined);

  return (
    <div
      className={`an-opt-img-container an-media ${isLoaded ? "is-loaded" : "is-loading"} ${className}`}
      style={resolvedRatio ? { aspectRatio: resolvedRatio } : undefined}
    >
      {/* Micro-shimmer placeholder while decoding */}
      {!isLoaded && <div className="an-opt-img-shimmer" aria-hidden="true" />}

      <picture>
        {sources.map(source => (
          <source
            key={`${source.media}-${source.srcSet}`}
            media={source.media}
            srcSet={source.srcSet}
            type={source.type}
          />
        ))}
        <img
          src={currentSrc}
          alt={alt}
          width={resolvedWidth}
          height={resolvedHeight}
          srcSet={srcSet}
          sizes={resolvedSizes}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          style={{ objectFit }}
          className={`an-opt-img-element ${isLoaded ? "has-faded-in" : ""}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setSourceIndex(index =>
              index < chain.length - 1 ? index + 1 : index
            );
            if (sourceIndex >= chain.length - 1) setIsLoaded(true);
          }}
        />
      </picture>
    </div>
  );
}
