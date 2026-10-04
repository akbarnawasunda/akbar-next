# Fase 7 — Laporan: Kontras Tipografi + Pangkas Ornamen

Status: **dikerjakan nomor 1-10, commit lokal, menunggu persetujuan untuk push.**

Label tiap klaim: **[FAKTA]** = diverifikasi (dibaca langsung dari kode/alat/tes),
**[TAFSIR]** = kesimpulan/alasan desain dari fakta di atas, **[KARANGAN]** = tidak
ada — kalau ada klaim semacam itu dipakai, itu kesalahan dan harus ditandai di
tinjauan.

## 0. Penyimpangan dari premis rencana — dibaca dulu sebelum sisanya

Rencana Fase 7 menulis dua asumsi tentang keadaan kode yang **tidak cocok**
dengan apa yang sebenarnya ada di repo saat dikerjakan. Keduanya diperiksa
langsung sebelum mengerjakan apa pun, dan pekerjaan dilanjutkan dari fakta
yang benar, bukan dari asumsi rencana:

1. **[FAKTA] Roster huruf.** Rencana menyebut "Fase 6J (Clash Display / Uncut
   Sans / General Sans / Commit Mono)" sebagai roster saat ini. Tidak ada
   berkas `docs/phase6j-*.md`, dan `client/src/index.css` (satu-satunya
   sumber kebenaran token font, menurut komentarnya sendiri) serta
   `scripts/audit-layout.mjs` (daftar `LOCAL_FONTS`, baris 21-32) sama-sama
   menunjukkan roster aktif adalah **Big Shoulders Display 800 / Schibsted
   Grotesk / Sometype Mono / Noto Sans Sundanese** — hasil Fase 6H/6I
   (`docs/phase6h-ganti-roster-huruf.md`, `docs/phase6i-koreksi.md`). Semua
   nama di daftar rencana ("Clash Display" dkk.) hanya muncul sebagai
   komentar sejarah (riwayat keputusan lama), bukan huruf yang dimuat.
   **Akibat:** instruksi "roster tidak diganti" dipatuhi terhadap roster
   yang BENAR aktif (Big Shoulders dkk.), bukan yang disebut rencana. Tidak
   ada huruf yang ditambah/diganti di Fase 7 ini.
2. **[FAKTA] Jumlah ornamen.** Rencana menyebut "delapan ornamen" sebagai
   titik berangkat nomor 6. Komentar di
   `client/src/components/signature/NightAtmosphere.tsx` menulis sendiri
   riwayatnya: Fase 6 sudah memangkas 8 → 4 (aurora, garis pindai, strip
   gelombang, siku bingkai hero, strip frekuensi hero sudah dihapus; lihat
   `docs/phase6-signature-report.md §5`). Keadaan nyata sebelum Fase 7:
   **empat** ornamen aktif (`instr-topo`, `instr-rail`, `instr-grain`,
   `instr-progress`). Rinciannya di `docs/notes/inventaris-ornamen.md`.
   **Akibat:** nomor 6 memangkas dari 4 ke 2, bukan dari 8 ke 2 — tujuannya
   (sisa yang punya alasan fungsi) sama persis, jumlah awalnya saja dikoreksi.
3. **[FAKTA] Advance width "NAWASUNDA.".** Rencana menulis "7,764em untuk
   NAWASUNDA." pada Clash Display 700. Diukur ulang dengan fontTools
   terhadap huruf judul yang BENAR aktif (Big Shoulders Display 800, berkas
   `client/public/assets/fonts/fontsource/big-shoulders-display-800.woff2`):
   advance width murni **4,671em**, +tracking 0,02em×10 huruf = **4,871em** —
   sama persis dengan `HERO_WORD_EM` yang sudah dikunci di
   `server/mobileLayout.test.ts` sejak Fase 6E. Angka 7,764em di rencana
   tidak dipakai di mana pun karena fontnya sendiri sudah tidak dimuat repo.

