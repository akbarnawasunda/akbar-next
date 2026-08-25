import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("international artist layer", () => {
  it("registers separate English public URLs without replacing Indonesian routes", () => {
    const app = source("client/src/App.tsx");
    const english = source("client/src/pages/EnglishPages.tsx");
    expect(app).toContain('path={"/"} component={Home}');
    expect(app).toContain('path={"/en"} component={EnglishHome}');
    expect(app).toContain('path={"/en/music/:slug"} component={EnglishReleaseDetail}');
    expect(app).toContain('path={"/en/epk"} component={EnglishEpk}');
    expect(app).toContain('path={"/en/privacy"} component={EnglishPrivacy}');
    expect(english).toContain("Producer, remixer, and electronic bass artist from Bandung Barat, Indonesia.");
    expect(english).toContain("No confirmed show is public yet.");
    expect(english).toContain("Available on request.");
    expect(english).not.toContain("FanSignalInline");
  });

  it("keeps a visible language switcher in both public chrome implementations", () => {
    const idChrome = source("client/src/components/NightFrequencyChrome.tsx");
    const enChrome = source("client/src/components/EnglishChrome.tsx");
    expect(idChrome).toContain('aria-label="Language selection"');
    expect(idChrome).toContain('href={englishPath}');
    expect(enChrome).toContain('href={indonesianPath(pathname)}');
    expect(enChrome).toContain('href="/en/inquire"');
    expect(enChrome).toContain('aria-controls="english-mobile-menu"');
  });

  it("emits route-aware canonical, language alternates, and only factual schema types", () => {
    const app = source("client/src/App.tsx");
    const schema = source("client/src/components/StructuredData.tsx");
    const index = source("client/index.html");
    const ssr = source("server/_core/ssrHtml.ts");
    const robots = source("client/public/robots.txt");
    const sitemap = source("client/public/sitemap.xml");
    expect(app).toContain('document.documentElement.lang = isEnglish ? "en" : "id"');
    expect(app).toContain('meta.setAttribute("content", value)');
    expect(app).toContain('setMeta(\'meta[property="og:image"]\'');
    expect(app).toContain('setMeta(\'meta[name="twitter:title"]\', resolvedTitle)');
    expect(app).toContain('setMeta(\'meta[name="twitter:description"]\', resolvedDescription)');
    expect(app).toContain('setMeta(\'meta[name="twitter:image"]\', resolvedImage)');
    expect(app).toContain('link.dataset.languageLink = "true"');
    expect(ssr).toContain('<html lang="${language}">');
    expect(ssr).toContain('hreflang="${language}"');
    expect(ssr).toContain('name="twitter:card"');
    expect(ssr).toContain('name="twitter:image"');
    expect(index).toContain('rel="apple-touch-icon"');
    expect(robots).toContain("Sitemap: https://akbarnawasunda.my.id/sitemap.xml");
    expect(robots).toContain("Disallow: /studio");
    expect(sitemap).toContain("https://akbarnawasunda.my.id/en/music");
    expect(sitemap).toContain('hreflang="en"');
    expect(schema).toContain('"@type": "WebSite"');
    expect(schema).toContain('name: "Akbar Nawasunda"');
    expect(schema).toContain('alternateName: "Akbar Nawasunda | Official Website"');
    expect(schema).toContain('"@type": "MusicGroup"');
    expect(schema).toContain('"@type": "MusicRecording"');
    expect(schema).toContain('"@type": "MusicEvent"');
    expect(schema).toContain('pathWithoutLanguage === "/live"');
    expect(schema).toContain('publicUpcomingEvents(cms.data)');
  });

  it("shares one public custom-content query between page data and metadata", () => {
    const publicContent = source("client/src/content/publicContent.ts");
    const app = source("client/src/App.tsx");
    expect(publicContent).toContain("trpc.content.documents.useQuery()");
    expect(publicContent).toContain("customDocumentsToPublicContent");
    expect(app).toContain("trpc.content.documents.useQuery()");
    expect(publicContent).not.toContain("@sanity/client");
    expect(publicContent).not.toContain("_type ==");
  });
});
