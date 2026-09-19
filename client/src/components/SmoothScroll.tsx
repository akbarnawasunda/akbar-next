import { useEffect } from "react";
import { setupSmoothScroll } from "@/lib/smoothScroll";

export function SmoothScroll() {
  useEffect(() => {
    const cleanup = setupSmoothScroll();
    return cleanup;
  }, []);
  return null;
}
