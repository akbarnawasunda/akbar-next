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

describe("motion simplification", () => {
  it("keeps the particle, ticker, and scramble experiments out of the shipped UI", () => {
    const code = clientSources();
    [
      "NameParticleField",
      "PlatformTicker",
      "ScrambleText",
      "ArtistSignalMotion",
      "HomeAmbientCanvas",
      "HomeWordmarkParticles",
    ].forEach(experiment => expect(code).not.toContain(experiment));
  });

  it("renders the hero heading as final copy, without a scramble timer", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain('data-no-scramble="true"');
    expect(home).toContain("hero-title-editorial");
  });
});