Ketiganya ditemukan dengan cara yang sama: baca kode yang benar-benar
berjalan, bukan menganggap benar apa yang tertulis di rencana. Tidak ada
yang "salah" secara disengaja — kemungkinan rencana ditulis dari ingatan
fase yang lebih lama. Yang penting: pekerjaan nomor 1-10 di bawah semuanya
berpijak pada angka yang diverifikasi di atas, bukan angka rencana.

## 1. Inventaris skala huruf sekarang

[FAKTA] `docs/notes/skala-huruf-sekarang.md`. 728 deklarasi `font-size` di
`client/src/**/*.css`; 513 nilai tetap, dan **88,3% dari situ (453)**
menumpuk di pita 0,5–1rem. Token lama (`--text-*`) sudah ada tapi cuma
dipakai 21 kali dari 728. Tidak ada kode yang diubah di langkah ini.

## 2. Inventaris ornamen

[FAKTA] `docs/notes/inventaris-ornamen.md`. Empat ornamen global
(`NightAtmosphere` + `InstrumentLayer.css`, aktif di SEMUA halaman publik
lewat `PublicShell.tsx`): `instr-topo` (kontur/identitas), `instr-rail`
(rel tepi — menandai batas), `instr-grain` (tekstur material),
`instr-progress` (progres gulir — menandai keadaan). Juga dipetakan tiga
lapisan di luar cakupan (particle field wordmark, wave bar pemutar audio,
scanline kartu teaser game) — bukan ornamen atmosfer, jadi tidak disentuh
nomor 6.

## 3. Tangga tipografi baru (token)

[FAKTA] `client/src/index.css`, token `--step--1` … `--step-7`, rasio 1,5×
dari dasar 1rem (0,667rem → 17,086rem). `--step-3` (titik tengah angka
-1..7) sengaja tidak pernah dipasang ke selektor mana pun — diverifikasi:

```
grep -rn "var(--step-3)" client/src   →  tidak ada hasil
```

[TAFSIR] Rasio 1,5× dipilih (bukan rasio emas 1,618× yang sempat dihitung
lebih dulu) karena 1,618^7 menghasilkan 29rem (464px) — jauh melebihi lebar
kolom hero mana pun bahkan di layar terlebar; 1,5^7 = 17,086rem masih
proporsional sebagai "jarang dipakai, nyaris tak tercapai" tanpa harus
dipotong tajam oleh `min()`/`max()` di titik penggunaan.

## 4. Tangga dipasang ke HomeStage.css

[FAKTA] Perubahan di `client/src/pages/HomeStage.css`:

| Elemen | Sebelum | Sesudah | Sumber angka |
|---|---|---|---|
| Judul hero, ponsel (≤767,98px) | `clamp(2.2rem, 14vw, 4.6rem)` | `clamp(2.25rem, 15.5vw, 5.062rem)` | sama dengan `--step-2`/`--step-4`, ditulis literal (lihat Risiko §A) |
| Judul hero, desktop (≥768px, blok yang menang cascade) | `clamp(3.6rem, 12vw, 12rem)` | `clamp(var(--step-4), 14vw, 12.8rem)` | lantai = token; plafon 12,8rem dihitung dari batas kolom 1024px (`min(64rem,100%)`) ÷ 4,871em |
| Lede hero | `clamp(1rem, 1.25vw, 1.18rem)` (dasar) / `clamp(1rem, 1.05vw, 1.18rem)` (desktop) | `clamp(var(--step--1), 1vw, 0.8rem)` | tingkat MIKRO |
| Jarak dalam hero (`gap`) | `clamp(14px, 1.5vw, 24px)` | `var(--space-lg)` | — |
| Jarak antar adegan (`.an-channels/.an-feature/.an-catalog`) | `var(--section-y)` (= `--space-2xl`) | `var(--space-3xl)` | token global tidak diubah; override lokal di halaman ini saja |

