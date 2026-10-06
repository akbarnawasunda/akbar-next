/**
 * Kontrak Signature Runtime.
 *
 * Aturannya sama dengan docs/notes/testing-policy.md: apa pun yang dilihat
 * pengunjung diuji lewat HTML hasil `entry-server.tsx`. Hanya hal yang memang
 * tidak muncul di HTML (aturan CSS, token, fungsi murni runtime) yang diuji
 * dari source/modul, dan setiap kasusnya diberi alasan.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";
import { buildHeadTags, composeHtml } from "./_core/ssrHtml";
import { particleBudget } from "../client/src/signature/capability";
import { attachPointerSignal } from "../client/src/signature/pointerSignal";
import { routeInfo, isPublicRoute } from "../client/src/signature/routeSignal";
import {
  createSignatureStore,
  INITIAL_SNAPSHOT,
} from "../client/src/signature/signatureStore";
import { phraseFor } from "../client/src/signature/stagePhrases";
import type { SignatureCapability } from "../client/src/signature/types";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const ID_ROUTES = [
  "/",
  "/music",
  "/visuals",
  // /visuals/portraits bukan rute lagi (Phase 3 §2 baris 5); kontennya jadi
  // seksi in-page /visuals#portraits (sub-fase 5d).
  "/live",
  "/universe",
  "/about",
  "/inquire",
  "/licensing",
  "/epk",
  "/privacy",
  "/game/jedag-run",
];

const EN_ROUTES = ID_ROUTES.map(route =>
  route === "/" ? "/en" : `/en${route}`
);

type Rendered = Awaited<ReturnType<typeof render>> & { text: string };

const cache = new Map<string, Promise<Rendered>>();

function renderPage(path: string): Promise<Rendered> {
  const cached = cache.get(path);
  if (cached) return cached;
  const pending = render(path, { documents: async () => [] as never }).then(
    result => ({
      ...result,
      text: result.html
        .replace(/<script[\s\S]*?<\/script>/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    })
  );
  cache.set(path, pending);
  return pending;
}

describe("rute publik tetap halaman penuh di SSR", () => {
  it("mengirim konten nyata untuk seluruh rute ID dan EN", async () => {
    for (const route of [...ID_ROUTES, ...EN_ROUTES]) {
      const page = await renderPage(route);
      expect(page.text.length, `panjang konten ${route}`).toBeGreaterThan(400);
      expect(page.head.title, `judul ${route}`).toMatch(/Akbar Nawasunda/i);
      expect(page.html, `footer ${route}`).toContain("AKBAR NAWASUNDA");
      expect(page.html, `shell ${route}`).toContain("an-public-shell");
    }
  });

  it("menjaga beranda tetap punya h1 teks asli di kedua bahasa", async () => {
    for (const route of ["/", "/en"]) {
      const page = await renderPage(route);
      const headings = page.html.match(/<h1[^>]*>[\s\S]*?<\/h1>/g) || [];
      expect(headings.length, `jumlah h1 ${route}`).toBe(1);
      const headingText = (headings[0] || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      expect(headingText.length, `isi h1 ${route}`).toBeGreaterThan(3);
      expect(headingText.toUpperCase()).toContain("AKBAR");
    }
  });

  it("tidak mengganti wordmark h1 dengan canvas", async () => {
    for (const route of ["/", "/en"]) {
      const page = await renderPage(route);
      // Canvas particle hanya dibuat setelah mount di browser.
      expect(page.html, `canvas ${route}`).not.toContain("<canvas");
      expect(page.html, `field ${route}`).not.toContain("an-signature-field");
    }
  });

  it("tidak membocorkan lapisan client ke HTML SSR", async () => {
    for (const route of ["/", "/en", "/music", "/en/visuals"]) {
      const page = await renderPage(route);
      expect(page.html, `lightbox ${route}`).not.toContain("an-lightbox");
      expect(page.html, `palette ${route}`).not.toContain("an-command");
      expect(page.html, `curtain ${route}`).not.toContain("an-route-signal");
      expect(page.html, `cursor ${route}`).not.toContain("an-cursor-signal");
      expect(page.html, `player ${route}`).not.toContain("an-global-player");
      expect(page.html, `autoplay ${route}`).not.toContain("auto_play=true");
    }
  });

  it("menjaga formulir langganan hanya di beranda, bukan diulang di tiap halaman", async () => {
    // Satu pemilik: beranda. Sebelumnya blok yang sama dipasang di lima
    // halaman sehingga pengunjung melihat section yang sama berulang.
    const home = await renderPage("/");
    const matches = home.html.match(/data-fan-signal-source="([a-z]+)"/g) || [];
    expect(matches.length).toBe(1);
    expect(matches[0]).toBe('data-fan-signal-source="home"');

    for (const route of ["/music", "/live", "/visuals", "/universe"]) {
      const page = await renderPage(route);
      expect(page.html.match(/data-fan-signal-source=/g), route).toBeNull();
    }

    // Halaman Inggris juga tidak memasangnya (form berbahasa ID).
    for (const route of ["/en", "/en/music", "/en/live"]) {
      const page = await renderPage(route);
      expect(page.html.match(/data-fan-signal-source=/g), route).toBeNull();
    }
  });

  it("menjaga embed SoundCloud resmi tetap visual=false", async () => {
    for (const route of ["/music", "/en/music"]) {
      const page = await renderPage(route);
      expect(page.html, route).toMatch(/w\.soundcloud\.com\/player/);
      expect(page.html, route).toContain("visual=false");
      expect(page.html, route).not.toContain("visual=true");
    }
  });
});

describe("metadata dan structured data", () => {
  it("memakai judul beranda resmi", async () => {
    const home = await renderPage("/");
    expect(home.head.title).toBe("Akbar Nawasunda | Official Website");
  });

  it("mengirim WebSite + WebPage yang saling terhubung", async () => {
    const home = await renderPage("/");
    const graph = (
      home.head.structuredData as { "@graph": Record<string, unknown>[] }
    )["@graph"];
    const website = graph.find(node => node["@type"] === "WebSite") as {
      "@id": string;
      alternateName: string[];
    };
    const webpage = graph.find(node => node["@type"] === "WebPage") as {
      isPartOf: { "@id": string };
      about: { "@id": string };
      inLanguage: string;
    };
    const artist = graph.find(node => node["@type"] === "MusicGroup") as {
      "@id": string;
    };

    expect(website.alternateName).toEqual([
      "Akbar Nawasunda",
      "DJ Akbar Remix",
      "akbarnawasunda.my.id",
    ]);
    expect(webpage.isPartOf["@id"]).toBe(website["@id"]);
    expect(webpage.about["@id"]).toBe(artist["@id"]);
    expect(webpage.inLanguage).toBe("id");

    const english = await renderPage("/en");
    const englishPage = (
      english.head.structuredData as { "@graph": Record<string, unknown>[] }
    )["@graph"].find(node => node["@type"] === "WebPage") as {
      inLanguage: string;
    };
    expect(englishPage.inLanguage).toBe("en");
  });

  it("hanya menyuntik satu og:site_name, dari ssrHtml", async () => {
    const home = await renderPage("/");
    const tags = buildHeadTags(home.head);
    expect(tags.match(/property="og:site_name"/g)?.length).toBe(1);

    const document = composeHtml(
      '<html lang="id"><head><!--app-head--></head><body><!--app-html--></body></html>',
      home.html,
      home.head,
      {}
    );
    expect(document.match(/og:site_name/g)?.length).toBe(1);
    expect(document).toContain('rel="canonical"');
    expect(document).toContain('hreflang="x-default"');
  });

  it("menjaga tautan penting tetap ada di halaman publik", async () => {
    const home = await renderPage("/");
    for (const href of ["/music", "/visuals", "/live", "/universe", "/epk"]) {
      expect(home.html, href).toContain(`href="${href}"`);
    }
    const english = await renderPage("/en");
    for (const href of ["/en/music", "/en/visuals", "/en/live"]) {
      expect(english.html, href).toContain(`href="${href}"`);
    }
  });
});

describe("kontrak runtime yang tidak muncul di HTML", () => {
  it("menjaga token tinggi embed audio tetap 166px", () => {
    // Token CSS tidak pernah terlihat di HTML hasil render.
    const css = source("client/src/components/MusicEmbed.css");
    expect(css).toContain("--an-embed-audio-h: 166px");
  });

  it("memakai mark kursor AN, bukan dot dan ring generik", () => {
    const component = source(
      "client/src/components/signature/CursorSignal.tsx"
    );
    const css = source("client/src/components/signature/CursorSignal.css");

    expect(component).toContain("an-cursor-cut--primary");
    expect(component).toContain("an-cursor-cut--counter");
    expect(component).toContain('data-state="default"');
    expect(component).toContain('"artwork"');
    expect(component).toContain('"music"');
    expect(component).toContain('"drag"');
    expect(component).not.toContain("an-cursor-dot");
    expect(component).not.toContain("an-cursor-ring");
    expect(css).not.toMatch(/\.an-cursor-(?:dot|ring)\b/);
    expect(css).not.toMatch(/filter:\s*(?:blur|drop-shadow)/);
  });

  it("menonaktifkan efek signature saat reduced motion", () => {
    // Aturan media query hanya ada di file CSS.
    for (const file of [
      "client/src/components/signature/SignatureBackground.css",
      "client/src/components/signature/CursorSignal.css",
      "client/src/components/signature/RouteSignalCurtain.css",
      "client/src/components/signature/SignalType.css",
      "client/src/components/signature/EraTimeline.css",
      "client/src/components/signature/InteractiveArtworkCard.css",
      "client/src/components/signature/GlobalAudioPlayer.css",
      "client/src/shell/PublicShell.css",
    ]) {
      const css = source(file);
      expect(css, file).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
      // Permukaan publik tetap solid: tidak ada efek kaca.
      expect(css, file).not.toMatch(/^\s*(-webkit-)?backdrop-filter\s*:/m);
    }
  });

  it("memberi perangkat sentuh versi ringan, bukan layar kosong", () => {
    const base: SignatureCapability = {
      tier: "lite",
      reducedMotion: false,
      saveData: false,
      coarsePointer: true,
      lowPower: false,
      viewport: "compact",
      deviceScore: 0.3,
      measured: true,
    };
    // Ponsel biasa: tetap dapat partikel, tapi ratusan — bukan ribuan.
    const lite = particleBudget(base, 390 * 780);
    expect(lite).toBeGreaterThan(0);
    expect(lite).toBeLessThanOrEqual(480);

    // Desktop normal: ribuan titik.
    const full = particleBudget(
      {
        ...base,
        tier: "full",
        coarsePointer: false,
        deviceScore: 0.8,
        viewport: "wide",
      },
      1440 * 900
    );
    expect(full).toBeGreaterThan(1500);

    // Reduced motion / save-data / perangkat sangat lemah: mati total.
    expect(particleBudget({ ...base, tier: "off" }, 1440 * 900)).toBe(0);
  });

  it("meruntuhkan jalur panggung saat efeknya tidak jalan", () => {
    // Aturan tinggi jalur hanya hidup di CSS; kalau runtuhnya hilang,
    // pengguna reduced motion harus menggulir dua layar kosong.
    const css = source("client/src/components/signature/SignatureStage.css");
    expect(css).toMatch(
      /\.an-signature-stage\[data-live="false"\] \.an-signature-stage-track \{\s*min-height: 0;/
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.an-signature-stage-track \{\s*min-height: 0;/
    );
    // Layar kecil tidak boleh kebagian jalur sepanjang desktop.
    expect(css).toMatch(
      /@media \(max-width: 640px\)[\s\S]*?min-height: 115vh;/
    );
    // Sticky memakai svh supaya bilah URL mobile tidak memotong panggung,
    // dan tingginya di bawah satu layar penuh supaya section berikutnya
    // selalu mengintip — panggung bukan ruangan khusus partikel.
    const sticky =
      /\.an-signature-stage-sticky \{[\s\S]*?min-height: (\d+)svh;/.exec(css);
    expect(sticky, "tinggi sticky panggung").toBeTruthy();
    expect(Number(sticky?.[1])).toBeLessThanOrEqual(80);
    // Jalur desktop juga tidak boleh kembali sepanjang dua layar lebih.
    const track =
      /\.an-signature-stage-track \{[\s\S]*?min-height: (\d+)vh;/.exec(css);
    expect(Number(track?.[1])).toBeLessThanOrEqual(150);
  });

  it("memakai metadata rute bersama untuk label tirai", () => {
    expect(routeInfo("/music").label).toBe("MUSIK");
    expect(routeInfo("/en/music").label).toBe("MUSIC");
    // Phase 3 §2: /universe di-label PERJALANAN (ID) / JOURNEY (EN);
    // /live di-label JADWAL (ID) / LIVE (EN).
    expect(routeInfo("/universe").label).toBe("PERJALANAN");
    expect(routeInfo("/en/universe").label).toBe("JOURNEY");
    expect(routeInfo("/live").label).toBe("JADWAL");
    expect(routeInfo("/en/live").label).toBe("LIVE");
    // Rute potret yang dihapus tidak lagi dikenal metadata tirai.
    expect(routeInfo("/visuals/portraits").label).toBe("");
    expect(routeInfo("/visuals").mode).toBe("dust");
    expect(routeInfo("/").mode).toBe("wordmark");
    expect(isPublicRoute("/studio")).toBe(false);
    expect(isPublicRoute("/en/live")).toBe(true);
    expect(isPublicRoute("/visuals/portraits")).toBe(false);
  });
});

/**
 * Sinyal gulir diuji sebagai modul: angkanya tidak pernah muncul di HTML
 * (canvas dibuat setelah mount), tapi perilakunya adalah kontrak — engine
 * partikel memakai `scrollVelocity` untuk menentukan kekuatan dorongan.
 */
