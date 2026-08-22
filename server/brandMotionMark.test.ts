import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("RMX brand motion mark", () => {
  it("uses the user-provided RMX asset in the public identity data", () => {
    const content = source("client/src/content/artistPlatform.ts");
    expect(content).toContain("rmxMark");
    expect(content).toContain('rmxMark: "/api/brand/rmx-mark"');
    const proxy = source("server/brandAssetProxy.ts");
    expect(proxy).toContain('app.get("/api/brand/rmx-mark"');
    expect(proxy).toContain("akbar-nawasunda-rmx-mark_d59968bf.jpg");
    const vercel = source("vercel.json");
    expect(vercel).toContain('"source": "/api/brand/rmx-mark"');
    expect(vercel).toContain("akbar-nawasunda-rmx-mark_d59968bf.jpg");
    expect(vercel.indexOf('"source": "/api/brand/rmx-mark"')).toBeLessThan(
      vercel.indexOf('"source": "/(.*)"'),
    );
  });

  it("plays a canvas particle dissolve only from a user action and clears after one sequence", () => {
    const component = source("client/src/components/BrandMotionMark.tsx");
    expect(component).toContain("onClick={() => setIsAnimating(true)}");
    expect(component).toContain("requestAnimationFrame(draw)");
    expect(component).toContain("particleCap = mobile ? 300 : 520");
    expect(component).toContain('canvas.dataset.particleMode = mobile ? "mobile" : "desktop"');
    expect(component).toContain("Putar particle logo Akbar Nawasunda");
  });

  it("keeps the mark static when reduced motion is requested", () => {
    const component = source("client/src/components/BrandMotionMark.tsx");
    const css = source("client/src/components/BrandMotionMark.css");
    expect(component).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
    expect(css).toMatch(/prefers-reduced-motion\s*:\s*reduce/);
    expect(css).toContain(".an-rmx-mark.is-animating canvas{opacity:0}");
  });
});
