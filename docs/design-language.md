# Design Language — Akbar Nawasunda

> Dokumen ini adalah kontrak visual untuk tahap redesign. Tujuannya bukan
> membuat semua halaman sama, melainkan memastikan semua halaman terasa satu
> dunia: **cinematic, editorial, image-driven, dark/deep-blue, dan punya
> karakter**.
>
> Token dan primitif yang disebut di sini sudah ada di `client/src/index.css`.
> Kalau sebuah halaman butuh nilai di luar skala ini, tambahkan tokennya di
> `index.css` — jangan menulis angka baru di CSS halaman.

---

## 1. Identitas yang tidak boleh berubah

- **Warna**: seluruh permukaan publik tetap gelap. Token brand tinggal di
  `client/src/index.css` (`--ink`, `--ink-soft`, `--ink-card`, `--paper`,
  `--acid`, `--blue`, `--mute`). Cakupan editorial
  (`.an-public-shell.an-editorial` di `EditorialRefresh.css`) boleh menggeser
  nilai surface/opasitasnya, tapi tidak boleh mengganti hue brand.
- **Aksen neon mentah dilarang** (`#00d4ff`, `#1ee8ff`, `#18d7f2`, dan
  keluarga rgba-nya). Aksen = `var(--acid)`, boleh dengan `color-mix()` untuk
  opasitas.
- **Font**: hanya tiga keluarga yang di-self-host —
  `Clash Display` (display), `General Sans` (body), `Azeret Mono` (metadata).
  Tidak ada font eksternal, tidak ada nama font yang tidak punya `@font-face`.
- **Signature motion** adalah identitas: particle field, cursor signal, tirai
  rute, dan panggung wordmark. Semuanya hidup di `client/src/signature/**` dan
  dipasang oleh `client/src/shell/PublicShell.tsx`.

## 2. Struktur global

| Lapisan | Nilai | Pemilik |
| --- | --- | --- |
| Container penuh | `--container-max` (1440px) | `.an-container` |
| Bingkai editorial | `--container-frame` (1180px) | `.an-container--frame` |
| Blok baca | `--container-text` (62ch) | `.an-container--text` |
| Gutter | `--gutter` / `--editorial-gutter` | shell + page |
| Ritme section | `--section-y` (`--space-2xl`) | `.an-section` |
| Skala spasi | `--space-2xs` … `--space-3xl` | semua section |
| Skala tipe | `--text-hero`, `--text-h2`, `--text-h3`, `--text-lede`, `--text-small`, `--text-meta` | `@layer base` |
| Skala lapisan | `--z-field` → `--z-splash` | lapisan fixed |
| Breakpoint | 360/390 (mobile utama), 640, 768, 900, 1080, 1440 | media query |

Aturan komposisi:

1. Satu halaman = satu `h1`. Judul mengikuti skala tipe, bukan angka lokal.
2. Section memakai `.an-section`; jarak antar section tidak ditulis manual.
3. Garis pemisah memakai `.an-rule` atau `--editorial-rule`/`--ink-line`.
4. Metadata (label, tahun, format, platform) selalu `var(--font-mono)` +
   `text-transform: uppercase` + `letter-spacing` ≥ 0.12em.
5. Tidak ada `!important` baru. Kalau butuh `!important` untuk menang, berarti
   dua lapisan CSS saling menimpa dan salah satunya harus dirapikan.
6. Tidak ada `overflow-x: hidden/clip` baru. Satu jaring pengaman hidup di
   `.an-public-shell` (PublicShell.css) dan tidak boleh diperluas.

## 3. Fotografi & artwork (image-driven)

- Semua gambar lewat `.an-media` (frame dengan `--media-ratio`) atau salah satu
  komponen bersama:
  - `OptimizedEditorialImage` — fotografi editorial dan studi potret
    (`sizePreset`: `hero` / `full` / `artwork` / `card` / `portrait` /
    `thumbnail`), `<picture>` + varian mobile, shimmer, `priority` untuk
    above-the-fold.
  - `ResilientArtworkImage` — artwork rilisan dengan rantai fallback ke brand.
  - `ResilientBrandImage` — logo.
- Ukuran intrinsik diambil dari `client/src/lib/responsiveImage.ts`. Tambahkan
  entri hanya untuk file yang benar-benar ada.
- Hanya hero/above-the-fold yang `priority` (eager + `fetchPriority="high"`).
  Sisanya `lazy`.
