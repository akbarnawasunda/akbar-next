# Fase 6 — Tanda Tangan: tipografi judul, aksara Sunda, partikel tepi, lapisan kontur

**Akbar Nawasunda — akbarnawasunda.my.id**
Tanggal: 2026-10-03 · Branch: `arena/01a10161-akbar-next` · Basis: `fe9b3a2`
Kontrak yang mengikat: `docs/phase3-information-architecture.md` (IA, tertutup) dan
`docs/phase4-design-system.md` (§2 diamandemen di sini, lihat §7).

Setiap klaim diberi label: **[FACT]** = bisa diverifikasi dari berkas/perintah di repo ini ·
**[INTERP]** = penilaian desain saya atas fakta itu · **[INVENT]** = sesuatu yang saya buat sendiri dan
tidak berasal dari bukti mana pun.

---

## 0. Catatan jujur sebelum apa pun

- **`docs/signature-direction.md` TIDAK ADA di repo ini.** [FACT — `ls docs/` hanya memuat
  phase3, phase4, phase4a, phase4b, phase5a/b/d/e/f, dan `docs/notes/*`.] Saya tidak mengarang isinya.
  Premis "katalog didominasi remix" dan "notasi ×" saya ambil dari sumber yang benar-benar ada:
  `client/src/content/artistPlatform.ts` + alias "DJ Akbar Remix" yang sudah dipakai di
  `client/src/pages/Home.tsx` dan `client/src/pages/EnglishPages.tsx`. [FACT]
  Konsekuensinya: **saya tidak membangun apa pun di atas notasi "×"** pada putaran ini — tanpa dokumen
  arahnya, membuat sistem tipografi dari satu karakter itu akan jadi tebakan. Ini tersisa sebagai
  pekerjaan berikutnya (§9). [INTERP]
- **Tidak ada browser di sandbox ini.** Unduhan Chromium Playwright gagal (`Download failure, code=1`).
  [FACT] Jadi tidak ada tangkapan layar dari halaman yang benar-benar dirender. Yang saya buktikan dan
  cara membuktikannya ada di §8, termasuk daftar hal yang **belum** terbukti.
- Tidak ada satu pun bio, kutipan, statistik, tautan, email, atau makna simbol baru yang ditambahkan.
  [FACT — diff tidak memuat teks konten baru; satu-satunya karakter baru adalah aksara Sunda di §2,
  yang statusnya usulan dan ditandai demikian.]

---

## 1. Judul: Clash Display → **Syne 800**, hanya untuk H1

**Apa yang berubah** [FACT]
- Font baru self-hosted dari repo (bukan CDN): `client/public/assets/fonts/fontsource/syne-800.woff2`
  (13.684 B, SIL OFL, lisensi ikut disalin ke `SYNE-LICENSE.txt`), diambil dengan
  `npm pack @fontsource/syne`.
- Token baru `--font-title` di `client/src/index.css`; `--font-display` (Clash) tetap hidup untuk H2/H3.
- `h1` memakai Syne lewat dua tempat: aturan dasar di `client/src/index.css` dan — supaya tidak menambah
  `!important` baru — penulisan ulang custom property di `client/src/CinematicReference.css`
  (`.nf-page h1, .an-site h1 { --ref-serif-display: var(--font-title) }`). [FACT]
- Preload ditukar, bukan ditambah: `clash-display-500` keluar, `syne-800` masuk
  (`client/index.html`). Jumlah file preload tetap tiga; totalnya 63,5 → 61,9 kB. [FACT]
- Font panggung partikel ikut Syne: `WORDMARK_FONT` di
  `client/src/signature/field/particleField.ts`. [FACT]

**Kalibrasi — diukur, bukan ditebak** [FACT]
`scripts/measure-title-type.py` (baru) membaca advance width langsung dari woff2 di repo:

| Kata | Clash Display 600 (`ls -0,05em`) | Syne 800 (`ls -0,05em`) | Rasio |
|---|---|---|---|
| `NAWASUNDA.` | 6,813em | **11,463em** | **1,683×** |
| `AKBAR NAWASUNDA` | 10,146em | 17,076em | 1,683× |

