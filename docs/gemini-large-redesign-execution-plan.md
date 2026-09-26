# Gemini Large Redesign — Direct Execution Plan

## Tujuan

Redesign besar-besaran website Akbar Nawasunda agar terasa seperti official website established independent electronic artist: cinematic, editorial, dark, photographic, tactile, premium, dan tetap ringan secara teknis.

Jangan membuat website baru dari nol. Redesign repository yang sudah ada dengan mempertahankan seluruh konten, route, link, player, CMS, form, SEO, SSR, dan integrasi yang sudah berfungsi.

## Aturan Mutlak

1. Jangan mengarang release, event, achievement, statistik, social account, artist information, atau link baru.
2. Jangan menghapus fitur yang sedang berjalan hanya agar implementasi lebih mudah.
3. Jangan mengubah data artist hanya karena ingin mencocokkan reference image.
4. Jangan menyalin gambar reference secara literal. Gunakan hanya bahasa visualnya.
5. Jangan menambahkan generic SaaS layout, glassmorphism, excessive neon, excessive gradient, rounded card berlebihan, atau dekorasi futuristik acak.
6. Website harus tetap all-dark dengan cyan sebagai accent/signal yang terkontrol.
7. Music catalog wajib tetap menjadi horizontal carousel dan harus bisa digunakan dengan mouse, keyboard, dan touch.
8. Semua iframe/embed/video wajib berada di dalam container dan tidak boleh menyebabkan horizontal overflow.
9. Mobile 390px adalah target utama, bukan versi desktop yang diperkecil.
10. Semua halaman harus memiliki komposisi berbeda tetapi tetap berada dalam satu Akbar Nawasunda visual world.
11. Jangan menggunakan `!important` secara massal untuk menutupi struktur CSS yang buruk.
12. Jangan commit file build, secret, screenshot sementara, atau dependency yang tidak diperlukan.
13. Jangan melakukan `git push --force`.
14. Kerjakan satu fase pada satu waktu. Setelah satu fase selesai dan semua quality gate lolos, baru lanjut fase berikutnya.

## Repository Context

- Stack: React + Vite + Wouter
- Package manager: pnpm
- Tests: Vitest
- SSR quality gate: `scripts/verify-ssr.sh`
- Main source: `client/src`
- Existing public pages: Home, Music, Release detail, Visuals, Portraits, Live, Archive/Universe, About, EPK, Inquiry/Contact, Licensing, Privacy, English routes
- Existing working behavior must be preserved.

## Reference Direction

Gunakan visual reference yang diberikan user sebagai arah untuk:

- dark black/blue cinematic atmosphere,
- large artist photography,
- strong editorial headline,
- compact mono metadata,
- thin rules and measured grid,
- cyan signal accent,
- restrained texture/grain,
- large artwork,
- horizontal release content,
- strong whitespace,
- clear hierarchy,
- premium independent electronic artist identity.

Reference tidak boleh diterjemahkan menjadi copy-paste layout identik pada semua halaman.

---

# Execution Protocol

## Phase 0 — Baseline dan Audit

### Tugas

1. Inspect repository structure, routes, shared components, page CSS, content sources, assets, integrations, and test files.
2. Buat route inventory lengkap.
3. Buat dependency map:
   - shared shell,
   - pages,
   - media components,
   - CMS/content,
   - embeds,
   - metadata/SEO,
   - forms,
   - responsive styles.
4. Jalankan baseline:

```bash
pnpm check
pnpm test
pnpm build
bash scripts/verify-ssr.sh
```

5. Capture screenshot baseline pada:
   - `/`
   - `/music`
   - `/visuals`
   - `/live`
   - `/universe`
   - `/about`
   - `/epk`
   - `/inquire`

   Gunakan viewport 390x844 dan 1440x900.

### Output sebelum edit

Buat `docs/redesign-audit.md` berisi:

- route table,
- existing feature table,
- asset table,
- known layout issues,
- performance risks,
- files yang akan diubah,
- files yang tidak boleh disentuh tanpa alasan.

### Stop condition

