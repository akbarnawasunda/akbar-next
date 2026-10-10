/**
 * Kontrak komposisi EPK & Inquiry (redesign checkpoint E).
 *
 * Dua halaman yang paling banyak dipakai orang lain (promotor, media,
 * kolaborator), jadi aturan yang dikunci di sini bukan soal selera: ukuran
 * sasaran sentuh, kolom yang tetap muat di layar kecil, dan bukti bahwa
 * panel kontak EPK tetap terang di atas halaman gelap.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "./test-renderer";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Teks yang benar-benar dilihat pengunjung, tanpa tag dan komentar React. */
const visibleText = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const PRESS_STAGE = "client/src/pages/PressStage.css";
const INQUIRY_STAGE = "client/src/pages/InquiryStage.css";

function block(css: string, selector: string) {
  const index = css.indexOf(selector);
  if (index < 0) throw new Error(`selector tidak ditemukan: ${selector}`);
  const start = css.indexOf("{", index);
  const end = css.indexOf("}", start);
  return css.slice(start + 1, end);
}

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

/** Lebar kata "NAWASUNDA." dalam em — jalur judul terpanjang. */
const WORD_EM = 6.963;

describe("komposisi EPK", () => {
  const css = stripComments(source(PRESS_STAGE));

  it("tidak menyembunyikan kebocoran dan tidak menambah !important", () => {
    expect(css).not.toMatch(/overflow-x:\s*(hidden|clip)/);
    expect(css).not.toContain("!important");
    expect(css).not.toMatch(/100vw/);
    expect((css.match(/{/g) ?? []).length).toBe((css.match(/}/g) ?? []).length);
  });

  it("menjaga judul hero muat di layar 320px", () => {
    const mobile = media(css, "@media (max-width: 767.98px)");
    const match = block(mobile, ".an-press-hero-copy h1").match(
      /font-size:\s*clamp\(\s*([\d.]+)rem\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)rem\s*\)/
    );
    expect(match, "clamp judul EPK").not.toBeNull();
    const [, min, vw, max] = match as RegExpMatchArray;
    const available = 320 - 22 * 2;
    const wordPx = clampPx(Number(min), Number(vw), Number(max), 320) * WORD_EM;
    expect(wordPx).toBeLessThanOrEqual(available);
  });

  it("menjatuhkan hero dan panel kontak jadi satu kolom", () => {
    const tablet = media(css, "@media (max-width: 1024px)");
    // Hero, ringkasan, dan panel kontak semuanya kembali satu kolom.
    for (const selector of [
      ".an-press-hero,",
      ".an-press-summary,",
      ".an-press-contact {",
    ]) {
      expect(tablet, selector).toContain(selector);
    }
    expect(tablet).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(tablet).toContain("align-items: start");
  });

  it("memberi baris aset satu kolom di ponsel supaya label aksi tidak terjepit", () => {
    const mobile = media(css, "@media (max-width: 767.98px)");
    expect(block(mobile, ".an-press-asset-list .an-index-row")).toContain(
      "grid-template-columns: minmax(0, 1fr)"
    );
    expect(block(mobile, ".an-press-asset-action")).toContain(
      "white-space: normal"
    );
  });

  it("menjaga panel kontak tetap terbaca di atas kertas", () => {
    // Panel ini satu-satunya permukaan terang (EpkReady.css mengunci
    // latarnya ke --paper), jadi teks di dalamnya wajib warna gelap.
    expect(block(css, ".an-press-contact-copy h2 {")).toContain(
      "color: var(--ink)"
    );
    expect(block(css, ".an-press-contact-link {")).toContain("color: var(--ink)");
  });
});

describe("komposisi Inquiry", () => {
  const css = stripComments(source(INQUIRY_STAGE));

  it("tidak menyembunyikan kebocoran dan tidak menambah !important", () => {
    expect(css).not.toMatch(/overflow-x:\s*(hidden|clip)/);
    expect(css).not.toContain("!important");
    expect(css).not.toMatch(/100vw/);
    expect((css.match(/{/g) ?? []).length).toBe((css.match(/}/g) ?? []).length);
  });

  it("memberi sasaran sentuh yang layak pada tombol dan field", () => {
    expect(block(css, ".an-inq-type-row button {")).toContain("min-height: 44px");
    expect(css).toMatch(
      /\.an-inq-grid input,[\s\S]{0,240}?min-height:\s*48px/
    );
    // Jempol di layar sentuh dapat tombol kirim yang lebih tinggi lagi.
    const coarse = media(css, "@media (pointer: coarse)");
    expect(coarse).toContain(".an-inq-submit");
    expect(coarse).toContain("min-height: 48px");
  });

  it("menyisakan cincin fokus yang terlihat pada input", () => {
    const focus = block(css, "input:focus-visible,");
    expect(focus).toContain("outline: 2px solid");
    expect(focus).toContain("outline-offset: 2px");
  });

  it("menjatuhkan formulir jadi satu kolom di ponsel", () => {
    const mobile = media(css, "@media (max-width: 767.98px)");
    expect(block(mobile, ".an-inq-grid {")).toContain(
      "grid-template-columns: minmax(0, 1fr)"
    );
    expect(block(mobile, ".an-inq-form {")).toContain("padding: 18px 16px");
  });
});

describe("EPK & Inquiry yang benar-benar terkirim", () => {
  it("mengirim fact sheet, aset resmi, dan panel kontak di /epk", async () => {
    const { html } = await render("/epk", {
      documents: async () => [] as never,
    });
    const text = visibleText(html);
    for (const marker of [
      "an-press-hero",
      "an-press-sheet-facts",
      "an-press-capability-list",
      "an-press-asset-list",
      "an-press-contact",
      "an-epk-contact-panel",
    ]) {
      expect(html, marker).toContain(marker);
    }
    expect(text).toContain("SAVE / PRINT EPK");
    expect(text).toContain("Aset yang tersedia secara resmi");
    expect(text).toContain("Request material");
  });

  it("mengirim formulir inquiry lengkap dengan labelnya di /inquire", async () => {
    const { html } = await render("/inquire?type=remix&source=epk", {
      documents: async () => [] as never,
    });
    const text = visibleText(html);
    expect(html).toContain("an-inq-form");
    expect(html).toContain("an-inq-type-row");
    // Empat jenis inquiry tetap bisa dipilih.
    for (const type of ["booking", "remix", "collaboration", "licensing"]) {
      expect(html, type).toContain(`>${type}</button>`);
    }
    // Field wajib tetap ada sebagai kontrol berlabel.
    expect(html.match(/<input/g)?.length ?? 0).toBeGreaterThanOrEqual(7);
    expect(html).toContain("<textarea");
    expect(text).toContain("KIRIM INQUIRY");
    expect(text).toContain("Remix inquiry.");
  });
});
