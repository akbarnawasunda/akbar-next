import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("editorial simplification", () => {
  it("renders section headings directly instead of running repeated scramble intervals", () => {
    const scramble = source("client/src/components/ScrambleText.tsx");
    expect(scramble).not.toContain("setInterval");
    expect(scramble).not.toContain("onClick");
  });

  it("keeps the homepage focused on music instead of decorative particle, ticker, and future-module sections", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).not.toContain("NameParticleField");
    expect(home).not.toContain("PlatformTicker");
    expect(home).not.toContain("ArtistSignalMotion");
    expect(home).not.toContain("future-section");
    expect(home).toContain("make the night move");
    expect(home).toContain('heroTitle || "AKBAR NAWASUNDA."');
    expect(home).toContain("no date announced|tba");
  });

  it("removes the previous generic campaign slogans from public page copy", () => {
    const pages = ["Home.tsx", "About.tsx", "Live.tsx", "Inquiry.tsx", "Licensing.tsx", "Music.tsx", "Visuals.tsx", "Universe.tsx", "PressKit.tsx"].map(name => source(`client/src/pages/${name}`)).join("\n");
    ["MAKE THE NIGHT MOVE", "EVERY FREQUENCY", "BUILD THE NEXT ROOM", "START A SIGNAL", "USE THE SOUND RIGHT", "TURN THE VOLUME INTO LIGHT", "Archive ini bukan dunia fiktif", "TRACK YANG BISA"].forEach(copy => expect(pages).not.toContain(copy));
  });
});
