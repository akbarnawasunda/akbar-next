# DESIGN — Sistem Desain Revisi Layout Akbar Nawasunda

- **Versi:** 1.0 (draft)
- **Tanggal:** 2026-10-10
- **Hubungan:** Melengkapi [`/DESIGN.md`](../../DESIGN.md). Jika ada konflik soal identitas, dokumen root menang.

---

## 1. Prinsip desain

1. **Foto dan musik memimpin.** Setiap layar utama dibuka dengan gambar atau artwork besar, bukan teks panjang.
2. **Aksi jelas, dekorasi terkendali.** Satu CTA utama per blok. Efek visual tidak boleh mengalahkan tombol dengar atau tiket.
3. **Gelap dan sinematik, tapi terbaca.** Latar gelap, teks terang, kontras minimal 4.5:1.
4. **Ritme vertikal.** Blok bergantian antara gambar penuh, grid, dan ruang kosong (negative space).
5. **Identitas Akbar di setiap halaman.** Liquid Signal, palet `ink`, dan Sundanese muncul sebagai aksen, bukan hiasan generik.

## 2. Warna

### 2.1 Palet inti (berasal dari palet yang sudah ada)

| Token | Nilai | Pemakaian |
|---|---|---|
| `--color-ink` | `#101211` | Latar utama (primary background) |
| `--color-ink-soft` | `#171A18` | Permukaan sekunder |
| `--color-ink-card` | `#1B1E1C` | Kartu dan permukaan interaktif |
| `--color-ink-hover` | `#232724` | Hover dan baris terpilih |
| `--color-bone` | `#EDEBE4` | Teks utama (bukan putih murni) |
| `--color-bone-dim` | `#A9A89F` | Teks sekunder, metadata |
| `--color-line` | `rgba(237,235,228,0.14)` | Garis pemisah dan border |
| `--color-signal` | `#D7FF3A` | Aksen aktif: CTA utama, status live, fokus. Pemakaian dibatasi |
| `--color-signal-dim` | `#8FA32A` | Aksen sekunder, ikon, dan hover pada teks |
| `--color-alert` | `#FF5A3C` | Peringatan penipuan dan error form |

> Catatan: nilai `signal` dan `alert` adalah **usulan baru**. Sesuaikan dengan Liquid Signal yang sudah ada di root `DESIGN.md` sebelum dipakai. Jangan menambahkan lebih dari satu warna aksen per layar.

### 2.2 Aturan pemakaian warna

- Tombol utama: latar `signal`, teks `ink`. Maksimal satu per blok.
- Tombol sekunder: outline `bone` 1px, teks `bone`.
- Link di dalam teks: `bone` dengan garis bawah; hover `signal`.
- Status live "Sekarang" atau "Tiket tersedia": chip dengan titik `signal`.
- Peringatan penipuan: strip `alert` dengan teks `ink` atau kotak border `alert`.
- Jangan pakai `#000000` murni untuk latar. Jangan pakai gradasi pelangi.

### 2.3 Kontras (wajib)

| Kombinasi | Rasio minimal | Status |
|---|---|---|
| `bone` di atas `ink` | ≥ 12:1 | Lulus |
| `bone-dim` di atas `ink` | ≥ 6:1 | Lulus |
| `ink` di atas `signal` | ≥ 12:1 | Lulus |
| `signal` sebagai teks kecil di atas `ink` | ≥ 4.5:1 | Verifikasi sebelum dipakai |

## 3. Tipografi

Memakai font yang sudah ada di repo (lihat README bagian Typography system). Tidak ada font baru.

| Peran | Font | Ukuran desktop | Ukuran mobile | Tracking | Pemakaian |
|---|---|---|---|---|---|
| Display (H1 hero) | **Recons** | 96–160 px | 48–72 px | -0.02em | Judul hero, wordmark |
| Heading (H2) | **NEXROID** | 48–64 px | 32–40 px | -0.01em | Judul blok |
| Heading (H3) | **NEXROID** | 28–36 px | 22–26 px | 0 | Judul kartu rilisan |
| Body | **Good Times** | 17–18 px | 16 px | 0 | Paragraf |
| Label / metadata | **Good Times** | 12–13 px | 12 px | 0.08em, UPPERCASE | Tanggal, tipe rilisan, kategori |
| Tombol / nav | **Good Times** | 14–15 px | 14 px | 0.06em, UPPERCASE | CTA dan navigasi |
| Signature | **Towards** | sesuai konteks | sesuai konteks | 0 | Hanya di sebelah tulisan Sundanese |

Aturan:

- Line-height: display 0.9–1.0; heading 1.1; body 1.6.
- Maksimal lebar baris body: 68 karakter.
- Judul hero tidak boleh lebih dari 3 baris di mobile.
- Jangan pakai font display untuk paragraf.

