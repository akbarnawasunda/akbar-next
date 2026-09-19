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

      // Reduced motion / no observer → semua langsung terlihat.
      if (reducedMotion || !("IntersectionObserver" in window)) {
        sections.forEach((section) => {
          section.classList.add("is-motion-in-view");
        });
        return;
      }

      const viewportHeight = window.innerHeight;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const alreadyVisible = rect.top < viewportHeight * 0.9;

        // Section yang sudah di viewport saat setup → langsung visible,
        // jangan di-hide.
        if (alreadyVisible) {
          section.classList.add("is-motion-in-view");
        } else {
          section.classList.add("reveal-pending");
        }
      });

      // Safety: 3 detik kemudian, paksa semua visible.
      safetyId = window.setTimeout(() => {
        if (cancelled) return;
        sections.forEach((section) => {
          if (!section.classList.contains("is-motion-in-view")) {
            section.classList.remove("reveal-pending");
            section.classList.add("is-motion-in-view");
          }
        });
      }, 3000);

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const section = entry.target as HTMLElement;
            if (!entry.isIntersecting) return;
            section.classList.remove("reveal-pending");
            section.classList.add("is-motion-in-view");
          });
        },
        { threshold: [0, 0.08], rootMargin: "0px 0px -6%" }
      );

      sections.forEach((section) => observer?.observe(section));
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
