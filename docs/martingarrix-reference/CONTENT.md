# CONTENT — Model Konten dan Aturan Copy

- **Versi:** 1.0 (draft)
- **Tanggal:** 2026-10-10
- **Acuan:** [`SITEMAP.md`](./SITEMAP.md), [`COMPONENTS.md`](./COMPONENTS.md)

---

## 1. Prinsip konten

1. **Fakta dulu, adjektiva belakangan.** Tanggal, kota, dan nama rilisan harus akurat sebelum deskripsi.
2. **Satu ide per kalimat.** Maksimal 20 kata untuk kalimat di hero dan kartu.
3. **Bahasa Indonesia sebagai default**, EN sebagai padanan lengkap (bukan terjemahan kasar).
4. **Tidak ada janji tiket atau meet-and-greet** kecuali sudah dikonfirmasi penyelenggara.
5. **Nama artis selalu konsisten:** "Akbar Nawasunda" untuk karya original, "DJ Akbar Remix" untuk remix historis.

## 2. Ringkasan model konten

| Entitas | Sumber | Wajib | Field utama |
|---|---|---|---|
| Hero | Studio → Beranda | Ya | kicker, judul, sub-judul, gambar, CTA |
| Rilisan | Studio → Music | Ya | judul, artis, tipe, tanggal, artwork, link dengar |
| Live | Studio → Live | Ya | tanggal, kota, negara, nama acara, venue, link tiket |
| Video | Studio → Visuals | Ya | judul, provider, provider ID, poster |
| Foto editorial | Studio → Asset library | Tidak | gambar, alt, kredit foto |
| Kutipan | Studio → About / Beranda | Tidak | teks, atribusi |
| Sosial | Studio → Global | Ya | platform, URL, label |
| Kanal resmi | Statis di repo | Ya | daftar kanal, cara verifikasi |
| Lisensi | Studio → Licensing | Ya | jenis, cara minta, kontak |

## 3. Aturan per entitas

### 3.1 Hero

- **Kicker:** maks 4 kata, UPPERCASE. Contoh: "RILIS BARU · SINGLE · 2026".
- **Judul:** maks 6 kata. Tidak boleh berakhir dengan titik.
- **Sub-judul:** maks 16 kata, satu kalimat.
- **CTA utama:** kata kerja. "Dengarkan sekarang", "Tonton video", "Lihat live".
- **Gambar:** minimal 2400 px lebar, subjek di sisi kiri atau tengah agar teks di kanan/bawah tetap terbaca.

### 3.2 Rilisan

- **Judul:** sesuai judul resmi rilisan. Jangan disingkat.
- **Artis:** sesuai kredit di platform streaming.
- **Tipe:** `single`, `ep`, `album`, atau `remix`.
- **Tanggal rilis:** format `YYYY-MM-DD`. Tampil sebagai "10 Okt 2026" di UI.
- **Link dengar:** minimal satu. Urutan default: Spotify, Apple Music, YouTube, SoundCloud.
- **Artwork:** persegi, minimal 3000 px, format JPG atau PNG.

### 3.3 Live

- **Tanggal:** wajib. Jika belum pasti, jangan dipublikasikan.
- **Nama acara:** nama resmi penyelenggara.
- **Venue:** boleh kosong jika belum diumumkan, tapi kota wajib.
- **Tiket:** hanya URL penyelenggara resmi. Domain yang tidak dikenal ditolak di Studio.
- **Status:** `on-sale`, `low`, `sold-out`, atau `details`. Status diperbarui manual.
- **Arsip:** otomatis setelah tanggal lewat.

### 3.4 Video

- **Judul:** sesuai judul di platform.
- **Provider:** YouTube, Vimeo, atau self-hosted.
- **Poster:** wajib, rasio 16:9.
- **Deskripsi:** maks 160 karakter untuk kartu, maks 400 karakter untuk halaman.

### 3.5 Foto dan kredit

- Setiap foto editorial wajib memiliki kredit fotografer jika ada, dan izin pemakaian dicatat di Studio.
- Alt text wajib dan deskriptif. Contoh: "Akbar Nawasunda di depan layar LED saat set malam".

