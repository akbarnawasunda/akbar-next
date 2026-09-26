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
    expect(palette).toContain("var(--ink)");
    expect(palette).toContain("var(--paper)");
    expect(palette).toContain("var(--acid)");
    expect(palette).not.toContain("#76efff");
  });

  it("keeps the high-contrast signup treatment warm and material rather than cyan", () => {
    const palette = source("client/src/components/MaturePalette.css");
    expect(palette).toContain(".nf-page .nf-signal-block");
    expect(palette).toContain("background: var(--paper) !important");
    expect(palette).toContain("color: var(--ink) !important");
  });
});
