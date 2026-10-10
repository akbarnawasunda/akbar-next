# LAYOUT — Struktur Halaman Revisi Akbar Nawasunda

- **Versi:** 1.0 (draft)
- **Tanggal:** 2026-10-10
- **Acuan:** [`DESIGN.md`](./DESIGN.md), [`SITEMAP.md`](./SITEMAP.md)

Notasi wireframe: `[ ]` = blok, `( )` = tombol, `< >` = gambar, `{ }` = data dinamis dari Studio.

---

## 1. Shell global (semua halaman)

### 1.1 Urutan dari atas ke bawah

1. **Banner cookie** (sticky bawah, sekali saja, hilang setelah pilihan).
2. **Header** (sticky, berubah latar setelah scroll 80 px).
3. **Konten halaman.**
4. **Strip peringatan kanal resmi** (F-05).
5. **Footer.**

### 1.2 Header

Desktop (≥ 1024 px):

```
[Logo/wordmark]     Music  Visuals  Live  Archive  About  Press  Game        [ID | EN]  ( Dengarkan )
```

Mobile (< 1024 px):

```
[Logo/wordmark]                                                    [ Menu ]
```

- Menu mobile membuka layar penuh dengan daftar menu besar (NEXROID 36 px) dan satu CTA di bawah.
- Tombol "Dengarkan" hanya muncul di desktop agar tidak berebut dengan menu.

### 1.3 Banner cookie

```
+--------------------------------------------------------------------------------+
| Situs ini memakai cookie untuk berfungsi dan memahami penggunaannya.            |
| Baca Kebijakan Privasi.          ( Tolak semua )   ( Kelola )   ( Terima semua ) |
+--------------------------------------------------------------------------------+
```

- Posisi: bawah layar, lebar penuh di mobile, kartu 480 px di desktop kanan bawah.
- Dua tombol harus sama-sama terlihat dan setara visualnya (tidak boleh "Terima" saja yang menonjol).

### 1.4 Strip kanal resmi (F-05)

```
[!]  Akbar tidak pernah meminta pembayaran lewat DM, komentar, atau pesan pribadi.  Pelajari kanal resmi →
```

- Latar `ink-soft`, border kiri 2px `alert`.
- Muncul di setiap halaman, di atas footer.

### 1.5 Footer

```
--------------------------------------------------------------------------------
AKBAR NAWASUNDA                         Musik        Live         Tentang
[wordmark besar]                        Music        Visuals      EPK
                                        Live         Arsip        Booking
                                        Kanal resmi  Lisensi      Privasi

Ikuti:  Instagram · YouTube · Spotify · Apple Music · TikTok
© 2026 Akbar Nawasunda.  ID | EN
--------------------------------------------------------------------------------
```

- Tautan sosial monokrom, teks label, bukan hanya ikon.
- Wordmark besar di kiri hanya di desktop.

---

## 2. Beranda (`/`)

Beranda adalah halaman paling penting. Maksimal **6 blok utama** (ditambah footer).

### 2.1 Desktop (≥ 1024 px)

```
+------------------------------------------------------------------------------+
| BLOK 1 — HERO (100vh, maks 900px)                                             |
|  <foto penuh, overlay gradasi bawah>                                          |
|                                                                              |
|  RILIS BARU · {tipe} · {tanggal}                                              |
|  {Judul rilisan terbaru}                                                      |
|  {sub-judul singkat satu baris}                                               |
|  ( Dengarkan sekarang )   ( Lihat live )                                      |
|                                                                              |
|                                                          • Scroll            |
+------------------------------------------------------------------------------+
| BLOK 2 — LIVE TERDEKAT (3 baris)                                              |
|  LIVE                                         Lihat semua live →             |
|  {DD MMM}  {Kota}           {Venue}                      ( Tiket ) / ( Detail )|
|  {DD MMM}  {Kota}           {Venue}                      ( Tiket ) / ( Detail )|
|  {DD MMM}  {Kota}           {Venue}                      ( Tiket ) / ( Detail )|
+------------------------------------------------------------------------------+
| BLOK 3 — RILISAN TERBARU (grid 4 kolom)                                       |
|  RILISAN TERBARU                              Lihat semua musik →            |
|  <art 1:1>      <art 1:1>      <art 1:1>      <art 1:1>                       |
|  {Judul}        {Judul}        {Judul}        {Judul}                         |
|  {Artis}        {Artis}        {Artis}        {Artis}                         |
+------------------------------------------------------------------------------+
| BLOK 4 — VIDEO TERBARU (split 7:5)                                            |
|  <thumbnail 16:9, tombol putar>          {Judul video}                        |
|                                          {deskripsi singkat}                  |
|                                          ( Tonton semua video )               |
+------------------------------------------------------------------------------+
| BLOK 5 — STRIP EDITORIAL (foto + kutipan, P1)                                 |
|  <foto>  <foto>  <foto>                                                        |
|  "Kutipan satu-dua kalimat."  — Akbar                                          |
+------------------------------------------------------------------------------+
| BLOK 6 — TERHUBUNG (sosial + newsletter P2)                                   |
|  Ikuti Akbar:  Instagram · YouTube · Spotify · Apple Music · TikTok           |
+------------------------------------------------------------------------------+
```

