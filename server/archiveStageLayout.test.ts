/**
 * Kontrak komposisi arsip & profil (redesign checkpoint D).
 *
 * Overflow sungguhan hanya terlihat di browser; yang bisa dikunci dari sini
 * adalah aturan yang menyebabkannya: lebar kolom tetap pada layar kecil,
 * judul hero yang harus muat di 320px, dan struktur scene yang tidak boleh
 * dibalik tanpa disadari. Semua angka dibaca dari file CSS-nya sendiri.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const ARCHIVE_STAGE = "client/src/pages/ArchiveStage.css";
const SCENE_KIT = "client/src/shell/SceneKit.css";

/** Isi blok `selector { ... }` pertama yang cocok. */
function block(css: string, selector: string) {
  const index = css.indexOf(selector);
  if (index < 0) throw new Error(`selector tidak ditemukan: ${selector}`);
  const start = css.indexOf("{", index);
  const end = css.indexOf("}", start);
  return css.slice(start + 1, end);
}

/** Isi satu blok @media berdasarkan awalan query-nya. */
function media(css: string, query: string) {
  const index = css.indexOf(query);
  if (index < 0) throw new Error(`media query tidak ditemukan: ${query}`);
  const start = css.indexOf("{", index);
  let depth = 1;
  let i = start + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") depth -= 1;
    i += 1;
  }
  return css.slice(start + 1, i - 1);
}

const clampPx = (minRem: number, vw: number, maxRem: number, viewport: number) =>
  Math.max(minRem * 16, Math.min((vw / 100) * viewport, maxRem * 16));

/** Lebar kata "NAWASUNDA." dalam em — jalur terpanjang di judul halaman. */
const WORD_EM = 6.963;

describe("komposisi arsip & profil", () => {
  const css = stripComments(source(ARCHIVE_STAGE));

  it("tidak menyembunyikan kebocoran dan tidak menambah !important", () => {
    expect(css).not.toMatch(/overflow-x:\s*(hidden|clip)/);
    expect(css).not.toContain("!important");
    expect(css).not.toMatch(/backdrop-filter/);
    expect(css).not.toMatch(/100vw/);
    expect((css.match(/{/g) ?? []).length).toBe((css.match(/}/g) ?? []).length);
  });

  it("memakai satu definisi lebar halaman untuk rute .nf-page", () => {
    const kit = stripComments(source(SCENE_KIT));
    // `--hx-max` dulu hanya ada di Home.css (.an-site); tanpa definisi ini
    // max-width: var(--hx-max) tidak resolves di /universe dan /about.
    expect(kit).toMatch(
      /:is\(\.an-site, \.nf-page, \.en-page\)\s*\{\s*--hx-max:\s*\d+px;/
    );
  });

  it("menjatuhkan hero arsip & profil jadi satu kolom di tablet", () => {
    const tablet = media(css, "@media (max-width: 1024px)");
    expect(block(tablet, ".an-arc-hero,")).toContain(
      "grid-template-columns: minmax(0, 1fr)"
    );
    expect(block(tablet, ".an-ab-hero {")).toContain(
      "grid-template-columns: minmax(0, 1fr)"
    );
    // Aside yang lengket tidak boleh tetap sticky saat kolomnya sudah satu.
    expect(block(tablet, ".an-arc-origin-head,")).toContain("position: static");
  });

  it("menjaga judul hero tetap muat di layar 320px", () => {
    const mobile = media(css, "@media (max-width: 767.98px)");
    const rule = block(mobile, ".an-arc-hero-copy h1,");
    const match = rule.match(
      /font-size:\s*clamp\(\s*([\d.]+)rem\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)rem\s*\)/
    );
    expect(match, "clamp judul hero arsip").not.toBeNull();
    const [, min, vw, max] = match as RegExpMatchArray;
    // Gutter dalam halaman pada 320px = clamp(22px, 6vw, 104px) → 22px.
    const available = 320 - 22 * 2;
    const wordPx = clampPx(Number(min), Number(vw), Number(max), 320) * WORD_EM;
    expect(
      wordPx,
      `judul ${wordPx.toFixed(0)}px > ruang ${available}px`
    ).toBeLessThanOrEqual(available);
  });

  it("menyusun dinding artwork 5+3+4 / 4+3+5 pada dua belas kolom", () => {
    const spans = [
      ...block(css, ".an-arc-wall-item:nth-child(1)").matchAll(
        /grid-column:\s*span\s+(\d+)/g
      ),
      ...block(css, ".an-arc-wall-item:nth-child(2)").matchAll(
        /grid-column:\s*span\s+(\d+)/g
      ),
      ...block(css, ".an-arc-wall-item:nth-child(3),").matchAll(
        /grid-column:\s*span\s+(\d+)/g
      ),
    ].map(match => Number(match[1]));
    expect(spans).toEqual([5, 3, 4]);
    expect(block(css, ".an-arc-wall-grid {")).toContain(
      "repeat(12, minmax(0, 1fr))"
    );
  });

  it("mengubah dinding artwork jadi dua kolom di ponsel", () => {
    const mobile = media(css, "@media (max-width: 767.98px)");
    expect(block(mobile, ".an-arc-wall-grid {")).toContain(
      "repeat(2, minmax(0, 1fr))"
    );
    // Semua item harus kembali ke satu kolom grid, apa pun urutannya.
    expect(block(mobile, ".an-arc-wall-item:nth-child(n) {")).toContain(
      "grid-column: span 1"
    );
    expect(
      block(mobile, ".an-arc-wall-item:nth-child(n) .an-arc-wall-art {")
    ).toContain("aspect-ratio: 1 / 1");
  });

  it("memberi rantai <picture> acuan tinggi supaya crop benar", () => {
    expect(block(css, ".an-arc-wall-art > picture {")).toContain(
      "height: 100%"
    );
    expect(block(css, ".an-arc-wall-art img {")).toContain("object-fit: cover");
  });

  it("memberi band potret tinggi berbasis viewport, bukan px tetap", () => {
    const band = block(css, ".an-ab-band-plate {");
    expect(band).toMatch(/height:\s*clamp\([^)]*vw[^)]*\)/);
    expect(block(css, ".an-ab-band-plate img {")).toContain("object-fit: cover");
  });

  it("mematikan gerak saat pengunjung memintanya", () => {
    const reduced = media(css, "@media (prefers-reduced-motion: reduce)");
    expect(reduced).toContain("transition: none");
    expect(reduced).toContain("transform: none");
  });
});
