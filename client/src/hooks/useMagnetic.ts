import { useEffect, useRef } from "react";

export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const enabled = () => pointerQuery.matches && !motionQuery.matches;
    const reset = () => {
      element.style.setProperty("--magnetic-x", "0px");
      element.style.setProperty("--magnetic-y", "0px");
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!enabled()) return;
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
      element.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
      element.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
    };

    const handlePreferenceChange = () => {
      if (!enabled()) reset();
    };

    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerleave", reset);
    element.addEventListener("blur", reset);
    pointerQuery.addEventListener("change", handlePreferenceChange);
    motionQuery.addEventListener("change", handlePreferenceChange);
    reset();
    return () => {
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerleave", reset);
      element.removeEventListener("blur", reset);
      pointerQuery.removeEventListener("change", handlePreferenceChange);
      motionQuery.removeEventListener("change", handlePreferenceChange);
      reset();
    };
  }, []);

  return ref;
}
