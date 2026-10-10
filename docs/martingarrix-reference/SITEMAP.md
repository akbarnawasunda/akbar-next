# SITEMAP — Struktur Informasi Akbar Nawasunda

- **Versi:** 1.0 (draft)
- **Tanggal:** 2026-10-10
- **Acuan:** [`PRD.md`](./PRD.md), [`LAYOUT.md`](./LAYOUT.md)

Rute yang sudah ada di repo dipertahankan. Rute baru ditandai **(baru)**.

---

## 1. Peta situs

```
/                         Beranda
├── /music                Katalog musik
│   └── /music/[slug]     Detail rilisan                     (detail: P1)
├── /visuals              Video dan visual
├── /live                 Jadwal live dan arsip
├── /universe             Perjalanan kreatif (signature)
├── /archive              Arsip rilisan dan karya            (baru: P1)
├── /about                Tentang Akbar
├── /epk                  Press kit
├── /inquire              Booking dan permintaan
├── /licensing            Lisensi musik
├── /kanal-resmi          Kanal resmi dan anti-penipuan      (baru: P0)
├── /game/jedag-run       JEDAG RUN
├── /privacy              Kebijakan privasi
└── /404                  Tidak ditemukan
```

Versi bahasa Inggris memakai prefix `/en/...` dengan struktur identik. Lihat `app/(en)/` dan `app/(id)/`.

## 2. Navigasi utama

### 2.1 Menu header (urutan tetap)

1. Music
2. Visuals
3. Live
4. Archive
5. About
6. Press (menuju `/epk`)
7. Game

Catatan: "Inquire" tidak ada di menu utama. Akses booking ada di CTA EPK dan footer. Ini menjaga menu tetap pendek.

### 2.2 Footer

| Kolom | Tautan |
|---|---|
| Musik | Music, Visuals, Live, Archive |
| Tentang | About, EPK, Booking (`/inquire`), Lisensi (`/licensing`) |
| Bantuan | Kanal resmi, Privasi, Kontak |
| Ikuti | Instagram, YouTube, Spotify, Apple Music, TikTok |

## 3. Aturan konten per rute

| Rute | Sumber data | Wajib ada | Opsional |
|---|---|---|---|
| `/` | Studio: rilisan, live, video, hero | Hero, minimal 1 rilisan | Live, video, editorial |
| `/music` | Studio: katalog | Judul, artwork, tipe, tanggal | Kredit, link platform |
| `/music/[slug]` | Studio: rilisan detail | Judul, artwork, minimal 1 link dengar | Video, kredit lengkap |
| `/live` | Studio: live | Tanggal, kota, nama acara | Venue, link tiket |
| `/visuals` | Studio: video dan visual | Judul, thumbnail | Deskripsi |
| `/epk` | Studio: press | Bio pendek, satu foto | File PDF dan ZIP |
| `/inquire` | Konfigurasi form | Nama, email, jenis, pesan | Lampiran |
| `/kanal-resmi` | Statis | Daftar kanal resmi, cara verifikasi | Riwayat peringatan |

## 4. Pemetaan dari layout referensi (ringkas)

| Pola di situs referensi | Padanan di Akbar |
|---|---|
| Hero dengan foto dan CTA tiket | Hero beranda dengan CTA dengar dan live |
| Daftar tur dengan tombol tiket | Strip live terdekat (blok 2 beranda) |
| Latest releases dengan tombol "View all" | Grid rilisan terbaru dan "Lihat semua musik" |
| Video terbaru dengan tombol putar | Blok video terbaru (blok 4) |
| Strip foto editorial dengan kutipan | Strip editorial (blok 5, P1) |
| Daftar sosial "Follow me" | Blok terhubung dan footer |
| Banner cookie Accept / Deny | Banner cookie dengan Tolak / Kelola / Terima |
| Peringatan penipuan resmi | Strip kanal resmi (F-05) dan halaman `/kanal-resmi` |

## 5. Aturan URL

- Gunakan huruf kecil dan tanda hubung. Contoh: `/music/this-dream-of-you`.
- Jangan ubah rute yang sudah diindeks tanpa redirect 301.
- Rute `/kanal-resmi` baru perlu ditambahkan ke `public/sitemap.xml` dan `app/(id)` / `app/(en)`.

## 6. Checklist SEO per rute

- [ ] Judul unik dan deskriptif.
- [ ] Meta description unik.
- [ ] Canonical dan hreflang ID/EN.
- [ ] Open Graph dan Twitter card.
- [ ] Muncul di sitemap.
- [ ] JSON-LD sesuai (MusicGroup, MusicRecording, Event, WebPage).
