import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const publicLegacyIndex = read("public/legacy/index.html");
const clientLegacyIndex = read("client/public/legacy/index.html");
const appScript = read("public/assets/js/app.js");
const clientAppScript = read("client/public/assets/js/app.js");
const audioScript = read("public/assets/js/audio.js");
const previewScript = read("public/assets/js/previews.js");
const clientPreviewScript = read("client/public/assets/js/previews.js");

describe("legacy static fallback under /legacy", () => {
  it("points every local CSS, script, and image reference at a deployed file", () => {
    for (const htmlPath of ["public/legacy/index.html", "public/legacy/epk.html", "public/legacy/privacy.html"]) {
      const html = read(htmlPath);
      for (const [, reference] of html.matchAll(/(?:src|href)="((?:\/assets|\/legacy)\/[^\"]+)"/g)) {
        const pathname = reference.split(/[?#]/, 1)[0];
        expect(existsSync(resolve(process.cwd(), "public", pathname.slice(1))), `${htmlPath}: ${reference}`).toBe(true);
      }
    }

    expect(publicLegacyIndex).toContain('href="/legacy/style.css"');
    expect(publicLegacyIndex).toContain('href="/legacy/epk.html"');
    expect(publicLegacyIndex).toContain('href="/legacy/privacy.html"');
    expect(publicLegacyIndex).toContain('src="/assets/js/app.js?v=16"');
    const epk = read("public/legacy/epk.html");
    expect(epk).toContain("fetch('/data/content.json'");
    expect(epk).not.toContain("fetch('data/content.json'");
    expect(epk).toContain('href="/en/inquire">inquiry form</a>');
    expect(epk).not.toContain("/#collab");
    expect(epk).toBe(read("client/public/legacy/epk.html"));
    expect(publicLegacyIndex).toBe(clientLegacyIndex);
  });

  it("roots audio sample URLs so they resolve from /legacy/index.html", () => {
    expect(audioScript).not.toMatch(/[\'\"]assets\/media\//);
    expect(audioScript).toContain("'/assets/media/KICK.mp3'");
    expect(audioScript).toContain("'/assets/media/BACKSOUNDING.mp3'");
    expect(audioScript).toBe(read("client/public/assets/js/audio.js"));
  });

  it("keeps legacy content data requests rooted at the site origin", () => {
    for (const scriptPath of [
      "public/assets/js/app.js",
      "public/assets/js/content-render.js",
      "public/assets/js/footer.js",
      "public/assets/js/seo-jsonld.js",
    ]) {
      expect(read(scriptPath)).not.toMatch(/fetch\(['"]data\//);
    }
    expect(appScript).toContain("fetch('/data/releases.json'");
    expect(read("public/assets/js/content-render.js")).toContain("fetch('/data/content.json'");
    expect(read("public/assets/js/footer.js")).toContain("fetch('/data/content.json'");
    expect(read("public/assets/js/seo-jsonld.js")).toContain("fetch('/data/releases.json'");
    expect(existsSync(resolve(process.cwd(), "public/data/content.json"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "public/data/releases.json"))).toBe(true);
  });

  it("uses JSONP for iTunes because browser fetch is cross-origin restricted", () => {
    const appSearch = appScript.slice(
      appScript.indexOf("function itunesSearch("),
      appScript.indexOf("var mapPromise", appScript.indexOf("function itunesSearch(")),
    );
    expect(appSearch).toContain("document.createElement('script')");
    expect(appSearch).toContain("&callback=");
    expect(appSearch).toContain("window.setTimeout");
    expect(appSearch).not.toContain("fetch(");
    expect(appScript).toBe(clientAppScript);

    expect(previewScript).toContain("mapCallbacks");
    expect(previewScript).toContain("&callback=");
    expect(previewScript).not.toContain("fetch('https://itunes.apple.com");
    expect(previewScript).toBe(clientPreviewScript);
  });
});
