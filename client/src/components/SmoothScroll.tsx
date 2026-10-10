import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  resetSmoothScroll,
  setupSmoothScroll,
  shouldUseSmoothScroll,
} from "@/lib/smoothScroll";

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Perangkat yang memakai scroll native tidak perlu mengunduh Lenis.
    if (!shouldUseSmoothScroll()) return;

    const controller = new AbortController();
    let cleanup: (() => void) | undefined;

    void setupSmoothScroll(controller.signal).then(dispose => {
      if (controller.signal.aborted) {
        dispose();
        return;
      }
      cleanup = dispose;
    });

    return () => {
      controller.abort();
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    // Also covers router.push/replace and browser history, which don't always
    // pass through a clicked <a>. Next remains responsible for hash/scroll.
    resetSmoothScroll();
  }, [pathname]);

  return null;
}
