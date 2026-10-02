# Audit & Fondasi Redesign — Laporan Tahap 0

Tanggal: 2026-10-02 · Branch: `arena/01a0fba8-akbar-next` (dari `main` @ `1f9b7dc`)

Dokumen ini merangkum audit menyeluruh, perubahan fondasi yang dilakukan, dan
yang sengaja **tidak** dilakukan pada tahap ini. Kontrak visual untuk tahap
berikutnya ada di [`design-language.md`](design-language.md).

---

## 1. Yang diaudit

- **Framework & build**: React 19 + Vite 7, SPA dengan SSR custom
  (`client/src/entry-server.tsx`), Express + tRPC + Drizzle untuk API.
- **Routing**: `wouter`, rute ID + EN + studio + game (lihat `client/src/App.tsx`).
- **Styling**: Tailwind v4 + CSS per komponen/halaman; urutan import
  `index.css` → `CinematicReference.css` → CSS shell/App → CSS halaman (code-split).
- **Font**: Fontshare self-host (Clash Display / General Sans / Azeret Mono).
- **Motion & signature**: `client/src/signature/**` (store, capability,
  pointer, audio, route, particle engine) + `components/signature/**`.
- **Global nav**: `NightFrequencyChrome.tsx/.css` + `EnglishChrome.tsx` +
  `MobileNav.tsx` + `Home.css` (`.an-mobile-navigation`).
- **Global player**: `components/signature/GlobalAudioPlayer.tsx/.css`.
- **CMS**: tRPC `content.documents` → `content/publicContent.ts` → halaman.
- **Media**: `OptimizedEditorialImage`, `ResilientArtworkImage`,
  `ResilientBrandImage`, `lib/publicMedia.ts`, `client/public/assets/**`.
- **SEO**: metadata SSR (`ssr/prefetch`, `_core/ssrHtml`), JSON-LD, sitemap,
  `scripts/verify-ssr.sh`.
- **Bahasa**: ID + EN (rute `/en/*`), `EnglishLayer.css`.
- **Game**: `pages/GameJedagRun.tsx` + `game/jedagRun/**` (tidak disentuh).
- **Studio/Admin**: `pages/ContentStudio.tsx`, `Admin.tsx` (tidak disentuh).
- **PR #7**: `gh pr diff 7` (27 file, +1593/−408) — lihat bagian 4.

Baseline sebelum perubahan: `pnpm check` lulus, `pnpm test` 47 file /
247 tes lulus.

## 2. Temuan arsitektur & layout

### Kritis

1. **PR #7 melepas seluruh lapisan signature dari shell.** `<SignatureBackground />`,
   `<RouteSignalCurtain />`, dan `<CursorSignal />` dihapus dari
   `PublicShell.tsx`; `SignatureStage` dipaksa `data-live="false"` sehingga
   jalur scroll 140vh-nya runtuh. Mesin partikel, store, dan CSS-nya masih
   utuh — hanya tidak pernah dipasang. Tidak ada tes yang gagal, jadi
   kehilangannya tidak terdeteksi.
2. **Font merek tidak pernah terpakai.** `CinematicReference.css` mengarahkan
   `--ref-serif-display` ke `"Syne"`, `--ref-body` ke `"Plus Jakarta Sans"`,
   dan `--ref-mono` ke `"JetBrains Mono"` — tidak ada satu pun yang punya
   `@font-face`. Karena aturan itu memakai `!important`, seluruh `h1–h3`
   halaman publik dan metadata mono turun ke font sistem (Arial/Arial Narrow).
   `NightFrequencyChrome.css` juga memakai `"JetBrains Mono"` 5×.
3. **Overflow diselesaikan dengan menyembunyikan, di 6 tempat**:
   `html`/`body`/`#root` (`overflow-x: hidden`), `.nf-page` (2 file),
   `.an-site`, dan scope editorial — plus `.nf-page p { overflow-wrap: normal
   !important }` yang mematikan pemenggalan kata. Kombinasi keduanya membuat
   teks panjang bisa keluar layar tanpa terlihat saat dikembangkan.