[FAKTA] **Bukti terukur, bukan ditaksir** (dihitung dengan skrip Python,
hasil dibuktikan ulang lewat render fontTools+Pillow di nomor 8): pada
viewport 1366px, judul naik dari 163,92px → 191,24px (**+17%**); lede turun
dari 16,00px → 12,80px (**-20%**). Pada 320px (kontrak
`server/mobileLayout.test.ts`): kata "NAWASUNDA." memakai 241,6px dari
280px ruang yang ada (margin 38,4px / 13,7%) — naik dari 218px sebelumnya,
masih jauh dari mepet. Pada viewport lebar (≥1600px): judul berhenti di
12,8rem (204,8px), kata "NAWASUNDA." memakai 997,6px dari plafon kolom
1024px (margin 26,4px) — tidak pernah overflow di viewport mana pun yang
diuji (320–2560px).

[FAKTA] `HERO_WORD_EM = 4.871` di `server/mobileLayout.test.ts` **tidak
diubah** — tidak perlu, karena huruf judul tidak berganti. Kontraknya tetap
dijaga dan lolos (lihat §9).

### Risiko §A — kenapa tidak semua memakai `var(--step-N)` langsung

[FAKTA] `server/mobileLayout.test.ts` membaca `font-size: clamp(...)` lewat
**regex angka literal** (`([\d.]+)rem`), bukan dengan resolve custom
property. Saat clamp ponsel ditulis `clamp(var(--step-2), 15.5vw,
var(--step-4))`, tes gagal: "punya aturan judul hero mobile: expected 0 to
be greater than 0" — regex-nya kosong karena tidak menemukan angka literal.
[TAFSIR] Ini BUKAN bug tes yang perlu diperbaiki — per kebijakan nomor 9
("tes adalah kontrak, yang diperbaiki kodenya"), clamp ponsel ditulis
literal (`clamp(2.25rem, 15.5vw, 5.062rem)`) dengan komentar yang
menyatakan angkanya sama persis dengan `--step-2`/`--step-4`. Clamp desktop
AMAN memakai `var(--step-4)` langsung karena tidak pernah dicek regex ini
(scan tes dibatasi pada blok `@media (max-width: ...)`, desktop memakai
`min-width`).

## 5. Pemakaian huruf judul diperluas

[FAKTA] Sebelumnya `--font-title` muncul di 6 tempat (`SignatureStage.css`,
`index.css`, `Home.css`, `ChromeRedesign.css` ×2, dan setelah nomor 4 juga
`HomeStage.css` hero). Ditambah di beranda:

- **Nomor seksi** — digit pembuka label section ("02", "03") dipisah ke
  `<span className="an-section-num">` (di `Home.tsx`), diberi
  `font-family: var(--font-title)` (`.an-section-num` di `HomeStage.css`);
  sisa kalimat tetap mono, mewarisi `.an-meta`/`.instr-index`.
- **Angka besar** — `.an-channel-index` (nomor 01-06 di daftar kanal resmi)
  naik dari label mono 0,54rem ke huruf judul `--step-1` (1,5rem, ×2,8).
- **Kutipan tunggal** — baris jeda baru di nomor 7 (`.an-pause-quote`)
  memakai huruf judul di tingkat MIKRO (`--step--1`).
- **Awalan nama track** — `.an-feature-type` (label tipe rilisan di
  sebelah judul rilisan terbaru) pindah dari mono ke huruf judul.

[TAFSIR] Cakupan dibatasi ke beranda (bukan seluruh situs) karena nomor 4
juga membatasi diri ke `HomeStage.css` lebih dulu — konsisten dengan urutan
rencana. Halaman lain (about, music, dsb.) belum disentuh; ini risiko yang
belum terbukti di §Risiko bawah.

## 6. Ornamen dipangkas dari EMPAT jadi dua

[FAKTA] (angka awal dikoreksi di §0.2) Dihapus beserta aturan CSS-nya
(bukan `display: none`): `.instr-topo` dan `.instr-grain`, termasuk token
`--instr-line` dan wrapper `.instr-atmosphere--film` yang jadi tidak
terpakai, serta override mobile `.instr-topo` di breakpoint 767,98px.
`client/src/components/signature/NightAtmosphere.tsx` ditulis ulang untuk
hanya merender `instr-rail` + `instr-progress`.

