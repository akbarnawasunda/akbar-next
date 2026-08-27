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

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lightweightViewport = window.matchMedia("(max-width: 959px)").matches;
    const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-scene]"));

    root.dataset.scrollReady = "true";
    root.dataset.scrollMode = reducedMotion ? "reduced" : "native";

    if (!scenes.length) return;

    // Touch layouts keep native scroll and use one observer event per chapter.
    // They do not need a continuous rAF just to update a highlight state.
    if (reducedMotion || lightweightViewport) {
      let activeScene = "";
      const observer = new IntersectionObserver(
        entries => {
          const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const nextScene = (visible[0]?.target as HTMLElement | undefined)?.dataset.scrollScene || activeScene;
          if (nextScene && nextScene !== activeScene) {
            activeScene = nextScene;
            root.dataset.activeScene = nextScene;
          }
        },
        { threshold: [0.1, 0.3, 0.55], rootMargin: "-12% 0px -18%" },
      );
      scenes.forEach(scene => observer.observe(scene));
      return () => observer.disconnect();
    }

    let frame = 0;
    let lastActiveScene = "";

    const apply = () => {
      const viewportHeight = window.innerHeight || 1;
      let activeScene = "";
      let activeScore = 0;

      scenes.forEach(scene => {
        const rect = scene.getBoundingClientRect();
        const sceneHeight = scene.offsetHeight;
        const progress = getSceneProgress(scene, rect.top, viewportHeight);
        const center = rect.top + sceneHeight / 2;
        const distanceFromCenter = Math.abs(center - viewportHeight * 0.52);
        const active = scene.dataset.scrollPin === "true"
          ? progress > 0.02 && progress < 0.98
          : rect.bottom > viewportHeight * 0.18 && rect.top < viewportHeight * 0.84;
        const score = active ? 1 - clamp(distanceFromCenter / (viewportHeight * 1.35)) : 0;
        const nearViewport = rect.bottom > -viewportHeight * 1.15 && rect.top < viewportHeight * 1.25;

        if (scene.dataset.scrollActive !== String(active)) {
          scene.dataset.scrollActive = String(active);
        }

        // A distant scene cannot be seen during the next frame. Keep its last
        // values and avoid style work until it approaches the viewport again.
        if (nearViewport) {
          scene.style.setProperty("--scroll-progress", progress.toFixed(4));
          scene.style.setProperty("--scroll-scene-progress", progress.toFixed(4));
          scene.style.setProperty("--scroll-distance", `${Math.round((progress - 0.5) * -36)}px`);
          scene.style.setProperty("--scroll-background-distance", `${Math.round((progress - 0.5) * -58)}px`);
          scene.style.setProperty("--scroll-foreground-distance", `${Math.round((progress - 0.5) * 34)}px`);

          const horizontalTrack = scene.querySelector<HTMLElement>("[data-scroll-horizontal-track]");
          const horizontalViewport = horizontalTrack?.parentElement;
          if (horizontalTrack && horizontalViewport) {
            const horizontalDistance = Math.max(0, horizontalTrack.scrollWidth - horizontalViewport.clientWidth);
            scene.style.setProperty("--scroll-horizontal-distance", `${Math.round(horizontalDistance * progress)}px`);
          }

          if (scene.dataset.scrollScene === "platforms") {
            const platformCards = scene.querySelectorAll<HTMLElement>(".home-platform-card");
            platformCards.forEach((card, index) => {
              const start = 0.04 + index * 0.075;
              const cardProgress = clamp((progress - start) / 0.2);
              card.style.setProperty("--card-scroll-progress", cardProgress.toFixed(3));
              const focused = cardProgress > 0.92 && cardProgress < 1;
              if (card.dataset.scrollFocus !== String(focused)) {
                card.dataset.scrollFocus = String(focused);
              }
            });
          }
        }

        if (score > activeScore) {
          activeScore = score;
          activeScene = scene.dataset.scrollScene || "";
        }
      });

      if (activeScene !== lastActiveScene) {
        root.dataset.activeScene = activeScene;
        lastActiveScene = activeScene;
      }
      root.dataset.scrollReady = "true";
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };

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
