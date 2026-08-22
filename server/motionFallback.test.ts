import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("motion accessibility fallback", () => {
  it("renders final scramble copy immediately when reduced motion is requested", () => {
    const scramble = source("client/src/components/ScrambleText.tsx");
    expect(scramble).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
    expect(scramble).toContain("setValue(text)");
  });

  it("gates scramble and vinyl/particle CSS animation with a reduced-motion media query", () => {
    const scrambleCss = source("client/src/components/ScrambleText.css");
    const signalCss = source("client/src/components/ArtistSignalMotion.css");

    expect(scrambleCss).toMatch(/prefers-reduced-motion\s*:\s*reduce/);
    expect(signalCss).toMatch(/prefers-reduced-motion\s*:\s*reduce/);
  });

  it("keeps interactive scramble duration within the intended two-to-three second window", () => {
    const scramble = source("client/src/components/ScrambleText.tsx");
    expect(scramble).toContain("duration = 2400");
    expect(scramble).toContain("an-scramble-interactive");
  });
});
