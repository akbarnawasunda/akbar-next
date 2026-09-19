import { useEffect } from "react";
import { useLocation } from "wouter";
import "./MotionOrchestrator.css";

function usePublicSectionReveal(location: string) {
  useEffect(() => {
    let cancelled = false;
    let retryId: number | undefined;
    let observer: IntersectionObserver | undefined;
    let safetyId: number | undefined;

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

      if (reducedMotion || !("IntersectionObserver" in window)) {
        sections.forEach((section) => {
          section.classList.add("is-motion-in-view");
        });
        return;
      }

      // Safety: kalau setelah 2.5s ada section yang belum masuk observer
      // (misal observer gagal fire), paksa tampil.
      safetyId = window.setTimeout(() => {
        if (cancelled) return;
        sections.forEach((section) => {
          if (!section.classList.contains("is-motion-in-view")) {
            section.classList.add("is-motion-in-view");
          }
        });
      }, 2500);

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const section = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              section.classList.add("is-motion-in-view");
            }
          });
        },
        { threshold: [0, 0.08], rootMargin: "0px 0px -6%" }
      );

      sections.forEach((section) => {
        section.dataset.motionReplay = "true";
        observer?.observe(section);
      });
    };

    setup();

    return () => {
      cancelled = true;
      if (retryId !== undefined) window.clearTimeout(retryId);
      if (safetyId !== undefined) window.clearTimeout(safetyId);
      observer?.disconnect();
    };
  }, [location]);
}

export function MotionOrchestrator() {
  const [location] = useLocation();
  usePublicSectionReveal(location);
  return null;
}
