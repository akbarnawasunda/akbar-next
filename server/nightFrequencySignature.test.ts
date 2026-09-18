import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("Night Frequency signature", () => {
  it("keeps the editorial index accessible and gives the hero an origin index", () => {
    const component = source("client/src/components/NightFrequencySignature.tsx");
    expect(component).toContain('aria-label="Indeks bagian halaman"');
    expect(component).toContain(
      'aria-current={index === activeChapter ? "step" : undefined}'
    );
    expect(component).toContain('String(index).padStart(2, "0")');
    expect(component).toContain(
      'scrollIntoView({ behavior: "smooth", block: "start" })'
    );
  });

  it("keeps the signature lightweight and reduced-motion safe", () => {
    const css = source("client/src/components/NightFrequencySignature.css");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    // Signature rail boleh punya backdrop-filter, tapi tidak boleh
    // filter: blur() besar — itu mahal di GPU dan bikin janky.
    expect(css).toContain("backdrop-filter");
    expect(css).not.toMatch(/filter:\s*blur\((?:[2-9]\d|\d{3,})px\)/);
  });
});