# Fase 4A — Amplifikasi Visual "NIGHT FREQUENCY"

Dokumen ini mencatat satu lintasan kerja yang diminta langsung oleh pemilik
situs setelah PR #10 dibuka: **"tidak ada yang berubah dari desainnya — coba
pikir matang-matang, bikin desain yang lebih canggih dan keren."**

Fase ini bukan sub-fase baru dalam rencana 5a–5g. Ini **revisi lapisan visual
Phase 4** (design system) yang diterapkan ke kode — jadi penamaannya 4A, dan
**5g (a11y/perf/SEO penuh) tetap belum dikerjakan**.

Label keputusan visual: `[DERIVED]` = diturunkan dari Phase 4 · `[CONVENTIONAL]`
= pola yang sudah lazim dan aman · `[INVENTED]` = bahasa visual baru yang saya
putuskan sendiri.

---

## 1. Diagnosis: kenapa "tidak ada yang berubah"

Tiga sebab, semuanya nyata, dan hanya satu di antaranya soal selera:

1. **Produksi memang belum berubah.** Semua pekerjaan ada di branch
   `arena/01a0ffb8-akbar-next` dan baru dibuka sebagai PR #10. Selama PR belum
   di-merge, `akbarnawasunda.my.id` tetap menjalankan versi lama. `[FACT]`
2. **Preview Vercel-nya terkunci.** Deployment preview untuk branch ini
   mengembalikan halaman login Vercel (*Protected Deployment*), jadi tautan
   preview tidak bisa dibuka tanpa akun Vercel tim. `[FACT]`
3. **Perubahan 5c–5f memang sebagian besar bukan visual.** Sub-fase itu
   merapikan IA, konten, dan kepemilikan tiap rute; bahasa visualnya (warna,
   huruf, jarak) nyaris tidak bergerak sejak sebelum redesign. Ditambah lagi
   **beranda versi Inggris masih memakai komposisi lama** — jadi kalau yang
   dibuka `/en`, memang desain lama yang tampil. `[FACT]`

Karena itu lintasan 4A ini fokus ke hal yang selama ini paling sedikit
tersentuh: **permukaan visual yang benar-benar dilihat orang di lima detik
pertama** — hero, chrome, dan ritme bagian.

## 2. Arahan: "situs sebagai instrumen"

Satu kalimat yang memutuskan semua detail di bawah: situs ini harus terasa
seperti **perangkat studio yang hidup**, bukan halaman yang menampilkan foto
dan daftar. Nama situsnya sendiri sudah memberi bahannya — *night frequency*.

Tiga bahan, tidak lebih:
- **frekuensi** (strip bar, garis gelombang) `[INVENTED]`
- **garis teknis** (grid cetak biru, rel tepi, siku bingkai, pita ukur) `[INVENTED]`
- **satu aksen** (steel `--acid`, tetap satu-satunya aksen) `[DERIVED]`

Yang **tidak** dilakukan: menambah warna kedua, mengganti huruf, memakai
animation library, atau menambah aset bergerak. Semua tetap CSS.

## 3. Yang berubah, per berkas

### 3.1 Lapisan global — `client/src/shell/InstrumentLayer.css` (baru)

Dimuat paling akhir di `PublicShell`, jadi ia tidak perlu bertarung
spesifisitas dengan berkas lain dan **tidak menambah satu pun `!important`**.

| Elemen | Isi | Alasan |
| --- | --- | --- |
| `.instr-aurora` | dua sumber cahaya steel tipis di atas halaman | halaman tidak lagi terasa rata seperti kertas kosong `[INVENTED]` |
| `.instr-grid` | grid 76px, luruh di tengah lewat `mask-image` | bahasa cetak biru tanpa mengganggu teks `[INVENTED]` |
| `.instr-rail` | dua garis sejajar tepi kontainer (`max(gutter, (100% − max)/2)`) | halaman terbaca sebagai satu lembar kerja `[INVENTED]` |
| `.instr-grain` | satu SVG `feTurbulence` inline 180×180, opacity 4,5% | menyatukan foto + artwork dalam satu bahan cetak `[CONVENTIONAL]` |
| `.instr-scan` | garis 1px turun sekali / 19 detik | "perangkat hidup", cukup pelan untuk tidak minta perhatian `[INVENTED]` |
| `.instr-progress` | garis progres gulir 2px di tepi atas | angka nyata dari posisi gulir, **tanpa JavaScript** — CSS scroll-timeline `[INVENTED]` |
| `.instr-wave` | strip equalizer 10–18px sebagai jahitan antar bagian | kelanjutan bahasa frekuensi dari hero `[INVENTED]` |
| `.instr-index` | label "01 — SINYAL" + garis pengisi | tulang punggung teknis untuk bagian halaman `[INVENTED]` |

Dua lapis z-index dipisah dengan sengaja: `--deep` (`z-index: -1`) untuk
kedalaman di bawah konten, `--film` (`z-index: var(--z-base)`) untuk grain dan
garis pindai di atas konten tetapi **di bawah** particle field (3), player
(48), dan nav (90).

### 3.2 Beranda — `client/src/pages/HomeStage.css` + `Home.tsx`

- **Judul hero** naik dari `clamp(3rem, 6.6vw, 6.4rem)` ke
  `clamp(3.3rem, 7.6vw, 7.8rem)`, tracking `-0.055em`, `line-height: 0.9`.
  Kolom teks dilebarkan ke `min(48rem, 58%)` supaya kata terpanjang tetap
  muat — ukuran ponsel **tidak disentuh** karena dihitung tes 320px. `[DERIVED]`
