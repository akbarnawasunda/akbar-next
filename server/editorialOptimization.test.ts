import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";

const assetPath = (name: string) => resolve(process.cwd(), "client/public/assets", name);
const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const prefetch = { documents: async () => [] as never };

describe("high-performance image optimization & non-Google typography", () => {
  it("keeps lightweight mobile-optimized editorial assets ready for responsive loading", () => {
    const mobileStage = assetPath("akbar-night-frequency-stage-mobile-optimized.webp");
    const mobileHero = assetPath("akbar-night-frequency-hero-mobile-optimized.webp");
    const optPortrait = assetPath("akbar-official-portrait-optimized.webp");

    expect(existsSync(mobileStage)).toBe(true);
    expect(existsSync(mobileHero)).toBe(true);
    expect(existsSync(optPortrait)).toBe(true);

    expect(statSync(mobileStage).size).toBeLessThan(200_000);
    expect(statSync(mobileHero).size).toBeLessThan(200_000);
    expect(statSync(optPortrait).size).toBeLessThan(150_000);
  });

  // Gambar editorial dirender di HTML, jadi kontraknya diuji dari halaman
  // nyata (lihat docs/notes/testing-policy.md), bukan dari nama variabel.
  it("mengirim markup gambar yang aman layout-shift, responsif, dan hemat data", async () => {
    // Kontrak markup sama untuk semua permukaan OptimizedEditorialImage.
    // Halaman gallery potret lama bukan rute lagi — seksi #portraits-nya
    // dibangun di sub-fase 5d; kontrak "frame pertama eager" (di gallery
    // frame pertama memang above-the-fold) diverifikasi ulang di sana.
    // Di /universe semua gambar berada di bawah fold, jadi wajib lazy.
    const page = await render("/universe", prefetch);
    const images = page.html.match(/<img[^>]*an-opt-img-element[^>]*>/g) || [];

    expect(images.length, "halaman tanpa gambar editorial").toBeGreaterThan(0);
    for (const img of images) {
      expect(img, "gambar tanpa decoding async").toContain('decoding="async"');
      expect(img, "gambar di bawah fold harus lazy").toContain('loading="lazy"');
    }
    // Varian mobile dikirim lewat <picture>, bukan `sizes` tanpa `srcSet`.
    expect(page.html, "tanpa <picture> untuk varian mobile").toContain("<picture");
  });

  it("route potret lama redirect ke seksi in-page /visuals#portraits (Phase 3 §2 baris 5)", async () => {
    for (const [route, target] of [
      ["/visuals/portraits", "/visuals#portraits"],
      ["/en/visuals/portraits", "/en/visuals#portraits"],
    ] as const) {
      const page = await render(route, prefetch);
      expect(page.html, `${route}: tanpa meta refresh`).toContain(
        `content="0; url=${target}"`
      );
      // Galeri tidak lagi dirender di rute lama.
      expect(page.html, `${route}: markup gallery bocor`).not.toContain(
        "an-opt-img-element"
      );
    }
  });

  it("memakai ukuran intrinsik untuk gambar aset lokal", async () => {
    // Studi potret pindah ke /universe (tidak diulang di beranda), jadi
    // kontrak ukuran intrinsik diperiksa di halaman pemiliknya.
    const page = await render("/universe", prefetch);
    const images = page.html.match(/<img[^>]*an-opt-img-element[^>]*>/g) || [];
    const sized = images.filter(img => /width="\d+"/.test(img) && /height="\d+"/.test(img));
    expect(sized.length, "tidak ada gambar dengan ukuran intrinsik").toBeGreaterThan(0);
    for (const img of sized) {
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  it("serves curated non-Google Fontshare fonts locally with zero external Google font latency", () => {
    const clashFont = assetPath("fonts/fontshare/clash-display-600.woff2");
    const generalFont = assetPath("fonts/fontshare/general-sans-500.woff2");
    const azeretFont = assetPath("fonts/fontshare/azeret-mono-500.woff2");

    expect(existsSync(clashFont)).toBe(true);
    expect(existsSync(generalFont)).toBe(true);
    expect(existsSync(azeretFont)).toBe(true);

    const indexCss = source("client/src/index.css");
    expect(indexCss).toContain('@font-face {\n  font-family: "Clash Display";');
    expect(indexCss).toContain('@font-face {\n  font-family: "General Sans";');
    expect(indexCss).toContain('@font-face {\n  font-family: "Azeret Mono";');
    expect(indexCss).toContain('--font-display: "Clash Display"');
    expect(indexCss).toContain('--font-body:    "General Sans"');
    expect(indexCss).toContain('--font-mono:    "Azeret Mono"');
  });

  it("mencegah teks terpotong tanpa menyembunyikan overflow", () => {
    const homeCss = source("client/src/pages/Home.css");
    const indexCss = source("client/src/index.css");
    const shellCss = source("client/src/shell/PublicShell.css");

    // hero-title-mask must not crop descenders with overflow: hidden
    expect(homeCss).toContain(".hero-title-mask {\n  display: inline-block;\n  overflow: visible;");
    // hero-title-editorial must support word break and fluid clamp
    expect(homeCss).toContain("word-break: break-word;");
    expect(homeCss).toContain("overflow-wrap: break-word;");

    // Containment policy: html/body tidak boleh menyembunyikan overflow,
    // karena itu menutupi elemen yang sebenarnya keluar viewport.
    // Komentar dibuang dulu supaya dokumentasi kebijakan tidak ikut terbaca
    // sebagai aturan CSS.
    const indexRules = indexCss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(indexRules, "index.css kembali menyembunyikan overflow").not.toMatch(
      /overflow-x:\s*(hidden|clip)/
    );
    // Satu-satunya jaring pengaman ada di public shell dan dipakai `clip`
    // supaya tidak membuat scroll container (sticky nav tetap bekerja).
    expect(shellCss).toMatch(/\.an-public-shell \{[\s\S]*?overflow-x: clip;/);
  });
});
