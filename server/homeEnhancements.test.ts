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
    expect(home).toContain("aria-busy={contentIsLoading}");
    expect(home).toContain("enabled: publicContent.isError");
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
    expect(particle).toContain('"#9c7cff"');
    expect(particle).toContain("imageSmoothingEnabled = false");
    expect(particle).toContain("idleTime * 0.62");
    expect(particle).toContain("drawIrisReactor");
    expect(home).toContain('className="hero-title-editorial"');
    expect(home).toContain('data-no-scramble="true"');
    expect(home).toContain("hero-title-mask");
    expect(home).toContain("Garam & Madu × Backpacker");
    expect(home).toContain("const cmsCurrentRelease");
    expect(home).toContain("const displayReleases");
    expect(home).toContain("const activeRelease = cmsCurrentRelease");
    expect(home).toContain("/assets/akbar-night-frequency-hero.webp");
    expect(home).toContain("/assets/akbar-night-frequency-stage.webp");
    expect(home).not.toContain("MANAGED RELEASE");
    expect(source("client/src/components/MotionOrchestrator.tsx")).toContain(
      "const duration = 2000;"
    );
    expect(source("client/src/pages/HomeLayoutRefinement.css")).toContain(
      "hero-title-tracking-settle 2300ms"
    );
    expect(source("client/src/components/InteractionSystem.css")).toContain(
      "ui-content-rise 2200ms"
    );
  });

  it("keeps the portfolio-inspired homepage patterns wired", () => {
    const app = source("client/src/App.tsx");
    const home = source("client/src/pages/Home.tsx");
    const marquee = source("client/src/components/PlatformMarquee.tsx");
    const progress = source("client/src/components/ScrollProgress.tsx");
    const patterns = source("client/src/pages/HomePortfolioPatterns.css");
    const orchestrator = source("client/src/components/MotionOrchestrator.tsx");
    const orchestratorCss = source(
      "client/src/components/MotionOrchestrator.css"
    );

    expect(app).toContain(
      'import { ScrollProgress } from "./components/ScrollProgress";'
    );
    expect(app).toContain("<ScrollProgress />");
    expect(app).toContain("<MotionOrchestrator />");
    expect(home).toContain(
      'import { PlatformMarquee, SectionIndex } from "@/components/PlatformMarquee";'
    );
    expect(home).toContain('import "./HomePortfolioPatterns.css";');
    expect(home).toContain("<PlatformMarquee links={editablePlatformLinks} />");
    expect(home).toContain(
      '<SectionIndex number="01" label="PLATFORM RESMI" />'
    );
    expect(marquee).toContain("an-platform-marquee-track");
    expect(progress).toContain("requestAnimationFrame");
    expect(patterns).toContain("akbar-night-frequency-hero.webp");
    expect(patterns).toContain("an-section-index");
    expect(orchestrator).toContain("SCRAMBLE_CHARS");
    expect(orchestrator).toContain(".nf-page main > section");
    expect(orchestratorCss).toContain('data-scramble-running="true"');
    expect(home).toContain("ResilientBrandImage");
    expect(source("client/src/content/artistPlatform.ts")).toContain(
      'logoFallback: "/assets/akbar-logo-fallback.webp"'
    );
    expect(source("client/src/components/NightFrequencyChrome.tsx")).toContain(
      "ResilientBrandImage"
    );
    const index = source("client/index.html");
    const sitemap = source("client/public/sitemap.xml");
    expect(index).toContain('<html lang="id">');
    expect(index).toContain('<title>Akbar Nawasunda | Official Website</title>');
    expect(index).toContain('akbar-night-frequency-hero-mobile.webp');
    expect(index).toContain(
      'rel="canonical" href="https://akbarnawasunda.my.id/"'
    );
    expect(index).toContain(
      'property="og:url" content="https://akbarnawasunda.my.id/"'
    );
    expect(sitemap).toContain("https://akbarnawasunda.my.id/music");
  });

  it("keeps the editorial brand system wired across public surfaces", () => {
    const app = source("client/src/App.tsx");
    const index = source("client/index.html");
    const brand = source("client/src/components/BrandSystem.css");

    expect(app).toContain('import "./components/BrandSystem.css";');
    expect(index).toContain("Bebas+Neue");
    expect(index).toContain("Manrope");
    expect(brand).toContain("--an-graphite: #071419");
    expect(brand).toContain('font-family: "Bebas Neue"');
    expect(brand).toContain('font-family: "Manrope"');
    expect(brand).toContain('font-family: "IBM Plex Mono"');
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
