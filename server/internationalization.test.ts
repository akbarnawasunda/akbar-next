import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "./test-renderer";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("international artist layer", () => {
  it("registers separate English public URLs without replacing Indonesian routes", () => {
    const routeView = source("app/_components/RouteView.tsx");
    const idHome = source("app/(id)/page.tsx");
    const enHome = source("app/(en)/en/page.tsx");
    const enRelease = source("app/(en)/en/music/[slug]/page.tsx");
    const enEpk = source("app/(en)/en/epk/page.tsx");
    const enPrivacy = source("app/(en)/en/privacy/page.tsx");
    const english = source("client/src/pages/EnglishPages.tsx");
    expect(idHome).toContain("pathname='/' route='home'");
    expect(enHome).toContain("pathname='/en' route='enHome'");
    expect(enRelease).toContain("route='enRelease'");
    expect(enEpk).toContain("pathname='/en/epk' route='enEpk'");
    expect(enPrivacy).toContain("pathname='/en/privacy' route='enPrivacy'");
    expect(routeView).toContain("enHome: page(");
    // Hero EN kini memakai satu bio terverifikasi (HomeView locale="en" di
    // Home.tsx), bukan parafrase terpisah yang dulu hidup di EnglishPages.tsx
    // — sama pola dengan About.tsx di baris berikut.
    expect(source("client/src/pages/Home.tsx")).toContain(
      "verifiedArtistProfile.shortBioEn"
    );
    // Salinan panggung EN kini hidup di Live.tsx (LiveView dipakai /live dan
    // /en/live), bukan lagi disalin terpisah di EnglishPages.tsx.
    expect(source("client/src/pages/Live.tsx")).toContain(
      "No confirmed show is public yet."
    );
    // Salinan EPK EN kini hidup di PressKit.tsx (PressView locale="en").
    expect(source("client/src/pages/PressKit.tsx")).toContain(
      "Available on request."
    );
    expect(english).not.toContain("FanSignalInline");
  });

  it("keeps a visible language switcher in the one shared public chrome", async () => {
    // ID dan EN dulu punya dua implementasi chrome paralel (NightFrequencyChrome
    // + EnglishChrome) yang bisa menyimpang diam-diam (liquid-signal Phase 3 §2:
    // EnglishChrome pernah salah jumlah anak grid nav). Sekarang satu komponen
    // (`lang` prop) dipakai ID dan EN sekaligus — tes ini memeriksa HTML yang
    // benar-benar dikirim ke kedua rute, bukan dua berkas sumber terpisah.
    const chrome = source("client/src/components/NightFrequencyChrome.tsx");
    expect(chrome).toContain('aria-label={lang === "en" ? "Language selection" : "Pilihan bahasa"}');
    expect(chrome).toContain("href={englishPath}");
    expect(chrome).toContain("href={idPath}");

    const prefetch = { documents: async () => [] as never };
    const id = await render("/", prefetch);
    const en = await render("/en", prefetch);

    for (const page of [id, en]) {
      expect(page.html).toContain('class="an-language-switcher"');
      expect(page.html).toContain(">ID<");
      expect(page.html).toContain(">EN<");
    }

    // CTA utama EN tetap LISTEN → /en/music (paritas dengan "Dengarkan" di
    // chrome ID); inquiry tetap ada sebagai rute CONTACT di kedua bahasa.
    expect(id.html).toContain(">Dengarkan");
    expect(id.html).toContain('href="/music"');
    expect(en.html).toContain(">LISTEN");
    expect(en.html).toContain('href="/en/music"');
    expect(en.html).toContain('href="/en/inquire"');
    expect(en.html).toContain('aria-controls="english-mobile-menu"');
  });

  it("emits route-aware canonical, language alternates, and only factual schema types", async () => {
    const siteProviders = source("app/_components/SiteProviders.tsx");
    const sitePage = source("app/_lib/site-page.tsx");
    const layout = source("app/layout.tsx");
    const robots = source("public/robots.txt");
    const sitemap = source("public/sitemap.xml");
    expect(siteProviders).toContain('document.documentElement.lang =');
    expect(sitePage).toContain("alternates:");
    expect(sitePage).toContain('"x-default"');
    expect(sitePage).toContain("canonical:");
    expect(sitePage).toContain("openGraph:");
    expect(sitePage).toContain("twitter:");
    expect(layout).toContain("apple:");
    expect(robots).toContain("Sitemap: https://akbarnawasunda.my.id/sitemap.xml");
    expect(robots).toContain("Disallow: /studio");
    expect(sitemap).toContain("https://akbarnawasunda.my.id/en/music");
    expect(sitemap).toContain('hreflang="en"');
    // Schema diperiksa dari payload yang benar-benar dikirim ke halaman,
    // bukan dari isi file komponennya.
    const home = await render("/", { documents: async () => [] as never });
    const graph = (
      home.head.structuredData as { "@graph": Record<string, unknown>[] }
    )["@graph"];
    const types = graph.map(node => node["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("WebPage");
    expect(types).toContain("MusicGroup");

    const website = graph.find(node => node["@type"] === "WebSite") as {
      name: string;
      alternateName: string[];
      inLanguage: string;
    };
    expect(website.name).toBe("Akbar Nawasunda | Official Website");
    expect(website.alternateName).toEqual([
      "Akbar Nawasunda",
      "DJ Akbar Remix",
      "akbarnawasunda.my.id",
    ]);

    const english = await render("/en", { documents: async () => [] as never });
    const englishWebsite = (
      english.head.structuredData as { "@graph": Record<string, unknown>[] }
    )["@graph"].find(node => node["@type"] === "WebSite") as {
      inLanguage: string;
    };
    expect(englishWebsite.inLanguage).toBe("en");
  });

  it("shares one public custom-content query between page data and metadata", () => {
    const publicContent = source("client/src/content/publicContent.ts");
    const sitePage = source("app/_lib/site-page.tsx");
    expect(publicContent).toContain("trpc.content.documents.useQuery()");
    expect(publicContent).toContain("customDocumentsToPublicContent");
    expect(sitePage).toContain("caller.content.documents()");
    expect(sitePage).toContain("prefetchForPath");
    expect(publicContent).not.toContain("@sanity/client");
    expect(publicContent).not.toContain("_type ==");
  });
});