## 4. Grid, container, dan spacing

### 4.1 Grid

| Breakpoint | Lebar | Kolom | Gutter | Margin samping |
|---|---|---|---|---|
| Mobile | 360–767 px | 4 | 16 px | 20 px |
| Tablet | 768–1023 px | 8 | 24 px | 32 px |
| Desktop | 1024–1439 px | 12 | 24 px | 48 px |
| Wide | ≥ 1440 px | 12 | 32 px | 64 px |

Lebar konten maksimum: **1440 px** untuk teks, **1920 px** untuk blok gambar penuh.

### 4.2 Spacing scale

Gunakan kelipatan 4: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.

- Jarak antar blok (section): desktop 96–128 px, mobile 64 px.
- Jarak judul ke konten: 24–32 px.
- Jarak antar kartu dalam grid: sama dengan gutter.

### 4.3 Radius dan border

- Kartu rilisan: radius 0 atau 4 px (lebih tajam = lebih editorial).
- Tombol: radius 0 atau pill, konsisten per halaman. Pilih **radius 0** untuk menjaga kesan editorial.
- Border 1px `line`. Hindari shadow tebal.

## 5. Gambar dan media

- **Hero:** foto penuh 16:9 di desktop, 4:5 atau 3:4 di mobile. Overlay gradasi ke `ink` di bagian bawah agar teks terbaca.
- **Artwork rilisan:** rasio 1:1, dimuat dengan `next/image`, ukuran 400 dan 800 px.
- **Thumbnail video:** rasio 16:9. Tombol putar di tengah dengan ikon garis.
- **Foto editorial:** kombinasi landscape dan portrait. Jangan lebih dari 3 foto berurutan tanpa teks.
- Semua gambar wajib memiliki `alt` deskriptif dalam bahasa halaman.
- Format: AVIF atau WebP. Hindari PNG untuk foto.

## 6. Komponen visual (ringkas)

Detail props dan perilaku ada di [`COMPONENTS.md`](./COMPONENTS.md).

| Komponen | Pola visual |
|---|---|
| Tombol utama | Latar `signal`, teks `ink`, UPPERCASE, tinggi 48 px |
| Tombol sekunder | Outline `bone`, tinggi 48 px |
| Chip status | Border 1px, titik kecil `signal` untuk status aktif |
| Kartu rilisan | Artwork 1:1, judul NEXROID, artis Good Times dim, tombol dengar di bawah |
| Baris live | Tanggal besar di kiri, kota dan venue di tengah, CTA di kanan |
| Strip foto | Gambar penuh bersebelahan tanpa gutter, dengan kutipan di atasnya |
| Banner | Strip tipis di atas footer, latar `ink-soft`, teks `bone-dim` |

## 7. Gerak (motion)

- Durasi: mikro 150 ms, standar 300 ms, dramatis 600–900 ms.
- Easing: `cubic-bezier(0.2, 0.7, 0.2, 1)` untuk masuk, `ease-in` untuk keluar.
- Hero: fade dan sedikit scale (1.03 → 1.0) saat masuk, sekali saja.
- Kartu: naik 4 px saat hover, tanpa efek lain.
- Carousel (jika dipakai): auto-play dimatikan secara default; wajib punya tombol pause.
- Liquid Signal / partikel: hanya di hero atau splash, dimatikan di `prefers-reduced-motion` dan di mobile berdaya rendah.
- Jangan animasikan layout (top/left/width). Gunakan `transform` dan `opacity`.

## 8. Elemen khusus Akbar (dipertahankan)

- **Liquid Signal:** tetap jadi signature. Di layout baru, hanya muncul di hero dan splash, bukan di setiap blok.
- **Sundanese:** muncul di judul halaman tertentu (Universe, About) dengan Noto Sans Sundanese. Tidak dipakai sebagai ornamen.
- **DJ Akbar Remix:** label kecil di kartu rilisan remix, bukan judul utama.

## 9. Yang sengaja tidak dilakukan

- Tidak memakai pola template "creative portfolio" dengan grid abu-abu dan kartu identik tanpa hierarki.
- Tidak memakai carousel auto-play di hero.
- Tidak memakai lebih dari dua font dalam satu layar.
- Tidak memakai ikon sosial berwarna penuh; gunakan monokrom.
- Tidak memakai popup newsletter di awal kunjungan.
- Tidak menampilkan iklan pihak ketiga.

## 10. Checklist desain sebelum merge

- [ ] Hanya satu CTA utama per blok.
- [ ] Kontras teks lolos (lihat 2.3).
- [ ] Tidak ada warna di luar token.
- [ ] Semua gambar punya `alt`.
- [ ] Animasi menghormati `prefers-reduced-motion`.
- [ ] Diuji di 360, 390, 768, 1024, 1440 px.
