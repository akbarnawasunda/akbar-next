import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  threshold = 0.12
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.classList.add("reveal-ready");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      element.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.classList.add("is-revealed");
        observer.disconnect();
      },
      {
        threshold,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
