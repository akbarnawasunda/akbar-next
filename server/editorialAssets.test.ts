import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const assetPath = (name: string) => resolve(process.cwd(), "client/public/assets", name);

describe("editorial artwork assets", () => {
  it("keeps the red editorial portrait available as a lightweight WebP", () => {
    const path = assetPath("akbar-future-red.webp");
    expect(existsSync(path)).toBe(true);
    expect(statSync(path).size).toBeLessThan(300_000);
  });

  it("keeps the yellow archive portrait available as a lightweight WebP", () => {
    const path = assetPath("akbar-future-yellow.webp");
    expect(existsSync(path)).toBe(true);
    expect(statSync(path).size).toBeLessThan(350_000);
  });
});
