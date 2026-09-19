import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("homepage platform cards and portrait exposure", () => {
  it("renders official platform links as accessible brand-colored cards", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain("home-platform-card platform-");
    expect(home).toContain(
      "aria-label={`Buka Akbar Nawasunda di ${platform.label}`}"
    );
  });

  it("keeps the official portrait bright enough without removing copy contrast", () => {
    const home = source("client/src/pages/Home.tsx");
    const brand = source("client/src/content/artistPlatform.ts");
    expect(home).toContain("src={portraitSrc}");
    expect(home).toContain("setPortraitSrc(officialBrand.portraitFallback)");
    expect(brand).toContain(
      'portraitFallback: "/assets/akbar-nawasunda-official-portrait.jpg"'
    );
  });
});
