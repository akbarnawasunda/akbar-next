import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Night Frequency signature", () => {
  it("keeps the tuning rail accessible and gives the hero an origin index", () => {
    const component = source("client/src/components/NightFrequencySignature.tsx");
    expect(component).toContain('aria-label="Navigasi frekuensi halaman"');
    expect(component).toContain('aria-current={index === activeChapter ? "step" : undefined}');
    expect(component).toContain('String(index).padStart(2, "0")');
    expect(component).toContain('scrollIntoView({ behavior: "smooth", block: "start" })');
  });

  it("keeps the signature lightweight and reduced-motion safe", () => {
    const css = source("client/src/components/NightFrequencySignature.css");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("backdrop-filter: blur(14px)");
    expect(css).not.toContain("filter: blur(80px)");
  });
});