describe("sinyal gulir", () => {
  function harness() {
    const listeners = new Map<string, (event: unknown) => void>();
    const frames: (() => void)[] = [];
    const page = { scrollY: 0, trackTop: 0 };

    const globals = globalThis as unknown as Record<string, unknown>;
    const previous = {
      window: globals.window,
      document: globals.document,
      performance: globals.performance,
    };
    let clock = 0;

    globals.performance = { now: () => (clock += 16) };
    globals.window = {
      get scrollY() {
        return page.scrollY;
      },
      innerHeight: 900,
      addEventListener: (type: string, handler: (event: unknown) => void) => {
        listeners.set(type, handler);
      },
      removeEventListener: () => undefined,
      requestAnimationFrame: (callback: () => void) => {
        frames.push(callback);
        return frames.length;
      },
      cancelAnimationFrame: () => undefined,
    };
    globals.document = {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      querySelector: (selector: string) => {
        if (selector === "[data-signal-stage]") {
          return {
            getBoundingClientRect: () => ({
              left: 120,
              top: 300,
              width: 1200,
              height: 320,
            }),
          };
        }
        if (selector === "[data-signal-stage-track]") {
          return {
            getBoundingClientRect: () => ({
              top: page.trackTop,
              height: 1400,
            }),
          };
        }
        return null;
      },
    };

    const store = createSignatureStore({ ...INITIAL_SNAPSHOT });
    const detach = attachPointerSignal(store);

    const pump = (count = 1) => {
      for (let i = 0; i < count; i++) {
        const next = frames.shift();
        if (!next) break;
        next();
      }
    };
    const scrollTo = (y: number, trackTop = page.trackTop) => {
      page.scrollY = y;
      page.trackTop = trackTop;
      listeners.get("scroll")?.({});
      pump();
    };

    return {
      store,
      scrollTo,
      pump,
      stop() {
        detach();
        globals.window = previous.window;
        globals.document = previous.document;
        globals.performance = previous.performance;
      },
    };
  }

  it("mengukur kecepatan gulir dan meluruhkannya sendiri", () => {
    const run = harness();
    expect(run.store.signals.scrollVelocity).toBe(0);

    // Gulir pelan lalu gulir kencang: dorongannya harus berbeda.
    run.scrollTo(40);
    const slow = run.store.signals.scrollVelocity;
    expect(slow).toBeGreaterThan(0);

    run.scrollTo(640);
    const fast = run.store.signals.scrollVelocity;
    expect(fast).toBeGreaterThan(slow * 3);

    // Tanpa gulir baru, nilainya meluruh sampai nol — bukan angka basi yang
    // terus mendorong partikel.
    run.pump(60);
    expect(run.store.signals.scrollVelocity).toBe(0);
    run.stop();
  });

  it("mengganti frasa panggung lewat state diskret, bukan tiap frame", () => {
    const run = harness();
    // Jalur 1400px, viewport 900px → 500px perjalanan.
    run.scrollTo(0, 0);
    expect(run.store.getSnapshot().stagePhrase).toBe(0);

    let renders = 0;
    run.store.subscribe(() => {
      renders++;
    });

    // Pertengahan jalur: masih frasa pertama.
    run.scrollTo(100, -100);
    expect(run.store.getSnapshot().stagePhrase).toBe(phraseFor(0.2));

    // Lewat ambang: frasa kedua, dan hanya satu notifikasi React.
    run.scrollTo(400, -400);
    expect(run.store.getSnapshot().stagePhrase).toBe(1);
    run.scrollTo(420, -420);
    run.scrollTo(440, -440);
    expect(renders).toBe(1);
    run.stop();
  });
});
