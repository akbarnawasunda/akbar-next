import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let rafId = 0;

/**
 * Smooth scroll sengaja dibatasi: hanya desktop dengan mouse/trackpad.
 * Di layar sentuh dan perangkat lemah, inersia Lenis bikin scroll terasa
 * berat dan telat, padahal scroll bawaan sudah mulus.
 */
export function shouldUseSmoothScroll() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  // Perangkat sentuh → pakai scroll native.
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches)
    return false;
  if (window.innerWidth < 1024) return false;
  // CPU inti sedikit → jangan tambah beban rAF terus-menerus.
  const cores = (navigator as Navigator & { hardwareConcurrency?: number })
    .hardwareConcurrency;
  if (typeof cores === "number" && cores > 0 && cores <= 4) return false;
  return true;
}

export async function setupSmoothScroll() {
  if (!shouldUseSmoothScroll()) return () => {};
  if (lenisInstance) return () => {};

  const { default: LenisCtor } = await import("lenis");
  const lenis = new LenisCtor({
    duration: 0.85,
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
