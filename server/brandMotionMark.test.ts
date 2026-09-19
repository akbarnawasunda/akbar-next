import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("lightweight RMX brand mark", () => {
  it("uses the supplied RMX asset and safe public asset proxy", () => {
    const content = source("client/src/content/artistPlatform.ts");
    expect(content).toContain("rmxMark");
    expect(content).toContain('rmxMark: "/assets/akbar-rmx-mark.webp"');
    const proxy = source("server/brandAssetProxy.ts");
    expect(proxy).toContain('app.get("/api/brand/rmx-mark"');
    const vercel = source("vercel.json");
    expect(vercel).toContain('"source": "/api/brand/rmx-mark"');
  });

  it("renders a static inline SVG instead of a public canvas animation", () => {
    const component = source("client/src/components/BrandMotionMark.tsx");
    const css = source("client/src/components/BrandMotionMark.css");
    expect(component).toContain("an-rmx-static-mark");
    expect(component).toContain("<svg");
    expect(component).toContain("an-rmx-monogram");
    expect(component).not.toContain("canvas");
    expect(component).not.toContain("requestAnimationFrame");
    expect(component).not.toContain("particleCap");
    expect(css).toContain(".an-rmx-static-mark");
    expect(css).toContain(".an-rmx-monogram");
    // Tidak boleh pakai backdrop-filter (mahal di GPU untuk SVG kecil).
    expect(css).not.toContain("backdrop-filter");
  });

  it("keeps the supplied portrait as the homepage hero visual", () => {
    const brand = source("client/src/content/artistPlatform.ts");
    const home = source("client/src/pages/Home.tsx");
    expect(brand).toContain(
      'portrait: "/assets/akbar-nawasunda-official-portrait.webp"'
    );
    expect(home).toContain("home-hero-portrait");
    expect(home).toContain("Portrait resmi Akbar Nawasunda");
  });
});
