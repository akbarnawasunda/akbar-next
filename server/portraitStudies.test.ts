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

  it("routes portrait CTAs to the dedicated gallery in both languages", () => {
    const app = source("client/src/App.tsx");
    const visuals = source("client/src/pages/Visuals.tsx");
    const component = source("client/src/components/VisualPortraitStudies.tsx");
    const gallery = source("client/src/pages/VisualPortraitGallery.tsx");
    const sitemap = source("client/public/sitemap.xml");
    expect(app).toContain('path={"/visuals/portraits"}');
    expect(app).toContain('path={"/en/visuals/portraits"}');
    expect(visuals).toContain("<VisualPortraitStudies studies={portraitContent} />");
    expect(component).toContain('"/en/visuals/portraits"');
    expect(gallery).toContain("PHOTO");
    expect(sitemap).toContain("https://akbarnawasunda.my.id/visuals/portraits");
    expect(sitemap).toContain("https://akbarnawasunda.my.id/en/visuals/portraits");
  });
});
