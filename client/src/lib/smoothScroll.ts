import Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let rafId = 0;

export function setupSmoothScroll() {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }
  if (lenisInstance) return () => {};

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    infinite: false,
  });

  lenisInstance = lenis;

  const raf = (time: number) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  const handleAnchorClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const destination = document.querySelector<HTMLElement>(href);
    if (!destination) return;
    event.preventDefault();
    lenis.scrollTo(destination, { offset: -80, duration: 1.4 });
  };
  document.addEventListener("click", handleAnchorClick);

  return () => {
    cancelAnimationFrame(rafId);
    document.removeEventListener("click", handleAnchorClick);
    lenis.destroy();
    lenisInstance = null;
  };
}

export function scrollToTop(immediate = true) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate });
  } else if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
  }
}
