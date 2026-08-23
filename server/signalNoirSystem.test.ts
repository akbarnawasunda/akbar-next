import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SignalNoirSystem.css"), "utf8");

describe("Signal Noir visual system", () => {
  it("defines the shared visual grammar", () => {
    expect(source).toContain("--noir-00: #020608");
    expect(source).toContain("--noir-bone: #f3ead8");
    expect(source).toContain("signal handoff");
    expect(source).toContain(".an-site .an-hero");
    expect(source).toContain(".nf-page .nf-page-hero");
    expect(source).toContain(".nf-page .nf-catalog-card");
  });

  it("keeps each key route recognisable and mobile-safe", () => {
    expect(source).toContain('data-route="/music"');
    expect(source).toContain('data-route="/visuals"');
    expect(source).toContain('data-route="/live"');
    expect(source).toContain('data-route="/universe"');
    expect(source).toContain("@media (max-width: 820px)");
    expect(source).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
