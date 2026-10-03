import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import type { Era } from "@/content/eras";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { useSignatureRuntime } from "@/signature/useSignature";
import "./EraTimeline.css";

/**
 * Timeline era arsip.
 *
 * Kontrak utama: seluruh isi era ada di DOM dan terbaca penuh tanpa
 * JavaScript. JavaScript hanya menambah progres garis, sorotan era aktif,
 * pergantian artwork, dan meneruskan era aktif ke Signature Runtime supaya
 * particle background ikut merespons.
 */
export function EraTimeline({
  eras,
  lang = "id",
  releaseHrefPrefix = "",
}: {
  eras: Era[];
  lang?: "id" | "en";
  releaseHrefPrefix?: string;
}) {
  const { actions } = useSignatureRuntime();
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !eras.length) return;
    if (typeof IntersectionObserver === "undefined") return;

    const items = Array.from(
      list.querySelectorAll<HTMLElement>("[data-era-index]")
    );

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number(
          (visible.target as HTMLElement).dataset.eraIndex || 0
        );
        setActive(index);
      },
      { threshold: [0.25, 0.6], rootMargin: "-20% 0px -40% 0px" }
    );
    items.forEach(item => observer.observe(item));

    // Progres garis mengikuti scroll native; tidak ada scroll hijacking.
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = list.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const total = rect.height + viewport * 0.4;
      const passed = Math.min(Math.max(viewport * 0.6 - rect.top, 0), total);
      setProgress(Math.min(1, passed / total));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [eras.length]);

  useEffect(() => {
    if (!eras.length) return;
    actions.setEra({
      index: active,
      total: eras.length,
      id: eras[active]?.id || "",
    });
  }, [actions, active, eras]);

  if (!eras.length) return null;

  const current = eras[active] || eras[0];
  const copy =
    lang === "en"
      ? { artwork: "RELATED ARTWORK", release: "OPEN RELEASE", era: "ERA" }
      : { artwork: "ARTWORK TERKAIT", release: "BUKA RILISAN", era: "BABAK" };

  return (
    <div
      className="an-era-timeline"
      style={{ ["--era-progress" as string]: progress.toFixed(3) }}
    >
      <ol className="an-era-list" ref={listRef}>
        <span className="an-era-rail" aria-hidden="true">
          <i />
        </span>
        {eras.map((era, index) => (
          <li
            key={era.id}
            className="an-era-item"
            data-era-index={index}
            data-active={index === active}
          >
            <p className="an-era-year">{era.year}</p>
            <h3 className="an-era-title">{era.title}</h3>
            <p className="an-era-copy">{era.description}</p>
            {era.relatedRelease ? (
              <Link
                className="an-era-link"
                href={
                  era.releaseSlug
                    ? `${releaseHrefPrefix}/music/${era.releaseSlug}`
                    : `${releaseHrefPrefix}/music`
                }
                data-signal-interactive
              >
                {copy.release} · {era.relatedRelease}{" "}
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            ) : null}
          </li>
        ))}
      </ol>

      <aside className="an-era-artwork" aria-live="polite">
        <p className="an-era-artwork-label">
          {copy.artwork} · {copy.era} {String(active + 1).padStart(2, "0")}
        </p>
        <div className="an-era-artwork-frame">
          <ResilientArtworkImage
            key={current.id}
            src={current.artwork || ""}
            alt={
              lang === "en"
                ? `Artwork for era ${current.title}`
                : `Artwork untuk babak ${current.title}`
            }
          />
        </div>
        <p className="an-era-artwork-caption">
          {current.year} — {current.title}
        </p>
      </aside>
    </div>
  );
}
