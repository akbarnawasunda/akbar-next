import { ArrowUpRight, Play, Square } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@/lib/navigation";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { useSignatureRuntime, useSignatureState } from "@/signature/useSignature";
import "./InteractiveArtworkCard.css";

/**
 * Kartu artwork bersama untuk rilisan, video, visual, dan arsip.
 *
 * - grain statis ringan (CSS, tanpa canvas tambahan)
 * - parallax dua lapis yang sangat tipis, hanya untuk pointer presisi
 * - mini-waveform saat hover/focus bila ada preview resmi
 * - preview audio maksimal 15 detik dan hanya setelah klik eksplisit
 * - tanpa pointer presisi / saat reduced motion: kartu tetap statis dan
 *   seluruh isinya tetap bisa diakses lewat keyboard
 */

const PREVIEW_LIMIT_MS = 15_000;

export function InteractiveArtworkCard({
  title,
  meta,
  badge,
  image,
  backupImage,
  href,
  previewUrl,
  onOpen,
  openLabel,
  children,
}: {
  title: string;
  meta?: string;
  badge?: string;
  image: string;
  backupImage?: string;
  href?: string;
  previewUrl?: string;
  onOpen?: () => void;
  openLabel?: string;
  children?: ReactNode;
}) {
  const { actions } = useSignatureRuntime();
  const reduced = useSignatureState(snapshot => snapshot.capability.reducedMotion);
  const coarse = useSignatureState(snapshot => snapshot.capability.coarsePointer);
  const cardRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number>(0);
  const [previewing, setPreviewing] = useState(false);

  const parallax = !reduced && !coarse;

  useEffect(() => {
    if (!parallax) return;
    const card = cardRef.current;
    if (!card) return;
    const onMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--art-x", x.toFixed(3));
      card.style.setProperty("--art-y", y.toFixed(3));
    };
    const onLeave = () => {
      card.style.setProperty("--art-x", "0");
      card.style.setProperty("--art-y", "0");
    };
    card.addEventListener("pointermove", onMove, { passive: true });
    card.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, [parallax]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
    },
    []
  );

  const stopPreview = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = 0;
    audioRef.current?.pause();
    setPreviewing(false);
    actions.setAudioState("paused");
  };

  const startPreview = () => {
    if (!previewUrl) return;
    if (previewing) {
      stopPreview();
      return;
    }
    const audio = audioRef.current || new Audio(previewUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    // Sumber resmi milik sendiri → benar-benar bisa dianalisis.
    actions.connectAudioElement(audio);
    actions.setAudioState("playing");
    void audio.play().catch(() => undefined);
    setPreviewing(true);
    timerRef.current = window.setTimeout(stopPreview, PREVIEW_LIMIT_MS);
  };

  return (
    <article
      className="an-artwork-card"
      ref={cardRef}
      data-previewing={previewing}
    >
      <div className="an-artwork-card-media">
        <div className="an-artwork-card-layer">
          <ResilientArtworkImage
            src={image}
            backupSrc={backupImage}
            alt={`Artwork ${title}`}
          />
        </div>
        <span className="an-artwork-card-grain" aria-hidden="true" />
        {previewUrl ? (
          <span className="an-artwork-card-wave" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <i key={index} style={{ animationDelay: `${index * 60}ms` }} />
            ))}
          </span>
        ) : null}
      </div>

      <div className="an-artwork-card-body">
        {badge ? <span className="an-artwork-card-badge">{badge}</span> : null}
        <h3 className="an-artwork-card-title">{title}</h3>
        {meta ? <p className="an-artwork-card-meta">{meta}</p> : null}
        {children}

        <div className="an-artwork-card-actions">
          {previewUrl ? (
            <button
              type="button"
              className="an-artwork-card-preview"
              onClick={startPreview}
              aria-pressed={previewing}
            >
              {previewing ? <Square size={12} /> : <Play size={12} fill="currentColor" />}
              {previewing ? "STOP" : "PREVIEW 15S"}
            </button>
          ) : null}

          {onOpen ? (
            <button
              type="button"
              className="an-artwork-card-open"
              onClick={onOpen}
            >
              {openLabel || "LIHAT"} <ArrowUpRight size={13} aria-hidden="true" />
            </button>
          ) : null}

          {href && href.startsWith("/") ? (
            // Tautan internal lewat router yang sama dengan sisa situs, jadi
            // transisi rute (dan partikelnya) tetap berjalan.
            <Link
              className="an-artwork-card-link"
              href={href}
            >
              {openLabel || "BUKA"} <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          ) : href ? (
            <a
              className="an-artwork-card-link"
              href={href}
              target="_blank"
              rel="noreferrer"
            >
              {openLabel || "BUKA"} <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
