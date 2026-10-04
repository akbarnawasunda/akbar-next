/**
 * Kontrak layout layar kecil (Android) dan layar besar (desktop).
 *
 * docs/notes/testing-policy.md melarang menguji tampilan lewat teks source.
 * Yang diuji di sini memang tidak pernah muncul di HTML: aturan CSS, meta
 * viewport, dan satu perhitungan lebar teks.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

/**
 * Lebar kata "NAWASUNDA." dalam satuan em, diukur dari advance width glyph
 * font JUDUL yang di-host di repo ini (upem 1000) ditambah letter-spacing
 * per karakter. Angka ini yang menentukan apakah judul hero terpotong di
 * layar 320px.
 *
 * KONTRAK BERUBAH (Fase 6E, disengaja): font judul kini
 * `client/public/assets/fonts/fontsource/big-shoulders-display-800.woff2`.
 * Riwayatnya: clash-display-700 6,963em → syne-800 12,163em →
 * big-shoulders-display-800 **4,871em** (sudah termasuk tracking +0,02em).
 * Perbandingan keenam kandidat pada lebar baris yang sama ada di
 * docs/notes/display-candidates.png. Karena hurufnya 2,5× lebih ringkas,
 * seluruh clamp judul dinaikkan — bukan karena ingin lebih besar saja,
 * tapi karena lebar barisnya tetap sama.
 *
 * Yang dijaga tes ini tidak pernah berubah: tidak boleh ada kata judul
 * yang melewati ruang teks di layar 320px.
 */
const HERO_WORD_EM = 4.871;
const SMALLEST_PHONE = 320;
const GUTTER = 20; // --hx-gutter / --ref-gutter pada <= 767.98px

/** clamp(min, prefer, max) seperti CSS, dalam px. */
const clampPx = (
  minRem: number,
  vwFactor: number,
  maxRem: number,
  vw: number
) => Math.max(minRem * 16, Math.min((vwFactor / 100) * vw, maxRem * 16));

/**
 * Semua aturan ukuran judul hero yang hidup di blok @media mobile
 * (max-width <= 768px). Mana pun bisa memenangkan cascade, jadi semuanya
 * harus muat.
 */
function mobileHeroClamps(css: string) {
  const out: { min: number; vw: number; max: number }[] = [];
  const mediaRe = /@media\s*\(max-width:\s*([\d.]+)px\)\s*\{/g;
  let media: RegExpExecArray | null;
  while ((media = mediaRe.exec(css))) {
    if (Number(media[1]) > 768) continue;
    // Potong isi blok media dengan menghitung kurung kurawal.
    let depth = 1;
    let i = media.index + media[0].length;
    const start = i;
    while (i < css.length && depth > 0) {
      if (css[i] === "{") depth += 1;
      else if (css[i] === "}") depth -= 1;
      i += 1;
    }
    const body = css.slice(start, i - 1);
    const ruleRe =
      /hero-title-editorial[^{}]*\{[^}]*?font-size:\s*clamp\(\s*([\d.]+)rem\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)rem\s*\)/g;
    let rule: RegExpExecArray | null;
    while ((rule = ruleRe.exec(body))) {
      out.push({
        min: Number(rule[1]),
        vw: Number(rule[2]),
        max: Number(rule[3]),
      });
    }
  }
  return out;
}

