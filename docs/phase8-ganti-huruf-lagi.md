# Fase 8 — Huruf diganti lagi (dan dampaknya ke seluruh clamp judul)

Pemilik situs menilai roster Fase 6H ("Big Shoulders Display" + "Schibsted
Grotesk") **"jelek banget, basic"** dan secara eksplisit membatalkan
larangan ganti-huruf yang berdiri sejak Fase 6H/7 — khusus untuk permintaan
ini. Arahnya: sesuatu yang berkarakter, bukan grotesque generik lagi.

## Roster lama → baru

| peran | sebelum (Fase 6H) | sesudah (Fase 8) |
|---|---|---|
| judul / H1 / H2-H3 / wordmark | Big Shoulders Display 800 | **Unbounded 900** |
| badan teks / UI | Schibsted Grotesk 400/500/700 | **Hanken Grotesk 400/500/700** |
| label / angka / konsol | Sometype Mono 400/500 | tetap — di luar keluhan |
| identitas aksara | Noto Sans Sundanese 400 | tetap — di luar keluhan |

[FACT] Dasar pemilihan: perbandingan render fontTools pada frasa sungguhan
("AKBAR NAWASUNDA." + kalimat badan) di tiga skala — huruf lama, Unbounded
800, dan Unbounded 900 — disimpan di `docs/notes/font-candidate-preview.png`.
Pemilik situs memilih opsi Unbounded **900** setelah melihat gambar itu.

[FACT] Total unduhan huruf turun **114.012 B → 86.956 B** (-23,7%):
`unbounded-900.woff2` 21.112 B, `hanken-grotesk-{400,500,700}.woff2`
13.460/13.796/13.844 B — menggantikan `big-shoulders-display-800.woff2`
(14.556 B) dan `schibsted-grotesk-{400,500,700}.woff2` (≈24.344 B/bobot).
Huruf lama dan lisensinya dihapus dari repo, bukan sekadar berhenti
dipakai; `UNBOUNDED-LICENSE.txt` dan `HANKEN-GROTESK-LICENSE.txt`
ditambahkan dengan header lisensi yang benar.

## [FAKTA KRITIS] Unbounded jauh lebih lebar — seluruh clamp judul ikut berubah

Ini bukan sekadar tukar nama font di token CSS. Diukur dari advance width
glyph (fontTools, upem 1000) pada kata terpanjang yang dipakai judul hero,
**"NAWASUNDA."** (termasuk titik):

| huruf | advance width murni | + tracking +0,02em/huruf (10 huruf) |
|---|---|---|
| Big Shoulders Display 800 | 4,671em | **4,871em** |
| Unbounded 900 | 9,401em | **9,601em** |

[TAFSIR] Unbounded adalah huruf geometris **lebar** (bukan kondensasi
seperti Big Shoulders Display) — ia menulis kata yang sama hampir **2×**
lebih lebar per karakter. Karena huruf judul dipakai pada clamp yang
dikalibrasi presisi ke lebar kolom hero (supaya "NAWASUNDA." tidak
terpotong di layar 320px, kontrak `server/mobileLayout.test.ts` sejak Fase
6E), mengganti hurufnya TANPA menyesuaikan angka clamp akan membuat judul
meluap dari kolom di hampir semua halaman. Ini terverifikasi: sebelum
clamp disesuaikan, setiap aturan judul mobile yang sebelumnya pas ternyata
overflow 15-95% dari ruang yang tersedia di layar 320px.

[FACT] Rasio penyesuaian yang dipakai di seluruh berkas:
**0,50735 (= 4,871 / 9,601)**. Setiap clamp judul (`min`, koefisien `vw`,
`max`) diturunkan dengan rasio yang sama — ini secara matematis identik
dengan menghitung ulang dari lebar kolom asli ÷ advance width baru, tapi
jauh lebih cepat diverifikasi karena hasilnya PERSIS mempertahankan lebar
baris di setiap lebar layar, sama seperti sebelum penggantian huruf.

### Clamp yang disesuaikan

- `server/mobileLayout.test.ts`: `HERO_WORD_EM` **4,871 → 9,601**.
- `client/src/pages/HomeStage.css`: clamp mobile (`2,25rem,15,5vw,5,062rem`
  → `1,142rem,7,864vw,2,568rem`) dan clamp desktop FASE 4B
  (`var(--step-4),14vw,12,8rem` → `2,568rem,7,103vw,6,494rem`, literal —
  sengaja diputus dari tangga `--step` umum, lihat komentar di berkas).
  Ini judul hero BERANDA (ID) yang sungguh dirender, bukan kode mati.
- `client/src/CinematicReference.css`: `.an-site .hero-copy
  .hero-title-editorial` (dipakai nyata oleh `/en`,
  `clamp(3rem,16,7vw,5,8rem)` → `clamp(1,522rem,8,473vw,2,943rem)`, 4
  salinan + 1 basis desktop) dan `.nf-page-hero/.nf-epk-hero/.an-inquiry-hero
  h1` (kode referensi tidak terpakai di `.tsx` mana pun, tapi tetap
  diperiksa `mobileLayout.test.ts` — 5 aturan disesuaikan supaya kontrak
  tetap hijau).
- `client/src/shell/ChromeRedesign.css`: wordmark header (`.nf-wordmark-text
  strong`, `white-space: nowrap`, dipakai di SEMUA halaman) diturunkan
  ×0,5645 (rasio terpisah karena memakai "Akbar Nawasunda" + tracking
  0,04em, bukan "NAWASUNDA." all-caps) — `1,16rem → 0,655rem` (desktop),
  `0,9rem → 0,508rem` (mobile). Footer brand (boleh membungkus, risiko
  lebih rendah) diturunkan ×0,5594 untuk proporsi yang sepadan.
- `client/index.html`: splash `.an-splash-word` — pembagi efektif
  (`/5,4`, bukan `/4,6` atau `/4,75` seperti disebut komentar lama yang
  sudah tidak sinkron) dan lantai `max()` (`2,2rem`) diturunkan rasio yang
  sama (`/11,05` dan `1,075rem`) memakai advance width "NAWASUNDA" tanpa
  titik (huruf besar dari `text-transform`): 4,523em → 9,253em.

[FACT] `client/src/signature/field/particleField.ts` **tidak perlu**
disesuaikan manual — ia memakai `canvas.measureText()` untuk mengukur
lebar nyata lalu mengecilkan `fontSize` otomatis kalau kata lebih lebar
dari kolom (`if (widest > maxTextWidth) ...`). Cukup ganti
`WORDMARK_FONT` dan bobot `800 → 900`.

## [TAFSIR] Tracking negatif dilucuti dari 159 aturan judul

[FACT] Hampir semua h1-h4/`--font-title`/`--font-display` di situs ini
memakai `letter-spacing` NEGATIF (-0,02em sampai -0,075em), ditala untuk
Big Shoulders Display — huruf yang kondensasi/rapat dari sananya. Unbounded
geometris dan lebih longgar; tracking negatif pada huruf selebar ini
berisiko nyata membuat huruf bertabrakan (pelajaran yang sama persis dari
Fase 6D, didokumentasikan di `docs/notes/hero-tracking-scan.png` untuk
Syne 800).

[FACT] Karena situs tidak punya browser nyata untuk verifikasi visual per
halaman, dan 159 aturan tersebar di 30 berkas CSS, dilakukan **sapuan
mekanis**: setiap aturan dengan selektor heading (`h1`-`h4`) ATAU yang
eksplisit memakai `var(--font-title)`/`var(--font-display)`, dan memiliki
`letter-spacing` negatif, diturunkan jadi `0em`. Ini aman secara monoton —
tracking 0 TIDAK PERNAH lebih berisiko bertabrakan daripada tracking
negatif, untuk huruf manapun. Termasuk aturan dasar global `h1,h2,h3,h4`
dan `h1` di `client/src/index.css` yang sebelumnya `-0,03em`/`-0,04em`.

[TAFSIR] Ini keputusan proporsional, bukan jaminan sempurna: beberapa
heading mungkin terasa sedikit lebih longgar dari yang dimaksud desainer
semula, tapi tidak ada yang BERTAMBAH rapat — jadi tidak ada yang
BERTAMBAH berisiko bertabrakan dibanding sebelum Fase 8.

## Berkas yang disentuh

`client/src/index.css` (blok `@font-face` ditulis ulang + lima token +
komentar basis h1-h4 dikoreksi), `client/src/CinematicReference.css`,
`client/src/pages/HomeStage.css`, `client/src/pages/Home.css`,
`client/src/shell/ChromeRedesign.css`, `client/src/shell/EditorialRefresh.css`,
`client/src/signature/field/particleField.ts`, `client/src/components/signature/SignatureStage.css`
(`font-weight: 800 → 900`), `client/index.html` (preload + splash),
`scripts/audit-layout.mjs` (daftar font lokal), dan 159 titik
`letter-spacing` negatif di 30 berkas CSS (sapuan mekanis, lihat di atas).

## Kontrak tes yang berubah (disengaja)

[FACT] `server/editorialOptimization.test.ts` — tujuh berkas baru **harus
ada**, empat berkas Fase 6H **harus sudah tidak ada** (ditambahkan ke
daftar `gone` yang sudah ada dari Fase 6H), token `--font-display`/
`--font-body` menunjuk huruf baru, nama huruf lama **tidak boleh** muncul
di `index.css`. Yang dijaga tetap sama: semua huruf dilayani dari repo,
tidak ada rujukan `fonts.googleapis.com`/`fonts.gstatic.com`/
`api.fontshare.com`.

[FACT] `server/mobileLayout.test.ts` — `HERO_WORD_EM` 4,871 → 9,601,
komentar riwayat diperbarui (clash-display-700 6,963em → syne-800
12,163em → big-shoulders-display-800 4,871em → **unbounded-900 9,601em**).
Logika tes itu sendiri TIDAK diubah — yang berubah cuma angka acuan dan
clamp CSS yang diuji olehnya.

## Verifikasi

[FACT] `pnpm check` 0 galat · `vitest` 56 berkas / **330 tes** (termasuk
kedua test file di atas) · `audit-layout` **0 pelanggaran** (1.137
`!important`, tidak berubah signifikan dari sapuan letter-spacing) ·
`pnpm build` sukses · server produksi di-restart di port 4101 ·
`verify-ssr.sh` **32/32 ALL GREEN** · `unbounded-900.woff2` dan
`hanken-grotesk-400.woff2` dilayani 200, `big-shoulders-display-800.woff2`
dilayani 404 (benar-benar hilang) · bundle hasil build tidak lagi memuat
nama huruf lama di CSS/token (hanya tersisa di komentar historis).

## Catatan jujur

[FACT] Tanpa browser di sandbox, penilaian rupa (termasuk hasil sapuan
`letter-spacing`) berasal dari perhitungan advance width fontTools dan
logika CSS, bukan tangkapan layar per halaman. Rekomendasi: review visual
di 360/375/390px pada beberapa halaman dalam (`/about`, `/music`, `/live`)
dan khususnya wordmark header (`.nf-wordmark-text strong`, diturunkan
cukup agresif ×0,5645 untuk menjamin tidak overflow) sebelum dianggap
final secara visual — matematikanya terjamin tidak meluap, tapi "terlihat
pas" itu keputusan mata, bukan angka.

[FACT] `client/public/legacy/epk.html` dan berkas statis lain di
`client/public/legacy/` masih merujuk `fonts.googleapis.com` — ini
pra-ada sebelum Fase 8 (tidak disentuh sesi ini), di luar cakupan
`editorialOptimization.test.ts` (yang hanya memeriksa `client/index.html`
dan `client/src/index.css`), dan di luar keluhan pemilik situs kali ini.
