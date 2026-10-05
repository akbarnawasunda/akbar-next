# Prompt untuk sesi baru — revisi visual setelah ganti font

> Salin seluruh isi blok di bawah untuk memulai sesi desain berikutnya.

```text
Lanjutkan revisi visual situs publik Akbar Nawasunda di repository ini. Jangan mengubah branch kerja saat ini.

KONTEKS YANG SUDAH DIKUNCI
Sistem font inti sudah diganti dan seluruh asetnya harus tetap self-hosted di `client/public/assets/fonts/fontsource/`:

1. PRIMARY DISPLAY — Recons
2. SECONDARY DISPLAY — NEXROID
3. PRIMARY TEXT/UI — FHWASeriesEmod2020plus
4. SIGNATURE — Towards
5. SUNDANESE — Noto Sans Sundanese
6. GAME — Fluorite

Noctavell dan Velomino TIDAK BOLEH dipakai dalam core system. Jangan mengaktifkan keduanya sebagai fallback, eksperimen, atau dekorasi. Jangan kembali ke Central Station, Hanken Grotesk, Sometype Mono, Autocron, Tritopani, Striper, Unityped, Cultura Estropeada, maupun Big Shoulders Display.

PETA PERAN YANG WAJIB DIPERTAHANKAN
- `--font-title` = Recons. Khusus wordmark, nama/identitas brand, H1, hero title, dan momen display paling dominan.
- `--font-display` = NEXROID. Khusus H2–H4, heading section, judul rilisan, judul kartu/capability, dan display tingkat kedua.
- `--font-body`, `--font-mono`, `--font-label` = FHWASeriesEmod2020plus. Semua teks baca, UI, navigasi, CTA, metadata, tanggal, tombol, label form, footer, dan player harus memakai satu keluarga ini. Jangan membuat font mono atau font label baru.
- `--font-signature` = Towards. Hanya bacaan Latin `Akbar Nawasunda` yang mendampingi aksara Sunda.
- `--font-sunda` = Noto Sans Sundanese. Hanya deret aksara Sunda.
- `--font-game` = Fluorite. Hanya judul dan overlay dalam JEDAG RUN.

TUGAS SESI INI
1. Audit visual seluruh rute publik pada desktop dan mobile: `/`, `/music`, detail rilisan, `/visuals`, `/live`, `/universe`, `/about`, `/epk`, `/inquire`, `/licensing`, `/privacy`, `/game/jedag-run`, 404, serta pasangan `/en/...`.
2. Tuning ukuran, line-height, letter-spacing, max-width, dan line wrapping untuk font baru. Jangan mengubah pesan/konten, data CMS, rute, SEO, interaksi, atau informasi bisnis hanya demi styling.
3. Pastikan Recons tidak terpotong di hero/splash/wordmark dan tetap muat di 320px, 360px, 375px, 390px, tablet, dan desktop. Kalau sebuah judul terlalu panjang, atur ukuran atau measure; jangan mengganti Recons dengan NEXROID/HWFA tanpa alasan peran yang jelas.
4. Pastikan NEXROID sebagai heading sekunder masih terbaca dalam teks Indonesia dan Inggris, khususnya heading panjang di EPK, Privacy, Inquiry, dan Licensing.
5. Pastikan FHWASeriesEmod2020plus cukup nyaman untuk paragraf, formulir, tombol, metadata, nav, dan footer. Perbaiki ukuran/leading/letter spacing bila perlu, tetapi jangan menambah keluarga font baru.
6. Pastikan Towards hanya tetap muncul sebagai signature Latin di dekat aksara Sunda; jangan jadikan font body atau judul umum.
7. Pastikan Fluorite tidak bocor ke halaman publik biasa, dan Noto Sans Sundanese tidak bocor ke teks Latin.
8. Jangan memuat font eksternal (Google Fonts, CDN, `@import` remote, atau URL font pihak ketiga). Semua font harus menggunakan file lokal dan `@font-face` yang ada.
9. Jangan membuat synthetic bold/italic. Sistem sudah memakai `font-synthesis: none`; pertahankan itu dan jangan menambah bobot font yang tidak tersedia.
10. Perbarui `docs/audit-tipografi-teks-publik.md` bila ada perubahan nyata pada peran atau penerapan font.

FILE YANG HARUS DICEK TERLEBIH DAHULU
- `client/src/index.css` — satu sumber token dan `@font-face`.
- `client/index.html` — preload dan splash yang memakai nama font literal karena muncul sebelum aplikasi React.
- `client/src/shell/EditorialRefresh.css` — scope public dan mobile drawer portal.
- `client/src/shell/ChromeRedesign.css` — header/footer.
- `client/src/CinematicReference.css` — override visual lama; pastikan tidak membatalkan H1 Recons dan H2–H4 NEXROID.
- `client/src/pages/HomeStage.css`, `client/src/pages/Home.css`, dan `client/src/components/signature/SignatureStage.css` — hero, wordmark, dan particle stage.
- `client/src/components/signature/SundaScript.css` — signature + aksara.
- `client/src/pages/GameJedagRun.css` dan `client/src/components/JedagRunCanvas.css` — isolasi font game.

BATASAN
- Jangan hapus atau ubah root repository / `.git`.
- Jangan mengubah branch.
- Jangan gunakan Noctavell atau Velomino.
- Jangan mengganti aset gambar, warna brand, struktur informasi, atau copy kecuali memang diperlukan untuk memperbaiki overflow/aksesibilitas akibat font baru.
- Jangan memakai `!important` baru untuk memaksa font. Rapikan cascade/token yang menang.
- Jangan menghapus font lama dari folder aset hanya untuk bersih-bersih; fokus pada referensi aktif dan stabilitas build.

KRITERIA SELESAI
- Tidak ada referensi aktif ke keluarga font lama pada CSS/HTML/TSX publik.
- Tidak ada request font eksternal.
- Recons/NEXROID/FHWASeriesEmod2020plus/Towards/Noto/Fluorite termuat dari aset lokal dan muncul pada peran yang tepat.
- Tidak ada clipping, overflow horizontal, atau heading yang tidak terbaca di mobile utama.
- JEDAG RUN tetap terisolasi dengan Fluorite.
- Jalankan minimal `pnpm check` dan `pnpm build`; laporkan hasilnya serta rute/viewport yang diperiksa.
```
