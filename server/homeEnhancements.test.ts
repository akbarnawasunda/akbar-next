import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("homepage enhancement contract", () => {
  it("wires reveal, magnetic CTA, tilt cards, skeletons, and performance monitoring", () => {
    const home = source("client/src/pages/Home.tsx");
    const reveal = source("client/src/hooks/useScrollReveal.ts");
    const magnetic = source("client/src/hooks/useMagnetic.ts");
    const performance = source("client/src/hooks/usePerformanceMonitor.ts");

    expect(home).toContain("useScrollReveal");
    expect(home).toContain('className="section section-current reveal-target"');
    expect(home).toContain("useMagnetic");
    expect(home).toContain("<TiltCard");
    expect(home).toContain("<SkeletonCard");
    expect(home).toContain("aria-busy={contentQuery.isLoading}");
    expect(home).toContain('fetchPriority="high"');
    expect(reveal).toContain("IntersectionObserver");
    expect(reveal).toContain("prefers-reduced-motion: reduce");
    expect(magnetic).toContain("(hover: hover) and (pointer: fine)");
    expect(performance).toContain("largest-contentful-paint");
  });

  it("pauses the RMX animation loop when its canvas leaves the viewport", () => {
    const component = source("client/src/components/BrandMotionMark.tsx");

    expect(component).toContain("visibleRef");
    expect(component).toContain("new IntersectionObserver");
    expect(component).toContain("cancelAnimationFrame");
    expect(component).toContain("FALLBACK_RMX_MARK");
    expect(component).toContain('"#d8ff65"');
    expect(component).toContain("drawIdle");
    expect(component).toContain("idleActive ? drawIdle : draw");
  });

  it("wires route transition, touch swipe, and richer particle rendering", () => {
    const app = source("client/src/App.tsx");
    const home = source("client/src/pages/Home.tsx");
    const motion = source("client/src/pages/HomeMotionRefinement.css");
    const particle = source("client/src/components/BrandMotionMark.tsx");

    expect(app).toContain("useLocation");
    expect(app).toContain("RouteMotion");
    expect(app).toContain(
      'window.scrollTo({ top: 0, left: 0, behavior: "auto" })'
    );
    expect(home).toContain('import "./HomeMotionRefinement.css";');
    expect(motion).toContain("scroll-snap-type: x mandatory");
    expect(motion).toContain("touch-action: pan-x pan-y");
    expect(particle).toContain('"#bca7ff"');
    expect(particle).toContain("imageSmoothingEnabled = false");
    expect(particle).toContain("idleTime * 0.62");
  });

  it("keeps motion enhancements opt-in for reduced-motion users", () => {
    const css = source("client/src/pages/Home.css");
    const globalCss = source("client/src/index.css");

    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(css).toContain(".button-primary::before");
    expect(css).toContain(".skeleton");
    expect(globalCss).toMatch(/scroll-behavior:\s*smooth/);
    expect(globalCss).toMatch(/scroll-behavior:\s*auto/);
  });
});