describe("layout layar kecil", () => {
  it("menjaga kata judul hero tetap muat di layar 320px", () => {
    // Kata judul dipaksa white-space: nowrap + word-break: keep-all, jadi
    // kalau ukurannya terlalu besar teksnya tidak membungkus — ia keluar
    // layar, dan overflow-x: clip menyembunyikannya sebagai teks terpotong.
    const available = SMALLEST_PHONE - GUTTER * 2;
    for (const path of [
      "client/src/CinematicReference.css",
      "client/src/pages/Home.css",
      // Komposisi hero baru beranda (checkpoint A) memakai clamp sendiri;
      // ikut diuji supaya tidak ada aturan yang lolos dari pemeriksaan.
      "client/src/pages/HomeStage.css",
    ]) {
      const css = source(path);
      expect(
        css.match(/hero-title-word\s*\{[^}]*white-space:\s*nowrap/),
        `${path} mengunci kata hero jadi nowrap`
      ).toBeTruthy();

      const rules = mobileHeroClamps(css);
      expect(
        rules.length,
        `${path} punya aturan judul hero mobile`
      ).toBeGreaterThan(0);
      for (const rule of rules) {
        const fontPx = clampPx(rule.min, rule.vw, rule.max, SMALLEST_PHONE);
        const wordPx = fontPx * HERO_WORD_EM;
        expect(
          wordPx,
          `${path}: clamp(${rule.min}rem, ${rule.vw}vw, ${rule.max}rem) → judul ${wordPx.toFixed(0)}px > ruang ${available}px di layar 320px`
        ).toBeLessThanOrEqual(available);
      }
    }
  });

  it("menjaga judul halaman dalam tetap muat di layar 320px", () => {
    // Judul hero halaman dalam memakai kata terpanjang "NAWASUNDA." pada
    // /about dan /universe. Tanpa batas atas yang ikut lebar layar, kata itu
    // dipenggal `word-break` — terlihat sebagai judul terpotong.
    const css = source("client/src/CinematicReference.css");
    const rules: { min: number; vw: number; max: number }[] = [];
    const mediaRe = /@media\s*\(max-width:\s*([\d.]+)px\)\s*\{/g;
    let media: RegExpExecArray | null;
    while ((media = mediaRe.exec(css))) {
      if (Number(media[1]) > 768) continue;
      let depth = 1;
      let i = media.index + media[0].length;
      const start = i;
      while (i < css.length && depth > 0) {
        if (css[i] === "{") depth += 1;
        else if (css[i] === "}") depth -= 1;
        i += 1;
      }
      const body = css.slice(start, i - 1);
      const ruleRe =
        /(?:nf-page-hero|nf-epk-hero|an-inquiry-hero) h1[^{}]*\{[^}]*?font-size:\s*clamp\(\s*([\d.]+)rem\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)rem\s*\)/g;
      let rule: RegExpExecArray | null;
      while ((rule = ruleRe.exec(body))) {
        rules.push({
          min: Number(rule[1]),
          vw: Number(rule[2]),
          max: Number(rule[3]),
        });
      }
    }
    expect(
      rules.length,
      "aturan judul halaman dalam tidak ditemukan"
    ).toBeGreaterThan(0);
    const available = SMALLEST_PHONE - GUTTER * 2;
    for (const rule of rules) {
      const fontPx = clampPx(rule.min, rule.vw, rule.max, SMALLEST_PHONE);
      const wordPx = fontPx * HERO_WORD_EM;
      expect(
        wordPx,
        `clamp(${rule.min}rem, ${rule.vw}vw, ${rule.max}rem) → judul ${wordPx.toFixed(0)}px > ruang ${available}px di layar 320px`
      ).toBeLessThanOrEqual(available);
    }
  });

  it("tidak memakai 100vw sebagai batas lebar halaman", () => {
    // 100vw ikut menghitung lebar scrollbar desktop, jadi html/body jadi
    // lebih lebar daripada area yang terlihat.
    const css = source("client/src/index.css");
    expect(css).not.toMatch(/max-width:\s*100vw/);
    const motion = source("client/src/components/PublicMotion.css");
    expect(motion).not.toMatch(/width:\s*100vw/);
    expect(motion).not.toMatch(/height:\s*100vh/);
  });

  it("memakai svh untuk tinggi halaman penuh", () => {
    // 100vh di Android selalu seukuran layar tanpa bilah URL, jadi halaman
    // pendek mendapat ruang gulir kosong. svh memakai tinggi yang benar-benar
    // terlihat, dengan 100vh sebagai fallback peramban lama.
    for (const path of [
      "client/src/CinematicReference.css",
      "client/src/pages/EcosystemPages.css",
      "client/src/components/RouteMotion.css",
    ]) {
      const css = source(path);
      expect(css, path).toMatch(
        /min-height:\s*100vh;\s*\n\s*min-height:\s*100svh;/
      );
    }
  });

  it("memberi player sasaran sentuh dan area aman", () => {
    const css = source("client/src/components/signature/GlobalAudioPlayer.css");
    // Tombol 30px cukup untuk kursor, tidak untuk jempol.
    expect(css).toMatch(
      /@media \(pointer: coarse\)[\s\S]*?width: 44px;[\s\S]*?height: 44px;/
    );
    // Bilah gestur Android / home indicator iOS.
    expect(css).toMatch(/bottom:\s*calc\([^)]*env\(safe-area-inset-bottom/);
    // Player melayang tidak boleh menimbun akhir halaman di layar kecil.
    expect(css).toMatch(
      /html\[data-an-player="visible"\] body[\s\S]*?padding-bottom/
    );
    // Tinggi embed audio resmi tetap token yang sama.
    expect(css).toContain("--an-embed-audio-h, 166px");
  });

  it("memakai meta viewport yang aman untuk zoom", () => {
    const html = source("client/index.html");
    expect(html).toContain("viewport-fit=cover");
    // Mematikan zoom adalah pelanggaran aksesibilitas; pastikan tidak ada.
    expect(html).not.toMatch(/user-scalable\s*=\s*no/);
    expect(html).not.toMatch(/maximum-scale\s*=\s*1/);
  });
});
