# Audit "masih kelihatan jelek / kacau / buatan AI"

Tanggal: 2026-10-01 · Branch: `arena/01a0f592-akbar-next`
Metode: pembacaan kode + konten (`client/src`), aset publik, dan CSS. Belum ada perubahan kode — ini daftar temuan.

---

## A. Paling bikin "ketahuan AI" (prioritas 1)

### 1. Spek palsu di hero desktop
`client/src/pages/Home.tsx:233-258` — "Stage Deck" yang komentarnya sendiri menulis
*"Authentic Audio Console Specs"*, isinya:

- `CAT: AN-001 · LATEST DROP` — nomor katalog karangan, tidak dipakai di mana pun.
- `130 BPM · 24-BIT MASTER AUDIO` — hardcoded untuk **semua** rilisan, padahal judul lagunya dinamis dari CMS. Remix Papinka dan lagu lain dipaksa 130 BPM.
- `STAGE STATUS: TRANSMISSION ACTIVE` — tidak berarti apa-apa; ini bahasa generator.

**Fix:** hapus blok itu, atau ganti jadi data nyata (tahun, format, platform) yang ikut `activeRelease`.

### 2. Dekorasi kata "SIGNAL / FREQUENCY / JOURNEY" di mana-mana
395 kemunculan `signal`, 246 `journey`, 89 `frequency`, 17 `ecosystem` di `client/src`.
Nama kelas, nama file, dan **copy yang dilihat user** memakai kata yang sama: `home-signal-deck`, `FanSignalInline`, `NightFrequency*`, `LIVE SIGNAL`, `PLAYABLE SIGNAL`, `ENTER THE FREQUENCY`.
Untuk DJ breakbeat Bandung Barat, ini kosakata template, bukan kosakata dia.

**Fix:** pakai istilah domain yang beneran — "rilisan", "set", "jadwal", "kendang chops", "jedag jedug". Minimal untuk teks yang tampil.

### 3. Bahasa campur aduk di halaman Indonesia
Di `Home.tsx` (versi ID) muncul:
- `ENTER THE FREQUENCY.` + `Run the signal, collect the notes, and chase the drop.` (`Home.tsx:689-700`)
- label `PLAYABLE SIGNAL`, `LATEST VISUAL`, `YOUTUBE PREMIERE` (`artistPlatform.ts:94-98`)
- `STAGE STATUS`, `LOCATION`, `GENRE`, `TRANSMISSION ACTIVE`
Sementara ada halaman `/en` terpisah. Jadi dwibahasa-nya bocor.

**Fix:** semua teks di route non-`/en` harus Indonesia.

### 4. Judul section pola copy-paste
Tiap section memakai rumus identik: dua kata huruf kapital, dipotong `<br/>`, diakhiri titik.
`DENGAR / KARYANYA.` · `RILIS / TERBARU.` · `SEMUA / RILISAN.` · `VIDEO / & REMIX.` · `JADWAL / PERTUNJUKAN.` · `UPDATE / RILISAN.` · `ARTWORK / RILISAN.` · `DARI / STUDIO.` · `AKBAR / NAWASUNDA.`
Sembilan kali pola yang persis sama = terasa mesin. `<br/>` manual juga pecah aneh di layar sempit.

**Fix:** variasikan panjang judul, buang titik di akhir heading, biarkan wrap natural dengan `max-width`/`text-wrap: balance`.

### 5. Ikon ↗ di 150 tempat
`ArrowUpRight` dipakai 150× di `pages` + `components`. Setiap link punya panah yang sama, termasuk link internal (yang seharusnya ikon panah luar = link eksternal).

**Fix:** ↗ hanya untuk link keluar domain; link internal pakai `ArrowRight` atau tanpa ikon.

### 6. Tiga video pakai gambar yang sama
`artistPlatform.ts:94-98` — ketiga video fallback memakai `officialBrand.socialPreview`. Di grid video hasilnya tiga kotak identik. Ini yang paling kelihatan "diisi asal" oleh mata awam.

**Fix:** ambil thumbnail YouTube (`https://i.ytimg.com/vi/<id>/maxresdefault.jpg`) — ID videonya sudah ada di href.

---

## B. Bug visual nyata (prioritas 2)

