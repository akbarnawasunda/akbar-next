import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("RMX brand motion mark", () => {
  it("uses the user-provided RMX asset in the public identity data", () => {
    const content = source("client/src/content/artistPlatform.ts");
    expect(content).toContain("rmxMark");
    expect(content).toContain('rmxMark: "/api/brand/rmx-mark"');
    const proxy = source("server/brandAssetProxy.ts");
    expect(proxy).toContain('app.get("/api/brand/rmx-mark"');
    expect(proxy).toContain("akbar-nawasunda-rmx-mark_d59968bf.jpg");
    const vercel = source("vercel.json");
    expect(vercel).toContain('"source": "/api/brand/rmx-mark"');
    expect(vercel).toContain("akbar-nawasunda-rmx-mark_d59968bf.jpg");
    expect(vercel).toContain(
      '"source": "/manus-storage/akbar-nawasunda-official-portrait_2c39f68f.jpg"'
    );
    expect(vercel).toContain("akbar-nawasunda-official-portrait_2c39f68f.jpg");
    expect(vercel.indexOf('"source": "/api/brand/rmx-mark"')).toBeLessThan(
      vercel.indexOf('"source": "/(.*)"')
    );
    expect(
      vercel.indexOf(
        '"source": "/manus-storage/akbar-nawasunda-official-portrait_2c39f68f.jpg"'
      )
    ).toBeLessThan(vercel.indexOf('"source": "/(.*)"'));
  });

  it("uses the supplied official portrait as the homepage hero visual while preserving the particle layer", () => {
    const brand = source("client/src/content/artistPlatform.ts");
    const home = source("client/src/pages/Home.tsx");
    const heroCss = source("client/src/pages/HomeArtistUpgrade.css");
    expect(brand).toContain(
      'portrait: "/manus-storage/akbar-nawasunda-official-portrait_2c39f68f.jpg"'
    );
    expect(home).toContain("home-hero-portrait");
    expect(home).toContain("Portrait resmi Akbar Nawasunda");
    expect(heroCss).toContain(".home-hero-portrait");
    expect(heroCss).toMatch(/\.an-rmx-particle-hero\s*\{[\s\S]*z-index:\s*2;/);
  });

  it("builds the RMX silhouette from canvas particles and replays a dissolve only from user action", () => {
    const component = source("client/src/components/BrandMotionMark.tsx");
    const css = source("client/src/components/BrandMotionMark.css");
    expect(component).toContain("onClick={replay}");
    expect(component).toContain("requestAnimationFrame(draw)");
    expect(component).toContain("particleCap = mobile ? 1200 : 2400");
    expect(component).toContain("sampleContext.drawImage(image");
    expect(component).toContain("isInk");
    expect(component).toContain("isBlueAccent");
    expect(component).toContain(
      'canvas.dataset.particleMode = mobile ? "mobile" : "desktop"'
    );
    expect(component).toContain("Mainkan ulang particle logo Akbar Nawasunda");
    expect(component).not.toContain("an-rmx-mark-caption");
    expect(css).toContain(".an-rmx-particle-hero");
    expect(css).not.toContain("background:#d8cfbe");
  });

  it("keeps the mark static when reduced motion is requested", () => {
    const component = source("client/src/components/BrandMotionMark.tsx");
    const css = source("client/src/components/BrandMotionMark.css");
    expect(component).toContain(
      'matchMedia("(prefers-reduced-motion: reduce)")'
    );
    expect(css).toMatch(/prefers-reduced-motion\s*:\s*reduce/);
    expect(component).toContain("if (!particles.length || reducedMotion)");
    expect(css).toMatch(/\.an-rmx-particle-hero\s*\{\s*cursor:\s*default;/);
  });
});
