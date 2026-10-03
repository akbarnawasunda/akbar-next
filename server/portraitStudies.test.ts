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
    const vercel = source("vercel.json");
    const sitemap = source("client/public/sitemap.xml");
    const component = source("client/src/components/VisualPortraitStudies.tsx");
    // Rute lama tidak lagi ada; CTA visual kini menunjuk seksi in-page.
    expect(app).not.toContain('path={"/visuals/portraits"} component=');
    expect(visuals).toContain('portraitsHref: "/visuals#portraits"');
    expect(visuals).toContain('portraitsHref: "/en/visuals#portraits"');
    expect(visuals).toContain("<VisualPortraitStudies");
    expect(visuals).toContain("studies={portraitContent}");
    expect(component).not.toContain("/visuals/portraits");
    // 301 permanen di kedua bahasa; sitemap tidak lagi mempublikasikan rute lama.
    const redirects: { source: string; destination: string; permanent: boolean }[] =
      JSON.parse(vercel).redirects;
    const idRedirect = redirects.find(
      r => r.source === "/visuals/portraits"
    );
    const enRedirect = redirects.find(
      r => r.source === "/en/visuals/portraits"
    );
    expect(idRedirect?.destination).toBe("/visuals#portraits");
    expect(idRedirect?.permanent).toBe(true);
    expect(enRedirect?.destination).toBe("/en/visuals#portraits");
    expect(enRedirect?.permanent).toBe(true);
    expect(sitemap).not.toContain("/visuals/portraits");
  });
});
