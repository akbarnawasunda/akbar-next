/**
 * Kontrak komposisi beranda (redesign checkpoint A).
 *
 * Overflow sungguhan hanya terlihat di browser, tapi dua hal bisa dikunci
 * dari sini: (1) lebar kolom tetap pada komposisi baru harus muat di layar
 * 360px, dan (2) aturan strukturalnya tidak boleh dibalik tanpa disadari
 * (foto hero jadi elemen mengalir di ponsel, hero menutup satu viewport
 * penuh di desktop). Semua angka diambil dari file CSS-nya sendiri, jadi
 * tes ikut berubah kalau nilainya memang diubah.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

/** Buang komentar supaya teks dokumentasi tidak terbaca sebagai aturan. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const HOME_STAGE = "client/src/pages/HomeStage.css";
const CHROME = "client/src/shell/ChromeRedesign.css";

/** Isi blok `selector { ... }` pertama yang cocok. */
function block(css: string, selector: string) {
  const index = css.indexOf(selector);
  if (index < 0) throw new Error(`selector tidak ditemukan: ${selector}`);
  const start = css.indexOf("{", index);
  const end = css.indexOf("}", start);
  return css.slice(start + 1, end);
}

const px = (value: number) => value * 16;

describe("komposisi beranda", () => {
  const css = stripComments(source(HOME_STAGE));

  it("menutup satu viewport penuh di desktop tanpa menaruh isi di bawah fold", () => {
    const hero = block(css, ".an-site .an-hero-scene {");
    // Foto ditarik ke bawah masthead, jadi tingginya harus ikut ditambah.
    expect(hero).toContain("min-height: calc(100svh + var(--chrome-h");
    expect(hero).toContain("margin-top: calc(var(--chrome-h");
    // Padding bawah + petunjuk gulir mengimbangi bagian yang tertutup bar.
    expect(hero).toContain("calc(var(--chrome-h, 78px) + clamp(26px, 5vh, 52px))");
    expect(block(css, ".an-site .an-hero-scroll {")).toContain(
      "bottom: calc(var(--chrome-h, 78px) + clamp(18px, 3vh, 30px))"
    );
  });

  it("menjaga maskot hero tetap lencana kecil, bukan menutupi foto", () => {
    // Regresi nyata: `.an-site .an-hero-plate img` (0,2,1) mengalahkan
    // `.an-site .an-hero-mascot` (0,2,0), jadi maskot ikut terentang
    // 100% x 100% dan menutupi foto potret di plate.
    const mascot = block(css, ".an-site .an-hero-mascot {");
    expect(mascot).toContain("position: absolute");
    expect(mascot).toContain("width: clamp(56px, 7vw, 92px)");
    expect(mascot).toContain("max-width: 26%");
    expect(mascot).toContain("object-fit: contain");
    // Aturan ukuran penuh hanya boleh mengenai foto di dalam <picture>.
    expect(css).not.toMatch(/\.an-site \.an-hero-plate img \{/);
    expect(block(css, ".an-site .an-hero-plate .home-hero-picture img {")).toContain(
      "object-fit: cover"
    );
  });

  it("mengubah foto hero jadi elemen mengalir di ponsel", () => {
    const mobile = css.slice(css.indexOf("@media (max-width: 767.98px)"));
    const plate = block(mobile, ".an-site .an-hero-plate {");
    expect(plate).toContain("position: relative");
    expect(plate).toContain("inset: auto");
    expect(plate).toContain("width: 100%");
    expect(plate).toContain("max-height: 68svh");
    // Tanpa aspect-ratio, `max-height` saja membuat foto jadi kolom tipis.
    expect(plate).toContain("aspect-ratio: 4 / 5");
  });

  it("menjaga fakta hero tetap muat di 360px tanpa lebar tetap", () => {
    // Artefak rilisan di hero sudah tidak ada (rilisan cukup diumumkan di
    // papan sinyal + seksi pemutar). Yang dikunci sekarang: fakta hero tetap
    // membungkus dan tidak ada lebar piksel tetap di hero versi ponsel.
    const facts = block(css, ".an-site .an-hero-facts {");
    expect(facts).toContain("flex-wrap: wrap");
    expect(facts).not.toMatch(/width:\s*\d+px/);

    const mobile = css.slice(css.indexOf("@media (max-width: 767.98px)"));
    expect(block(mobile, ".an-site .an-hero-facts {")).toContain(
      "gap: var(--space-md) var(--space-lg)"
    );
    const plate = block(mobile, ".an-site .an-hero-plate {");
    expect(plate).toContain("width: 100%");
    expect(plate).not.toMatch(/width:\s*\d+px/);
  });

  it("menjaga baris kanal resmi tidak melipat di 360px", () => {
    const mobile = css.slice(css.indexOf("@media (max-width: 767.98px)"));
    const row = block(mobile, ".an-site .an-channel {");
    const columns = (
      row.match(/grid-template-columns:([^;]+);/)?.[1].trim() ?? ""
    )
      // Pisahkan per nilai, bukan per spasi: `minmax(0, 1fr)` satu kolom.
      .match(/(?:minmax|min|max)\([^)]*\)|[^\s]+/g) ?? [];
    expect(columns).toHaveLength(3);
    const mark = px(Number.parseFloat(columns[0] ?? "0"));
    const gap = 12; // --space-sm minimum pada 360px
    const arrow = 16; // ikon ArrowUpRight
    const inner = 360 - 22 * 2;
    const left = inner - (mark + gap * 2 + arrow);
    expect(left, `nama kanal hanya kebagian ${left.toFixed(0)}px`).toBeGreaterThanOrEqual(
      150
    );
  });

  it("membatasi lebar kartu rail katalog", () => {
    const mobile = css.slice(css.indexOf("@media (max-width: 767.98px)"));
    const rail = block(mobile, ".an-site .an-rail {");
    const columns = rail.match(/grid-auto-columns:\s*min\((\d+)vw,\s*(\d+)px\)/);
    expect(columns, "rail katalog memakai lebar kolom tetap").toBeTruthy();
    const vw = Number(columns?.[1] ?? "0");
    const cap = Number(columns?.[2] ?? "0");
    const width = Math.min((vw / 100) * 360, cap);
    expect(width).toBeLessThanOrEqual(360 - 22);
  });

  it("tidak menambah `!important` baru di lapisan redesign", () => {
    for (const file of [HOME_STAGE, CHROME]) {
      const content = stripComments(source(file));
      const count = (content.match(/!important/g) ?? []).length;
      expect(count, `${file} menambah !important`).toBe(0);
    }
  });
});

