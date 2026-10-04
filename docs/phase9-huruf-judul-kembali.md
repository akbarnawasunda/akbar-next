# Fase 9 — Huruf judul dikembalikan ke Big Shoulders Display

Setelah melihat tampilan hidup situs dengan Unbounded 900 (Fase 8), pemilik
situs menilai hurufnya **kurang cocok untuk judul** dan meminta
dikembalikan ke huruf judul sebelumnya, Big Shoulders Display 800. Ini
koreksi untuk peran JUDUL saja: badan teks (Hanken Grotesk, juga diganti
di Fase 8) **tidak** diminta kembali dan tidak disentuh. Perlakuan solid
(non-outline) pada kata terakhir hero — juga dari Fase 9's perubahan UI
lain — dikonfirmasi TETAP dipertahankan; itu bukan bagian dari keluhan
huruf.

## Roster — sebelum (Fase 8) → sesudah (Fase 9)

| peran | Fase 8 | Fase 9 |
|---|---|---|
| judul / H1 / H2-H3 / wordmark | Unbounded 900 | **Big Shoulders Display 800** (kembali ke Fase 6H) |
| badan teks / UI | Hanken Grotesk 400/500/700 | tetap — di luar keluhan |
| label / angka / konsol | Sometype Mono 400/500 | tetap — di luar keluhan |
| identitas aksara | Noto Sans Sundanese 400 | tetap — di luar keluhan |

`unbounded-900.woff2` dan `UNBOUNDED-LICENSE.txt` dihapus dari repo (bukan
sekadar berhenti dipakai); `big-shoulders-display-800.woff2` dan
`BIG-SHOULDERS-DISPLAY-LICENSE.txt` ditambahkan kembali dengan header
lisensi SIL OFL yang benar. `@font-face` dan token `--font-display`/
`--font-title` di `client/src/index.css` ditulis ulang untuk menunjuk
Big Shoulders Display lagi.

## Clamp judul: dikembalikan ke angka Fase 6H/6E, bukan dihitung baru

Fase 8 menurunkan setiap clamp judul dengan rasio tetap **0,50735**
(= 4,871/9,601, advance width "NAWASUNDA." Big Shoulders Display vs
Unbounded). Karena rasio itu murni geometris (bukan estetis), mengembalikan
huruf berarti mengembalikan clamp dengan rasio **kebalikannya** — hasilnya
secara matematis identik dengan angka asli sebelum Fase 8, bukan
penghitungan baru. Yang disesuaikan balik:

- `server/mobileLayout.test.ts`: `HERO_WORD_EM` **9,601 → 4,871**.
- `client/src/pages/HomeStage.css`: clamp mobile dan clamp desktop (FASE
  4B, literal, diputus dari tangga `--step`) dikembalikan ke angka
  Fase 6H/4B semula.
- `client/src/CinematicReference.css`: kelima clamp family pada
  `.an-site .hero-copy .hero-title-editorial` (dipakai nyata oleh `/en`)
  dan `.nf-page-hero/.nf-epk-hero/.an-inquiry-hero h1` (kode referensi
  tidak terpakai di `.tsx` mana pun, tapi tetap diperiksa
  `mobileLayout.test.ts`) dikembalikan ke lima nilai aslinya.
- `client/src/shell/ChromeRedesign.css`: wordmark header (`.nf-wordmark-text
  strong`, desktop + mobile) dan footer brand dikembalikan ke angka
  Fase 6H semula.
- `client/index.html`: splash `.an-splash-word` — pembagi efektif
  (`/11,05 → /5,4`) dan lantai `max()` (`1,075rem → 2,2rem`) dikembalikan.
- `client/src/pages/Home.css`: satu dari lima aturan
  `.hero-copy .hero-title-editorial` (baris dasar, `font-size`) **ternyata
  tidak pernah disentuh Fase 8** — angkanya sudah cocok dengan huruf
  Big Shoulders Display sepanjang waktu (hanya `font-weight: 900` yang
  perlu dikembalikan ke `800`). Tiga aturan lain di berkas yang sama
  dengan selektor serupa juga tidak cocok dengan pola rescale Fase 8 mana
  pun — kemungkinan besar dibayangi (shadowed) oleh
  `CinematicReference.css` dalam cascade CSS untuk halaman yang memakainya
  (keduanya spesifisitas sama, `CinematicReference.css` dimuat global di
  `main.tsx` sebelum CSS per-halaman) — dibiarkan apa adanya.
