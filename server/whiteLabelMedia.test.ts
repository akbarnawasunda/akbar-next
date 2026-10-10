import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isWhiteLabelMediaPath,
  publicMediaUrl,
} from "../client/src/lib/publicMedia";
import {
  localMediaFallback,
  sanitizePublicDocuments,
  whiteLabelMediaUrl,
} from "./publicMediaPolicy";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("white-label public media", () => {
  it("maps known Manus media to first-party paths without touching unrelated URLs", () => {
    expect(
      whiteLabelMediaUrl(
        "https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/qdnFVUsmqPWcPbsv.jpg"
      )
    ).toBe("/media/portrait/neon-portrait.jpg");
    expect(
      whiteLabelMediaUrl("/manus-storage/akbar-nawasunda-rmx-mark_d59968bf.jpg")
    ).toBe("/media/brand/rmx-mark.jpg");
    expect(publicMediaUrl("https://i1.sndcdn.com/artworks-demo.jpg")).toBe(
      "https://i1.sndcdn.com/artworks-demo.jpg"
    );
    expect(isWhiteLabelMediaPath("/media/portrait/neon-portrait.jpg")).toBe(
      true
    );
    expect(
      sanitizePublicDocuments([
        {
          id: 1,
          payload: {
            heroImage:
              "https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/zMxYKACXxuHdtyVJ.jpg",
          },
        },
      ])
    ).toEqual([
      { id: 1, payload: { heroImage: "/media/portrait/kx07-portrait.jpg" } },
    ]);
  });

  it("uses existing local brand artwork when an upstream media host is unavailable", () => {
    expect(localMediaFallback("/media/portrait/neon-portrait.jpg")).toBe(
      "/assets/akbar-nawasunda-official-portrait.webp"
    );
    expect(localMediaFallback("/media/brand/rmx-mark.jpg")).toBe(
      "/assets/akbar-rmx-mark.webp"
    );
    expect(localMediaFallback("/media/unknown.jpg")).toBeUndefined();
  });

  it("serves allowlisted media through a first-party route with a local outage fallback", () => {
    const nextConfig = source("next.config.ts");
    const mediaRoute = source("app/media/[...path]/route.ts");
    expect(source("server/routers.ts")).toContain("sanitizePublicDocuments");
    expect(mediaRoute).toContain("publicMediaSource(pathname)");
    expect(mediaRoute).toContain("localMediaFallback(pathname)");
    expect(mediaRoute).toContain("AbortSignal.timeout");
    expect(nextConfig).not.toContain(
      'source: "/media/portrait/neon-portrait.jpg"'
    );
    expect(nextConfig).not.toContain(
      'source: "/media/portrait/kx07-portrait.jpg"'
    );
  });
});
