import { useEffect, useRef } from "react";

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function useHorizontalScrollSequence<T extends HTMLElement = HTMLElement>() {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const track = root.querySelector<HTMLElement>("[data-horizontal-track]");
    const viewport = root.querySelector<HTMLElement>("[data-horizontal-viewport]");
    if (!track || !viewport) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let horizontalDistance = 0;

    const measure = () => {
      horizontalDistance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      root.style.setProperty("--horizontal-distance", `${Math.round(horizontalDistance)}px`);
      root.dataset.horizontalReady = "true";
    };

    const apply = () => {
      frame = 0;
      measure();

      if (motionQuery.matches || horizontalDistance <= 0) {
        root.style.setProperty("--horizontal-progress", "0");
        root.style.setProperty("--horizontal-translate", "0px");
        if (track) track.style.removeProperty("transform");
        root.dataset.horizontalActive = "false";
        return;
      }

      const viewportHeight = window.innerHeight || 1;
      const rect = root.getBoundingClientRect();
      const scrollRange = Math.max(1, root.offsetHeight - viewportHeight);
      const progress = clamp(-rect.top / scrollRange);
      const translate = -Math.round(horizontalDistance * progress);
      root.style.setProperty("--horizontal-progress", progress.toFixed(4));
      root.style.setProperty("--horizontal-translate", `${translate}px`);
      if (track) track.style.transform = `translate3d(${translate}px, 0, 0)`;
      root.dataset.horizontalActive = progress > 0.01 && progress < 0.99 ? "true" : "false";
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(requestUpdate) : undefined;
    resizeObserver?.observe(root);
    resizeObserver?.observe(track);
    resizeObserver?.observe(viewport);

    root.dataset.horizontalMode = motionQuery.matches ? "reduced" : "scroll-through";
    measure();
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);
    motionQuery.addEventListener?.("change", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("load", requestUpdate);
      motionQuery.removeEventListener?.("change", requestUpdate);
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return rootRef;
}
