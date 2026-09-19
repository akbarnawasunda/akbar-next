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

    expect(home).toContain('className="section section-current"');
    expect(home).toContain("aria-busy={contentIsLoading}");
    expect(home).toContain("enabled: publicContent.isError");
    expect(home).toContain('fetchPriority="high"');
    expect(reveal).toContain("IntersectionObserver");
    expect(reveal).toContain("prefers-reduced-motion: reduce");
    expect(magnetic).toContain("(hover: hover) and (pointer: fine)");
    expect(performance).toContain("largest-contentful-paint");
  });

  it("keeps the RMX public mark static and lightweight", () => {
    const component = source("client/src/components/BrandMotionMark.tsx");

    expect(component).toContain("an-rmx-static-mark");
    expect(component).toContain("<svg");
    expect(component).toContain("an-rmx-monogram");
    expect(component).not.toContain("canvas");
    expect(component).not.toContain("requestAnimationFrame");
  });

  it("wires route transition, touch swipe, and richer particle rendering", () => {
    const app = source("client/src/App.tsx");
    const home = source("client/src/pages/Home.tsx");

    expect(app).toContain("useLocation");
    expect(app).toContain("RouteMotion");
    expect(app).toContain(
      'window.scrollTo({ top: 0, left: 0, behavior: "auto" })'
    );
    expect(source("client/src/components/BrandMotionMark.tsx")).not.toContain(
      "requestAnimationFrame"
    );
    expect(home).toContain('className="hero-title-editorial"');
    expect(home).toContain('data-no-scramble="true"');
    expect(home).toContain("hero-title-mask");
    expect(home).toContain("Garam & Madu × Backpacker");
    expect(home).toContain("const cmsCurrentRelease");
    expect(home).toContain("const displayReleases");
    expect(home).toContain("const activeRelease = cmsCurrentRelease");
    expect(home).toContain("/assets/akbar-night-frequency-hero-optimized.webp");
    expect(home).toContain("/assets/akbar-night-frequency-stage-optimized.webp");
    expect(home).not.toContain("MANAGED RELEASE");
  });

  it("keeps the portfolio-inspired homepage patterns wired", () => {
    const app = source("client/src/App.tsx");
    const home = source("client/src/pages/Home.tsx");
    const marquee = source("client/src/components/PlatformMarquee.tsx");
    const progress = source("client/src/components/ScrollProgress.tsx");
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
    expect(home).toContain("<PlatformMarquee links={editablePlatformLinks} />");
    expect(marquee).toContain("an-platform-marquee-track");
    expect(progress).toContain("requestAnimationFrame");
    expect(orchestrator).toContain('main > section:not(.reveal-target)');
    expect(orchestrator).toContain('section.classList.add("reveal-pending")');
    expect(orchestratorCss).toContain(".reveal-pending");
    expect(home).toContain("ResilientBrandImage");
    expect(source("client/src/content/artistPlatform.ts")).toContain(
      'logoFallback: "/assets/akbar-logo-fallback.webp"'
    );
    expect(source("client/src/components/NightFrequencyChrome.tsx")).toContain(
      "ResilientBrandImage"
    );
    const index = source("client/index.html");
    const ssr = source("server/_core/ssrHtml.ts");
    const sitemap = source("client/public/sitemap.xml");
    expect(index).toContain('<html lang="id">');
    expect(index).toContain("<!--app-head-->");
    expect(index).toContain('src="/src/entry-client.tsx"');
    expect(ssr).toContain("function buildHeadTags");
    expect(ssr).toContain('rel="canonical"');
    expect(ssr).toContain('property="og:url"');
    expect(sitemap).toContain("https://akbarnawasunda.my.id/music");
  });

  it("keeps the editorial brand system wired across public surfaces", () => {
    const app = source("client/src/App.tsx");
    const index = source("client/index.html");
    const brand = source("client/src/components/BrandSystem.css");

    expect(app).toContain('import "./components/BrandSystem.css";');
    expect(index).toContain("Bebas+Neue");
    expect(index).toContain("Manrope");
    expect(brand).toContain("--an-graphite: var(--ink)");
    expect(brand).toContain("--an-plasma: var(--signal)");
    expect(brand).toContain("--an-graphite: var(--ink)");
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
