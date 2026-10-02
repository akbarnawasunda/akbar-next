/**
 * Kontrak layout kartu media resmi (`OfficialMediaFrame`) untuk /music dan
 * /visuals, versi Indonesia maupun Inggris.
 *
 * Semua yang dikunci di sini berasal dari masalah nyata yang terlihat di
 * pratinjau: kartu dibingkai dua kali (shelf + kartu + glow), artwork
 * persegi SoundCloud dipotong 16:9, kotak video dipaksa lebih tinggi dari
 * rasionya (`min-height`), dan baris kiri-kanan tidak berakhir di garis
 * yang sama karena `align-items: start` plus kolom 1.32fr/1fr.
 *
 * Tes ini TIDAK memeriksa rendering — hanya menjaga aturan geometrinya
 * tidak kembali. Verifikasi visualnya tetap di browser.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

/** Buang komentar supaya teks dokumentasi tidak terbaca sebagai aturan. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Isi blok `selector { ... }` dengan kurung seimbang. */
function rule(css: string, needle: string) {
  const index = css.indexOf(needle);
  if (index < 0) throw new Error(`selector tidak ditemukan: ${needle}`);
  const start = css.indexOf("{", index);
  let depth = 0;
  for (let i = start; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(start + 1, i);
    }
  }
  throw new Error(`blok tidak tertutup: ${needle}`);
}

const FRAME = "client/src/components/OfficialMediaFrame.css";
const EMBED = "client/src/components/MusicEmbed.css";
const KIT = "client/src/components/editorial/EditorialKit.css";
const MUSIC_STAGE = "client/src/pages/CatalogStage.css";
const VISUAL_STAGE = "client/src/pages/ShowcaseStage.css";

const frame = stripComments(source(FRAME));
const kit = stripComments(source(KIT));
const musicStage = stripComments(source(MUSIC_STAGE));
const visualStage = stripComments(source(VISUAL_STAGE));

