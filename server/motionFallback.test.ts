import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("motion simplification", () => {
  it("renders headings as their final copy without a scramble timer", () => {
    const scramble = source("client/src/components/ScrambleText.tsx");
    expect(scramble).toContain("return <Tag");
    expect(scramble).not.toContain("setInterval");
    expect(scramble).not.toContain("onClick");
  });

  it("does not animate the static heading layer", () => {
    const scrambleCss = source("client/src/components/ScrambleText.css");
    expect(scrambleCss).toContain("animation:none!important");
  });

  it("keeps the particle and ticker experiments out of the public homepage", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).not.toContain("NameParticleField");
    expect(home).not.toContain("PlatformTicker");
  });
});
