# Audit tipografi publik — roster Recons / NEXROID

_Diperbarui 5 Oktober 2026 setelah penggantian sistem font. Dokumen ini adalah peta penerapan untuk situs publik, bukan daftar font lama._

## Roster yang aktif dan dikunci

| Peran | Token | Font | Cakupan |
|---|---|---|---|
| Primary display | `--font-title` | **Recons** | H1, hero/wordmark, nama brand, splash, particle stage |
| Secondary display | `--font-display` | **NEXROID** | H2–H4, judul section, judul rilisan, card/capability title |
| Primary text/UI | `--font-body`, `--font-mono`, `--font-label` | **FHWASeriesEmod2020plus** | seluruh paragraf, CTA, nav, footer, metadata, angka, tanggal, label, form, player, dan UI |
| Signature | `--font-signature` | **Towards** | bacaan Latin `Akbar Nawasunda` pada pelat aksara saja |
| Sundanese | `--font-sunda` | **Noto Sans Sundanese** | aksara Sunda saja |
| Game | `--font-game` | **Fluorite** | judul dan overlay JEDAG RUN saja |

**Tidak digunakan dalam core system:** Noctavell dan Velomino.  
**Tidak digunakan lagi sebagai font aktif:** Central Station, Hanken Grotesk, Sometype Mono, Autocron, Tritopani, Striper, Unityped, Cultura Estropeada, dan Big Shoulders Display.

Semua font inti di-self-host pada `client/public/assets/fonts/fontsource/`. Tidak ada Google Fonts, CDN, atau fallback font dekoratif eksternal di sistem aktif. `font-synthesis: none` tetap berlaku agar browser tidak membuat bold/italic palsu dari file single-weight.

---

## Aturan baca yang berlaku di setiap halaman

| Jenis teks yang tampak | Font sekarang |
|---|---|
| H1, hero title, wordmark `AKBAR NAWASUNDA`, judul splash, wordmark particle stage | **Recons** |
| H2/H3/H4, judul seksi, nama rilisan, nama event, nama capability, judul kartu | **NEXROID** |
| Paragraf, bio, narasi, caption, fakta, form, tombol, link, label, metadata, waktu, nomor, nav, footer, player | **FHWASeriesEmod2020plus** |
| `ᮃᮊ᮪ᮘᮁ ᮔᮝᮞᮥᮔ᮪ᮓ` | **Noto Sans Sundanese** |
| Kunci baca Latin `Akbar Nawasunda` di samping aksara | **Towards** |
| Heading/overlay khusus game JEDAG RUN | **Fluorite** |

> Sebelumnya metadata memakai mono dan nav/footer memakai font label dekoratif. Sekarang semua itu sengaja menjadi **FHWASeriesEmod2020plus** agar teks biasa, UI, dan navigasi berbicara dengan satu suara.

---

## Teks global

| Permukaan | Recons | NEXROID | FHWASeriesEmod2020plus | Khusus |
|---|---|---|---|---|
| Splash | `Akbar`, `Nawasunda` | — | WIB, jam, tanggal, lokasi, `Producer · Remixer · Bandung Barat`, durasi, ucapan ulang tahun | Aksara → Noto |
| Header | wordmark `Akbar Nawasunda` | — | tagline, `MUSIK`, `VISUAL`, `PERJALANAN`, `TENTANG`, `EPK`, `KONTAK`, `JADWAL`, `ID / EN`, `Dengarkan` / `LISTEN`, menu mobile | — |
| Footer | `AKBAR NAWASUNDA` | — | tagline, judul kolom, seluruh tautan, platform, copyright, jam | — |
| Tirai rute / player / command palette | — | judul hasil bila ada | label rute, status pemutar, judul track, shortcut, kontrol | aksara tirai → Noto |

---

## Peta per halaman

### Beranda — `/` dan `/en`

- **Recons:** judul hero `AKBAR NAWASUNDA.`, wordmark/particle stage, angka atau elemen yang memang ditandai sebagai primary display.
- **NEXROID:** `YANG SEDANG BERJALAN.`, judul rilisan aktif, `Dengar di kanal resminya.`, nama platform, `MAIN JEDAG RUN.`, `BAWA SUARA INI KE PANGGUNGMU.`, `JANGAN KETINGGALAN.`
- **FHWASeriesEmod2020plus:** kicker, lede hero, `DENGAR SEKARANG`, `Lihat visual`, fakta Basis/Sejak/Genre, semua label sinyal, cerita rilisan, tombol player, metadata rilisan, kanal, CTA, email signup, serta teks tombol `DAFTAR`.
- **Noto + Towards:** pelat nama aksara; kata `AKSARA SUNDA` tetap FHWASeriesEmod2020plus.

### Musik — `/music` dan `/en/music`

- **Recons:** H1 `Musik` / `Music`.
- **NEXROID:** judul rilisan, `Dengar di kanal resminya.`, `Dengar langsung.`, `Semua rilisan.`, heading CTA dan Fan Signal.
- **FHWASeriesEmod2020plus:** jumlah rilisan/kanal, deskripsi katalog, metadata format/tahun/platform, semua tombol, tautan platform, cerita/kredit rilisan, kontrol rail, label player, dan CTA.

### Detail rilisan — `/music/:slug` dan `/en/music/:slug`

- **Recons:** H1/judul halaman yang menjadi display utama.
- **NEXROID:** judul rilisan, `Dengar & pakai.`, `Rilisan lain`, dan nama rilisan terkait.
- **FHWASeriesEmod2020plus:** status hak pakai, metadata, tombol dengar/lisensi, catatan, kredit, tautan, loading, dan pesan katalog kosong.

