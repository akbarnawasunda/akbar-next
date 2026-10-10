import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let rafId = 0;
/** Bangunkan pompa rAF lenis dari luar (mis. scrollToTop programmatic). */
let wakePump: (() => void) | null = null;

/**
 * Smooth scroll sengaja dibatasi ke desktop yang mampu dan memakai mouse /
 * trackpad. Layar sentuh, reduced motion, hemat data, jaringan 2G, dan mesin
 * yang benar-benar rendah daya tetap memakai scroll native.
 */
export function shouldUseSmoothScroll() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches)
    return false;
  if (window.innerWidth < 1024) return false;

  const device = navigator as Navigator & {
    hardwareConcurrency?: number;
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const cores =
    typeof device.hardwareConcurrency === "number" &&
    device.hardwareConcurrency > 0
      ? device.hardwareConcurrency
      : 4;
  const memory =
    typeof device.deviceMemory === "number" && device.deviceMemory > 0
      ? device.deviceMemory
      : 4;
  if (cores <= 2 || memory <= 2) return false;

  const connection = device.connection;
  if (
    connection?.saveData ||
    /^(?:slow-)?2g$/.test(connection?.effectiveType || "")
  ) {
    return false;
  }

  return true;
}

export async function setupSmoothScroll(signal?: AbortSignal) {
  if (!shouldUseSmoothScroll() || signal?.aborted) return () => {};
  if (lenisInstance) return () => {};

  const { default: LenisCtor } = await import("lenis");
  // The component can unmount while the optional Lenis chunk is downloading.
  // Re-check after the await so Strict Mode and route changes cannot leave a
  // detached instance running in the background.
  if (signal?.aborted || lenisInstance) return () => {};

  const lenis = new LenisCtor({
    // A short, responsive lerp feels smooth without the long catch-up caused
    // by a fixed 0.85s wheel duration. Touch input remains native (syncTouch is
    // deliberately off), as does all reduced-motion and low-power scrolling.
    lerp: 0.12,
    smoothWheel: true,
    wheelMultiplier: 1,
    infinite: false,
    anchors: false,
    stopInertiaOnNavigate: true,
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
   * scrollTo programmatic. The canvas has its own frame-budget governor.
   */
  const raf = (time: number) => {
    lenis.raf(time);
    rafId = 0;
    if (lenis.isScrolling) rafId = requestAnimationFrame(raf);
  };
  const wake = () => {
    if (!rafId) rafId = requestAnimationFrame(raf);
  };
  const stopInertia = () => {
    // Use Lenis' public scrollTo API (reset is private in its type surface).
    // Setting the animated target to the current native position is immediate.
    lenis.scrollTo(lenis.actualScroll, { immediate: true, force: true });
  };
  wakePump = wake;
  rafId = requestAnimationFrame(raf);

  window.addEventListener("wheel", wake, { passive: true });
  window.addEventListener("touchmove", wake, { passive: true });
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("popstate", stopInertia);
  window.addEventListener("hashchange", stopInertia);
  document.addEventListener("keydown", wake);

  // Do not hijack same-page anchors: browser/Next keeps ownership of the URL
  // hash and scroll restoration. Only clear Lenis inertia before the native
  // anchor action, otherwise its old target could pull the page back afterward.
  const resetBeforeNativeNavigation = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor || anchor.hasAttribute("download")) return;
    if (anchor.target && anchor.target.toLowerCase() !== "_self") return;

    const destination = new URL(anchor.href, window.location.href);
    const current = new URL(window.location.href);
    if (destination.origin !== current.origin) return;

    const isHashNavigation =
      destination.pathname === current.pathname &&
      (Boolean(destination.hash) || anchor.getAttribute("href")?.endsWith("#"));
    if (isHashNavigation) stopInertia();
  };
  document.addEventListener("click", resetBeforeNativeNavigation);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    wakePump = null;
    window.removeEventListener("wheel", wake);
    window.removeEventListener("touchmove", wake);
    window.removeEventListener("scroll", wake);
    window.removeEventListener("popstate", stopInertia);
    window.removeEventListener("hashchange", stopInertia);
    document.removeEventListener("keydown", wake);
    document.removeEventListener("click", resetBeforeNativeNavigation);
    lenis.destroy();
    if (lenisInstance === lenis) lenisInstance = null;
  };
}

/**
 * Route transitions can also be triggered programmatically (without a link
 * click). Clear any old interpolation after Next has applied its route/scroll
 * restoration; Lenis then adopts the actual native position.
 */
export function resetSmoothScroll() {
  if (!lenisInstance) return;
  lenisInstance.scrollTo(lenisInstance.actualScroll, {
    immediate: true,
    force: true,
  });
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
