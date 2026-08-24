import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  threshold = 0.12
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.classList.add("reveal-ready");
    element.dataset.revealReplay = "true";
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      element.dataset.revealPhase = "locked";
      element.classList.add("is-revealed");
      return;
    }

    let previousTop: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        const top = entry.boundingClientRect.top;
        const direction = previousTop === undefined || top < previousTop ? "down" : "up";
        previousTop = top;
        element.dataset.revealDirection = direction;
        element.dataset.revealPhase = entry.isIntersecting ? "acquiring" : "released";
        element.classList.toggle("is-revealed", entry.isIntersecting);
        if (entry.isIntersecting) {
          window.requestAnimationFrame(() => {
            if (element.isConnected && element.classList.contains("is-revealed")) {
              element.dataset.revealPhase = "locked";
            }
          });
        }
      },
      {
        threshold: [0, threshold],
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
