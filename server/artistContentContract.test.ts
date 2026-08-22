import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("artist content contract", () => {
  it("defines owner-managed profile, press, release-story, and event fields in the CMS contract", () => {
    const studioSchema = source("cms/sanity-studio/sanity.config.ts");
    const publicContent = source("client/src/sanity/publicContent.ts");

    expect(studioSchema).toContain('name: "artistProfile"');
    expect(studioSchema).toContain('name: "pressKit"');
    expect(studioSchema).toContain('name: "event"');
    expect(studioSchema).toContain('name: "story"');
    expect(publicContent).toContain('profile?:');
    expect(publicContent).toContain('pressKit?:');
    expect(publicContent).toContain('events: CmsEvent[]');
  });

  it("keeps public modules honest when official material is not published", () => {
    const pressKit = source("client/src/pages/PressKit.tsx");
    const live = source("client/src/pages/Live.tsx");

    expect(pressKit).toContain("REQUEST PACK");
    expect(live).toContain("NO DATE CONFIRMED YET.");
  });

  it("preserves verified legacy artist identity and catalog in the public fallback", () => {
    const platformContent = source("client/src/content/artistPlatform.ts");

    expect(platformContent).toContain('aliases: ["DJ Akbar Remix"]');
    expect(platformContent).toContain('"Jedag Jedug"');
    expect(platformContent).toContain('"Jungle Dutch"');
    expect(platformContent).toContain('"Ngertenono Ati Medium Hall"');
    expect(platformContent).toContain('"Die With A Smile × Warga +62"');
  });

  it("merges published CMS releases with legacy catalog fallback instead of replacing it", () => {
    const musicPage = source("client/src/pages/Music.tsx");

    expect(musicPage).toContain("const cmsCatalog = cmsReleases.map");
    expect(musicPage).toContain("releases.filter(legacy => !cmsCatalog.some");
  });

  it("uses platform SVGs and available per-release artwork in music discovery modules", () => {
    const icon = source("client/src/components/PlatformIcon.tsx");
    const home = source("client/src/pages/Home.tsx");
    const music = source("client/src/pages/Music.tsx");
    const content = source("client/src/content/artistPlatform.ts");

    expect(icon).toContain('simple-icons/icons/spotify.svg?raw');
    expect(icon).toContain('simple-icons/icons/soundcloud.svg?raw');
    expect(home).toContain("<PlatformIcon label={platform.label}");
    expect(music).toContain("<PlatformIcon label={platform.label}");
    expect(content).toContain('image: "https://i.scdn.co/image/');
  });
});
