# Fase 6D — Judul nyatu, huruf gepeng, tirai yang generik

Tiga keluhan dari pemilik situs. Dua di antaranya ternyata cacat nyata,
bukan selera.

## 1. "AKBAR NAWASUNDA" terbaca menyatu — BUG

[FACT] Penyebabnya: spasi antar kata ditaruh **di dalam** `.hero-title-mask`,
sedangkan mask itu `display: inline-block`. Browser memangkas spasi di ujung
sebuah inline-block, jadi spasinya hilang dan dua kata menempel.
[FACT] Perbaikan: spasi kini jadi simpul saudara mask, bukan anaknya
(`<Fragment>` di `client/src/pages/Home.tsx` dan
`client/src/pages/EnglishPages.tsx`). HTML hasil SSR sekarang:
`…>AKBAR</span></span> <span class="hero-title-mask"…` — spasinya ada.

## 2. Huruf terlihat gepeng — BUG, bukan perasaan

[FACT] Judul diset `letter-spacing: -0.05em` (dan -0.045/-0.055 di breakpoint
lain). Saya render kata itu langsung dari `syne-800.woff2`:
pada -0,05em sampai 0em huruf-hurufnya **benar-benar bertabrakan** — A menyatu
dengan K, K menabrak B. Bukti: `docs/notes/hero-tracking-scan.png` (empat
tracking berjajar) dan `docs/notes/hero-tracking-before-after.png`.
[INTERP] Syne 800 sudah sangat rapat dari perancangnya; merapatkannya lagi
seperti kebiasaan "display font = tracking minus" justru merusaknya.

[FACT] Keputusan: tracking judul jadi **+0,02em** (positif), leading
0,86/0,9/0,94 → 0,94/1,0/1,02, dan `font-weight` 600 → **800** (hanya bobot
800 yang di-host; 600 memancing browser memalsukan bobot). Agar lebar baris
tidak berubah, seluruh clamp dikalikan 0,942 — dihitung dari advance width,
bukan ditebak: `client/src/pages/HomeStage.css`, dan clamp mobile sejenis di
`CinematicReference.css` + `pages/Home.css`.

[FACT] **Kontrak tes berubah dengan sengaja**: `HERO_WORD_EM` di
`server/mobileLayout.test.ts` 11,463 → **12,163 em** ("NAWASUNDA." pada
+0,02em). Tes tetap menjaga hal yang sama: tidak ada kata judul yang melewati
ruang teks di layar 320px.

## 3. Tirai loading yang generik

[FACT] Tirai lama menaikkan dua baris wordmark Latin lalu menyapukan scanline
— gerakan yang bisa ditemukan di ribuan situs.
[FACT] Sekarang isinya nama dalam aksara Sunda (`SUNDA_NAME.script`) yang
tersingkap kiri→kanan lewat `clip-path`, seperti sedang dituliskan; lalu garis
signal menyapu; lalu bacaan Latin kecil dalam mono berjarak lebar sebagai
kunci baca; lalu label tujuan. `client/src/components/signature/RouteSignalCurtain.tsx`
+ `.css`. [INTERP] Yang tidak bisa dipindah ke artis lain bukan gerakannya,
tapi namanya sendiri dalam aksaranya sendiri — jadi itu yang dijadikan isi.
[FACT] Jalur `prefers-reduced-motion` tidak berubah: tirai tidak dirender
sama sekali.

## Verifikasi

[FACT] `pnpm check` 0 galat · `vitest` 56 berkas / **330 tes** lulus ·
`audit-layout` 0 pelanggaran · `pnpm build` sukses · server dijalankan ulang
di `0.0.0.0:4101` · `verify-ssr.sh` **32/32 ALL GREEN**.

## Yang belum dikerjakan

[FACT] Keluhan "semua fontnya kurang khas" belum dijawab di fase ini. Itu
penggantian keluarga huruf untuk badan teks dan label — konsekuensinya besar
(keterbacaan, anggaran font, seluruh skala tipografi) dan arahnya ada
beberapa. Opsinya saya ajukan terpisah agar pemilik situs memilih arah dulu.
