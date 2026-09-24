import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const assetPath = (name: string) => resolve(process.cwd(), "client/public/assets", name);
const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("high-performance image optimization & non-Google typography", () => {
  it("keeps lightweight mobile-optimized editorial assets ready for responsive loading", () => {
    const mobileStage = assetPath("akbar-night-frequency-stage-mobile-optimized.webp");
    const mobileHero = assetPath("akbar-night-frequency-hero-mobile-optimized.webp");
    const optPortrait = assetPath("akbar-official-portrait-optimized.webp");

    expect(existsSync(mobileStage)).toBe(true);
    expect(existsSync(mobileHero)).toBe(true);
    expect(existsSync(optPortrait)).toBe(true);

    expect(statSync(mobileStage).size).toBeLessThan(200_000);
    expect(statSync(mobileHero).size).toBeLessThan(200_000);
    expect(statSync(optPortrait).size).toBeLessThan(150_000);
  });

  it("provides OptimizedEditorialImage with micro-shimmer, responsive picture, and CLS protection", () => {
    const componentCode = source("client/src/components/OptimizedEditorialImage.tsx");
    const cssCode = source("client/src/components/OptimizedEditorialImage.css");

    expect(componentCode).toContain("<picture>");
    expect(componentCode).toContain("MOBILE_OPTIMIZED_VARIANTS");
    expect(componentCode).toContain("an-opt-img-shimmer");
    expect(componentCode).toContain("decoding=\"async\"");
    expect(cssCode).toContain("an-shimmer-sweep");
  });

  it("serves curated non-Google Fontshare fonts locally with zero external Google font latency", () => {
    const clashFont = assetPath("fonts/fontshare/clash-display-600.woff2");
    const generalFont = assetPath("fonts/fontshare/general-sans-500.woff2");
    const azeretFont = assetPath("fonts/fontshare/azeret-mono-500.woff2");

    expect(existsSync(clashFont)).toBe(true);
    expect(existsSync(generalFont)).toBe(true);
    expect(existsSync(azeretFont)).toBe(true);

    const indexCss = source("client/src/index.css");
    expect(indexCss).toContain('@font-face {\n  font-family: "Clash Display";');
    expect(indexCss).toContain('@font-face {\n  font-family: "General Sans";');
    expect(indexCss).toContain('@font-face {\n  font-family: "Azeret Mono";');
    expect(indexCss).toContain('--font-display: "Clash Display"');
    expect(indexCss).toContain('--font-body:    "General Sans"');
    expect(indexCss).toContain('--font-mono:    "Azeret Mono"');
  });

  it("prevents text cut-off, descender clipping, and horizontal overflow across responsive viewports", () => {
    const homeCss = source("client/src/pages/Home.css");
    const indexCss = source("client/src/index.css");

    // hero-title-mask must not crop descenders with overflow: hidden
    expect(homeCss).toContain(".hero-title-mask {\n  display: inline-block;\n  overflow: visible;");
    // hero-title-editorial must support word break and fluid clamp
    expect(homeCss).toContain("word-break: break-word;");
    expect(homeCss).toContain("overflow-wrap: break-word;");
    // Global overflow-x clipping
    expect(indexCss).toContain("overflow-x: clip;");
  });
});
