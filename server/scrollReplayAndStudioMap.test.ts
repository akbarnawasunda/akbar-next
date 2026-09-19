import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("scroll replay and studio site map contracts", () => {
  it("keeps internal route sections observed for both enter and exit transitions", () => {
    const motion = source("client/src/components/MotionOrchestrator.tsx");

    expect(motion).toContain("threshold: [0, 0.08]");
    expect(motion).toContain('main > section:not(.reveal-target)');
    expect(motion).toContain('section.classList.add("reveal-pending")');
    expect(motion).toContain('section.classList.add("is-motion-in-view")');
    expect(motion).toContain("observer?.observe(section)");
    expect(motion).toContain("observer?.disconnect()");
  });

  it("replays homepage sections through the shared reveal hook and tuning layer", () => {
    const hook = source("client/src/hooks/useScrollReveal.ts");
    expect(hook).toContain('element.dataset.revealReplay = "true"');
    expect(hook).toContain(
      'element.classList.toggle("is-revealed", entry.isIntersecting)'
    );
    expect(hook).toContain(
      'element.dataset.revealPhase = entry.isIntersecting ? "acquiring" : "released"'
    );
    expect(hook).toContain("threshold: [0, threshold]");
  });

  it("maps the public pages and their editable sources in Control Room", () => {
    const map = source("client/src/pages/StudioSiteMap.tsx");
    const mirror = source("client/src/components/StudioPageMirror.tsx");
    const studio = source("client/src/pages/ContentStudio.tsx");

    for (const route of [
      "/",
      "/music",
      "/visuals",
      "/live",
      "/universe",
      "/about",
      "/epk",
      "/inquire",
      "/licensing",
      "/privacy",
    ]) {
      expect(map).toContain(`route: "${route}"`);
    }
    for (const label of [
      "Foto & hero utama",
      "Platform resmi",
      "Diskografi",
      "Visual archive",
      "Jadwal pertunjukan",
      "Official assets",
      "Fan Signal",
    ]) {
      expect(map).toContain(label);
    }
    expect(map).toContain("VERIFIED FALLBACK");
    expect(studio).toContain("<StudioPageMirror");
    for (const route of ["/", "/music", "/visuals", "/visuals/portraits", "/live", "/universe", "/about", "/epk", "/inquire", "/licensing", "/privacy", "/game/jedag-run"]) {
      expect(mirror).toContain(`route: "${route}"`);
    }
    expect(mirror).toContain("Navigasi, CTA & footer routes");
    expect(mirror).toContain("Foto editorial / Press card");
    expect(mirror).toContain("Event cards & location links");
    expect(studio).toContain('id="studio-compose"');
    expect(studio).toContain('id="studio-document-library"');
  });

  it("keeps Studio publishing actions separate from asset browsing", () => {
    const studio = source("client/src/pages/ContentStudio.tsx");
    const picker = source("client/src/components/AssetPicker.tsx");
    const preview = source("client/src/components/StudioDocumentPreview.tsx");
    const map = source("client/src/pages/StudioSiteMap.tsx");

    expect(studio).toContain('id="studio-editor-form"');
    expect(studio).toContain('form="studio-editor-form"');
    expect(studio).toContain('type="submit"');
    expect(studio).toContain("Simpan & tampilkan");
    expect(picker).toContain("inlineGallery = false");
    expect(picker).toContain('type="text"');
    expect(picker).toContain('inputMode="url"');
    expect(picker).toContain("Path internal");
    expect(picker).toContain('type="button"');
    expect(preview).toContain("Lihat preview");
    expect(map).toContain("<details");
  });
});