4. **Judul halaman dalam terlalu besar di mobile.** `clamp(3.25rem, 17vw, 6rem)`
   ≈ 61px di 360px, sementara "NAWASUNDA." butuh ~6,96em (±426px) pada ruang
   316px — kata dipenggal `word-break` dan terlihat sebagai judul terpotong.

### Struktural

5. **Tiga lapisan token dengan nilai berbeda** untuk nama yang sama
   (`index.css`, scope `.an-public-shell.an-editorial`, alias `--ref-*`/
   `--public-*`/`--hx-*`). Contoh: `--ink` `#0a0b0c` vs `#101211`,
   `--acid` `#8fb2c0` vs `#9bb9c1`.
6. **`!important` 1.257 kemunculan** (CinematicReference 603, MaturePalette 183,
   Home.css 174, EditorialRefresh 126) — saling menimpa antar lapisan.
7. **Dua sistem halaman** (`.an-site` vs `.nf-page`/`.en-page`), masing-masing
   mendefinisikan ulang nav, section, dan hero.
8. **Aksen neon warisan** di `CinematicReference.css`
   (`rgba(24,215,242)`, `rgba(30,232,255)`) — keluarga warna yang sudah
   dilarang dokumentasi repo, bocor ke shadow/ hover/border.
9. **Sistem gambar terduplikasi**: `MOBILE_OPTIMIZED_VARIANTS` ditulis dua kali
   di dua komponen, `sizes` dipasang tanpa `srcSet` (atribut mati), banyak
   gambar tanpa ukuran intrinsik → layout shift.
10. **Z-index tanpa skala**: 24 nilai berbeda, dari `-2` sampai `999999`.
11. **`100vw`** dipakai 3× sebagai lebar/max-width (termasuk
    `calc(100vw - 40px)` pada hero note dan player) — `100vw` ikut menghitung
    scrollbar desktop.

## 3. Yang diubah (fondasi saja)

| File | Perubahan |
| --- | --- |
| `client/src/shell/PublicShell.tsx` | Memasang kembali `<SignatureBackground />`, `<RouteSignalCurtain />`, `<CursorSignal />` (client-only, urutan render = urutan lapisan) + komentar identitas. |
| `client/src/components/signature/SignatureStage.tsx` | Mengembalikan `data-live` dari runtime (`ready && tier !== "off"`), `stagePhrase`, `data-active`, `aria-hidden` baris era; dokumen ulang sebagai panggung hidup. |
| `client/src/index.css` | Token design language (container, skala spasi, skala tipe, rasio media, skala `--z-*`, breakpoint), `h1–h3` memakai token tipe, primitif `.an-container`/`.an-section`/`.an-rule`/`.an-media`/`.an-fade-in`/`.an-lift`, dan **kontainmen policy**: `overflow-x` dihapus dari `html`/`body`/`#root`. |
| `client/src/shell/PublicShell.css` | Satu jaring pengaman `overflow-x: clip` di `.an-public-shell` + dokumentasi alasannya. |
| `client/src/pages/Home.css`, `EcosystemPages.css`, `CinematicReference.css`, `shell/EditorialRefresh.css` | Menghapus `overflow-x: clip` per halaman yang kini redundan. |
| `client/src/CinematicReference.css` | `--ref-*` font → token font yang benar-benar dimuat; `p { overflow-wrap: normal !important }` → `break-word`; aksen neon → `color-mix(var(--acid))`; `100vw` → `100%`; clamp judul halaman di mobile → `clamp(2.4rem, 11.5vw, 4rem)` (fit 320–430px). |
| `client/src/components/NightFrequencyChrome.css` | 5× `"JetBrains Mono"` → `var(--font-mono)`. |
| `client/src/components/RouteTransition.css` | Fallback font mono tidak lagi menunjuk font yang tidak dimuat. |
| `client/src/lib/responsiveImage.ts` (baru) | Manifest ukuran intrinsik (diukur dari file), varian mobile, kandidat AVIF, preset `sizes`, `srcSetFor`, `pictureSourcesFor`, rantai fallback, kebijakan loading. |
| `client/src/components/OptimizedEditorialImage.tsx` | Memakai modul di atas: `<picture>` dari manifest, `srcSet` ber-`w`, `width`/`height` intrinsik, `sizePreset`, `priority`, fallback berurutan. |
| `client/src/components/ResilientArtworkImage.tsx/.css` | Sama: `srcSet` + ukuran intrinsik + fallback; warna fallback memakai token brand (bukan palet lama). |
| `client/src/components/signature/GlobalAudioPlayer.css` | `100vw` → `100%` (viewport tanpa scrollbar). |
| `server/signatureChrome.test.ts` (baru) | Penjaga regresi: shell wajib memasang ketiga lapisan signature, `data-live` tidak boleh dipatok mati, dan SSR tidak boleh membocorkan canvas/lapisan client. |
| `server/mobileLayout.test.ts` | Tes baru: semua clamp judul halaman dalam harus muat di 320px. |
| `server/editorialOptimization.test.ts` | Diubah dari pengecekan string source menjadi tes render (SSR) untuk markup gambar, plus kontrak kontainmen baru. |
| `scripts/audit-layout.mjs` + `pnpm audit:layout` (baru) | Audit kebijakan: overflow tersembunyi, font tanpa `@font-face`, `100vw`, `!important`, `backdrop-filter`, skala z-index. |