describe("komposisi halaman katalog", () => {
  const css = stripComments(source("client/src/pages/CatalogStage.css"));

  it("menjaga baris kanal resmi katalog muat di 360px", () => {
    const mobile = css.slice(css.indexOf("@media (max-width: 767.98px)"));
    const row = block(mobile, ".an-cat-channels .an-index-row {");
    const columns = (
      row.match(/grid-template-columns:([^;]+);/)?.[1].trim() ?? ""
    ).match(/(?:minmax|min|max)\([^)]*\)|[^\s]+/g) ?? [];
    expect(columns).toHaveLength(3);
    const gap = 12; // --space-sm minimum
    const mark = 20; // lambang platform
    const arrow = 16;
    const inner = 360 - 22 * 2;
    const left = inner - (gap * 2 + mark + arrow);
    expect(
      left,
      `nama kanal hanya kebagian ${left.toFixed(0)}px`
    ).toBeGreaterThanOrEqual(150);
  });

  it("menumpuk hero katalog & detail rilisan jadi satu kolom di layar kecil", () => {
    // Hero katalog sudah satu kolom sejak 1024px; blok catatan/kredit baru
    // menumpuk di 768px. Keduanya harus eksplisit, bukan mengandalkan
    // perilaku grid bawaan.
    const tablet = css.slice(css.indexOf("@media (max-width: 1024px)"));
    expect(block(tablet, ":is(.an-cat-hero, .an-rel-hero) {")).toContain(
      "grid-template-columns: minmax(0, 1fr)"
    );

    const mobile = css.slice(css.indexOf("@media (max-width: 767.98px)"));
    expect(block(mobile, ":is(.an-cat-note, .an-rel-story) {")).toContain(
      "grid-template-columns: minmax(0, 1fr)"
    );
  });

  it("tidak menambah `!important` di lapisan katalog", () => {
    expect((css.match(/!important/g) ?? []).length).toBe(0);
  });
});
