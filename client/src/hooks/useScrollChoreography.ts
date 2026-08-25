import { useEffect, useRef } from "react";

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function useScrollChoreography<T extends HTMLElement = HTMLElement>() {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-scene]"));
    let frame = 0;

    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const viewportHeight = window.innerHeight || 1;
        let activeScene = "";
        let activeScore = 0;

        scenes.forEach(scene => {
          const rect = scene.getBoundingClientRect();
          const progress = clamp((viewportHeight - rect.top) / (viewportHeight + Math.max(1, rect.height)));
          const center = rect.top + rect.height / 2;
          const distanceFromCenter = Math.abs(center - viewportHeight * 0.54);
          const active = rect.bottom > viewportHeight * 0.22 && rect.top < viewportHeight * 0.72;
          const score = active ? 1 - clamp(distanceFromCenter / (viewportHeight * 1.2)) : 0;

          scene.style.setProperty("--scroll-progress", progress.toFixed(4));
          scene.style.setProperty("--scroll-distance", `${Math.round((progress - 0.5) * -36)}px`);
          scene.style.setProperty("--scroll-background-distance", `${Math.round((progress - 0.5) * -52)}px`);
          scene.style.setProperty("--scroll-foreground-distance", `${Math.round((progress - 0.5) * 28)}px`);
          scene.dataset.scrollActive = active ? "true" : "false";

          if (score > activeScore) {
            activeScore = score;
            activeScene = scene.dataset.scrollScene || "";
          }
        });

        root.dataset.activeScene = activeScene;
        root.dataset.scrollReady = "true";
        if (reducedMotion) root.dataset.reducedMotion = "true";
        frame = 0;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("load", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return rootRef;
}