### Yang sengaja tidak diubah

Konten CMS, URL/rute, form, admin/studio, game `/game/jedag-run`, struktur
token brand, dan komposisi/desain halaman. Tidak ada gambar AI, tidak ada
imagery generik, dan tidak ada asset yang diganti.

## 4. Particle system: bagaimana ditemukan & dipulihkan

1. `gh pr diff 7` menunjukkan blok yang dihapus di `PublicShell.tsx`:
   `-import { CursorSignal }`, `-import { RouteSignalCurtain }`,
   `-import { SignatureBackground }`, lalu `-<SignatureBackground />`,
   `-<RouteSignalCurtain />`, `-<CursorSignal />`.
2. Diff yang sama menunjukkan `SignatureStage` diubah menjadi statis
   (`data-live="false"`, selector `useSignatureState` dihapus).
3. Mesinnya masih utuh: `signature/field/particleField.ts` (1.193 baris),
   `signature/signatureStore.ts`, `capability.ts` (anggaran partikel: desktop
   hingga ribuan titik, `lite` ≤ 480, `off` = 0), `pointerSignal.ts`,
   `audioSignal.ts`, `routeSignal.ts`, dan CSS `.an-signature-field` yang
   mengatur opasitas per mode rute (wordmark/signal/dust/era/quiet/frequency).
4. Pemulihan: tiga lapisan dipasang kembali di `ShellSurfaces` (setelah mount,
   jadi tidak ada `<canvas>` di HTML SSR — sesuai
   `server/signatureRuntime.test.ts`), dan panggung wordmark kembali hidup.
5. Penjaga: `server/signatureChrome.test.ts` gagal kalau ada yang melepasnya
   lagi tanpa menggantinya.

## 5. Hasil validasi tahap ini

- `pnpm check` (tsc) — lulus.
- `pnpm test` — 48 file / 251 tes lulus.
- `pnpm audit:layout` — tidak ada pelanggaran kebijakan fondasi.
- `pnpm build` + `bash scripts/verify-ssr.sh` — dijalankan pada tahap ini
  (lihat catatan commit).
- Dev server + rute publik — dicek manual pada tahap ini.

Belum dikerjakan (memang di luar tahap): redesign halaman, konsolidasi tiga
lapisan token, penghapusan `!important` bertahap, dan verifikasi browser
360/375/390 (butuh browser sungguhan).

## 6. Siap untuk tahap redesign berikutnya

- Design language + token + primitif (`docs/design-language.md`,
  `client/src/index.css`).
- Sistem gambar bersama (`lib/responsiveImage.ts` + dua komponen).
- Signature motion hidup kembali, dengan tes penjaga.
- Kebijakan kontainmen yang tidak menutupi bug + alat audit.
- Urutan kerja yang disarankan: (1) konsolidasi token ke `index.css`,
  (2) shell + primitives (nav/footer/container/section/media),
  (3) Music → Home → rute lain, satu rute per commit, `pnpm check` +
  `pnpm test` + `pnpm audit:layout` sebagai gerbang.