### Visual — `/visuals` dan `/en/visuals`

- **Recons:** H1 `Video & potret.` / `Video & portraits.`
- **NEXROID:** `Tayangan resmi.`, `Arsip visual.`, judul video/studi potret, serta heading CTA.
- **FHWASeriesEmod2020plus:** kicker, lede, fakta, filter, label `SEMUA`, `BUKA VIDEO`, tombol YouTube/portrait/proyek, caption, dan semua metadata.

### Jadwal — `/live` dan `/en/live`

- **Recons:** H1 `Jadwal & panggung.` / `Dates & stage.`
- **NEXROID:** nama show, tanggal besar, `Belum ada tanggal publik.`, `Jadwal terkonfirmasi.`
- **FHWASeriesEmod2020plus:** status, countdown, venue/kota/negara, lede, tombol tiket/RSVP/peta/booking/email, tabel event, dan seluruh label kalender.

### Perjalanan — `/universe` dan `/en/universe`

- **Recons:** H1 `Perjalanan Akbar Nawasunda.` / `The Akbar Nawasunda journey.`, nama primary display di panggung/era bila dipakai sebagai brand.
- **NEXROID:** `SATU NAMA, BANYAK BABAK.`, judul era, judul rilisan, `Dari studio.`, `Lanjut dari sini.`, nama rute keluar.
- **FHWASeriesEmod2020plus:** kicker, cerita perjalanan, fakta, tahun, metadata era, caption, catatan, nomor indeks, tombol, dan deskripsi rute.

### Tentang — `/about` dan `/en/about`

- **Recons:** H1 `Akbar Nawasunda.`
- **NEXROID:** `Perjalanan musik.`, judul jalur lanjut seperti `Dengar rilisan`, `Telusuri perjalanan`, dan `EPK & press kit`.
- **FHWASeriesEmod2020plus:** bio pendek/panjang, kutipan, fakta, genre, caption, CTA inquiry, label, serta deskripsi jalur lanjut.

### EPK — `/epk` dan `/en/epk`

- **Recons:** H1 `Press & booking.`
- **NEXROID:** `Tentang Akbar Nawasunda.`, judul capability, aset, rilisan pilihan, kontak proyek, dan heading platform.
- **FHWASeriesEmod2020plus:** fact sheet, nilai identitas, bio, deskripsi capability/aset/kontak, metadata rilisan, tombol save/print/kontak, platform, dan seluruh label.

### Inquiry — `/inquire` dan `/en/inquire`

- **Recons:** H1 bergantung tipe inquiry: booking, remix, collaboration, atau licensing.
- **NEXROID:** `Tentang kamu`, `Tentang proyek`, heading konteks/form/feedback.
- **FHWASeriesEmod2020plus:** intro, kontak, checklist, tipe inquiry, semua label dan placeholder input, data yang diketik pengguna, tombol submit, validasi, error, dan status berhasil.

### Licensing — `/licensing` dan `/en/licensing`

- **Recons:** H1 `Lisensi musik.` / `Music licensing.`
- **NEXROID:** `Mulai dari permintaan, bukan asumsi.`, `Jalur penggunaan.`, nama jalur, dan `Yang perlu disertakan.`
- **FHWASeriesEmod2020plus:** lede, aturan hak pakai, penjelasan jalur, checklist, nomor, CTA, dan email.

### Privasi — `/privacy` dan `/en/privacy`

- **Recons:** H1 `PRIVACY POLICY.`
- **NEXROID:** `LIGHT BY DEFAULT.`, `LIGHT ON YOUR DATA.`, `WHAT ENTERS THE SYSTEM.`, `NO HIDDEN TRACKING.`, `WHO HELPS RUN THE SITE.`, `YOUR DATA. YOUR CALL.`, judul kartu data dan layanan.
- **FHWASeriesEmod2020plus:** intro, isi legal, quote, anchor daftar isi, nomor seksi, tanggal, status data, daftar layanan, CTA, dan seluruh catatan.

### Game — `/game/jedag-run` dan `/en/game/jedag-run`

- **Fluorite:** `KEJAR DROP-NYA.` / `CHASE THE DROP.`, `TOP SEPULUH.` / `TOP TEN.`, judul modal username, dan heading overlay mulai/jeda/game over.
- **FHWASeriesEmod2020plus:** semua instruksi, skor, combo, username, leaderboard, tombol, status, tautan, label, dan caption.
- Recons/NEXROID tidak digunakan untuk heading game.

### 404

- **Recons:** headline `Halaman ini tidak ada di frekuensi.` / `This page is not on the frequency.`
- **FHWASeriesEmod2020plus:** `ERROR 404 · ...`, penjelasan, tombol kembali, status, URL rute, caption, dan metadata.

---

## Implementasi dan verifikasi

- Token dan `@font-face`: `client/src/index.css`
- Preload + splash: `client/index.html`
- Scope editorial dan mobile drawer: `client/src/shell/EditorialRefresh.css`
- Wordmark particle (Canvas tidak bisa membaca CSS variable): `client/src/signature/field/particleField.ts`
- Pelat aksara/signature: `client/src/components/signature/SundaScript.css`
- Game: `client/src/pages/GameJedagRun.css`, `client/src/components/JedagRunCanvas.css`
- Prompt untuk tuning sesi berikutnya: `docs/prompt-sesi-baru-revisi-tipografi.md`
