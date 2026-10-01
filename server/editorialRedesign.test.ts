/**
 * Kontrak redesign editorial.
 *
 * Semua pemeriksaan di bawah merender halaman lewat jalur SSR produksi
 * (`client/src/entry-server.tsx`) dan memeriksa HTML yang benar-benar diterima
 * pengunjung — bukan membaca source JSX sebagai teks. Satu blok terakhir
 * memeriksa file statis (index.html, CSS) karena isinya memang tidak muncul
 * sebagai markup hasil render.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";
import { releases } from "../client/src/content/artistPlatform";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const ROUTES_ID = [
  "/",
  "/music",
  "/visuals",
  "/visuals/portraits",
  "/live",
  "/universe",
  "/about",
  "/epk",
  "/inquire",
  "/licensing",
  "/privacy",
];

const ROUTES_EN = ROUTES_ID.map(route =>
  route === "/" ? "/en" : `/en${route}`
);

const releaseSlug = slugify(releases[0].title);
const ALL_ROUTES = [
  ...ROUTES_ID,
  ...ROUTES_EN,
  `/music/${releaseSlug}`,
  `/en/music/${releaseSlug}`,
];

type Rendered = { html: string; text: string; title: string };

const cache = new Map<string, Promise<Rendered>>();

function renderPage(path: string): Promise<Rendered> {
  const cached = cache.get(path);
  if (cached) return cached;
  const pending = render(path, { documents: async () => [] as never }).then(
    result => ({
      html: result.html,
      text: result.html
        .replace(/<script[\s\S]*?<\/script>/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&#x27;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
      title: result.head.title,
    })
  );
  cache.set(path, pending);
  return pending;
}

describe("rute publik sesudah redesign", () => {
  it("tidak ada halaman yang menjadi cangkang kosong", async () => {
    for (const route of ALL_ROUTES) {
      const page = await renderPage(route);
      expect(page.text.length, `panjang konten ${route}`).toBeGreaterThan(500);
      expect(page.title, `judul ${route}`).toMatch(/Akbar Nawasunda/i);
      expect(page.html, `heading utama ${route}`).toMatch(/<h1[\s>]/);
    }
  });

  it("menjaga navigasi utama dan jalur bahasa tetap ada", async () => {
    const home = await renderPage("/");
    for (const href of ["/music", "/visuals", "/live", "/inquire"]) {
      expect(home.html, `tautan ${href}`).toContain(`href="${href}"`);
    }
    const english = await renderPage("/en");
    expect(english.html).toContain('href="/en/music"');
  });

  it("menampilkan papan Current Signal di beranda ID dan EN", async () => {
    const home = await renderPage("/");
    expect(home.html).toContain('id="signal"');
    expect(home.text).toContain("CURRENT SIGNAL");
    expect(home.text).toContain("RILISAN TERBARU");
    expect(home.html).toContain("ed-signal-board");

    const english = await renderPage("/en");
    expect(english.text).toContain("CURRENT SIGNAL");
    expect(english.text).toContain("LATEST RELEASE");
    expect(english.html).toContain("ed-signal-board");
  });

  it("menampilkan panel CTA booking di beranda kedua bahasa", async () => {
    const home = await renderPage("/");
    expect(home.html).toContain("ed-cta");
    expect(home.text).toContain("BOOKING / KOLABORASI");
    expect(home.html).toContain('href="/inquire?source=home"');

    const english = await renderPage("/en");
    expect(english.html).toContain("ed-cta");
    expect(english.text).toContain("BOOKING / COLLABORATION");
    expect(english.html).toContain('href="/en/inquire?source=home"');
  });

  it("menjadikan Universe linimasa interaktif yang tetap terbaca crawler", async () => {
    for (const [route, label] of [
      ["/universe", "SATU NAMA,"],
      ["/en/universe", "ONE NAME,"],
    ] as const) {
      const page = await renderPage(route);
      expect(page.html, route).toContain("ed-timeline");
      expect(page.text, route).toContain(label);
      // Panel pertama terbuka saat SSR: isi milestone harus ikut terkirim.
      expect(page.html, route).toContain("ed-timeline__copy");
      expect(page.html, route).toContain('aria-expanded="true"');
    }
  });

  it("menonjolkan status live dan selalu punya CTA inquiry", async () => {
    for (const [route, needle] of [
      ["/live", "AJUKAN TANGGAL"],
      ["/en/live", "PROPOSE A DATE"],
    ] as const) {
      const page = await renderPage(route);
      expect(page.html, route).toContain('id="next-show"');
      expect(page.text, route).toContain(needle);
    }
  });

  it("membungkus embed audio dengan shell player dan URL SoundCloud yang benar", async () => {
    const music = await renderPage("/music");
    expect(music.html).toContain("ed-player");
    expect(music.html).toMatch(/soundcloud\.com/);
    expect(music.html).toContain("visual=false");
    expect(music.html).toMatch(/loading="lazy"/);
  });

  it("memberi arsip visual penyaring tanpa menghapus kartu arsip", async () => {
    const visuals = await renderPage("/visuals");
    expect(visuals.html).toContain("ed-filters");
    expect(visuals.text).toContain("SEMUA");
    expect(visuals.html).toContain("nf-visual-card");
  });

  it("menjaga Fan Signal tetap satu per halaman dengan source yang benar", async () => {
    const pairs: [string, string][] = [
      ["/", "home"],
      ["/music", "music"],
      ["/live", "footer"],
      ["/visuals", "visuals"],
      ["/universe", "universe"],
    ];
    for (const [route, source] of pairs) {
      const page = await renderPage(route);
      const forms = page.html.match(/fan-signal-section/g) ?? [];
      expect(forms.length, `jumlah Fan Signal di ${route}`).toBeGreaterThan(0);
      const sections = page.html.match(/class="[^"]*fan-signal-section[^"]*"/g);
      expect(
        new Set(sections).size,
        `Fan Signal unik di ${route}`
      ).toBeLessThanOrEqual(2);
      expect(page.html, `source Fan Signal ${route}`).toContain(
        `data-fan-signal-source="${source}"`
      );
    }
  });

  it("tidak mengirim splash atau overlay loading ke dalam HTML SSR", async () => {
    for (const route of ["/", "/en", "/music", "/live"]) {
      const page = await renderPage(route);
      expect(page.html, route).not.toContain("akbar-preloader");
      expect(page.html, route).not.toContain("an-page-loading");
    }
  });
});

describe("aset statis redesign", () => {
  const read = (path: string) =>
    readFileSync(resolve(process.cwd(), path), "utf8");

  it("splash hanya tampil sekali per sesi dan punya batas durasi jelas", () => {
    const indexHtml = read("client/index.html");
    expect(indexHtml).toContain("an-splash-seen");
    expect(indexHtml).toContain("sessionStorage");
    expect(indexHtml).toContain("MIN_VISIBLE = 1200");
    expect(indexHtml).toContain("MAX_VISIBLE = 1800");
    expect(indexHtml).toMatch(/prefers-reduced-motion: reduce/);
  });

  it("design system editorial tidak memakai efek kaca", () => {
    const kit = read("client/src/components/editorial/EditorialKit.css");
    expect(kit).not.toContain("backdrop-filter");
    expect(kit).toMatch(/prefers-reduced-motion: reduce/);
  });

  it("token audio embed dan warna inti tetap utuh", () => {
    expect(read("client/src/components/MusicEmbed.css")).toContain(
      "--an-embed-audio-h: 166px"
    );
    const base = read("client/src/index.css");
    for (const token of ["--acid", "--ink", "--paper", "--mute"]) {
      expect(base).toContain(`${token}:`);
    }
  });
});
