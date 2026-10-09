import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { publicPortraitStudies } from "../client/src/content/publicContent";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("portrait studies CMS and public gallery", () => {
  it("keeps fallback portrait studies available before CMS import", () => {
    const studies = publicPortraitStudies(null);
    expect(studies).toHaveLength(2);
    expect(studies[0].imageUrl).toContain("/media/portrait/");
    expect(studies[1].title).toBe("Studi KX-07");
    expect(studies[1].titleEn).toBe("KX-07 Study");
  });

  it("exposes an editable portrait workflow with real media previews", () => {
    const customContent = source("server/customContent.ts");
    const studio = source("client/src/pages/ContentStudio.tsx");
    const archive = source("client/src/components/StudioPortraitArchive.tsx");
    expect(customContent).toContain('"portrait"');
    expect(customContent).toContain('"custom-portrait"');
    expect(studio).toContain('value: "portrait"');
    expect(studio).toContain("StudioPortraitArchive");
    expect(studio).toContain('key: "imageUrl", label: "Foto portrait"');
    expect(archive).toContain("Impor & edit foto");
    expect(archive).toContain("Edit portrait");
  });

  it("merges the portrait gallery into /visuals with 301 redirects (Phase 3 §2 baris 5)", () => {
    const app = source("client/src/App.tsx");
    const visuals = source("client/src/pages/Visuals.tsx");
    const nextConfig = source("next.config.ts");
    const sitemap = source("client/public/sitemap.xml");
    const section = source("client/src/components/PortraitStudiesSection.tsx");
    // Rute lama tidak lagi ada; seksi studi potret kini in-page (#portraits).
    expect(app).not.toContain('path={"/visuals/portraits"} component=');
    expect(visuals).toContain("<PortraitStudiesSection");
    expect(visuals).toContain('href="#portraits"');
    expect(section).toContain('id="portraits"');
    expect(section).not.toContain("/visuals/portraits");
    // ALT fallback wajib: studi tanpa altId/altEn jatuh ke judul, dan judul
    // kosong jatuh ke label fallback — tidak ada <img alt=""> di seksi.
    expect(section).toContain("study.altEn || study.altId || titleOf(study)");
    expect(section).toContain("t.fallbackTitle");
    // 301 permanen di kedua bahasa; sitemap tidak lagi mempublikasikan rute lama.
    expect(nextConfig).toContain('source: "/visuals/portraits", destination: "/visuals#portraits", permanent: true');
    expect(nextConfig).toContain('source: "/en/visuals/portraits", destination: "/en/visuals#portraits", permanent: true');
    expect(sitemap).not.toContain("/visuals/portraits");
  });
});
