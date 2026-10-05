#!/usr/bin/env node
/**
 * Audit fondasi CSS/layout.
 *
 * Alat ini TIDAK menggantikan pemeriksaan visual di browser. Fungsinya
 * menjaga kebijakan yang mudah dilanggar tanpa sadar saat redesign:
 *
 *  1. tidak ada lagi `overflow-x: hidden/clip` yang menutupi kebocoran
 *     (satu-satunya pengecualian: `.an-public-shell` di PublicShell.css);
 *  2. tidak ada `font-family` yang menunjuk font yang tidak pernah di-declare
 *     `@font-face` (penyebab seluruh hierarki turun ke font sistem);
 *  3. `100vw` tidak dipakai sebagai lebar/max-width elemen;
 *  4. `!important` tidak bertambah tanpa alasan;
 *  5. `backdrop-filter` tidak kembali ke permukaan publik.
 *
 * Jalankan: `pnpm audit:layout` (atau `node scripts/audit-layout.mjs`).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["client/src", "client/index.html"];
const SHELL_FILE = "client/src/shell/PublicShell.css";

/** File yang memang memuat hukum: satu jaring pengaman di public shell. */
const OVERFLOW_ALLOWLIST = [SHELL_FILE];

const LOCAL_FONTS = [
  // Core type system: semua aset di-host lokal oleh aplikasi.
  "Recons",
  "NEXROID",
  "Good Times",
  "Towards",
  "Noto Sans Sundanese",
  "Fluorite",
];
const FONT_FALLBACKS = [
  "inherit",
  "serif",
  "sans-serif",
  "monospace",
  "system-ui",
  "ui-monospace",
  "ui-serif",
  "ui-sans-serif",
  "apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Menlo",
  "Monaco",
  "Consolas",
  "SFMono-Regular",
  "var(--font-display)",
  "var(--font-body)",
  "var(--font-mono)",
  "var(--font-label)",
  "var(--font-title)",
  "var(--font-signature)",
  "var(--font-sunda)",
  "var(--font-game)",
  "var(--ref-serif-display)",
  "var(--ref-body)",
  "var(--ref-mono)",
];

const files = [];
function walk(target) {
  const abs = join(ROOT, target);
  if (statSync(abs).isDirectory()) {
    for (const entry of readdirSync(abs)) walk(join(target, entry));
  } else if (/\.(css|html)$/.test(target)) {
    files.push(target);
  }
}
SCAN_DIRS.forEach(walk);

const findings = { error: [], warn: [], info: [] };

const importantByFile = [];
const zIndexValues = new Set();

const stripComments = value => value.replace(/\/\*[\s\S]*?\*\//g, "");

for (const file of files) {
  // Komentar berisi contoh/kebijakan, bukan aturan — dibuang sebelum scan.
  const source = stripComments(readFileSync(join(ROOT, file), "utf8"));

  // 1. Overflow masking.
  const overflowMatches = [
    ...source.matchAll(/overflow-x:\s*(hidden|clip)[^;]*;/g),
  ];
  if (overflowMatches.length && !OVERFLOW_ALLOWLIST.includes(file)) {
    findings.error.push(
      `${file}: ${overflowMatches.length}× overflow-x yang menyembunyikan kebocoran (${overflowMatches[0][0]}). Perbaiki elemennya, jangan dipotong.`
    );
  }

  // 2. Font yang tidak pernah dimuat.
  const fontFamilies = [...source.matchAll(/font-family:\s*([^;]+);/g)];
  const declared = new Set();
  for (const entry of source.matchAll(/@font-face\s*\{[^}]*font-family:\s*"([^"]+)"/g)) {
    declared.add(entry[1]);
  }
  for (const entry of fontFamilies) {
    const first = entry[1].split(",")[0].trim().replace(/^["']|["']$/g, "");
    if (!first || first.startsWith("var(")) continue;
    if (LOCAL_FONTS.includes(first) || FONT_FALLBACKS.includes(first)) continue;
    if (declared.has(first)) continue;
    findings.error.push(
      `${file}: font "${first}" dipakai tapi tidak punya @font-face — hierarki akan jatuh ke font sistem.`
    );
  }

  // 3. 100vw.
  if (/100vw/.test(source) && !/IMAGE_SIZES|sizes=/.test(source)) {
    const count = (source.match(/100vw/g) || []).length;
    findings.warn.push(
      `${file}: ${count}× 100vw. Lebar viewport termasuk scrollbar — pakai 100% kecuali untuk kasus yang sudah dijelaskan.`
    );
  }

  // 5. Kaca/blur. `backdrop-filter: none` justru perbaikan, bukan pelanggaran.
  const blur = [...source.matchAll(/(?:-webkit-)?backdrop-filter\s*:\s*([^;]+);/g)]
    .map(match => match[1].trim())
    .filter(value => !/^none$/i.test(value));
  if (blur.length) {
    findings.error.push(
      `${file}: backdrop-filter non-none (${blur[0]}) dilarang di permukaan publik.`
    );
  }

  const important = (source.match(/!important/g) || []).length;
  if (important) importantByFile.push([important, file]);

  for (const match of source.matchAll(/z-index:\s*(-?\d+)/g)) {
    zIndexValues.add(Number(match[1]));
  }
}

importantByFile.sort((a, b) => b[0] - a[0]);
const importantTotal = importantByFile.reduce((sum, [count]) => sum + count, 0);

findings.info.push(
  `!important total: ${importantTotal} — terbanyak: ${importantByFile
    .slice(0, 5)
    .map(([count, file]) => `${file} (${count})`)
    .join(", ")}`
);
findings.info.push(
  `z-index terpakai: ${[...zIndexValues].sort((a, b) => a - b).join(", ")} — samakan dengan skala --z-* di index.css.`
);
findings.info.push(
  "Pemeriksaan yang TIDAK bisa dilakukan skrip ini: overflow nyata, tabrakan fixed player/nav, dan crop gambar. Jalankan di browser pada 360/375/390px."
);

const label = { error: "ERROR", warn: "PERHATIAN", info: "INFO" };
for (const key of ["error", "warn", "info"]) {
  for (const line of findings[key]) {
    console.log(`[${label[key]}] ${line}`);
  }
}

if (findings.error.length) {
  console.error(`\n${findings.error.length} masalah fondasi ditemukan.`);
  process.exit(1);
}
console.log("\nTidak ada pelanggaran kebijakan fondasi.");
console.log(`Scan: ${files.length} file di ${SCAN_DIRS.join(", ")}`);
