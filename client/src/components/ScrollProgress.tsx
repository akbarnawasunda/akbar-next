import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const root = document.documentElement;
        const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
        const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        progressRef.current?.style.setProperty(
          "transform",
          `scaleX(${Math.min(1, Math.max(0, progress))})`
        );
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

  return (
    <div className="an-scroll-progress" aria-hidden="true">
      <span ref={progressRef} />
    </div>
  );
}
