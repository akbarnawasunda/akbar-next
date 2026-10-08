/**
 * Lantai ukuran teks mikro di seluruh CSS publik.
 *
 * Regresi yang dijaga di sini nyata dan pernah masuk dua kali: di blok
 * `@media (max-width: …)` ukuran teks justru DIPERKECIL dari versi
 * desktopnya sampai di bawah lantai mikro situs (0,5rem) —
 * `.game-page-footer` dan `.jedag-run-footer` sama-sama dipaksa `0,48rem`
 * (7,7px), padahal isinya skor, label rute, dan hak cipta. Teks sekecil itu
 * tidak terbaca di ponsel 360–390px.
 *
 * Ukuran teks di dalam berkas CSS tidak pernah muncul di HTML hasil render,
 * jadi tes source memang satu-satunya cara memeriksanya (docs/notes/
 * testing-policy.md poin 3: "tes source hanya untuk yang memang tidak muncul
 * di HTML: aturan CSS"). Semua angka diambil dari nilai deklarasinya sendiri,
 * bukan dari daftar nilai yang diharapkan, jadi memperbesar teks tetap hijau.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(process.cwd(), "client/src");
const SCAN_ROOT = "client/src";

/**
 * Deklarasi yang memang di bawah lantai. Tidak ada lagi: tagline wordmark
 * (satu-satunya pengecualian lama) sudah tidak dirender di masthead —
 * navigasi dirapikan di docs/desktop-visual-qa-cursor-pass.md §1, dan entri
 * pengecualian ini ikut dihapus seperti yang diperintahkan komentarnya.
 * Jangan tambah entri baru tanpa alasan peran yang sama jelasnya.
 */
const ALLOWED: { file: string; contains: string; reason: string }[] = [];

/** Nilai absolut terkecil yang boleh dipakai teks apa pun, dalam px. */
const FLOOR_PX = 8; // 0,5rem

const cssFiles: string[] = [];
(function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs);
    else if (entry.endsWith(".css")) cssFiles.push(abs);
  }
})(ROOT);

/** Buang komentar supaya teks dokumentasi tidak terbaca sebagai deklarasi. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * Ubah satu nilai `font-size` jadi px absolut, atau `null` kalau nilainya
 * relatif/tidak bisa dipastikan tanpa cascade (em, var(), calc(), 0).
 * Untuk `clamp()` yang diambil adalah batas bawahnya — itulah teks terkecil
 * yang mungkin dirender.
 */
function floorPx(value: string): number | null {
  const v = value.trim().replace(/\s*!important$/, "").trim();
  const clamp = v.match(/^clamp\(([^,]+),/);
  const target = (clamp ? clamp[1] : v).trim();
  if (target === "0") return 0;
  const rem = target.match(/^([\d.]+)rem$/);
  if (rem) return Number(rem[1]) * 16;
  const px = target.match(/^([\d.]+)px$/);
  if (px) return Number(px[1]);
  return null;
}

const declarations: {
  file: string;
  selector: string;
  value: string;
  px: number;
}[] = [];

for (const abs of cssFiles) {
  const file = relative(process.cwd(), abs).split("\\").join("/");
  const css = stripComments(readFileSync(abs, "utf8"));
  // Pencocokan blok sederhana: nama selektor adalah teks sebelum `{` terdekat.
  // Untuk aturan di dalam `@media`, teks itu ikut memuat pembuka media query —
  // tidak masalah, yang diperiksa hanya ekor selektornya.
  const blockRe = /([^{}]*)\{([^{}]*)\}/g;
  let block: RegExpExecArray | null;
  while ((block = blockRe.exec(css))) {
    const selector = block[1].trim().replace(/\s+/g, " ").split("\n").pop() ?? "";
    const sizeRe = /(?:^|;)\s*font-size:\s*([^;]+)/g;
    let size: RegExpExecArray | null;
    while ((size = sizeRe.exec(block[2]))) {
      const px = floorPx(size[1]);
      if (px === null) continue;
      declarations.push({ file, selector: selector.trim(), value: size[1].trim(), px });
    }
  }
}

describe("lantai ukuran teks mikro", () => {
  it("memindai berkas CSS di client/src", () => {
    // Menjaga tes ini sendiri: kalau pemindai rusak, ia harus gagal, bukan
    // diam-diam lolos tanpa memeriksa apa pun.
    expect(cssFiles.length).toBeGreaterThan(50);
    expect(declarations.length).toBeGreaterThan(400);
  });

  it(`tidak ada font-size di bawah ${FLOOR_PX}px (0,5rem) di luar pengecualian`, () => {
    const offenders = declarations
      .filter(d => d.px > 0 && d.px < FLOOR_PX)
      .filter(
        d =>
          !ALLOWED.some(
            allowed => d.file === allowed.file && d.selector.includes(allowed.contains)
          )
      )
      .map(d => `${d.file} → ${d.selector} (${d.value} = ${d.px.toFixed(2)}px)`);

    expect(
      offenders,
      `teks di bawah ${FLOOR_PX}px tidak terbaca di ponsel:\n${offenders.join("\n")}`
    ).toEqual([]);
  });

  it("tetap mencatat pengecualian yang sudah tidak berlaku", () => {
    // Pengecualian yang sudah tidak berlaku harus hilang dari daftar —
    // kalau tidak, ia jadi izin lama yang membusuk.
    for (const allowed of ALLOWED) {
      const stillSmall = declarations.some(
        d =>
          d.file === allowed.file &&
          d.selector.includes(allowed.contains) &&
          d.px > 0 &&
          d.px < FLOOR_PX
      );
      expect(
        stillSmall,
        `pengecualian tidak lagi diperlukan (${allowed.reason}): ` +
          `${allowed.file} → ${allowed.contains}`
      ).toBe(true);
    }
  });
});
