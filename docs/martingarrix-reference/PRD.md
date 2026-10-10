# PRD — Website Resmi Akbar Nawasunda (Revisi Layout)

- **Versi:** 1.0 (draft)
- **Tanggal:** 2026-10-10
- **Pemilik produk:** Akbar Nawasunda / tim website
- **Status:** Draft untuk ditinjau
- **Referensi pola:** martingarrix.com (struktur layout, bukan aset atau identitas)

---

## 1. Ringkasan

Akbar Nawasunda membutuhkan website resmi yang bisa dipakai sebagai **rumah digital tunggal**: tempat fans mendengarkan rilisan, menonton video, melihat jadwal live, dan tempat promotor, media, dan label menemukan EPK serta jalur booking. Website saat ini sudah memiliki banyak halaman dan identitas visual yang kuat, tetapi hierarki informasi di beranda dan halaman musik belum sekuat situs musisi besar yang menjadi referensi. Revisi ini menata ulang **layout dan pola komponen** agar:

1. Pengunjung langsung paham apa yang sedang terjadi (rilis baru, live terdekat, video terbaru).
2. Aksi utama (dengar, tonton, dapatkan tiket, hubungi) selalu terlihat.
3. Identitas Akbar (gelap, sinematik, Liquid Signal, Sundanese) tetap utuh.

## 2. Latar belakang dan masalah

| # | Masalah | Dampak |
|---|---|---|
| P1 | Beranda belum menonjolkan rilisan terbaru dan live terdekat secara bersamaan. | Fans harus menjelajah dulu untuk tahu ada apa. |
| P2 | Tidak ada blok "Next live" yang konsisten di beranda. | Tiket dan jadwal kalah jelas dari konten lain. |
| P3 | Video terbaru (YouTube/visual) belum punya slot tetap. | Konten visual tidak terlihat oleh pengunjung baru. |
| P4 | Tautan sosial dan platform streaming tersebar. | Pengunjung sulit memilih platform. |
| P5 | Belum ada peringatan jelas soal kanal resmi dan penipuan. | Risiko fans tertipu oknum yang mengatasnamakan artis. |
| P6 | Cookie consent dan kebijakan privasi belum tampil sebagai pengalaman yang jelas. | Kepatuhan dan kepercayaan pengguna lemah. |

## 3. Tujuan dan non-tujuan

### 3.1 Tujuan (goals)

- **G1.** Pengunjung baru bisa menemukan rilisan terbaru dalam **2 klik** atau kurang dari beranda.
- **G2.** Live terdekat terlihat di atas lipatan (above the fold) pada desktop dan mobile, bila data tersedia.
- **G3.** Setiap rilisan punya jalur dengar yang jelas (Spotify, Apple Music, YouTube, dll.) tanpa halaman tambahan yang tidak perlu.
- **G4.** EPK dan booking dapat diakses oleh promotor atau media tanpa harus mengirim email dulu.
- **G5.** Identitas visual Akbar tetap terbaca, bukan generik.
- **G6.** Halaman cepat (LCP mobile target di bawah 2.5 detik) dan dapat diakses (WCAG 2.2 AA).

### 3.2 Non-tujuan (non-goals)

- Tidak menjual merchandise atau tiket langsung dari website ini. Tiket hanya tautan ke penyelenggara resmi.
- Tidak membangun sistem membership atau komunitas berbayar pada fase ini.
- Tidak menyalin tata letak, aset, atau teks dari situs lain secara langsung.
- Tidak menambah feed sosial real-time yang berat.

## 4. Pengguna dan kebutuhan

| Persona | Kebutuhan utama | Halaman utama |
|---|---|---|
| **Fans** | Dengar rilisan baru, nonton video, tahu kapan main di kota dekat | Beranda, Music, Live, Visuals |
| **Promotor / EO** | Lihat track record, EPK, dan kirim permintaan booking | EPK, Inquire |
| **Media / jurnalis** | Ambil foto press, bio, dan kutipan resmi | EPK, About |
| **Playlist editor / label** | Dengar rilisan, cek lisensi | Music, Licensing |
| **Kolaborator** | Kenali karya dan proses kreatif | About, Universe, Archive |
| **Tim internal (Studio)** | Ubah konten tanpa mengubah kode | Studio (internal) |

## 5. Ruang lingkup fitur

### 5.1 Prioritas P0 (wajib untuk rilis revisi ini)

| ID | Fitur | Deskripsi singkat |
|---|---|---|
| F-01 | **Hero beranda** | Foto penuh dengan judul, sub-judul, dan dua CTA: "Dengarkan terbaru" dan "Lihat live". |
| F-02 | **Strip live terdekat** | Daftar 3 live terdekat dengan tanggal, kota, venue, dan tombol tiket atau detail. Tersembunyi jika kosong. |
| F-03 | **Grid rilisan terbaru** | 4–5 kartu rilisan dengan artwork, judul, tipe (single/EP/remix), dan tautan dengar. |
| F-04 | **Blok video terbaru** | Satu video utama dengan thumbnail dan tombol putar. Tautan ke daftar video. |
| F-05 | **Peringatan kanal resmi** | Banner kecil di atas footer atau di bawah hero: informasi bahwa Akbar tidak pernah meminta pembayaran lewat DM. Tautan ke halaman "Kanal resmi". |
| F-06 | **Banner cookie** | Pilihan Tolak semua / Terima semua / Kelola, dengan tautan ke Privacy. |
| F-07 | **Deretan tautan sosial** | Ikon atau label untuk Instagram, YouTube, Spotify, Apple Music, TikTok, dan lainnya. |
| F-08 | **Halaman Music dengan katalog** | Filter tipe, urut tanggal, dan tombol dengar per platform. |
| F-09 | **Halaman Live** | Daftar live: upcoming di atas, arsip di bawah. |
| F-10 | **Halaman Visuals** | Daftar video dan visual dengan pemutar embed. |
| F-11 | **EPK dan Inquire** | Unduh atau tampilkan EPK, lalu form booking dengan validasi. |
| F-12 | **Navigasi responsif** | Desktop: menu horizontal. Mobile: menu layar penuh. |
| F-13 | **Footer lengkap** | Tautan sosial, Privacy, Licensing, kontak, dan kredit. |