**Keputusan dan alasannya** [INTERP]
Instruksi menyebut hero desktop turun ke **9,2vw**. Angka itu **tidak muat**: pada 1440px, 9,2vw = 132,5px
dan `NAWASUNDA.` memakai 132,5 × 11,463 ≈ **1.519px**, sementara ruang teks setelah dua gutter hanya
≈1.296px (≈117% dari ruang). Memecahnya jadi dua baris tidak menolong, karena yang kepanjangan adalah
**satu kata**. Jadi saya memakai faktor terukur: **semua clamp judul dikalikan 0,60** (1/1,683 = 0,594,
dibulatkan ke atas sedikit demi margin aman). Hero desktop menjadi **7,44vw**. Hasilnya: lebar baris judul
di layar praktis **sama persis seperti sebelumnya** — yang berubah hanya tinggi hurufnya (cap height Syne
650/1000 vs Clash 670/1000). Judul tidak mengecil secara optik sebagai blok; ia berubah bentuk. [INTERP]

Berkas yang clamp-nya dikalibrasi ulang (26 aturan): `client/src/pages/HomeStage.css`,
`client/src/pages/Home.css`, `client/src/CinematicReference.css`, `client/src/shell/EditorialRefresh.css`,
plus token `--text-hero`/`--text-h1` di `client/src/index.css`. [FACT]

**Perubahan kontrak tes yang disengaja** [FACT]
`server/mobileLayout.test.ts`: `HERO_WORD_EM` 6,963 → **11,463**. Konstanta itu adalah lebar kata dalam em
**pada font judul**; karena font judulnya berganti, konstantanya ikut berganti. **Yang dijaga tes tidak
berubah**: tidak boleh ada kata judul yang melewati ruang teks di layar 320px — dan justru karena konstanta
dinaikkan, tes sekarang lebih ketat, bukan lebih longgar. Tidak ada tes yang dilonggarkan atau dihapus.

**Bukti visual** [FACT] `docs/notes/type-compare-clash-vs-syne.png` — dirender dengan fontTools + Pillow dari
file font yang benar-benar ada di repo. Potongan bersudut Syne terlihat pada A, K, W, R; lebar ekstra juga
terlihat langsung, dan itulah yang memaksa kalibrasi di atas.

**Risiko** [INTERP] Di layar 320px judul hero kini ±23px (sebelumnya ±38px). Secara **lebar baris** sama,
tetapi secara tinggi huruf ini turun. Saya memilih ini karena aturan prioritas: keterbacaan dan tidak bocor
dari viewport menang atas drama. Kalau pemilik ingin drama tinggi kembali di ponsel, satu-satunya jalan
jujur adalah menerima pemenggalan kata — yang untuk sebuah nama orang, menurut saya, lebih buruk.

---

## 2. Aksara Sunda — identitas, bukan hiasan

**Apa yang ditambahkan** [FACT]
- Font: `client/public/assets/fonts/fontsource/noto-sans-sundanese-700.woff2` (5.136 B, SIL OFL), dengan
  `unicode-range: U+1B80-1BBF, U+1BC0-1BFF, U+1CC0-1CC7` — jadi file ini **tidak pernah ikut terunduh**
  untuk teks Latin. Token `--font-sunda`.
- **Gema di bawah judul hero**: `ᮃᮊ᮪ᮘᮁ · ᮔᮝᮞᮥᮔ᮪ᮓ` di `client/src/pages/Home.tsx`
  (`.an-hero-sunda`, CSS di `client/src/pages/HomeStage.css`), `aria-hidden="true"`, warna `--signal`
  (9,1:1 di atas `--ink`), ukuran tidak pernah melebihi lede.
- **Frasa partikel alias**: `STAGE_PHRASES[1]` di `client/src/signature/stagePhrases.ts` menjadi
  `ᮓᮤᮏᮦ ᮃᮊ᮪ᮘᮁ` / `ᮛᮦᮙᮤᮊ᮪ᮞ᮪`. Versi Latinnya tetap hidup sebagai teks di DOM lewat `alsoKnownAs`
  panggung (`sr-only`), jadi pembaca layar dan crawler tidak kehilangan apa pun.
- `particleField` memuat font aksara secara eksplisit (`fonts.load(..., STAGE_PHRASES[1].join(" "))`)
  lalu menyusun ulang, supaya sampel pertama tidak pernah memakai fallback. [FACT]

