import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("RMX brand motion mark", () => {
  it("uses the user-provided RMX asset in the public identity data", () => {
    const content = source("client/src/content/artistPlatform.ts");
    expect(content).toContain("rmxMark");
    expect(content).toContain("akbar-nawasunda-rmx-mark_d59968bf.jpg");
  });

  it("plays only from a user action and clears its one-shot animation class afterwards", () => {
    const component = source("client/src/components/BrandMotionMark.tsx");
    expect(component).toContain("onClick={() => setIsAnimating(true)}");
    expect(component).toContain("onAnimationEnd={() => setIsAnimating(false)}");
    expect(component).toContain("Putar motion logo Akbar Nawasunda");
  });

  it("keeps the mark static when reduced motion is requested", () => {
    const css = source("client/src/components/BrandMotionMark.css");
    expect(css).toMatch(/prefers-reduced-motion\s*:\s*reduce/);
    expect(css).toContain("animation:none!important");
  });
});