Jangan implement apa pun sampai audit selesai dan baseline semua lolos. Jika baseline gagal, perbaiki baseline issue terlebih dahulu dan jelaskan penyebabnya.

---

## Phase 1 — Design System

### Tugas

Bangun token visual terpusat, tanpa mengubah struktur besar halaman:

- background,
- surface,
- text,
- muted text,
- cyan accent,
- border/rule,
- display font,
- body font,
- mono font,
- container width,
- section spacing,
- shadow,
- breakpoint.

Buat atau rapikan struktur CSS menjadi jelas. Jangan menambah layer bernama `final`, `override-final`, atau `emergency-fix`.

### Acceptance criteria

- Tidak ada warna random yang tersebar tanpa token.
- Typography hierarchy konsisten.
- Text contrast tetap terbaca.
- Tidak ada perubahan route atau data.
- Desktop dan mobile masih render dengan baik.

Jalankan semua quality gate.

---

## Phase 2 — Shared Shell dan Primitives

### Tugas

Rapikan atau buat komponen reusable untuk:

- Header / desktop nav,
- mobile nav,
- footer,
- page container,
- section header,
- eyebrow label,
- button/link,
- media frame,
- artwork card,
- horizontal carousel,
- embed wrapper,
- loading/fallback state.

### Acceptance criteria

- Header dan footer konsisten di semua public route.
- Mobile menu usable di 390px.
- Semua embed mempunyai `max-width: 100%`, containment, dan aspect ratio yang stabil.
- Carousel mendukung horizontal touch scroll, keyboard focus, dan arrow controls.
- Tidak ada perubahan pada link atau fungsi asli.

Jalankan quality gate dan screenshot representative routes.

---

## Phase 3 — Music Page

Gunakan urutan ini:

```text
Music Hero
Featured Release
Platform Hub
Direct Listening / Embedded Players
All Releases Horizontal Carousel
Release CTA / Story
Newsletter or Signal
Footer
```

### Tugas visual

- Hero memakai portrait/artwork asli dengan cinematic crop.
- Headline besar tetapi tidak terpotong pada 390px.
- Metadata memakai mono font.
- Featured release memakai artwork asli dan hierarchy jelas.
- Platform links menggunakan data asli.
- Player terlihat rapi dan contained.
- Carousel memperlihatkan sebagian card berikutnya sebagai affordance.

### Acceptance criteria

- Semua release dan link tetap asli.
- Player tetap bekerja.
- Carousel tidak berubah menjadi grid vertical.
- Tidak ada horizontal overflow pada 390px.
- Tidak ada card atau text overlap.

---

## Phase 4 — Homepage

Gunakan struktur:

```text
Artist Hero
Latest Signal / Intro
Selected Music
Visual Frequency
Live / Booking
Stay Connected
Footer
```

Homepage tidak boleh menjadi copy dari Music page.

### Acceptance criteria

- Hero menjadi fokus utama.
- CTA pertama jelas.
- Ada visual rhythm antara photo, type, dan rule lines.
- Semua content tetap berdasarkan data existing.
- Above-fold tidak memuat semua image dan iframe sekaligus.

---

## Phase 5 — Visual, Live, Archive, About, EPK, Contact

Implement satu route group per commit atau per logical change.

### Visual

- Large image/video composition.
- Gallery tetap accessible.
- Image loading lazy di bawah fold.

### Live

- Event timeline atau event list jelas.
- Tidak mengarang event.
- Booking CTA tetap mudah ditemukan.

### Archive / Universe

- Archive terasa seperti editorial index.
- Tidak mengubah data arsip.

### About

- Artist story dan timeline mudah dibaca.
- Hindari blok teks terlalu padat.

### EPK / Contact

- Information hierarchy kuat.
- Form field terbaca.
- CTA tidak tersembunyi.
- Inquiry flow dan validation tetap berfungsi.

### Acceptance criteria

Setiap route memiliki komposisi sendiri, tetapi memakai tokens, shell, typography, and media treatment yang sama.

---

## Phase 6 — Performance Pass