### 2.2 Mobile (< 768 px)

- Hero: foto 4:5, judul di bawah foto, dua tombol full-width bertumpuk.
- Live: satu baris per live, tanggal di atas, tombol di bawah. Tampilkan 2 live, sisanya di "Lihat semua".
- Rilisan: grid 2 kolom, tampilkan 4 item. Scroll horizontal opsional untuk lebih dari 4.
- Video: thumbnail penuh lebar, judul di bawah.
- Strip editorial: scroll horizontal snap.

### 2.3 Urutan blok dinamis

Jika data tidak tersedia, blok di-skip sepenuhnya (bukan menampilkan kotak kosong):

| Kondisi | Aksi |
|---|---|
| Tidak ada live mendatang | Blok 2 diganti satu baris: "Belum ada jadwal live. Lihat arsip live." |
| Tidak ada rilisan | Blok 3 disembunyikan |
| Tidak ada video | Blok 4 disembunyikan |
| Rilisan terbaru punya video | Hero boleh memakai thumbnail video, tetapi tombol utama tetap "Dengarkan" |

---

## 3. Music (`/music`)

```
+------------------------------------------------------------------------------+
| HEADER HALAMAN                                                                |
|  MUSIK                                                                        |
|  {Satu paragraf perkenalan katalog, maks 2 baris}                             |
+------------------------------------------------------------------------------+
| RILIS TERBARU (featured, split 6:6)                                           |
|  <artwork 1:1 besar>     {Judul}  {tipe} · {tahun}                            |
|                          {Artis, label}                                       |
|                          ( Spotify ) ( Apple Music ) ( YouTube )              |
+------------------------------------------------------------------------------+
| FILTER BAR                                                                    |
|  [Semua] [Single] [EP] [Remix] [DJ Akbar Remix]       Urut: Terbaru ▾         |
+------------------------------------------------------------------------------+
| KATALOG (grid 4 kolom desktop, 2 mobile)                                       |
|  <art> {Judul}   <art> {Judul}   <art> {Judul}   <art> {Judul}                |
|  ...                                                                          |
|  ( Muat lebih banyak )                                                        |
+------------------------------------------------------------------------------+
| CTA BAWAH                                                                     |
|  Lisensi musik untuk film, iklan, atau game? → Licensing                      |
+------------------------------------------------------------------------------+
```

### 3.1 Halaman detail rilisan (`/music/[slug]`)

- Hero artwork besar di kiri, judul dan metadata di kanan (desktop).
- Blok "Dengarkan di": daftar platform sebagai baris, bukan ikon saja.
- Blok "Kredit": produser, remixer, label, tahun.
- Blok "Video terkait" jika ada.
- Blok "Rilisan lain" (3 kartu).

---

## 4. Live (`/live`)

```
+------------------------------------------------------------------------------+
| HEADER: LIVE                                                                  |
|  {Satu kalimat: jadwal resmi, tiket hanya dari penyelenggara.}                |
+------------------------------------------------------------------------------+
| AKAN DATANG                                                                   |
|  {DD MMM YYYY}  {Kota, negara}   {Nama acara}    {Venue}    ( Tiket resmi )   |
|  {DD MMM YYYY}  {Kota, negara}   {Nama acara}    {Venue}    ( Tiket resmi )   |
|  ...                                                                          |
+------------------------------------------------------------------------------+
| ARSIP                                                                         |
|  Tahun ▾  ·  daftar ringkas {Tahun} {Kota} {Acara}                            |
+------------------------------------------------------------------------------+
```

