import { useEffect, useRef } from "react";

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getSceneProgress(scene: HTMLElement, sceneTop: number, viewportHeight: number) {
  if (scene.dataset.scrollPin === "true") {
    return clamp(-sceneTop / Math.max(1, scene.offsetHeight - viewportHeight));
  }

  return clamp((viewportHeight - sceneTop) / (viewportHeight + Math.max(1, scene.offsetHeight)));
}

export function useScrollChoreography<T extends HTMLElement = HTMLElement>() {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = motionQuery.matches;
    const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-scene]"));
    let frame = 0;

    const apply = () => {
      const viewportHeight = window.innerHeight || 1;
      let activeScene = "";
      let activeScore = 0;

      scenes.forEach(scene => {
        const rect = scene.getBoundingClientRect();
        const progress = getSceneProgress(scene, rect.top, viewportHeight);
        const center = rect.top + scene.offsetHeight / 2;
        const distanceFromCenter = Math.abs(center - viewportHeight * 0.52);
        const active = scene.dataset.scrollPin === "true"
          ? progress > 0.02 && progress < 0.98
          : rect.bottom > viewportHeight * 0.18 && rect.top < viewportHeight * 0.84;
        const score = active ? 1 - clamp(distanceFromCenter / (viewportHeight * 1.35)) : 0;

        scene.style.setProperty("--scroll-progress", progress.toFixed(4));
        scene.style.setProperty("--scroll-scene-progress", progress.toFixed(4));
        scene.style.setProperty("--scroll-distance", `${Math.round((progress - 0.5) * -36)}px`);
        scene.style.setProperty("--scroll-background-distance", `${Math.round((progress - 0.5) * -58)}px`);
        scene.style.setProperty("--scroll-foreground-distance", `${Math.round((progress - 0.5) * 34)}px`);
        scene.dataset.scrollActive = active ? "true" : "false";

        const horizontalTrack = scene.querySelector<HTMLElement>("[data-scroll-horizontal-track]");
        const horizontalViewport = horizontalTrack?.parentElement;
        if (horizontalTrack && horizontalViewport) {
          const horizontalDistance = Math.max(0, horizontalTrack.scrollWidth - horizontalViewport.clientWidth);
          scene.style.setProperty("--scroll-horizontal-distance", `${Math.round(horizontalDistance * progress)}px`);
        }

        const platformCards = scene.querySelectorAll<HTMLElement>(".home-platform-card");
        platformCards.forEach((card, index) => {
          const start = 0.04 + index * 0.075;
          const cardProgress = clamp((progress - start) / 0.2);
          card.style.setProperty("--card-scroll-progress", cardProgress.toFixed(3));
          card.dataset.scrollFocus = cardProgress > 0.92 && cardProgress < 1 ? "true" : "false";
        });

        if (score > activeScore) {
          activeScore = score;
          activeScene = scene.dataset.scrollScene || "";
        }
      });

      root.dataset.activeScene = activeScene;
      root.dataset.scrollReady = "true";
      root.dataset.scrollMode = reducedMotion ? "reduced" : "native";
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };

    root.dataset.scrollReady = "true";
    root.dataset.scrollMode = reducedMotion ? "reduced" : "native";
    apply();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("load", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return rootRef;
}
