import { useEffect } from "react";
import { useLocation } from "wouter";
import "./MotionOrchestrator.css";

/**
 * MotionOrchestrator
 *
 * Perannya sekarang minimal:
 *   - Attach observer ke section halaman dalam.
 *   - Toggle `is-motion-in-view` supaya animasi masuk halus.
 *   - Hormati prefers-reduced-motion.
 *
 * Yang sudah DIHAPUS dari versi lama:
 *   - Scramble teks di h1, h2, h3, button, link.
 *     Sebelumnya bikin judul bergetar tiap klik dan ganggu
 *     screen reader. Sekarang tidak ada lagi.
 */
function usePublicSectionReveal(location: string) {
  useEffect(() => {
    let cancelled = false;
    let retryId: number | undefined;
    let observer: IntersectionObserver | undefined;

    const setup = () => {
      if (cancelled) return;

      const publicPage = document.querySelector<HTMLElement>(".nf-page");
      if (!publicPage) {
        if (document.querySelector(".an-site")) return;
        retryId = window.setTimeout(setup, 50);
        return;
      }

      const sections = Array.from(
        publicPage.querySelectorAll<HTMLElement>(
          "main > section:not(.reveal-target)"
        )
      );

      if (!sections.length) {
        retryId = window.setTimeout(setup, 50);
        return;
      }

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      sections.forEach((section) => {
        section.dataset.motionReplay = "true";
      });

      if (reducedMotion || !("IntersectionObserver" in window)) {
        sections.forEach((section) => {
          section.dataset.motionPhase = "locked";
          section.classList.add("is-motion-in-view");
        });
        return;
      }

      const setMotionState = (section: HTMLElement, isVisible: boolean) => {
        section.dataset.motionPhase = isVisible ? "acquiring" : "released";
        section.classList.toggle("is-motion-in-view", isVisible);
        if (!isVisible) return;
        window.requestAnimationFrame(() => {
          if (
            !cancelled &&
            section.isConnected &&
            section.classList.contains("is-motion-in-view")
          ) {
            section.dataset.motionPhase = "locked";
          }
        });
      };

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const section = entry.target as HTMLElement;
            setMotionState(section, entry.isIntersecting);
          });
        },
        { threshold: [0, 0.12], rootMargin: "0px 0px -8%" }
      );

      sections.forEach((section) => observer?.observe(section));
    };

    setup();

    return () => {
      cancelled = true;
      if (retryId !== undefined) window.clearTimeout(retryId);
      observer?.disconnect();
    };
  }, [location]);
}

export function MotionOrchestrator() {
  const [location] = useLocation();
  usePublicSectionReveal(location);
  return null;
}
