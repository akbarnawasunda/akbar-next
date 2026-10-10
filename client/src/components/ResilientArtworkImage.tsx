import { useCallback, useEffect, useRef, useState } from "react";
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
  const imgRef = useRef<HTMLImageElement | null>(null);
  const checkedSourceRef = useRef<string>("");

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

  const advance = useCallback(
    () =>
      setSourceIndex(index => (index < chain.length - 1 ? index + 1 : index)),
    [chain.length],
  );

  // [BUGFIX] Error gambar SEBELUM hidrasi tidak pernah sampai ke onError
  // (handler React baru aktif setelah hidrasi). Kalau CDN sudah gagal duluan,
  // `onError` tidak akan pernah berbunyi lagi dan state macet di "none" —
  // gambar rusak + alt text tampil selamanya (ini yang terlihat di /music).
  // Pemeriksaan pasca-hidrasi ini membaca keadaan <img> yang sebenarnya:
  // `complete && naturalWidth === 0` berarti pemuatan sudah gagal, jadi rantai
  // fallback langsung diteruskan. Guard `checkedSourceRef` membuat pemeriksaan
  // idempoten per sumber — StrictMode yang menjalankan efek dua kali tidak
  // boleh melompati dua sumber sekaligus.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (checkedSourceRef.current === source) return;
    checkedSourceRef.current = source;
    if (img.complete && img.naturalWidth === 0 && img.src) {
      advance();
    }
  }, [source, advance]);

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
          ref={imgRef}
          className={`an-resilient-artwork ${fallbackMode !== "none" ? "is-fallback" : ""} ${className}`}
          src={source}
          onError={advance}
        />
      </picture>
    );
  }

  return (
    <img
      {...imageProps}
      ref={imgRef}
      className={`an-resilient-artwork ${fallbackMode !== "none" ? "is-fallback" : ""} ${className}`}
      src={source}
      onError={advance}
    />
  );
}
