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

  it("tidak lagi mengirim komponen mark berbasis canvas ke publik", () => {
    const home = source("client/src/pages/Home.tsx");
    const chrome = source("client/src/components/NightFrequencyChrome.tsx");
    expect(home).not.toContain("BrandMotionMark");
    expect(chrome).not.toContain("BrandMotionMark");
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
