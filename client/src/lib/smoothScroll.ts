import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let rafId = 0;
/** Bangunkan pompa rAF lenis dari luar (mis. scrollToTop programmatic). */
let wakePump: (() => void) | null = null;

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

  /**
   * Pompa rAF untuk lenis — di-gate, tidak selalu menyala.
   *
   * `lenis.isScrolling` bernilai `false` saat lenis tidak sedang bekerja
   * ("smooth" selama scroll teranimasi, "native" 400ms setelah scroll native
   * terakhir — timeout-nya milik lenis, terlepas dari rAF). Saat idle, pompa
   * BERHENTI: halaman yang sedang dibaca tidak menjalankan loop scroll sama
   * sekali. Bangun instan oleh event (wheel/touch/scroll/keydown) dan setiap
   * scrollTo programmatic (docs/motion-performance-liquid-signal-pass.md §5.6).
   */
  const raf = (time: number) => {
    lenis.raf(time);
    rafId = 0;
    if (lenis.isScrolling) rafId = requestAnimationFrame(raf);
  };
  const wake = () => {
    if (!rafId) rafId = requestAnimationFrame(raf);
  };
  wakePump = wake;
  rafId = requestAnimationFrame(raf);

  window.addEventListener("wheel", wake, { passive: true });
  window.addEventListener("touchmove", wake, { passive: true });
  // Scroll native (scrollbar, keyboard): lenis menandainya "native" dan
  // meresetnya sendiri 400ms setelah scroll terakhir.
  window.addEventListener("scroll", wake, { passive: true });
  document.addEventListener("keydown", wake);

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
    // scrollTo menghidupkan animasi — pompa harus ikut bangun.
    wake();
  };
  document.addEventListener("click", handleAnchorClick);

  return () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
    wakePump = null;
    window.removeEventListener("wheel", wake);
    window.removeEventListener("touchmove", wake);
    window.removeEventListener("scroll", wake);
    document.removeEventListener("keydown", wake);
    document.removeEventListener("click", handleAnchorClick);
    lenis.destroy();
    lenisInstance = null;
  };
}

export function scrollToTop(immediate = true) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate });
    // scrollTo dengan animasi menghidupkan lenis — pompa harus ikut bangun.
    if (!immediate) wakePump?.();
  } else if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
  }
}