- Frame wajib punya rasio sebelum gambar datang. Foto hero: `--ratio-cinema`
  atau `--ratio-portrait`; artwork: `--ratio-square`; potret arsip:
  `--ratio-editorial`.
- Kalau CMS tidak mengirim dimensi gambar, jangan mengarang: pakai rasio
  komposisi yang tetap, dan catat sebagai utang metadata CMS.

## 4. Gerak (motion)

- Durasi/easing dari token: `--dur-fast` (160ms), `--dur` (280ms),
  `--dur-slow` (520ms), `--ease`.
- Utilitas bersama: `.an-fade-in`, `.an-lift`. Signature runtime menangani
  partikel, cursor, tirai rute, dan pewarnaan mode.
- Setiap animasi wajib punya jalur `prefers-reduced-motion` yang membuat
  konten tetap terlihat (tidak ada `opacity: 0` yang menggantung).
- Tidak ada scroll-jacking. Reveal hanya memakai `position: sticky`,
  `IntersectionObserver`, atau CSS animation.

## 5. Karakter per halaman

Satu bahasa, komposisi berbeda:

| Halaman | Peran | Komposisi khas |
| --- | --- | --- |
| Home | pembuka sinematik | hero potret penuh + wordmark partikel + rail platform + katalog rilisan horizontal |
| Music | katalog | hero artwork besar, platform hub, player contained, carousel rilisan |
| Release detail | dokumen rilisan | artwork dominan, metadata mono rapat, embed resmi, jalur balik ke katalog |
| Visuals | galeri gerak | grid video asimetris, satu thumbnail besar sebagai anchor |
| Portrait studies | arsip foto | grid potret editorial + lightbox, rasio konsisten |
| Live | jadwal | daftar/linimasa event, tanpa mengarang data, CTA booking jelas |
| Archive/Universe | indeks editorial | linimasa era, artwork arsip, tautan rute proyek |
| About | profil | potret + narasi panjang dengan measure `--container-text` |
| EPK/Press | dokumen siap pakai | sheet informasi, capability list, kontak resmi |
| Inquiry | form | kolom kontak + form, label mono, status jelas |
| Licensing | ketentuan | teks bernomor, tabel sederhana, kontak legal |
| Privacy | dokumen | teks panjang, measure sempit, tanpa dekorasi |

Yang menyatukan semuanya: gutter yang sama, ritme `--section-y`, metadata mono,
satu aksen, dan lapisan signature.

## 6. Mobile 360–390px

- Target utama: 360, 375, 390. Batas bawah yang diuji: 320.
- Judul hero dan judul halaman memakai clamp yang dihitung dari ruang nyata
  (viewport − 2 × gutter) dan diuji di
  `server/mobileLayout.test.ts`.
- Kata panjang tanpa spasi (nama, email, URL) wajib bisa dipenggal
  (`overflow-wrap: break-word`). Jangan pernah mengunci `overflow-wrap`/
  `word-break` ke `normal`.
- Player global tidak boleh menutupi akhir halaman: `html[data-an-player]`
  menambah `padding-bottom` pada `body`.
- Navigasi mobile memakai satu drawer (`.nf-mobile-drawer-root`, z-index
  `--z-overlay`), bukan tiga sistem berbeda.

## 7. Utang yang harus diselesaikan di tahap redesign

1. **Tiga lapisan token**: `index.css` (`:root`), scope editorial di
   `EditorialRefresh.css`, dan alias `--ref-*` + `--public-*` di
   `CinematicReference.css`. Nilai `--ink`/`--acid` berbeda tipis antar lapisan.
   Rencana: jadikan `index.css` satu-satunya definisi, lalu scope editorial
   hanya menimpa yang disengaja.
2. **`!important`**: 1257 kemunculan, terbanyak di `CinematicReference.css`
   (603) dan `MaturePalette.css` (183). Kurangi bertahap per halaman saat
   halaman itu disentuh; jangan menambah.
3. **Dua sistem halaman**: `.an-site` (Home) dan `.nf-page`/`.en-page`
   (halaman lain) punya definisi nav/section/hero sendiri. Arah jangka
   panjang: satu page shell + section primitives.
4. **Dimensi gambar dari CMS**: metadata `width`/`height` belum ikut dari CMS,
   jadi sebagian gambar mengandalkan rasio komposisi.
5. **Verifikasi browser**: jalankan `pnpm audit:layout`, lalu cek 360/375/390 di
   browser untuk overflow, tabrakan player/nav, dan crop gambar.
