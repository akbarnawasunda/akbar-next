import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import "./NightFrequencySignature.css";

type Chapter = {
  element: HTMLElement;
  label: string;
  index: string;
};

const PUBLIC_SECTION_SELECTOR = ".route-motion .nf-page main > section, .route-motion .an-site main > section";

function cleanLabel(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || "SIGNAL";
}

function collectChapters(): Chapter[] {
  return Array.from(document.querySelectorAll<HTMLElement>(PUBLIC_SECTION_SELECTOR)).map(
    (element, index) => {
      const indexElement = element.querySelector<HTMLElement>(
        ".an-section-index, .nf-page-eyebrow, .eyebrow, .section-eyebrow",
      );
      const heading = element.querySelector<HTMLElement>("h1, h2, h3");
      const indexText = cleanLabel(indexElement?.textContent);
      const label = cleanLabel(
        indexElement?.querySelector("span:last-child")?.textContent ||
          heading?.textContent ||
          indexText,
      );
      const isHero = element.matches(".an-hero, .nf-page-hero");
      const numericIndex = isHero
        ? "00"
        : indexText.match(/\d{1,2}/)?.[0] || String(index + 1).padStart(2, "0");
      return { element, label, index: numericIndex };
    },
  );
}

export function NightFrequencySignature() {
  const [location] = useLocation();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let retryId: number | undefined;

    const collect = () => {
      if (cancelled) return;
      const nextChapters = collectChapters();
      if (!nextChapters.length) {
        retryId = window.setTimeout(collect, 80);
        return;
      }
      setChapters(nextChapters);
      setActiveChapter(0);
    };

    collect();
    return () => {
      cancelled = true;
      if (retryId !== undefined) window.clearTimeout(retryId);
    };
  }, [location]);

  useEffect(() => {
    if (chapters.length < 2 || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const nextIndex = chapters.findIndex(chapter => chapter.element === visible.target);
        if (nextIndex >= 0) setActiveChapter(nextIndex);
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: "-18% 0px -56% 0px" },
    );

    chapters.forEach(chapter => observer.observe(chapter.element));
    return () => observer.disconnect();
  }, [chapters]);

  if (chapters.length < 2) return null;

  return (
    <aside className="nf-signature-rail" aria-label="Navigasi frekuensi halaman">
      <span className="nf-signature-rail-label">TUNE</span>
      <ol>
        {chapters.map((chapter, index) => (
          <li key={`${location}-${chapter.index}-${index}`}>
            <button
              type="button"
              className={index === activeChapter ? "is-active" : undefined}
              aria-label={`Buka bagian ${chapter.label}`}
              aria-current={index === activeChapter ? "step" : undefined}
              onClick={() => chapter.element.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              <span className="nf-signature-rail-tick" aria-hidden="true" />
              <span className="nf-signature-rail-index">{chapter.index}</span>
              <span className="nf-signature-rail-name">{chapter.label}</span>
            </button>
          </li>
        ))}
      </ol>
      <span className="nf-signature-rail-status" aria-hidden="true">
        {String(activeChapter + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
      </span>
    </aside>
  );
}