[FAKTA] `client/src/shell/InstrumentLayer.css` turun dari 7.675 B ke
5.937 B (**-22,6%**). Jalur `prefers-reduced-motion` diperiksa: tidak ada
aturan reduced-motion yang menunjuk `instr-topo`/`instr-grain` (keduanya
statis, tidak pernah beranimasi), jadi tidak ada yang perlu dibersihkan di
situ; satu-satunya aturan reduced-motion di berkas ini (untuk
`.instr-progress`) tetap relevan karena lapisan itu dipertahankan.

[FAKTA] `pnpm audit:layout` setelah perubahan: **0 pelanggaran** (sama
seperti sebelumnya) — tidak ada `overflow-x` baru, `100vw`, `!important`
baru, atau `backdrop-filter` yang masuk dari perubahan ini.

## 7. Satu layar jeda

[FAKTA] Section baru `.an-pause` di `Home.tsx` (antara "Kanal Resmi" dan
teaser game), `aria-hidden="true"` karena kalimatnya sudah dibacakan screen
reader lewat `.an-hero-lede` — section ini murni untuk mata. Isinya satu
baris: *"Breakbeat, electronic bass, dan remix."* — **bukan klaim baru**,
potongan verbatim dari `heroBody` yang sudah ada di `Home.tsx:183`/`181`,
ditata ulang sebagai kutipan huruf judul tingkat mikro. Ruang vertikal
`clamp(260px, 38vh, 440px)`, jauh lebih besar dari section lain. Tidak ada
aset gambar baru — murni CSS pada DOM yang sudah ringan.

[TAFSIR] Ini baru masuk akal SETELAH nomor 6: kalau `instr-topo`/
`instr-grain` masih hidup, lapisan tekstur itu tetap mengisi "kekosongan"
secara visual dan jedanya tidak akan terasa kosong sama sekali.

## 8. Bukti rupa (PNG, fontTools + Pillow)

[FAKTA] Dua gambar di `docs/notes/phase7-assets/`, dirender dari berkas
font yang di-host repo ini (dikonversi woff2→ttf dengan fontTools, lalu
dirender Pillow — bukan asset baru yang diunduh):

- `tangga-kontras.png` — sembilan tingkat `--step--1`…`--step-7` dalam
  huruf judul sungguhan, dengan `--step-3` digambar sebagai garis putus-putus
  (bukan teks) untuk menegaskan "sengaja kosong".
- `hero-sebelum-sesudah.png` — judul hero + lede, sebelum vs sesudah, pada
  viewport 1366px, dengan angka clamp yang dihitung dari rumus yang SAMA
  PERSIS dengan yang tertulis di `HomeStage.css` (bukan ditaksir ulang).

## 9. Gerbang verifikasi

[FAKTA] Semua dijalankan setelah nomor 1-7 selesai, di urutan ini:

| Gerbang | Hasil |
|---|---|
| `pnpm check` (`tsc --noEmit`) | 0 galat |
| `pnpm vitest run` | **56 berkas / 330 tes — semua lolos** |
| `pnpm audit:layout` | **0 pelanggaran** |
| `pnpm build` | sukses (client + SSR + `dist/index.js` + `api/trpc.js` + `api/ssr.js`) |
| Restart server produksi (`PORT=4102 NODE_ENV=production node dist/index.js`) | menyala, `Server running on http://0.0.0.0:4102/` |
| `BASE=http://localhost:4102 bash scripts/verify-ssr.sh` | **PASS=32 FAIL=0 — ALL GREEN** |

[FAKTA] Tidak ada tes yang diubah isinya untuk membuatnya lolos, kecuali
satu penyesuaian **sintaks penulisan** (bukan kontrak) yang dijelaskan di
§Risiko A: clamp ponsel ditulis literal, bukan `var()`, supaya tetap bisa
dibaca regex tes yang sudah ada. `HERO_WORD_EM` tidak disentuh.

## 10. Penyimpangan dari Fase 3/4

