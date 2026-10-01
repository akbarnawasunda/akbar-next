import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const clientSources = () => {
  const roots = ["client/src/pages", "client/src/components"];
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(resolve(process.cwd(), dir), {
      withFileTypes: true,
    })) {
      const next = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(next);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(next);
    }
  };
  roots.forEach(walk);
  return files.map(file => source(file)).join("\n");
};

describe("editorial simplification", () => {
  it("keeps the homepage focused on music instead of decorative experiments", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(clientSources()).not.toContain("NameParticleField");
    expect(clientSources()).not.toContain("PlatformTicker");
    expect(clientSources()).not.toContain("ArtistSignalMotion");
    expect(home).not.toContain("future-section");
    expect(home).toContain("make the night move");
    expect(home).toContain('heroTitle || "AKBAR NAWASUNDA."');
    expect(home).toContain("no date announced|tba");
  });

  it("removes the previous generic campaign slogans from public page copy", () => {
    const pages = [
      "Home.tsx",
      "About.tsx",
      "Live.tsx",
      "Inquiry.tsx",
      "Licensing.tsx",
      "Music.tsx",
      "Visuals.tsx",
      "Universe.tsx",
      "PressKit.tsx",
    ]
      .map(name => source(`client/src/pages/${name}`))
      .join("\n");
    [
      "MAKE THE NIGHT MOVE",
      "EVERY FREQUENCY",
      "BUILD THE NEXT ROOM",
      "START A SIGNAL",
      "USE THE SOUND RIGHT",
      "TURN THE VOLUME INTO LIGHT",
      "Archive ini bukan dunia fiktif",
      "TRACK YANG BISA",
    ].forEach(copy => expect(pages).not.toContain(copy));
  });
});
