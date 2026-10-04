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
    // Pemiliknya /visuals: seksi #portraits (5d) memuat frame studi potret,
    // dan semuanya berada di bawah fold — jadi wajib lazy. Hero /visuals
    // memakai slot eager-nya sendiri (bukan OptimizedEditorialImage).
    const page = await render("/visuals", prefetch);
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
    // Studi potret hanya hidup di /visuals#portraits (5e: blok foto /universe
    // dihapus), jadi kontrak ukuran intrinsik diperiksa di halaman pemiliknya.
    const page = await render("/visuals", prefetch);
    const images = page.html.match(/<img[^>]*an-opt-img-element[^>]*>/g) || [];
    const sized = images.filter(img => /width="\d+"/.test(img) && /height="\d+"/.test(img));
    expect(sized.length, "tidak ada gambar dengan ukuran intrinsik").toBeGreaterThan(0);
    for (const img of sized) {
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  it("menyajikan empat suara huruf self-hosted tanpa satu pun panggilan CDN", () => {
    // KONTRAK BERUBAH DUA KALI (disengaja). Fase 8: pemilik situs menilai
    // roster Fase 6H ("Big Shoulders Display" + "Schibsted Grotesk")
    // "jelek banget, basic" dan minta huruf JUDUL diganti ke Unbounded 900
    // (badan ikut diganti ke Hanken Grotesk 400/500/700). Fase 9:
    // peninjauan tampilan hidup menilai Unbounded kurang cocok untuk
    // judul — dikembalikan ke Big Shoulders Display 800, SEDANGKAN badan
    // (Hanken Grotesk) TETAP karena bukan bagian dari keluhan. Sometype
    // Mono dan Noto Sans Sundanese tidak pernah disentuh di kedua fase.
    // Bukti perbandingan Fase 8: docs/notes/font-candidate-preview.png.
    // Yang dijaga tes ini tidak berubah: semua huruf dilayani dari repo,
    // tidak ada satu pun permintaan ke CDN huruf mana pun.
    for (const file of [
      "fonts/fontsource/big-shoulders-display-800.woff2",
      "fonts/fontsource/hanken-grotesk-400.woff2",
      "fonts/fontsource/hanken-grotesk-500.woff2",
      "fonts/fontsource/hanken-grotesk-700.woff2",
      "fonts/fontsource/sometype-mono-400.woff2",
      "fonts/fontsource/sometype-mono-500.woff2",
      "fonts/fontsource/noto-sans-sundanese-400.woff2",
    ]) {
      expect(existsSync(assetPath(file)), file).toBe(true);
    }

    // Huruf yang tidak lagi dipakai benar-benar hilang dari repo, bukan
    // sekadar tak dipakai. Unbounded (huruf judul Fase 8) masuk daftar ini
    // sejak Fase 9; Schibsted Grotesk tetap gone sejak Fase 8 (badan kini
    // Hanken Grotesk, bukan dikembalikan ke Schibsted).
    for (const gone of [
      "fonts/fontshare/clash-display-600.woff2",
      "fonts/fontshare/general-sans-500.woff2",
      "fonts/fontshare/azeret-mono-500.woff2",
      "fonts/fontsource/syne-800.woff2",
      "fonts/fontsource/unbounded-900.woff2",
      "fonts/fontsource/schibsted-grotesk-400.woff2",
      "fonts/fontsource/schibsted-grotesk-500.woff2",
      "fonts/fontsource/schibsted-grotesk-700.woff2",
    ]) {
      expect(existsSync(assetPath(gone)), gone).toBe(false);
    }

    const indexCss = source("client/src/index.css");
    expect(indexCss).toContain('@font-face {\n  font-family: "Hanken Grotesk";');
    expect(indexCss).toContain('@font-face {\n  font-family: "Sometype Mono";');
    expect(indexCss).toContain('@font-face {\n  font-family: "Big Shoulders Display";');
    // Fase 6I: --font-display memegang suara DISPLAY (sama dengan
    // --font-title), bukan grotesk biasa. Saat ia sempat menunjuk grotesk,
    // seluruh H2/H3 di situs kehilangan watak dan halaman jadi datar. Fase
    // 8 dan Fase 9 mempertahankan prinsip ini, cuma bertukar huruf judul.
    expect(indexCss).toContain('--font-display: "Big Shoulders Display"');
    expect(indexCss).toContain('--font-body:    "Hanken Grotesk"');
    expect(indexCss).toContain('--font-mono:    "Sometype Mono"');
    expect(indexCss).not.toContain("Clash Display");
    expect(indexCss).not.toContain("Azeret Mono");
    expect(indexCss).not.toContain('"Unbounded"');
    expect(indexCss).not.toContain('"Schibsted Grotesk"');

    // Tidak ada CDN huruf di mana pun.
    for (const file of ["client/index.html", "client/src/index.css"]) {
      const text = source(file);
      expect(text).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|api\.fontshare\.com/);
    }
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
