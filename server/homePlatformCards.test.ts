import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("homepage platform cards and portrait exposure", () => {
  it("renders official platform links as accessible brand-colored cards", () => {
    const home = source("client/src/pages/Home.tsx");
    const css = source("client/src/pages/HomePlatformCards.css");
    expect(home).toContain("home-platform-card platform-");
    expect(home).toContain(
      "aria-label={`Buka Akbar Nawasunda di ${platform.label}`}"
    );
    expect(css).toContain(".platform-spotify{--brand:#1ed760}");
    expect(css).toContain(".platform-youtube{--brand:#ff1636}");
    expect(css).toContain(".platform-soundcloud{--brand:#ff6d17}");
    expect(css).toContain("grid-template-columns:repeat(3,minmax(0,1fr))");
  });

  it("keeps the particle lane separate from hero copy", () => {
    const layout = source("client/src/pages/HomeLayoutRefinement.css");
    expect(layout).toContain("Collision guard: keep the particle canvas");
    expect(layout).toContain('"portrait particle"');
    expect(layout).toContain("position: relative !important");
    expect(layout).toContain("margin: 38px 0 0 auto");
  });

  it("keeps the official portrait bright enough without removing copy contrast", () => {
    const home = source("client/src/pages/Home.tsx");
    const brand = source("client/src/content/artistPlatform.ts");
    const css = source("client/src/pages/HomePortraitRefinement.css");
    expect(home).toContain('import "./HomeLayoutRefinement.css";');
    expect(home).toContain("src={portraitSrc}");
    expect(home).toContain("setPortraitSrc(officialBrand.portraitFallback)");
    expect(brand).toContain(
      'portraitFallback: "/assets/akbar-official-portrait.webp"'
    );
    expect(css).toContain("brightness(1.2)");
    expect(css).toMatch(/text-shadow:\s*0 3px 26px rgba\(0, 0, 0, 0\.76\)/);
    expect(css).toContain("brightness(1.08)");
  });
});