[FAKTA] Fase 4 (`docs/phase4-design-system.md §2`) menetapkan `--text-*`
sebagai "satu-satunya sumber nilai" untuk skala tipe. Fase 7 **tidak
menghapus** token itu (masih dipakai 21 tempat) tapi menambahkan tangga
KEDUA (`--step-*`) dengan tujuan berbeda: `--text-*` untuk teks isi yang
aman dan dekat (rasio 1,2×), `--step-*` untuk kontras dramatis di titik-titik
tertentu (rasio 1,5×). [TAFSIR] Ini penyimpangan yang disengaja dari niat
asli "satu sumber nilai" — alasannya ditulis di komentar token (`index.css`)
dan di §3 di atas: tangga lama tidak bisa menghasilkan lompatan besar tanpa
mengubah arti token yang sudah dipakai 21 tempat lain. Risikonya: sekarang
ada DUA tangga tipografi hidup berdampingan, bukan satu — kalau ke depan
`--step-*` dipakai lebih luas, `--text-*` sebaiknya dipertimbangkan untuk
dipensiunkan atau digabung, bukan dibiarkan dua-duanya tumbuh.

## Risiko yang BELUM terbukti

[TAFSIR/RISIKO — bukan FAKTA, karena belum diuji dengan cara yang membuktikannya]

1. **Keterbacaan lede mikro.** Lede hero turun ke `clamp(0.667rem, 1vw,
   0.8rem)` — pada lebar sempit itu 10,7px, di bawah anjuran umum ~12px
   untuk teks baca. Belum diuji dengan pengguna nyata atau alat kontras
   warna/ukuran gabungan. Kalau pemilik situs menilai ini terlalu kecil,
   lantai amannya bisa dinaikkan ke `--step-0` tanpa mengubah struktur lain.
2. **Cakupan huruf judul (nomor 5) hanya di beranda.** Halaman lain
   (`/about`, `/music`, `/universe`, dst.) belum disentuh — "setiap layar
   gulungan" di rencana baru benar untuk BERANDA, bukan seluruh situs.
3. **Plafon 12,8rem dipilih manual**, bukan murni dari tangga `--step-*`
   (lihat §4) — ini keputusan kalibrasi yang didokumentasikan angkanya, tapi
   tetap keputusan manual, bukan hasil formula tangga yang otomatis.
4. **Tidak ada browser di sandbox ini.** Seluruh penilaian rupa berasal
   dari perhitungan clamp, audit kode, dan render font (nomor 8) — bukan
   dari melihat halaman sungguhan di viewport nyata. Screenshot dari
   pemilik situs tetap lebih berharga daripada klaim visual apa pun di
   laporan ini.
5. **Dua tangga tipografi hidup berdampingan** (`--text-*` dan `--step-*`)
   — lihat §10. Belum ada keputusan apakah ini permanen atau transisi.

## Berkas yang berubah

```
 client/src/components/signature/NightAtmosphere.tsx |  32 +++++------
 client/src/index.css                                 |  28 +++++++++
 client/src/pages/Home.tsx                             |  23 +++++--
 client/src/pages/HomeStage.css                        | 169 +++++++++++++++++++++++++++++++++++++++++++----------
 client/src/shell/InstrumentLayer.css                  |  80 +++++--------------
 docs/notes/skala-huruf-sekarang.md                    | baru
 docs/notes/inventaris-ornamen.md                      | baru
 docs/notes/phase7-assets/tangga-kontras.png            | baru
 docs/notes/phase7-assets/hero-sebelum-sesudah.png      | baru
 docs/phase7-laporan.md                                | baru (berkas ini)
```

## Status serah terima

Commit lokal di branch kerja ini. **Belum di-push** — menunggu tinjauan dan
persetujuan pemilik situs, sesuai permintaan nomor 10 di rencana. Tidak ada
huruf yang diganti (sesuai batasan di kepala rencana), tidak ada wordmark
SVG baru, tidak ada efek baru — hanya susunan, kontras ukuran, dan
pengurangan ornamen.
