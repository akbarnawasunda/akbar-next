import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { isWhiteLabelMediaPath, publicMediaUrl } from "../client/src/lib/publicMedia";
import { sanitizePublicDocuments, whiteLabelMediaUrl } from "./publicMediaPolicy";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("white-label public media", () => {
  it("maps known Manus media to first-party paths without touching unrelated URLs", () => {
    expect(whiteLabelMediaUrl("https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/qdnFVUsmqPWcPbsv.jpg")).toBe("/media/portrait/neon-portrait.jpg");
    expect(whiteLabelMediaUrl("/manus-storage/akbar-nawasunda-rmx-mark_d59968bf.jpg")).toBe("/media/brand/rmx-mark.jpg");
    expect(publicMediaUrl("https://i1.sndcdn.com/artworks-demo.jpg")).toBe("https://i1.sndcdn.com/artworks-demo.jpg");
    expect(isWhiteLabelMediaPath("/media/portrait/neon-portrait.jpg")).toBe(true);
    expect(sanitizePublicDocuments([{ id: 1, payload: { heroImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/zMxYKACXxuHdtyVJ.jpg" } }])).toEqual([{ id: 1, payload: { heroImage: "/media/portrait/kx07-portrait.jpg" } }]);
  });

  it("keeps the proxy allowlisted and ordered before the generic SSR route", () => {
    const proxy = source("server/brandMediaProxy.ts");
    const vercel = source("vercel.json");
    expect(proxy).toContain("BRAND_MEDIA_PATHS");
    expect(proxy).not.toContain("req.query");
    expect(source("server/routers.ts")).toContain("sanitizePublicDocuments");
    expect(vercel).toContain('"source": "/media/portrait/neon-portrait.jpg"');
    expect(vercel).toContain('"source": "/media/portrait/kx07-portrait.jpg"');
    expect(vercel.indexOf('"source": "/media/portrait/neon-portrait.jpg"')).toBeLessThan(vercel.indexOf('"source": "/(.*)"'));
  });
});
