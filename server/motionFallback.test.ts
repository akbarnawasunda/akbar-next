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

  it("keeps scramble copy stable on first paint unless a signature moment opts into autoStart", () => {
    const scramble = source("client/src/components/ScrambleText.tsx");
    expect(scramble).toContain("autoStart = false");
    expect(scramble).toContain("if (!autoStart) return");
  });

  it("uses a canvas name-field with viewport-aware particle caps, visibility pausing, and reduced-motion fallback", () => {
    const particle = source("client/src/components/NameParticleField.tsx");
    expect(particle).toContain("IntersectionObserver");
    expect(particle).toContain("mobile ? 760 : 2100");
    expect(particle).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
    expect(particle).toContain("paintFinal");
  });

  it("provides a continuously moving but reduced-motion-safe platform ticker", () => {
    const ticker = source("client/src/components/PlatformTicker.css");
    expect(ticker).toContain("an-platform-ticker 34s linear infinite");
    expect(ticker).toMatch(/prefers-reduced-motion\s*:\s*reduce/);
  });
});