- Mobile: setiap baris menjadi kartu vertikal dengan tanggal besar di kiri atas.
- Tanggal sudah lewat pindah ke arsip secara otomatis.

---

## 5. Visuals (`/visuals`)

```
+------------------------------------------------------------------------------+
| HEADER: VISUALS                                                               |
+------------------------------------------------------------------------------+
| PEMUTAR UTAMA (16:9, embed + poster)                                          |
+------------------------------------------------------------------------------+
| DAFTAR VIDEO (grid 3 kolom)                                                   |
|  <thumb> {Judul}   <thumb> {Judul}   <thumb> {Judul}                          |
+------------------------------------------------------------------------------+
| ARSIP VISUAL (masonry atau grid 4 kolom, klik untuk lightbox)                 |
+------------------------------------------------------------------------------+
```

- Video embed hanya dimuat setelah klik (facade) untuk performa.
- Lightbox: tombol tutup dan navigasi keyboard.

---

## 6. About (`/about`)

```
+------------------------------------------------------------------------------+
| HERO EDITORIAL: foto besar + judul "Tentang Akbar"                            |
+------------------------------------------------------------------------------+
| BIO SINGKAT (kolom tunggal, maks 68 karakter per baris)                       |
+------------------------------------------------------------------------------+
| PERJALANAN (timeline vertikal, 4–6 titik)                                     |
+------------------------------------------------------------------------------+
| KUTIPAN BESAR (satu kalimat, NEXROID 48 px)                                   |
+------------------------------------------------------------------------------+
| STRIP FOTO + KONTAK                                                           |
+------------------------------------------------------------------------------+
```

---

## 7. EPK (`/epk`) dan Inquire (`/inquire`)

### 7.1 EPK

```
+------------------------------------------------------------------------------+
| HEADER: PRESS KIT                                                             |
|  ( Unduh EPK PDF )   ( Unduh foto press ZIP )                                 |
+------------------------------------------------------------------------------+
| BIO (versi pendek 100 kata, versi panjang di bawah lipatan)                   |
| FOTO RESMI (grid 3 kolom, unduh per foto)                                     |
| HIGHLIGHT (4 kartu: rilis, tur, media, kolaborasi)                            |
| KONTAK PRESS                                                                  |
+------------------------------------------------------------------------------+
```

### 7.2 Inquire

- Dua kolom di desktop: kiri konteks dan jenis permintaan, kanan form.
- Mobile: form satu kolom, konteks di atas.
- Field minimum: nama, email, jenis (Booking / Media / Lisensi / Lainnya), pesan.

---

## 8. Halaman lain

| Halaman | Layout ringkas |
|---|---|
| `/universe` | Canvas penuh atau timeline horizontal, tetap menjadi pengalaman signature |
| `/archive` | Grid kronologis, filter tahun |
| `/licensing` | Kolom tunggal: tipe lisensi, cara minta, contoh penggunaan |
| `/privacy` | Teks kolom tunggal, daftar isi sticky di desktop |
| `/game/jedag-run` | Layar penuh; header minimal; tidak memakai footer penuh |
| `404` | Judul besar, satu tombol kembali ke beranda, satu tautan Music |

---

## 9. Breakpoint ringkas

| Perubahan | < 768 | 768–1023 | ≥ 1024 |
|---|---|---|---|
| Header | Menu burger | Menu burger | Menu horizontal |
| Hero | 4:5 | 16:9 | 16:9 maks 900px tinggi |
| Grid rilisan | 2 kolom | 3 kolom | 4 kolom |
| Live | Kartu vertikal | Baris ringkas | Baris tabel |
| Footer | Kolom bertumpuk | 2 kolom | 4 kolom |

---

## 10. Aturan jarak dan urutan

- Setiap blok dipisah 96 px (desktop) atau 64 px (mobile).
- Blok gambar penuh boleh berdampingan langsung dengan blok teks, tanpa jarak.
- Jangan letakkan dua blok CTA utama berurutan tanpa konten di antaranya.
