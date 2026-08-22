import { describe, expect, it } from "vitest";
import { allPlatformLinks, currentRelease, officialBrand, platformLinks, releases, videos } from "./artistPlatform";

describe("artist platform content", () => {
  it("keeps the core discovery modules populated with valid external destinations", () => {
    expect(currentRelease.href).toMatch(/^https:\/\//);
    expect(releases.length).toBeGreaterThanOrEqual(4);
    expect(videos.length).toBeGreaterThanOrEqual(3);
    expect(platformLinks.every(link => link.href.startsWith("https://"))).toBe(true);
  });

  it("avoids duplicate public platform labels", () => {
    const labels = platformLinks.map(link => link.label.toLowerCase());
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("provides verified all-platform destinations and an owned artwork fallback", () => {
    expect(allPlatformLinks.length).toBeGreaterThanOrEqual(5);
    expect(new Set(allPlatformLinks.map(link => link.label)).size).toBe(allPlatformLinks.length);
    expect(allPlatformLinks.every(link => link.href.startsWith("https://"))).toBe(true);
    expect(officialBrand.socialPreview).toContain("akbarfolio-424qdvsv.manus.space");
  });
});