### Wajib dilakukan

1. Gunakan AVIF/WebP dan responsive `srcset` bila asset tersedia.
2. Jangan preload semua image.
3. Preload hanya hero image yang benar-benar above-fold.
4. Lazy-load image di bawah fold.
5. Lazy-load iframe/embed ketika dibutuhkan atau mendekati viewport.
6. Hindari `background-attachment: fixed` pada mobile.
7. Gunakan route-level code splitting jika aman.
8. Batasi expensive blur, filter animation, and scroll listeners.
9. Tetapkan `aspect-ratio` pada media untuk mencegah CLS.
10. Pastikan reduced motion support.

### Target

- LCP mobile < 2.5s bila realistis.
- CLS < 0.1.
- INP < 200ms.
- Tidak ada image atau iframe yang memaksa layout melebar.
- Tidak ada console error fatal.

Jangan mengejar angka dengan mengorbankan image quality secara ekstrem.

---

## Phase 7 — Responsive dan Accessibility Audit

Verifikasi semua route pada:

- 390x844
- 768x1024
- 1280x800
- 1440x900

### Checklist

- no horizontal overflow,
- no clipped headline,
- no overlapping text,
- no unreadable low contrast,
- no broken image,
- no iframe overflow,
- nav mobile works,
- buttons have visible focus,
- keyboard can reach carousel controls,
- touch targets are usable,
- headings preserve hierarchy,
- image alt text is meaningful,
- reduced motion works.

Jika menemukan issue, perbaiki pada komponen/token yang tepat, bukan dengan random per-route patch.

---

## Phase 8 — Final Verification dan Delivery

Jalankan:

```bash
pnpm check
pnpm test
pnpm build
bash scripts/verify-ssr.sh
git diff --check
git status --short
```

Smoke-test semua route utama dengan HTTP 200.

Review git diff untuk memastikan:

- tidak ada secret,
- tidak ada generated build output,
- tidak ada screenshot sementara,
- tidak ada data palsu,
- tidak ada deletion fitur tanpa alasan,
- lockfile tetap tersedia,
- perubahan masih terukur.

### Commit strategy

Gunakan commit kecil dan jelas:

```text
chore: audit redesign baseline
feat: establish cinematic design tokens
feat: refine shared public shell
feat: redesign music page composition
feat: redesign homepage composition
feat: refine visual and live pages
perf: optimize public media loading
fix: resolve responsive overflow and contrast issues
```

Push hanya setelah local gates hijau. Jangan force push.

---

# Format Laporan AI Setelah Setiap Fase

Gunakan format ini:

```text
PHASE: [nama fase]
STATUS: PASS / BLOCKED

FILES CHANGED:
- path/file.tsx — alasan
- path/file.css — alasan

FUNCTIONALITY PRESERVED:
- [daftar fungsi yang diverifikasi]

VISUAL VERIFICATION:
- desktop: PASS/FAIL
- mobile 390px: PASS/FAIL
- overflow: PASS/FAIL
- contrast: PASS/FAIL

QUALITY GATES:
- pnpm check: PASS/FAIL
- pnpm test: PASS/FAIL
- pnpm build: PASS/FAIL
- SSR: PASS/FAIL

KNOWN ISSUES:
- [jika ada]

NEXT PHASE:
- [fase berikutnya]
```

# Instruksi Awal yang Bisa Langsung Ditempel ke Gemini

```text
Baca file docs/gemini-large-redesign-execution-plan.md sebagai kontrak kerja utama.

Kerjakan hanya Phase 0 terlebih dahulu. Jangan mengedit source code sebelum audit selesai.
Inspect repository, routes, components, content, assets, embeds, metadata, tests, and responsive CSS.
Jalankan baseline checks dan buat docs/redesign-audit.md.

Setelah itu berhenti dan laporkan:
- route inventory,
- existing feature inventory,
- visual problems,
- performance risks,
- exact files planned for each phase,
- baseline command results.

Jangan mengarang data. Jangan menghapus fungsi. Jangan melakukan redesign sekaligus.
``` 
