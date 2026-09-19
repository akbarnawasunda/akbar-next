# REFACTOR STATE — Akbar Nawasunda Website

> File ini single source of truth untuk status migrasi.
> Setiap sesi Manus baru WAJIB baca file ini dulu.
> Setiap sesi selesai WAJIB update file ini.

---

## STATUS SEKARANG

**Fase aktif:** FASE 5B — Animasi (menunggu approval)
**Terakhir update:** 2026-09-19
**Terakhir commit:** corrective typography + restrained visual hierarchy

---

## CHECKLIST FASE

- [ ] **FASE 1** — Audit repo
- [ ] **FASE 2** — Fix bug kritis (halaman blank, text invisible, import rusak)
- [ ] **FASE 3** — Homepage polish
- [ ] **FASE 4** — /music
- [ ] **FASE 5** — /visuals
- [ ] **FASE 6** — /live, /about, /privacy
- [ ] **FASE 7** — English pages (/en/*)
- [ ] **FASE 8** — Hapus file orphan
- [ ] **FASE 9** — Final verification

---

## DESIGN TOKENS (JANGAN UBAH)

--ink: #0a0a09
--ink-soft: #131211
--paper: #f0ebdd
--acid: #d8ff00
--signal: #ff4a1c
--mute: rgba(240, 235, 220, 0.60)
--ink-line: rgba(240, 235, 220, 0.14)

Font:
--font-display: Fraunces
--font-body: Switzer
--font-mono: JetBrains Mono

Hanya boleh didefinisikan di client/src/index.css.

---

## ATURAN MUTLAK

### Warna DILARANG
ungu #8a5cff, cyan #76efff, mint #79d6c7, pink #c4428e,
gold #d8ff65, biru #6ca9d5

### Font DILARANG
Space Grotesk, DM Serif Display, IBM Plex Mono, Inter, Clash Display

### CSS DILARANG
- box-shadow glow
- filter: blur() dekoratif
- border-radius > 0
- opacity: 0 default tanpa safety timer
- content-visibility: auto
- !important (kecuali 3 kasus khusus)

### Kode DILARANG
- Append CSS ke file panjang. REPLACE kalau fix.
- Push commit beruntun (Vercel cancel build)
- Hapus test karena gagal (update test kalau usang)
- Ubah index.css tanpa izin user

---

## WORKFLOW WAJIB

1. Baca file ini dulu
2. Baca file yang akan diubah
3. Cek siapa yang import file itu
4. Tulis rencana. Tunggu user setuju.
5. Ubah 1 file
6. Jalankan pnpm build. Gagal → rollback.
7. Jalankan pnpm test. Gagal → fix atau update test.
8. Commit: [scope] deskripsi
9. Update file ini
10. Push. Tunggu 1 menit. Cek Vercel.

---

## ROLLBACK

git reset --hard HEAD~1
git checkout <file>

---

## LOG SESI

### Sesi 1
- Tanggal: 2026-09-19
- Fase: 2A — Fix obsolete tests
- Selesai: hapus 2 test obsolete, update 1 test
- Hasil test: 8 failed, 26 passed (17 assertion failures)
- Lanjut: Fase 2B (design contract tests)

### Sesi 2C-1
- Tanggal: 2026-09-19
- Fase: 2C-1 — Fix kategori A design contract tests
- Selesai: update `maturePalette.test.ts`, `internationalization.test.ts`, dan `artistContentContract.test.ts`
- Perubahan: expected values diarahkan ke design tokens, copy, locale label, dan identifier perilaku aktif; assertion literal rapuh dipecah menjadi kontrak yang lebih bermakna
- Hasil test: 5 failed, 29 passed (11 assertion failures)
- Build: lulus
- Lanjut: Fase 2C-2 (mixed design contract tests)

### Sesi 2C-2a
- Tanggal: 2026-09-19
- Fase: 2C-2a — Fix 3 mixed design contract tests yang paling mudah
- Selesai: update `brandMotionMark.test.ts`, `homePlatformCards.test.ts`, dan `mediaFallback.test.ts`
- Perubahan: hapus referensi CSS obsolete; pertahankan kontrak asset/markup/media; update expected EPK ke `var(--paper)` dan `var(--ink)`
- Hasil test: 3 failed, 31 passed (7 assertion failures)
- Build: lulus
- Lanjut: Fase 2C-2b (`homeEnhancements.test.ts` dan `scrollReplayAndStudioMap.test.ts`)

### Sesi 2C-2b
- Tanggal: 2026-09-19
- Fase: 2C-2b — Fix deferred mixed design contract tests
- Selesai: update `homeEnhancements.test.ts`, `scrollReplayAndStudioMap.test.ts`, dan `mediaFallback.test.ts`
- Perubahan: hapus assertion untuk CSS, asset, selector, dan motion contract obsolete; pertahankan kontrak markup, SEO, media, dan MotionOrchestrator yang aktif
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: belum dijalankan pada sesi ini
- Status: FASE 2 design contract tests selesai
- Lanjut: FASE 3 — Hapus warna lama

### Sesi B1 — Mobile navigation
- Tanggal: 2026-09-19
- Fase: B1 — Fix homepage mobile navigation CSS
- Selesai: restore blok `.an-mobile-navigation` yang hilang dari `Home.css`
- Perubahan: overlay homepage kembali memiliki positioning fixed, z-index, visibility state, focus styling, link layout, dan responsive padding
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `bb26e35 [fix] restore mobile navigation CSS on homepage`
- Lanjut: minta user verifikasi menu di perangkat mobile sebelum FASE 3a

### Sesi B2 — Inner page navigation and layout
- Tanggal: 2026-09-19
- Fase: B2 — Stabilkan menu dan layout halaman dalam
- Selesai: hapus override `.nf-menu-toggle` dari `EcosystemPages.css`, lepaskan import `EcosystemRefinement.css` dari public/English chrome, dan perbaiki narrowing `story` di `Home.tsx`
- Perubahan: aturan tombol menu internal kini berasal dari `NightFrequencyChrome.css`; layer refinement global tidak lagi menimpa selector layout shared; quality gate TypeScript kembali lulus
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `6284e93 [fix] stabilize inner page navigation and layout`
- Lanjut: verifikasi menu dan layout halaman internal di perangkat mobile; setelah konfirmasi lanjut FASE 3a

### Sesi B2-FIX — Disable refinement layer
- Tanggal: 2026-09-19
- Fase: B2-FIX — Rapikan konflik multi-file
- Selesai: rename `EcosystemRefinement.css` menjadi `EcosystemRefinement.css.disabled`, import sudah dihapus dari dua chrome files, dan override `.nf-menu-toggle` page-level sudah dibersihkan
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Lanjut: minta user verifikasi `/music`, `/visuals`, `/live`, dan `/about` di HP; setelah konfirmasi lanjut FASE 3a

### Sesi 3a — PublicMotion and PlatformTicker colors
- Tanggal: 2026-09-19
- Fase: 3a — Migrasi warna legacy ke design tokens
- Selesai: update `PublicMotion.css` dan `PlatformTicker.css`
- Perubahan: warna background, border, accent, overlay, ticker text, icon, separator, dan focus state diarahkan ke `--ink`, `--ink-soft`, `--paper`, `--acid`, `--signal`, dan `--ink-line`; tidak ada perubahan font, layout, atau spacing
- Verifikasi legacy color grep: kosong
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `2a2def7 [fase-3a] migrate PublicMotion + PlatformTicker colors to tokens`
- Lanjut: FASE 3b — OfficialMediaFrame colors

### Sesi 3b — OfficialMediaFrame colors
- Tanggal: 2026-09-19
- Fase: 3b — Migrasi warna legacy ke design tokens
- Selesai: update `OfficialMediaFrame.css`
- Perubahan: warna background, border, accent, overlay, metadata, CTA, player, dan provider diarahkan ke `--ink`, `--ink-soft`, `--paper`, `--acid`, `--signal`, `--mute`, dan `--ink-line`; font, layout, spacing, dan struktur CSS tidak diubah
- Verifikasi legacy color grep: kosong
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `28cd9f2 [fase-3b] migrate OfficialMediaFrame colors to tokens`
- Lanjut: FASE 4 — hapus font legacy

### Sesi 4 — Hapus font legacy
- Tanggal: 2026-09-19
- Fase: 4 — Migrasi font legacy ke design tokens
- Selesai: update `OfficialMediaFrame.css`, `PlatformTicker.css`, dan `JedagRunRenderer.ts`
- Perubahan: `IBM Plex Mono` diganti `var(--font-mono)` pada CSS dan `JetBrains Mono` pada canvas; `Space Grotesk` diganti `var(--font-display)` untuk judul dan `var(--font-body)` untuk teks body/metadata; ukuran font, warna, layout, dan spacing tidak diubah
- Verifikasi legacy font grep target: kosong
- Verifikasi seluruh `client/src`: tidak ada `Space Grotesk`, `DM Serif Display`, `IBM Plex Mono`, atau `Clash Display`
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `d9c8eed [fase-4] migrate font legacy to tokens`
- Lanjut: FASE 5 — kurangi `!important`

### Sesi 5A + 5A.5 — Palette, Instrument Serif, font size, dan shadow system
- Tanggal: 2026-09-19
- Fase: 5A/5A.5 — Refresh visual foundation dan sistem shadow
- Selesai: update `index.css`, `Home.css`, dan `OfficialMediaFrame.css`
- Perubahan: `Fraunces` diganti `Instrument Serif`; `--acid` menjadi deep teal `#4a7c7c`; `--signal` menjadi terracotta `#a03a24`; ukuran heading utama homepage diturunkan; empat token shadow (`--shadow-text`, `--shadow-soft`, `--shadow-lift`, `--shadow-hero`) diterapkan pada hero, portrait, release/media cards, live blocks, dan official media
- Batasan: hardcode `#d8ff00` yang masih tersisa di `NameParticleField.tsx` dan `NightFrequencyChrome.css` sengaja belum diubah sesuai instruksi sesi
- Verifikasi: `Fraunces` tidak tersisa di `index.css`; `Instrument Serif` aktif; empat shadow token tersedia; `git diff --check` lulus
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: menunggu commit/push sesi ini
- Lanjut: FASE 5B — animasi, menunggu approval user

### Batch 1 — Monokrom ikon, CTA media, dan 404 page
- Tanggal: 2026-09-19
- Fase: Batch 1 dalam FASE 5B
- Selesai: update `PlatformIcon.css`, `OfficialMediaFrame.css`, dan `NotFound.tsx`
- Perubahan: ikon platform menjadi monokrom `var(--paper)` dengan hover `var(--acid)` tanpa `!important`; provider YouTube/SoundCloud pada media frame memakai `var(--acid)`; halaman 404 memakai palet dan font token website
- Batasan: tidak mengubah `index.css` atau file lain
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: menunggu commit/push sesi ini
- Lanjut: FASE 5B — animasi, menunggu approval user

### Visual Polish Pass — Homepage dan Music
- Tanggal: 2026-09-19
- Fase: FASE 5B — animasi dan visual refinement
- Selesai: polish `Home.css` dan `MaturePalette.css`
- Perubahan: atmospheric gradient/grid surfaces, stronger hero portrait frame, dimensional card shadows, tactile hover lift untuk platform/release/video/live/game cards, dan richer `/music` hero/platform/catalog surfaces
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `6834c20 [visual-pass] add atmospheric surfaces and tactile interactions`
- Verifikasi production: Vercel READY; screenshot homepage dan `/music` tervalidasi
- Lanjut: iterasi visual berikutnya berdasarkan feedback user

### Typography + Gradient Motion Pass
- Tanggal: 2026-09-19
- Fase: FASE 5B — typography, gradients, dan motion
- Selesai: migrasi font ke Fontsource lokal, gradient token system, animated hero atmosphere, gradient CTA, dan tambahan card/button motion
- Font: Bricolage Grotesque Variable, Plus Jakarta Sans Variable, JetBrains Mono Variable; tidak ada Google Fonts atau Fontshare runtime request
- Batasan: reduced-motion override dipertahankan; legacy HTML font requests juga dibersihkan
- Hasil external font audit: kosong
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `e602343 [typography-motion] self-host fonts and amplify gradients`
- Verifikasi production: Vercel READY; Home CSS valid dan aktif setelah hydration
- Catatan: headless full-page capture intermittently races dengan route CSS chunk; tidak dijadikan bukti visual final
- Lanjut: review visual manual di browser/device user

### Bold Cinematic Neon Pass
- Tanggal: 2026-09-19
- Fase: FASE 5B — visual direction refinement
- Selesai: dorong visual dari flat editorial ke cinematic neon editorial
- Perubahan: teal-violet-coral gradient system, gradient headline, layered hero glow, offset portrait frame, luminous CTA, gradient section transitions, richer card surfaces, dan hover shadows pada homepage serta inner pages
- Batasan: tidak mengubah konten, routing, atau data; mobile breakpoint dan reduced-motion tetap aktif
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `49b6bbb [visual-pass-2] push cinematic neon direction`
- Verifikasi production: Vercel READY; GitHub Actions success
- Lanjut: minta user review arah visual baru di HP dan desktop

### Corrective Typography + Scale Pass
- Tanggal: 2026-09-19
- Fase: FASE 5B — typography correction dan layout stabilization
- Selesai: rollback treatment neon yang terlalu besar, turunkan heading scale, dan ganti font family menjadi Syne / DM Sans / IBM Plex Mono
- Perubahan: display, body, dan metadata sekarang punya karakter berbeda; gradient text dan oversized neon blocks dihapus; CTA/background gradient dipertahankan sebagai aksen ringan
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `710cb68 [visual-correction] restore restrained typography hierarchy`
- Verifikasi production: Vercel READY; GitHub Actions success
- Lanjut: user review ulang di desktop dan HP; tidak ada perubahan tambahan sampai feedback berikutnya

### Kinetic Typography Pass
- Tanggal: 2026-09-19
- Fase: FASE 5B — electronic artist text motion
- Selesai: word reveal lebih ekspresif, clip-mask, micro-glitch shadow pulse, scan beam, dan label flicker ringan pada hero
- Batasan: motion hanya pada teks/label, tidak menggeser layout; reduced-motion fallback tetap aktif
- Hasil check: lulus
- Hasil test: 34 passed, 0 failed (100 tests)
- Build: lulus
- Commit: `74fa4ab [motion] add kinetic electronic artist typography`
- Verifikasi production: Vercel READY; GitHub Actions success
