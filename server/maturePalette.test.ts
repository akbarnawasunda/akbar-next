import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("mature artist palette", () => {
  it("loads the mature palette after earlier public visual layers", () => {
    const app = source("client/src/App.tsx");
    expect(app).toContain('import "./components/MaturePalette.css"');
  });

  it("uses graphite, copper, and parchment instead of plasma cyan as the public signal system", () => {
    const palette = source("client/src/components/MaturePalette.css");
    expect(palette).toContain("--an-plasma:#c7794c");
    expect(palette).toContain("--an-graphite:#0c0b0d");
    expect(palette).toContain("--an-parchment:#d8cfbe");
    expect(palette).not.toContain("#76efff");
  });

  it("keeps the high-contrast signup treatment warm and material rather than cyan", () => {
    const palette = source("client/src/components/MaturePalette.css");
    expect(palette).toContain(".an-site .signal-section,.nf-page .nf-signal-block{background:var(--an-parchment)");
  });
});
