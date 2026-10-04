# Fase 6E — Huruf judul diganti, lalu disetel berani (pilihan A + C)

Pemilik situs memilih arah **A + C**: ganti satu font judul, lalu setel keras.

## Kenapa Syne dibuang

[FACT] Enam huruf display dirender dari berkas fontnya langsung, pada
**lebar baris yang sama persis** — `docs/notes/display-candidates.png`.
Hasil ukur kata "NAWASUNDA." (upem 1000, termasuk tracking +0,02em):

| huruf | lebar kata | tinggi relatif pada lebar sama |
|---|---|---|
| Syne 800 | 12,163 em | paling kecil |
| Unbounded 800 | ±11,9 em | kecil |
| Bricolage Grotesque 800 | ±9,4 em | sedang |
| Archivo Black | ±8,9 em | sedang |
| Anton | 4,9 em | besar |
| **Big Shoulders Display 800** | **4,871 em** | **besar** |

[INTERP] Inilah akar rasa "judulnya kurang bersuara": Syne menulis sangat
lebar, jadi agar muat di kolom hero ia harus dikecilkan terus sampai nyaris
tidak terdengar. Big Shoulders menulis kata yang sama 2,5× lebih ringkas,
jadi pada lebar baris yang sama ia bisa 2,5× lebih tinggi.
[INTERP] Anton punya ukuran yang mirip tetapi dibuang justru karena terlalu
dikenal — ia huruf poster default di mana-mana, lawan dari "khas".
[INTERP] Potongan diagonal pada A/K/W/N Big Shoulders seirama dengan sudut
aksara Sunda yang berdiri tepat di bawahnya di hero.

## Yang berubah

[FACT] `client/public/assets/fonts/fontsource/big-shoulders-display-800.woff2`
(14.556 B) masuk; `syne-800.woff2` + lisensinya **dihapus**. Total font
218.048 B (sebelumnya 208.392 B; +9,7 kB).
[FACT] `@font-face` dan token `--font-title` di `client/src/index.css`;
preload di `client/index.html` ikut berganti berkas.
[FACT] Bagian "C" — setelan berani: seluruh clamp judul dinaikkan sesuai
rasio 12,163 : 4,871, jadi **lebar barisnya tidak berubah sedikit pun**,
hanya tingginya. Hero desktop `clamp(2.04rem, 7.01vw, 7.01rem)` →
`clamp(5.2rem, 17.4vw, 17.4rem)`; mobile → `clamp(2.6rem, 17.2vw, 5.6rem)`;
splash pembuka → `clamp(4.4rem, 25vw, 12rem)`.
[FACT] Judul halaman dalam (kalimat, bukan wordmark) hanya dinaikkan ±1,5×
supaya tetap kalimat yang bisa dibaca, bukan poster.
[FACT] `scripts/audit-layout.mjs`: "Syne" **dikeluarkan** dari daftar font
lokal dan diganti "Big Shoulders Display", supaya sisa pemakaian Syne
langsung terdeteksi sebagai pelanggaran.

[FACT] **Kontrak tes berubah dengan sengaja** (ketiga kalinya, dan alasannya
tercatat di berkasnya): `HERO_WORD_EM` di `server/mobileLayout.test.ts`
12,163 → **4,871**. Yang dijaga tetap sama: tidak ada kata judul yang
melewati ruang teks di layar 320px.

## Verifikasi

[FACT] `pnpm check` 0 galat · `vitest` 56 berkas / **330 tes** ·
`audit-layout` **0 pelanggaran** · `pnpm build` · server di-restart di
`0.0.0.0:4101` · `verify-ssr` **32/32 ALL GREEN** · berkas font terlayani
200 / 14.556 B.

## Risiko yang belum terbukti

[FACT] Tidak ada browser di sandbox. Ukuran baru dihitung dari advance width
sehingga lebar baris dijamin tidak berubah, tetapi **tinggi** judul kini
2,5× — tumpukan vertikal hero (judul → pelat aksara → lede) belum pernah
dilihat mata di browser. Ini hal pertama yang harus dicek pemilik situs.
