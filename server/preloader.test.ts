import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Cinematic Artist Stage Preloader", () => {
  const indexHtml = fs.readFileSync(path.resolve(process.cwd(), "client/index.html"), "utf8");
  const entryClient = fs.readFileSync(path.resolve(process.cwd(), "client/src/entry-client.tsx"), "utf8");

  it("embeds inline preloader styles and markup to eliminate initial load flashes", () => {
    expect(indexHtml).toContain('id="akbar-preloader"');
    expect(indexHtml).toContain('id="akbar-preloader-styles"');
    expect(indexHtml).toContain("an-monogram-box");
    expect(indexHtml).toContain("AKBAR NAWASUNDA");
    expect(indexHtml).toContain("an-eq-visualizer");
    expect(indexHtml).toContain('id="an-loader-bar"');
  });

  it("includes dismiss function and safety timeout in inline script", () => {
    expect(indexHtml).toContain("window.__dismissAkbarPreloader");
    expect(indexHtml).toContain("an-fade-out");
    expect(indexHtml).toContain("setTimeout");
  });

  it("wires graceful dismissal in entry-client upon hydration completion", () => {
    expect(entryClient).toContain("__dismissAkbarPreloader");
    expect(entryClient).toContain("requestAnimationFrame");
  });
});
