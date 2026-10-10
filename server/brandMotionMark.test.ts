import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "./test-renderer";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("lightweight RMX brand mark", () => {
  it("uses the supplied RMX asset and safe public asset proxy", () => {
    const content = source("client/src/content/artistPlatform.ts");
    expect(content).toContain("rmxMark");
    expect(content).toContain('rmxMark: "/assets/akbar-rmx-mark.webp"');
    const mediaPolicy = source("server/publicMediaPolicy.ts");
    const mediaRoute = source("app/media/[...path]/route.ts");
    const nextConfig = source("next.config.ts");
    expect(mediaPolicy).toContain('"/media/brand/rmx-mark.jpg"');
    expect(mediaRoute).toContain("localMediaFallback(pathname)");
    expect(nextConfig).toContain('source: "/api/brand/rmx-mark"');
    expect(nextConfig).toContain('destination: "/media/brand/rmx-mark.jpg"');
  });

  it("tidak lagi mengirim komponen mark berbasis canvas ke publik", () => {
    const home = source("client/src/pages/Home.tsx");
    const chrome = source("client/src/components/NightFrequencyChrome.tsx");
    expect(home).not.toContain("BrandMotionMark");
    expect(chrome).not.toContain("BrandMotionMark");
  });

  it("keeps the supplied portrait as the homepage hero visual", async () => {
    const brand = source("client/src/content/artistPlatform.ts");
    expect(brand).toContain(
      'portrait: "/assets/akbar-nawasunda-official-portrait.webp"'
    );
    // Panggung hero berubah nama kelas di redesign; yang dijaga adalah
    // potretnya benar-benar terkirim di HTML beranda lengkap dengan alt-nya.
    const home = await render("/", { documents: async () => [] as never });
    expect(home.html).toContain("an-hero-plate");
    expect(home.html).toContain("Portrait resmi Akbar Nawasunda");
    expect(home.html).toContain('fetchPriority="high"');
  });
});