## 4. Template copy

Gunakan template ini sebagai titik awal. Ganti bagian dalam kurung siku.

### 4.1 Beranda (ID)

| Elemen | Template |
|---|---|
| Kicker hero | `[TIPE] BARU · [TAHUN]` |
| Judul hero | `[Judul rilisan]` |
| Sub-judul hero | `Dengarkan sekarang di [platform utama], atau lihat jadwal live terdekat.` |
| Judul blok live | `Live terdekat` |
| Kosong live | `Belum ada jadwal live yang diumumkan. Lihat arsip live.` |
| Judul blok rilisan | `Rilisan terbaru` |
| Judul blok video | `Video terbaru` |

### 4.2 Beranda (EN)

| Elemen | Template |
|---|---|
| Kicker hero | `NEW [TYPE] · [YEAR]` |
| Judul hero | `[Release title]` |
| Sub-judul hero | `Listen now on [primary platform], or see the next live dates.` |
| Judul blok live | `Upcoming live` |
| Kosong live | `No live dates announced yet. See the live archive.` |
| Judul blok rilisan | `Latest releases` |
| Judul blok video | `Latest video` |

### 4.3 Banner kanal resmi (ID)

> Akbar tidak pernah meminta pembayaran lewat DM, komentar, atau pesan pribadi, termasuk untuk tiket, meet-and-greet, atau "akses khusus". Jika menerima pesan seperti itu, anggap sebagai penipuan dan laporkan. Pelajari kanal resmi.

### 4.4 Banner kanal resmi (EN)

> Akbar will never ask for payment via DM, comments, or private messages, including for tickets, meet-and-greets, or "special access". If you receive such a message, treat it as a scam and report it. Learn about official channels.

> Catatan: teks di atas adalah **draft**. Verifikasi dengan tim sebelum publikasi, terutama soal klaim tertentu.

### 4.5 Banner cookie (ID)

> Situs ini memakai cookie untuk berfungsi dan memahami penggunaannya. Baca [Kebijakan Privasi].

### 4.6 Form inquire (ID)

| Field | Label | Placeholder | Pesan error |
|---|---|---|---|
| Nama | Nama lengkap | Nama kamu | Isi nama lengkap |
| Email | Email | nama@domain.com | Format email tidak valid |
| Jenis | Keperluan | Pilih satu | Pilih salah satu |
| Pesan | Pesan | Ceritakan singkat konteksnya | Minimal 20 karakter |

Teks sukses: `Terima kasih. Permintaanmu sudah masuk. Kami balas lewat email dalam beberapa hari kerja.`

> Catatan: "beberapa hari kerja" adalah janji waktu. Ubah hanya jika tim benar-benar bisa memenuhinya.

## 5. Gaya penulisan

- **Sebut:** "rilisan", "live", "video", "EPK". Hindari "konten" di UI.
- **Hindari:** "exclusive", "must-listen", "best", kecuali ada bukti.
- **Kapitalisasi:** judul halaman dan label kecil dalam UPPERCASE hanya untuk kicker dan tombol.
- **Tanda baca:** tanpa tanda seru di UI, kecuali peringatan.
- **Angka:** gunakan angka untuk tanggal dan jumlah (`3 live`), tulis huruf untuk kata kecil (`satu`).

## 6. Proses publikasi

1. Isi konten di Studio dalam status **Draft**.
2. Cek kelengkapan terhadap bagian 2 dan 3.
3. Pratinjau di desktop dan mobile.
4. Ubah status ke **Published**.
5. Jalankan checklist di [`ACCEPTANCE.md`](./ACCEPTANCE.md) bagian konten.

## 7. Hal yang tidak boleh ada di konten

- Data pribadi (nomor telepon, alamat rumah, nomor identitas).
- Klaim kerja sama atau sponsor yang belum disetujui tertulis.
- Tautan tiket atau pembayaran ke domain di luar daftar resmi.
- Foto tanpa izin pemakaian.
- Teks yang menyebut artis lain dengan cara yang menyesatkan.
