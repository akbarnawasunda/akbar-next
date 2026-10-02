import { useEffect, useState } from "react";
import { officialBrand } from "@/content/artistPlatform";
import {
  IMAGE_SIZES,
  fallbackChain,
  intrinsicSize,
  pictureSourcesFor,
  srcSetFor,
  type ImageSizePreset,
} from "@/lib/responsiveImage";
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
  /** Preset `sizes`; dipakai kalau `sizes` tidak diberikan eksplisit. */
  sizePreset?: ImageSizePreset;
};

/**
 * Gambar artwork dengan rantai fallback.
 *
 * Urutan: `src` → `backupSrc` → aset brand lokal. Ukuran intrinsik diambil
 * dari manifest `lib/responsiveImage`, jadi `width`/`height` selalu ikut
 * terkirim dan layout tidak bergeser saat gambar datang (CLS).
 */
export function ResilientArtworkImage({
  src,
  backupSrc,
  alt,
  className = "",
  loading = "lazy",
  decoding = "async",
  fetchPriority = "low",
  sizes,
  sizePreset = "artwork",
}: ResilientArtworkImageProps) {
  const chain = fallbackChain(src, backupSrc, officialBrand.logoFallback);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [backupSrc, src]);

  const source = chain[Math.min(sourceIndex, chain.length - 1)];
  const known = intrinsicSize(source);
  const sources = pictureSourcesFor(source);
  const srcSet = srcSetFor(source);
  const fallbackMode: "none" | "backup" | "local" =
    sourceIndex === 0
      ? "none"
      : sourceIndex >= chain.length - 1
        ? "local"
        : "backup";

  const advance = () =>
    setSourceIndex(index => (index < chain.length - 1 ? index + 1 : index));

  const sizesAttribute =
    sizes ?? (srcSet || sources.length ? IMAGE_SIZES[sizePreset] : undefined);

  const imageProps = {
    alt,
    width: known?.[0],
    height: known?.[1],
    srcSet,
    sizes: sizesAttribute,
    loading,
    decoding,
    fetchPriority,
    "data-image-state": fallbackMode,
  } as const;

  if (sources.length) {
    return (
      <picture className="an-resilient-picture">
        {sources.map(item => (
          <source
            key={`${item.media}-${item.srcSet}`}
            media={item.media}
            srcSet={item.srcSet}
            type={item.type}
          />
        ))}
        <img
          {...imageProps}
          className={`an-resilient-artwork ${className}`}
          src={source}
          onError={advance}
        />
      </picture>
    );
  }

  return (
    <img
      {...imageProps}
      className={`an-resilient-artwork ${fallbackMode !== "none" ? "is-fallback" : ""} ${className}`}
      src={source}
      onError={advance}
    />
  );
}
