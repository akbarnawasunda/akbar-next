import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("artist content contract", () => {
  it("defines owner-managed profile, press, release-story, and event fields in the custom editor contract", () => {
    const editor = source("client/src/pages/ContentStudio.tsx");
    const codec = source("server/customContent.ts");
    const publicContent = source("client/src/content/publicContent.ts");

    expect(editor).toContain('value: "profile"');
    expect(editor).toContain('value: "pressKit"');
    expect(editor).toContain('value: "event"');
    expect(editor).toContain('key: "story"');
    expect(editor).toContain('key: "locationUrl"');
    expect(editor).toContain('key: "mapsUrl"');
    expect(codec).toContain('"profile"');
    expect(codec).toContain('"pressKit"');
    expect(publicContent).toContain("profile?:");
    expect(publicContent).toContain("pressKit?:");
    expect(publicContent).toContain("events: CmsEvent[]");
    expect(publicContent).toContain("locationUrl?: string");
    expect(publicContent).toContain("mapsUrl?: string");
  });

  it("keeps public modules honest when official material is not published", () => {
    const pressKit = source("client/src/pages/PressKit.tsx");
    const live = source("client/src/pages/Live.tsx");

    expect(pressKit).toContain("Request material");
    expect(pressKit).toContain("Aset yang tersedia secara resmi");
    // /live adalah permukaan tanggal (Phase 3 §2 baris 6): statusnya jujur
    // ("terbuka untuk booking") tanpa menjanjikan jadwal yang belum ada.
    expect(live).toContain("Terbuka untuk booking");
    expect(live).toContain("JADWAL / VENUE / TIKET");
    expect(live).toContain("an-event-location-link");
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
    expect(musicPage).toContain("const catalog = [");
    expect(musicPage).toContain("...cmsCatalog");
    expect(musicPage).toContain("...releases.filter(");
    expect(musicPage).toContain("!cmsCatalog.some(");
  });

  it("keeps the JEDAG RUN game and editable audio connected across public and Studio surfaces", () => {
    const editor = source("client/src/pages/ContentStudio.tsx");
    const codec = source("server/customContent.ts");
    const publicContent = source("client/src/content/publicContent.ts");
    const routes = source("app/_components/RouteView.tsx");
    const idGameRoute = source("app/(id)/game/jedag-run/page.tsx");
    const enGameRoute = source("app/(en)/en/game/jedag-run/page.tsx");
    const gamePage = source("client/src/pages/GameJedagRun.tsx");
    const canvas = source("client/src/components/JedagRunCanvas.tsx");
    const preview = source("client/src/components/StudioDocumentPreview.tsx");
    const checklist = source("client/src/components/StudioWorkspaceChrome.tsx");

    expect(editor).toContain('value: "game"');
    expect(editor).toContain('key: "bgmUrl"');
    expect(editor).toContain('key: "gameOverSfxUrl"');
    expect(codec).toContain('"game"');
    expect(publicContent).toContain("game?: CmsGameConfig");
    expect(publicContent).toContain("bgmUrl: publicMediaUrl");
    expect(routes).toContain('game: page(() => import("@/pages/GameJedagRun"))');
    expect(routes).toContain('enGame: page(() => import("@/pages/GameJedagRun").then(m => m.EnglishGameJedagRun))');
    expect(idGameRoute).toContain("pathname='/game/jedag-run'");
    expect(enGameRoute).toContain("pathname='/en/game/jedag-run'");
    expect(gamePage).toContain("JEDAG RUN — NIGHT FREQUENCY");
    expect(canvas).toContain("new JedagRunAudio(config)");
    expect(preview).toContain('game: { route: "/game/jedag-run"');
    expect(checklist).toContain('documentType === "game"');
  });

  it("keeps Studio media and link previews connected to the editor workflow", () => {
    const editor = source("client/src/pages/ContentStudio.tsx");
    const picker = source("client/src/components/AssetPicker.tsx");
    const preview = source("client/src/components/StudioDocumentPreview.tsx");
    const archive = source("client/src/components/StudioVisualArchive.tsx");
    const previewAssets = source("client/src/components/StudioAssetPreview.tsx");
    const home = source("client/src/pages/Home.tsx");
    const pressKit = source("client/src/pages/PressKit.tsx");

    expect(editor).toContain("StudioDocumentPreview");
    expect(editor).toContain("StudioVisualArchive");
    expect(editor).toContain("fallbackPayload");
    expect(editor).toContain('key: "editorialImage"');
    expect(editor).toContain("Foto editorial / Press card");
    expect(editor).toContain("StudioLinkListPreview");
    expect(picker).toContain("Upload baru");
    expect(picker).toContain("StudioAssetPreview");
    expect(picker).toContain("Foto website & Asset Library");
    expect(picker).toContain("Gunakan ${asset.fileName}");
    expect(preview).toContain("Yang akan terlihat di publik");
    expect(preview).toContain("mediaLabels");
    expect(preview).toContain("Foto hero");
    expect(archive).toContain("Fallback publik");
    expect(archive).toContain("Impor & edit");
    expect(previewAssets).toContain("StudioLinkPreview");
    expect(home).toContain("configuredPortrait");
    expect(pressKit).toContain("const portrait =");
    expect(pressKit).toContain("press?.editorialImage");
    expect(pressKit).toContain("profile?.portraitImage");
    expect(pressKit).toContain("const bio =");
    expect(pressKit).toContain("press?.snapshotBio");
    expect(pressKit).toContain("profile?.longBio");
    expect(source("client/src/content/publicContent.ts")).toContain("editorialImage:");
  });

  it("uses platform SVGs and available per-release artwork in music discovery modules", () => {
    const icon = source("client/src/components/PlatformIcon.tsx");
    const home = source("client/src/pages/Home.tsx");
    const music = source("client/src/pages/Music.tsx");
    const content = source("client/src/content/artistPlatform.ts");

    expect(icon).toContain("siSpotify.path");
    expect(icon).toContain("siSoundcloud.path");
    expect(icon).not.toContain("?raw");
    expect(icon).not.toContain("dangerouslySetInnerHTML");
    expect(home).toContain("<PlatformIcon label={platform.label}");
    expect(music).toContain("<PlatformIcon label={platform.label}");
    expect(content).toContain('image: "https://i.scdn.co/image/');
    expect(content).toContain('image: "https://i1.sndcdn.com/artworks-');
    expect(home).toMatch(
      /managedRelease\.imageUrl\s*!==\s*officialBrand\.socialPreview/
    );
    expect(home).toContain("currentRelease.image");
  });
});
