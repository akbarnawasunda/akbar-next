import { useEffect } from "react";
import { setupSmoothScroll, shouldUseSmoothScroll } from "@/lib/smoothScroll";

export function SmoothScroll() {
  useEffect(() => {
    // Perangkat yang tidak memakai smooth scroll tidak perlu mengunduh Lenis.
    if (!shouldUseSmoothScroll()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void setupSmoothScroll().then(dispose => {
      if (cancelled) {
        dispose();
        return;
      }
      cleanup = dispose;
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