**PERLU KONFIRMASI PEMILIK** [FACT bahwa ini belum dikonfirmasi; transliterasinya sendiri **[INVENT]** dalam
arti: saya memakai bentuk yang diberikan dalam instruksi dan memverifikasi hanya bahwa seluruh titik kodenya
ada di dalam font (`scripts`/fontTools: 0 glyph hilang).] Saya **tidak** memverifikasi ejaan aksara Sunda
secara linguistik dan **tidak** melekatkan klaim makna apa pun padanya di situs. Kalau pemilik mengoreksi
ejaannya, yang perlu diubah hanya dua tempat: `Home.tsx` dan `stagePhrases.ts`.

**Kenapa `aria-hidden`** [INTERP] Baris itu mengulang nama yang sudah dibacakan H1 persis di atasnya. Tanpa
`aria-hidden`, pembaca layar akan menyebut nama yang sama dua kali, dan yang kedua kemungkinan besar
dibacakan salah. Sebagai gambar teks ia tetap terlihat; sebagai informasi ia duplikat.

---

## 3. Partikel: ganti METODE, bukan tambah efek

**Masalah** [FACT] `sampleTextTargets` mengambil setiap piksel terisi di seluruh badan huruf, lalu
menebarkan titik di antaranya. Pada 2.600 titik untuk kata sepanjang "AKBAR NAWASUNDA", kerapatannya jauh
di bawah yang dibutuhkan untuk mengisi badan huruf → yang terlihat gundukan kerikil, bukan tulisan.

**Perbaikan** [FACT] `client/src/signature/field/particleField.ts`:
- parameter baru `edgeOnly`; target diambil dari piksel terisi yang punya tetangga kosong pada jarak
  **1–2px** di delapan arah;
- langkah sampling mulai dari 1px untuk mode tepi (tepi jauh lebih sedikit dari isi);
- **hanya frasa nama** yang memakainya (`mode === "wordmark"`). `signal`, `dust`, `era`, `frequency`, dan
  label `transit` tetap isi penuh karena tujuannya massa;
- memo `targetCache` (kunci: frasa + ukuran kotak + jumlah titik, dibersihkan saat resize dan saat font
  selesai dimuat) — supaya pengambilan sampel per-piksel tidak pernah jalan di tengah gulir saat frasa
  berganti.

**Bukti** [FACT] `docs/notes/particle-fill-vs-edge.png` — simulasi memakai algoritma yang sama persis dan
font yang sama, pada **jumlah titik yang sama (2.600)**. Target tersedia: 52.353 (isi) vs 11.755 (tepi).
Yang di atas tidak terbaca; yang di bawah terbaca sebagai huruf bergaris.

**Yang ikut diperiksa** [FACT]
- Pergantian frasa pada progres gulir: `phraseFor()` (ambang 0,42) dan `releaseRampFor()` tidak disentuh;
  `morphTo` sekarang mengambil target dari cache. `server/signatureRuntime.test.ts` (17 tes) hijau.
- Tier `lite`: `countFor` tidak berubah (plafon 1.800 titik, kerapatan 1/250px²). Karena target tepi jauh
  lebih sedikit daripada target isi, **jumlah titik yang sama sekarang menutupi garis huruf lebih rapat** —
  tier lite diuntungkan, bukan dirugikan. [INTERP atas FACT jumlah target di atas.]
- `prefers-reduced-motion: reduce` → `capability.ts` memberi tier `"off"` → field tidak pernah dibuat dan
  panggung runtuh jadi section biasa dengan wordmark sebagai teks DOM. Jalur ini tidak disentuh dan
  `server/motionFallback.test.ts` + `server/signatureField.test.ts` tetap hijau. [FACT]

---

## 4. Lapisan Sunda yang halus: garis kontur (SATU pilihan, bukan dua)

**Pilihan** [INTERP] Saya memilih **garis kontur topografi** menggantikan grid kotak di latar
(`.instr-grid` → `.instr-topo`, `client/src/shell/InstrumentLayer.css`), dan **tidak** memakai motif anyaman
bambu. Alasan: anyaman butuh pola dua arah yang rapat; pada CSS murni ia selalu berakhir sebagai tekstur
kain yang berisik di belakang teks, dan itu melanggar aturan "kalau harus memilih, menangkan keterbacaan".
Kontur mendapat tempat karena ia **bentuk tanahnya sendiri**, bukan ragam hias yang bisa ditempel di mana
saja. Batik dan kujang tidak dipakai, sesuai instruksi.

