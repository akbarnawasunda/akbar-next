import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "client/src/components/ResponsiveRepair.css"),
  "utf8",
);

describe("responsive repair layer", () => {
  it("keeps narrow hero copy visible and allows long titles to wrap", () => {
    expect(source).toContain("main > section.nf-page-hero");
    expect(source).toContain("opacity: 1 !important");
    expect(source).toContain("overflow-wrap: anywhere");
    expect(source).toContain("max-width: none !important");
  });

  it("keeps platform links as a complete two-column mobile matrix", () => {
    expect(source).toContain("grid-template-columns: repeat(2, minmax(0, 1fr)) !important");
    expect(source).toContain("overflow: visible !important");
    expect(source).toContain("scroll-snap-type: none !important");
  });

  it("uses full-card snap for media rails instead of half-visible panels", () => {
    expect(source).toContain(".nf-page .nf-embed-grid");
    expect(source).toContain("flex: 0 0 min(calc(100vw - 40px), 370px) !important");
    expect(source).toContain("scroll-snap-align: start");
  });

  it("limits glitch noise to music/release cards and respects reduced motion", () => {
    expect(source).toContain(".nf-page .nf-catalog-card::before");
    expect(source).toContain("@keyframes nf-music-glitch");
    expect(source).toContain("@media (prefers-reduced-motion: reduce)");
    expect(source).toContain("opacity: 0 !important");
  });
});