describe("kartu media resmi — geometri", () => {
  it("punya satu pemilik: kartu tidak lagi diatur dari berkas shell", () => {
    for (const file of [
      "client/src/shell/EditorialRefresh.css",
      "client/src/CinematicReference.css",
      "client/src/components/MaturePalette.css",
      "client/src/pages/EcosystemPages.css",
    ]) {
      const css = stripComments(source(file));
      for (const selector of [
        ".an-official-media-copy",
        ".an-official-media-actions",
        ".an-official-media-art",
        ".an-official-player-wrap",
      ]) {
        expect(css.includes(selector), `${selector} masih di ${file}`).toBe(
          false
        );
      }
      // `border`/`aspect-ratio` pada kartu hanya boleh datang dari FRAME.
      expect(
        /\.(nf-page|en-page|an-site)\s[^{]*\.an-official-media\s*\{/.test(css),
        `aturan .an-official-media masih ditimpa di ${file}`
      ).toBe(false);
    }
  });

  it("tidak memakai !important di berkas pemiliknya", () => {
    expect(frame.includes("!important")).toBe(false);
  });

  it("tidak menyisakan selektor mati .an-official-player (tanpa -wrap)", () => {
    expect(/\.an-official-player\s*\{/.test(frame)).toBe(false);
    expect(/\.an-official-player\s+iframe/.test(frame)).toBe(false);
  });

  it("memakai satu blok reduced-motion saja", () => {
    expect(frame.match(/prefers-reduced-motion/g) ?? []).toHaveLength(1);
  });

  it("mengisi tinggi baris grid supaya tepi kartu rata", () => {
    const card = rule(frame, ".an-official-media {");
    expect(card).toContain("height: 100%");
    expect(card).toMatch(/grid-template-rows:\s*auto 1fr auto auto/);
    expect(card).toMatch(/min-width:\s*0/);
  });

  it("memberi artwork audio bentuk persegi di samping teks", () => {
    const grid = rule(
      frame,
      ".an-official-media-provider-soundcloud,\n.an-official-media-provider-spotify {"
    );
    expect(grid).toMatch(/grid-template-columns:\s*var\(--media-thumb\)/);
    expect(grid).toMatch(/grid-template-rows:\s*1fr auto auto/);

    const art = rule(
      frame,
      ".an-official-media-provider-soundcloud .an-official-media-art,\n.an-official-media-provider-spotify .an-official-media-art {"
    );
    expect(art).toMatch(/aspect-ratio:\s*1 \/ 1/);
    expect(art).toMatch(/grid-column:\s*1/);

    const copy = rule(
      frame,
      ".an-official-media-provider-soundcloud .an-official-media-copy,\n.an-official-media-provider-spotify .an-official-media-copy {"
    );
    expect(copy).toMatch(/grid-column:\s*2/);
  });

  it("tidak memaksa tinggi kotak video melampaui rasio 16:9", () => {
    const youtube = rule(
      frame,
      ".an-official-media-provider-youtube .an-official-media-art {"
    );
    expect(youtube).toMatch(/aspect-ratio:\s*16 \/ 9/);
    expect(youtube.includes("min-height")).toBe(false);

    const embed = stripComments(source(EMBED));
    const wrap = rule(embed, ".an-embed-youtube .an-embed-frame-wrap {");
    expect(wrap).toMatch(/aspect-ratio:\s*16 \/ 9/);
    expect(wrap.includes("min-height")).toBe(false);
    // Token tinggi audio tetap seperti yang dijaga tes lain.
    expect(embed).toContain("--an-embed-audio-h: 166px");
  });

  it("tampil tanpa bingkai kedua di dalam shelf AudioPlayerShell", () => {
    const nested = rule(frame, ".ed-player__shelf .an-official-media {");
    expect(nested).toMatch(/--media-pad:\s*0/);
    expect(nested).toMatch(/border:\s*0/);
  });

  it("menyamakan padding bar dan isi shelf pada satu token", () => {
    const shell = rule(kit, ".ed-player {");
    expect(shell).toContain("--ed-player-pad");
    expect(rule(kit, ".ed-player__bar {")).toContain("var(--ed-player-pad)");
    expect(rule(kit, "\n.ed-player__body {")).toContain("var(--ed-player-pad)");
  });

  it("membiarkan shelf yang terbuka meregang, tapi tidak saat tertutup", () => {
    const open = rule(
      kit,
      '.ed-player:has(.ed-player__toggle[aria-expanded="true"]) {'
    );
    expect(open).toContain("height: 100%");
    expect(open).toMatch(/grid-template-rows:\s*auto 1fr/);
  });

  it("menyejajarkan kartu pemutar dan kartu video di baris grid", () => {
    const listen = rule(musicStage, ".an-cat-listen-grid {");
    expect(listen).toMatch(/align-items:\s*stretch/);
    expect(listen.includes("align-items: start")).toBe(false);

    const screening = rule(visualStage, ".an-vis-screening-grid {");
    expect(screening).toMatch(/align-items:\s*stretch/);
    expect(screening.includes("1.32fr")).toBe(false);
    expect(screening).toMatch(/minmax\(min\(100%,\s*340px\),\s*1fr\)/);
  });
});

describe("grid media: ritme arsip visual", () => {
  /** Susun kartu memakai penempatan padat seperti grid-auto-flow: dense. */
  function pack(spans: number[], cols = 6) {
    const rows: Set<number>[] = [];
    for (const span of spans) {
      let placed = false;
      for (const row of rows) {
        let run = 0;
        for (let c = 0; c <= cols; c += 1) {
          run = c < cols && !row.has(c) ? run + 1 : 0;
          if (run >= span) {
            for (let k = c - span + 1; k <= c; k += 1) row.add(k);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (!placed) rows.push(new Set(Array.from({ length: span }, (_, i) => i)));
    }
    return rows;
  }

  it("memakai bingkai 16:9 untuk thumbnail video arsip", () => {
    // hqdefault.jpg berbentuk 4:3 dengan bilah hitam; bingkai 16:9 yang
    // memotong bilah itu, sekaligus bentuk asli videonya.
    const media = rule(visualStage, ".an-vis-archive .an-artwork-card-media {");
    expect(media).toMatch(/aspect-ratio:\s*16 \/ 9/);
  });

  it("tidak meninggalkan kolom kosong di baris tengah", () => {
    const css = stripComments(source(VISUAL_STAGE));
    const grid = rule(css, ".an-vis-archive {");
    expect(grid).toMatch(/grid-template-columns:\s*repeat\(6,/);

    // Pola dari CSS: dua kartu lebar (5n+1, 5n+2) lalu tiga kartu normal.
    const spans = (count: number) =>
      Array.from({ length: count }, (_, i) => (i % 5 < 2 ? 3 : 2));
    const wide = rule(css, ".an-vis-archive > :nth-child(5n + 1),");
    expect(wide).toMatch(/grid-column:\s*span 3/);
    expect(rule(css, ".an-vis-archive > * {")).toMatch(
      /grid-column:\s*span 2/
    );

    for (const count of [2, 3, 5, 8]) {
      const rows = pack(spans(count));
      const interior = rows
        .slice(0, -1)
        .reduce((hole, row) => hole + (6 - row.size), 0);
      expect(interior, `${count} kartu menyisakan lubang`).toBe(0);
    }
  });
});