### 7. `SectionIndex` dirender dengan nomor kosong
`PlatformMarquee.tsx:83-97` selalu merender `<span>{number}</span><i/>`. Di `Home.tsx` dan `EnglishPages.tsx` semua dipanggil `number=""` → yang tampil adalah **span kosong + garis pemisah menggantung** sebelum label. Sementara `ArtistEditorialSections.tsx:52,107` masih mengirim `"03"` dan `"04"`.
Jadi di satu halaman: beberapa section tanpa nomor, lalu tiba-tiba muncul "03" dan "04" tanpa 01/02. Itu kelihatan rusak.

**Fix:** jadikan `number` opsional dan jangan render `<i/>` kalau kosong; lalu putuskan satu sistem — bernomor semua atau tidak sama sekali.

### 8. Perang `!important`
`Home.css` 2.528 baris dengan **170** `!important`; `MaturePalette.css` **180**; `EcosystemPages.css` 33; `PrivacyPolicy.css` 31.
Ini jejak "tambal di atas tambal": setiap perbaikan menimpa yang sebelumnya, bukan memperbaikinya. Akibatnya style susah diprediksi dan gampang pecah lagi.

**Fix:** konsolidasi token di satu layer, hapus `!important` bertahap mulai dari `MaturePalette.css`.

### 9. Breakpoint tidak konsisten
Di `Home.css` saja: `1024px`, `820px` (4×), `767.98px`, `700px`, `480px`. `767.98` jelas sisa kebiasaan Bootstrap yang nyasar.

**Fix:** tetapkan 3 breakpoint (mis. 640 / 1024 / 1280) dan pakai itu di semua file.

### 10. Kode sumber "terminified"
`Universe.tsx` punya 6 baris >250 karakter (satu section = satu baris JSX). Sama di `StudioPageMirror.tsx` (14 baris), `StudioPortraitArchive.tsx`, `StudioVisualArchive.tsx`, `StudioLeaderboardManager.tsx`.
Manusia tidak menulis begini; ini output model yang tidak diformat. Jalankan `prettier --write .` (script-nya sudah ada).

---

## C. Kebersihan repo & aset (prioritas 3)

### 11. 22 file font tidak terpakai (~716 KB)
Hanya Clash Display, General Sans, Azeret Mono yang dipakai (`index.css`). Yang tidak dirujuk sama sekali:
Boska (2), Satoshi (2), Nippo (5), Inknut Antiqua (7), Newsreader (2), Caveat, Press Start 2P, Fredericka the Great, Montenegrin Gothic One.
Folder `newtype/` (472 K) dan `requested/` (244 K) bisa dihapus total.

### 12. Aset gambar dobel
Tiap hero punya versi `-x.webp` **dan** `-x-optimized.webp`, keduanya ikut ter-deploy padahal kode hanya memakai yang `-optimized`. Contoh: `akbar-night-frequency-hero.webp` 792 K menganggur. Plus `akbar-nawasunda-official-portrait.jpg` 1,3 MB sebagai fallback.

### 13. 13 file catatan AI di root repo
`asset-audit.md`, `cms-decision.md`, `editorial-simplification-notes.md`, `legacy-content-migration-audit.md`, `mature-palette-notes.md`, `official-artist-site-audit.md`, `rmx-motion-mark-notes.md`, `verification-notes.md`, `verification-an-archive-notes.md`, `verification-embed-epk-notes.md`, `verification-motion-notes.md`, `todo.md`, `ideas.md`.
Ini log kerja agen, bukan dokumentasi proyek. Siapa pun yang buka repo langsung tahu ini dikerjakan AI.

**Fix:** pindahkan ke `docs/notes/` atau hapus; sisakan `README.md`.

### 14. Duplikasi ID/EN
`EnglishPages.tsx` 2.229 baris = salinan struktur halaman Indonesia. Setiap perbaikan layout harus dikerjakan dua kali — dan sekarang sudah mulai menyimpang (mis. temuan #7 di atas).

**Fix jangka panjang:** satu komponen halaman + kamus teks per locale.

---

## Urutan eksekusi yang saya sarankan

1. Hapus "Stage Deck" spek palsu (#1) + thumbnail video asli (#6) + perbaiki `SectionIndex` (#7) → dampak visual langsung, usaha kecil.
2. Bersihkan copy: bahasa campur (#3), pola judul (#4), kosakata "signal/frequency" (#2).
3. Ikon ↗ (#5), format kode (#10), hapus font & gambar nganggur (#11, #12), rapikan root (#13).
4. Baru garap utang CSS (`!important` + breakpoint) dan unifikasi ID/EN.

Bilang saja mau mulai dari nomor berapa, saya kerjakan.