### 5.2 Prioritas P1 (setelah P0 stabil)

| ID | Fitur |
|---|---|
| F-14 | Strip foto editorial dengan kutipan (fotografi tur, studio, keluarga, dan proses). |
| F-15 | Blok "Dari arsip" (Archive) yang menampilkan rilisan lama. |
| F-16 | Pencarian sederhana di halaman Music. |
| F-17 | Halaman rilisan detail yang menampilkan kredit lengkap. |

### 5.3 Prioritas P2 (opsional)

| ID | Fitur |
|---|---|
| F-18 | Newsletter sederhana (double opt-in). |
| F-19 | Timeline arsip interaktif (sudah ada konsepnya di Universe). |

## 6. Persyaratan fungsional (ringkas)

- **FR-01.** Data live dan rilisan diambil dari Studio/CMS yang sudah ada, bukan di-hardcode.
- **FR-02.** Jika tidak ada live mendatang, blok live menampilkan pesan "Belum ada jadwal" dan tautan ke arsip.
- **FR-03.** Setiap tombol tiket membuka tautan resmi penyelenggara di tab baru dengan `rel="noopener"`.
- **FR-04.** Banner cookie harus muncul sebelum skrip non-esensial dimuat (sesuai `docs/` privasi).
- **FR-05.** Form inquire mengirim data ke endpoint yang sudah ada dan menampilkan status sukses atau gagal.
- **FR-06.** Halaman musik dan live tetap bisa dirender server-side untuk SEO.
- **FR-07.** Dua bahasa (ID dan EN) mempertahankan `hreflang` yang sudah berjalan.

## 7. Persyaratan non-fungsional

| Aspek | Target |
|---|---|
| Performa | LCP mobile ≤ 2.5 detik, CLS ≤ 0.1, INP ≤ 200 ms |
| Aksesibilitas | WCAG 2.2 AA; kontras teks utama ≥ 4.5:1; navigasi keyboard penuh |
| Responsif | Layout diuji di 360, 390, 768, 1024, 1440 px |
| Gerak | Menghormati `prefers-reduced-motion` |
| SEO | Metadata, Open Graph, JSON-LD, sitemap tetap berfungsi |
| Keamanan dan privasi | Tidak menyimpan data pribadi di klien kecuali yang diperlukan; secrets di luar repo |

## 8. Metrik keberhasilan

| Metrik | Baseline | Target 90 hari |
|---|---|---|
| Klik ke "Dengarkan" dari beranda | diukur dulu | +30% |
| Klik ke tiket dari strip live | diukur dulu | +25% |
| Waktu ke halaman rilisan dari beranda | diukur dulu | ≤ 2 klik |
| Pengiriman form booking yang valid | diukur dulu | +20% |
| Skor Lighthouse mobile performa | diukur dulu | ≥ 85 |

> Catatan: baseline belum ada di repo. Tim perlu mengaktifkan analitik privasi-ramah sebelum rilis.

## 9. Urutan kerja (milestone)

1. **M0 — Persetujuan.** Tinjau PRD, DESIGN, dan LAYOUT. Setujui palet dan prioritas.
2. **M1 — Fondasi.** Token desain, komponen dasar (tombol, kartu, chip, banner), dan audit `pnpm audit:layout`.
3. **M2 — Beranda.** Hero, strip live, grid rilisan, video, footer, banner cookie.
4. **M3 — Music dan Live.** Katalog, filter, halaman live dengan upcoming dan arsip.
5. **M4 — Visuals, About, EPK, Inquire.** Pemutar embed, strip editorial, form.
6. **M5 — QA dan rilis.** Checklist di `ACCEPTANCE.md`, uji lintas perangkat, dan uji SEO.

## 10. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Layout menjadi generik seperti template musisi | Identitas Akbar hilang | Jaga Liquid Signal, palet ink, dan Sundanese sebagai pembeda |
| Terlalu banyak blok di beranda | Lambat dan membingungkan | Batasi beranda ke 6 blok utama (lihat `LAYOUT.md`) |
| Data live kosong atau tidak akurat | Fans kecewa | Fallback jelas dan tanggal wajib diisi di Studio |
| Embed video memperlambat halaman | LCP buruk | Lazy-load dengan poster thumbnail |
| Oknum penipuan mengatasnamakan artis | Reputasi rusak | Banner F-05 dan halaman Kanal resmi |

## 11. Pertanyaan terbuka

1. Apakah beranda perlu menampilkan rilisan terbaru **atau** live terdekat lebih dulu, jika keduanya ada?
2. Apakah strip foto editorial (F-14) akan memakai foto baru atau arsip?
3. Apakah ada kanal resmi lain (misalnya WhatsApp booking) yang perlu ditampilkan di banner F-05?
4. Apakah bahasa Indonesia tetap menjadi default, atau bahasa Inggris untuk pasar internasional?