**Iterasi yang penting** [FACT] Percobaan pertama memakai tiga keluarga cincin yang saling menimpa; saya
render dan melihat hasilnya: yang muncul **moiré seperti radar/gelombang** — persis kosakata EDM generik
yang dilarang `docs/design-language.md`. Versi final memakai **satu** keluarga elips sangat lebar
(150% × 78%, pusat di luar layar, jarak 33px) sehingga garisnya tidak pernah saling memotong — seperti
kontur sungguhan. Pratinjau: `docs/notes/topo-contour-preview.png` (simulasi Python dari rumus CSS yang
sama; opacity sebenarnya mengikuti `--instr-line` = paper 5%).

**Biaya** [FACT] Nol permintaan jaringan, nol JavaScript, satu elemen statis — sama seperti grid yang
digantikannya. Tidak ada nilai warna hard-code: garisnya `var(--instr-line)`.

---

## 5. Mengurangi ornamen: delapan → empat

Dihapus [FACT]:

| Ornamen | Berkas | Kenapa dihapus |
|---|---|---|
| Aurora | `InstrumentLayer.css` + `NightAtmosphere.tsx` | Hero sudah punya tiga lapis gradiennya sendiri (`HomeStage.css`); ini cahaya kedua yang menumpuk di tempat yang sama. |
| Garis pindai | sda. | Animasi `infinite` 19 detik tanpa arti; satu-satunya efeknya menarik mata dari judul. |
| Strip gelombang (`instr-wave`) | sda. + `Home.tsx` | "Equalizer" yang tidak membaca audio apa pun. |
| Siku bingkai hero ×4 | `Home.tsx` + `HomeStage.css` | Klise viewfinder; penanda teknis yang tidak menandai apa pun. |
| Strip frekuensi hero (46 bar) | sda. | Angka sinus tetap yang berpenampilan seperti data. Ikut menghapus satu animasi `infinite` dengan 46 elemen beranimasi. |

Disisakan, masing-masing dengan satu alasan fungsional [INTERP]:
1. `instr-topo` — **di mana** ini (satu-satunya pembawa identitas tempat);
2. `instr-rail` — **di mana tepi** halamannya (lebar kerja terlihat, tidak ditebak);
3. `instr-grain` — **satu bahan** (foto, artwork, dan UI jadi satu material cetak);
4. `instr-progress` — **seberapa jauh** gulirnya (satu-satunya lapisan dengan angka nyata; hanya dirender
   kalau `animation-timeline: scroll()` didukung).

Scrim atas pada plate hero dipertahankan tetapi alasannya ditulis ulang: dulu ia menopang siku/strip yang
kini hilang; sekarang alasannya tunggal dan fungsional — menjaga kontras masthead di atas foto terang. [FACT]

---

## 6. Deviasi dari Fase 3 dan Fase 4

- **Fase 3 (IA): tidak ada deviasi.** Tidak ada rute, bagian, atau item navigasi yang ditambah/dipindah/
  dihapus. Satu-satunya elemen DOM baru adalah satu baris `aria-hidden` di hero. [FACT]
- **Fase 4 §2 (tipografi): diamandemen secara eksplisit** di `docs/phase4-design-system.md` (blok
  "AMANDEMEN FASE 6"): tiga keluarga → lima; anggaran font 189,7 kB → **208,5 kB** (11 berkas woff2);
  peran display dipecah jadi judul/H1 (Syne) dan heading lain (Clash); seluruh clamp judul ×0,60; preload
  ditukar; cakupan bahasa ditambah satu pemakaian aksara Sunda non-teks. [FACT]
- **Fase 4 §lain: tidak disentuh.** Tidak ada token warna baru, tidak ada nilai warna hard-code, tidak ada
  `!important` baru, tidak ada `backdrop-filter`, tidak ada `100vw`, tidak ada `overflow-x` baru — dijaga
  `scripts/audit-layout.mjs` yang tetap 0 pelanggaran. [FACT]
- **Fase 4A/4B:** lima ornamen dari dua fase itu dihapus (§5). Itu deviasi yang disengaja dari
  `docs/phase4a-visual-amplification-report.md` dan `docs/phase4b-cinematic-pass.md`; hero sinematik
  (foto penuh layar + pita terang) tetap utuh. [FACT]