- `client/src/components/signature/SignatureStage.css` dan
  `client/src/pages/HomeStage.css` (`.an-section-num`, `.an-channel-index`,
  `.an-feature-type`): `font-weight: 900 → 800`.
- `client/src/pages/HomeStage.css`: kolom grid `.an-channel` yang
  dilebarkan di Fase 8 (3,2rem→3,8rem desktop, 2rem→3,6rem mobile) supaya
  angka Romawi muat di Unbounded yang lebar, dikembalikan ke lebar aslinya
  — "VIII" di Big Shoulders Display 800 (kondensasi) muat nyaman di kolom
  semula.
- `client/src/signature/field/particleField.ts`: `WORDMARK_FONT` dan bobot
  canvas (`900 → 800`) dikembalikan; `canvas.measureText()`-nya sendiri
  tidak perlu disentuh (otomatis mengecilkan `fontSize` kalau kata lebih
  lebar dari kolom).
- `scripts/audit-layout.mjs`: daftar `LOCAL_FONTS` ditukar balik.
- `server/editorialOptimization.test.ts`: aset Unbounded dipindah ke
  daftar "harus hilang", aset Big Shoulders Display dipindah ke daftar
  "harus ada"; assertion `indexCss` disesuaikan.

## [TAFSIR] Tracking (letter-spacing) sengaja TIDAK dikembalikan

Fase 8 melucuti 159 aturan letter-spacing negatif menjadi `0em` di 30
berkas (lihat `docs/phase8-ganti-huruf-lagi.md`). Nilai negatif ASLI per
aturan itu tidak disimpan di mana pun (bukan dihitung dari rasio seperti
clamp ukuran), jadi tidak ada cara presisi untuk mengembalikannya. Karena
tracking `0em` aman untuk huruf manapun (tidak pernah menambah risiko
huruf bertabrakan dibanding tracking negatif), keputusan di fase ini
adalah **membiarkannya di `0em`** alih-alih menebak nilai lama. Ini
kompromi yang disengaja, bukan kelalaian — kalau pemilik situs ingin
tracking yang lebih rapat untuk Big Shoulders Display dikembalikan, itu
permintaan susulan yang terpisah.

## Perlakuan solid hero TIDAK dilucuti

Kata terakhir hero sempat jadi garis luar (`-webkit-text-stroke`, hollow)
lalu dicabut jadi solid karena terlihat seperti glitch di atas Unbounded
900 yang sangat tebal. Perubahan ini **dipertahankan** meski huruf sudah
kembali ke Big Shoulders Display — dikonfirmasi langsung bahwa keluhan
tampilan "lebih bagus dulu" adalah soal HURUF, bukan soal solid/outline-nya
(yang justru dikonfirmasi TIDAK ingin dikembalikan setelah melihat
referensi tampilan lama).

## Berkas yang disentuh

`client/src/index.css`, `client/src/CinematicReference.css`,
`client/src/pages/Home.css`, `client/src/pages/HomeStage.css`,
`client/src/shell/ChromeRedesign.css`, `client/src/shell/EditorialRefresh.css`,
`client/src/components/signature/SignatureStage.css`,
`client/src/signature/field/particleField.ts`, `client/index.html`,
`scripts/audit-layout.mjs`, `server/mobileLayout.test.ts`,
`server/editorialOptimization.test.ts`,
`client/public/assets/fonts/fontsource/` (unbounded dihapus,
big-shoulders-display-800 + lisensinya ditambah kembali).

## Verifikasi

`pnpm vitest run` (330/330 hijau), `pnpm run check` (tsc bersih),
`pnpm run audit:layout` (tidak ada pelanggaran), `pnpm run build`
(sukses, client + SSR + API bundle).