- **Kata terakhir jadi garis luar** (`-webkit-text-stroke`, dijaga `@supports`
  + `forced-colors`) — satu gerakan tipografi yang membuat hero tidak terbaca
  sebagai judul biasa. `[INVENTED]`
- **Siku bingkai** di empat sudut hero + **pita ukur 24px** dan scrim atas di
  tepi foto (supaya penanda tipis tetap terbaca di atas area foto yang terang). `[INVENTED]`
- **Strip frekuensi 46 bar** di kanan atas hero. Tingginya **deterministik**
  (hash sinus, bukan `Math.random()`) supaya HTML server dan hidrasi klien
  identik, dan seluruh strip `aria-hidden` karena ini **bahasa visual, bukan
  analisis audio** — tidak ada label yang bisa dibaca sebagai klaim data. `[INVENTED]`
- **Fakta hero** dipisah garis tipis, bukan hanya jarak. `[CONVENTIONAL]`
- **Titik sinyal berdenyut** dan **petunjuk gulir bergaris** — keduanya hanya
  hidup di `prefers-reduced-motion: no-preference`. `[DERIVED]`
- **Indeks bagian**: `01 — SINYAL`, `02 — Rilisan terbaru`, `03 — Kanal resmi`
  (satu lewat prop `index` milik `EditorialSection` yang sudah ada). `[INVENTED]`

### 3.3 Penyelesaian tipografi (`InstrumentLayer.css`)

`text-wrap: balance` untuk heading, `text-wrap: pretty` untuk paragraf,
`tabular-nums` untuk semua label mono dan pasangan `dt/dd`, warna seleksi
memakai aksen, dan `scrollbar-color` bertema. Ini penyelesaian, bukan
perubahan bahasa desain. `[CONVENTIONAL]`

## 4. Yang TIDAK berubah

- **Token Phase 4** tetap satu-satunya sumber nilai (warna, huruf, `--dur-*`,
  `--ease`). Tidak ada nilai warna baru yang ditulis di lapisan ini.
- **Aturan gerak**: 160/280/520ms, tanpa animation library, dan setiap animasi
  baru punya pasangan `prefers-reduced-motion`.
- **Struktur & konten**: tidak ada rute baru, tidak ada teks baru yang
  diklaim, tidak ada data yang dikarang. Satu-satunya perubahan teks adalah
  awalan nomor pada dua label yang sudah ada.
- **Tiga kebijakan `audit:layout`**: tanpa `!important` baru, tanpa
  `backdrop-filter`, tanpa `overflow-x`/`100vw` baru.
- **Panggung signature** tetap hanya berisi fakta musik — tidak ada label
  bagian di dalamnya (dikunci `server/publicAccessibility.test.ts`).

## 5. Verifikasi

| Gerbang | Hasil |
| --- | --- |
| `pnpm check` (tsc) | bersih |
| `pnpm test` | **311/311** (54 berkas) |
| `scripts/verify-ssr.sh` | **32/32** |
| `node scripts/audit-layout.mjs` | 0 pelanggaran, 58 berkas |
| `pnpm build` | bersih; CSS baru terkonfirmasi di chunk `Home-*.css` dan `index-*.css` |
| SSR home | 200, 82.427 byte; 46 `.an-hero-bar`, `an-hero-instrument`, `instr-wave`, `01 — SINYAL` ada di HTML server |
| Semua rute | `/`, `/music`, `/universe`, `/about`, `/epk`, `/inquire`, `/live`, `/licensing`, `/en`, `/en/music` → 200 |
| Host preview (`4101-*.e2b.app`) | 200 — tidak ada penolakan host/origin |

## 6. Yang belum, dan risikonya

1. **Beranda Inggris (`/en`) masih memakai komposisi hero lama** (`.an-hero`,
   `.hero-copy`, `home-hero-portrait`) — satu-satunya rute publik yang belum
   satu bahasa desain dengan yang lain. Ini utang terbesar yang tersisa dari
   lintasan ini. `[FACT]`
2. **Belum ada pemeriksaan di browser sungguhan.** Sandbox tidak punya
   browser, jadi yang saya buktikan adalah HTML server, CSS hasil build, tipe,
   dan tes — bukan piksel. Tiga hal yang perlu dilihat mata manusia:
   posisi strip frekuensi di kanan atas hero pada 1280–1920px, garis luar kata
   terakhir pada Clash Display, dan apakah grain 4,5% terasa pas (naik/turun
   satu angka mudah).
3. **Grain + garis pindai berada di atas konten** (`z-index: 1`). Dampaknya
   pada kontras teks kecil (mis. `--mute-soft` 4,32) perlu diukur ulang saat
   5g — kalau ragu, turunkan opacity grain, jangan naikkan warna teks.
4. **`instr-progress` memakai CSS scroll-timeline.** Di peramban tanpa
   dukungan, garisnya tidak dirender sama sekali (bukan indikator palsu yang
   macet di 0%) — perilaku ini disengaja.
5. **Preview Vercel terproteksi.** Kalau ingin tautan preview yang bisa
   dibagikan tanpa login, itu setelan *Deployment Protection* di dashboard
   Vercel proyek ini, bukan sesuatu yang bisa diubah dari repo.

## 7. Cara melihat hasilnya sekarang

Server produksi hasil build berjalan di sandbox ini pada port **4101**
(`node dist/index.js`, bind `0.0.0.0`), jadi preview langsung di panel
Arena menampilkan situs yang sama dengan yang akan tampil setelah merge —
termasuk semua lapisan baru di atas. Setelah merge ke `main`, Vercel akan
men-deploy-nya ke produksi dan barulah `akbarnawasunda.my.id` ikut berubah.
