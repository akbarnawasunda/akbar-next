import { useEffect } from "react";

const LCP_BUDGET_MS = 2500;

export function usePerformanceMonitor() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("PerformanceObserver" in window) ||
      !PerformanceObserver.supportedEntryTypes?.includes(
        "largest-contentful-paint"
      )
    ) {
      return;
    }

    let reported = false;
    let latestLcp = 0;

    const report = () => {
      if (reported || latestLcp <= 0) return;
      reported = true;
      const detail = {
        metric: "LCP",
        value: Math.round(latestLcp),
        budget: LCP_BUDGET_MS,
      };

      if (import.meta.env.DEV) {
        console.info("[Performance] LCP", detail);
      }
      window.dispatchEvent(new CustomEvent("an:performance", { detail }));
    };

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const entry = entries[entries.length - 1];
      if (entry) latestLcp = entry.startTime;
    });

    try {
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      observer.disconnect();
      return;
    }

    const timer = window.setTimeout(report, 10_000);
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") report();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
    };
  }, []);
}
