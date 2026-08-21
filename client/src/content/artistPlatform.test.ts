import { describe, expect, it } from "vitest";
import { currentRelease, platformLinks, releases, videos } from "./artistPlatform";

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
});