---

## 7. Anggaran font sesudah perubahan [FACT]

| | Berkas | Byte |
|---|---|---|
| Lama (fontshare, 9 berkas) | Clash 500/600/700, General Sans 400/500/600, Azeret 400/500/600 | 189.720 |
| Baru | `syne-800.woff2` | 13.684 |
| Baru | `noto-sans-sundanese-700.woff2` | 5.136 |
| **Total** | **11 berkas** | **208.540 (208,5 kB)** |

Preload: `syne-800` + `general-sans-400` + `azeret-mono-500` = 61.940 B (sebelumnya 63.528 B). Aksara Sunda
tidak pernah diminta untuk halaman tanpa aksara itu, karena `unicode-range`-nya terkunci.

---

## 8. Verifikasi

Semua dijalankan di repo ini hari ini, berurutan, semuanya hijau [FACT]:

```
corepack pnpm install --frozen-lockfile        → Done
corepack pnpm check                            → tsc --noEmit, 0 error
corepack pnpm test                             → 54 berkas / 311 tes, semua lulus
node scripts/audit-layout.mjs                  → "Tidak ada pelanggaran kebijakan fondasi" (0)
corepack pnpm build                            → sukses (client + SSR + server + api)
PORT=4101 NODE_ENV=production node dist/index.js   → bind 0.0.0.0:4101 (di-restart sesudah build terakhir)
BASE=http://localhost:4101 bash scripts/verify-ssr.sh → PASS=32 FAIL=0, ALL GREEN
```

Pemeriksaan tambahan terhadap server produksi yang berjalan [FACT]:
- `GET /` memuat `class="an-hero-sunda"` dan karakter `ᮃᮊ᮪ᮘᮁ` di HTML SSR;
- `GET /` memuat `<link rel="preload" ... syne-800.woff2>`;
- `GET /assets/fonts/fontsource/syne-800.woff2` → 200, 13.684 B;
- `GET /assets/fonts/fontsource/noto-sans-sundanese-700.woff2` → 200, 5.136 B;
- CSS hasil build memuat `instr-topo` dan **tidak** memuat `instr-aurora`/`instr-scan`/`instr-wave`.

**Yang BELUM terbukti (tidak ada browser di sandbox)** [FACT]:
1. Tampilan sesungguhnya dari Syne pada hero di 320/390/768/1440/1920 — yang terbukti hanya aritmetika
   lebarnya (dan aritmetika itu sekarang dikunci tes).
2. Rupa akhir garis kontur setelah antialiasing peramban; pratinjau di `docs/notes/` adalah simulasi
   Python dari rumus yang sama, bukan tangkapan layar.
3. Partikel tepi saat benar-benar bergerak (pembentukan, morph, pelepasan) dan biaya frame nyatanya
   di perangkat mid-range; yang terukur hanya bentuk statisnya dan bahwa tes engine lulus.
4. Rupa shaping aksara Sunda (posisi pamaeh/vokal) saat dirender peramban dan di dalam kanvas.
5. Kontras gema aksara di atas foto hero yang terang — tokennya 9,1:1 di atas `--ink`, tetapi di hero ia
   duduk di atas foto bergradien.

Saran pemeriksaan pertama oleh pemilik: buka beranda di ponsel nyata, lihat (a) ukuran judul, (b) baris
aksara, (c) panggung partikel saat digulir.

---

## 9. Risiko & pekerjaan berikutnya [INTERP]

1. **Ejaan aksara Sunda menunggu konfirmasi** (§2). Sampai dikonfirmasi, anggap ini usulan.
2. **Notasi "×" belum dipakai sebagai tanda.** Ini kandidat terkuat berikutnya justru karena ia milik
   artisnya sendiri (judul rilisan), bukan pinjaman: misalnya sebagai pemisah resmi di baris meta katalog.
   Saya tidak mengerjakannya tanpa `docs/signature-direction.md`.
3. **Judul ponsel lebih pendek** (§1, Risiko). Butuh satu penilaian mata di perangkat nyata.
4. **Latar kontur sangat tipis** (paper 5%, warisan nilai grid lama). Kalau di layar nyata ia hampir tak
   terlihat, naikkan `--instr-line` — bukan menambah lapisan kedua.
