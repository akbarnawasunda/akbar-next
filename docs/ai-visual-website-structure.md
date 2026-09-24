# Visual Website Structure — Akbar Nawasunda

Dokumen ini adalah **brief visual dan wireframe tekstual** untuk dipakai sebagai referensi di AI image generator, AI UI generator, atau desainer visual. Targetnya bukan membuat screenshot website yang sudah jadi, melainkan menghasilkan gambar layout yang menunjukkan hierarki, proporsi, komposisi, serta karakter visual website Akbar Nawasunda.

## 1. Arah visual utama

Website ini adalah situs resmi seorang **electronic music producer, remixer, dan performer dari Indonesia**. Visualnya harus terasa seperti editorial music archive yang premium, gelap, tajam, dan modern. Hindari tampilan dashboard, template SaaS, neon cyberpunk berlebihan, atau landing page startup.

Gunakan atmosfer **nocturnal electronic artist**: ruang gelap bertekstur halus, tipografi besar, foto portrait dengan crop editorial, garis grid tipis, aksen cyan elektrik, biru-indigo, dan sedikit violet. Setiap section harus terasa seperti panel dalam satu sistem visual yang konsisten.

> Kesan yang dicari: **independent electronic artist website, dark editorial archive, premium music identity, controlled intensity, tactile interface, quiet confidence.**

## 2. Design tokens

| Elemen | Arahan visual |
|---|---|
| Background utama | Hampir hitam kebiruan `#0c0d12` |
| Panel | Graphite blue `#141722` dan `#1a1e2b` |
| Teks utama | Off-white `#f4f6fa` |
| Teks sekunder | Muted blue-grey `#a2abb9` |
| Aksen utama | Electric cyan `#00d4ff` |
| Aksen kedua | Indigo `#4f46e5` dan violet `#8b5cf6` |
| Display font | Geometric editorial sans, mirip Syne atau Clash Display, bold, compact |
| Body font | Clean modern sans, mirip Plus Jakarta Sans atau Satoshi |
| Metadata | Monospace uppercase, tracking lebar, mirip JetBrains Mono |
| Border | Garis putih transparan sangat tipis, sekitar 8–12% opacity |
| Shadow | Shadow besar dan lembut di bawah artwork, card, serta embed player |
| Radius | Kecil dan terkontrol: 2–8 px, bukan rounded-card yang playful |
| Tekstur | Grain/noise sangat halus, vignette, gradient indigo-cyan, garis scan tipis |

## 3. Global frame

Setiap halaman memakai struktur yang sama.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ AKBAR NAWASUNDA     MUSIC VISUALS LIVE ARCHIVE ABOUT EPK CONTACT     │
│                         ID / EN          KABAR TERBARU                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                         PAGE CONTENT                                 │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ AKBAR NAWASUNDA        LIHAT-LIHAT       HUBUNGI                      │
│ PRODUCER / REMIXER     Music             Spotify                      │
│ INDONESIA              Visuals           SoundCloud                   │
│                        Live              Instagram                    │
│                        Archive           EPK / Booking                │
│                                                                      │
│ © AKBAR NAWASUNDA                                      BACK TO SIGNAL│
└──────────────────────────────────────────────────────────────────────┘
```

Header desktop bersifat tipis, horizontal, dan tidak mengambil terlalu banyak ruang. Logo wordmark berada di kiri. Navigasi berada di tengah. Language switcher dan link berita berada di kanan. Pada mobile, navigasi berubah menjadi logo di kiri dan tombol menu berbentuk dua atau tiga garis di kanan. Jangan memaksa seluruh menu desktop masuk dalam satu baris mobile.

## 4. Homepage — struktur visual

### 4.1 Hero

Hero adalah section paling dominan. Gunakan komposisi asimetris dengan portrait besar di satu sisi dan copy editorial di sisi lain.

```text
DESKTOP 1440 px
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER                                                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  small cyan dot  PRODUCER / REMIXER                                 │
│                                                                      │
│  AKBAR                         ┌─────────────────────────────┐       │
│  NAWASUNDA.                    │                             │       │
│                                │  PORTRAIT AKBAR             │       │
│  Deskripsi singkat tentang     │  high contrast, editorial   │       │
│  musik dan identitas.          │  crop, dark lighting        │       │
│                                │                             │       │
│  [ PLAY / DENGAR ]             └─────────────────────────────┘       │
│  LIHAT VISUAL       KABAR TERBARU                                  │
│                                                                      │
│                                      hand-drawn mascot / doodle      │
│                                                     SCROLL ↘         │
└──────────────────────────────────────────────────────────────────────┘
```

Gunakan portrait hitam kebiruan dengan highlight cyan atau white rim light. Foto tidak boleh tampak seperti stock photo korporat. Tambahkan mascot doodle kecil sebagai elemen kontras yang lebih personal. Judul harus sangat besar, tetapi setiap kata tetap terbaca dan tidak pecah secara agresif.

### 4.2 Music signal deck

Section berikutnya memperkenalkan platform musik. Copy besar berada di kiri, sedangkan kartu platform berada di kanan dalam susunan modular.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ MUSIK                                                                │
│                                                                      │
│ DENGAR                         ┌──────────┐ ┌──────────┐             │
│ KARYANYA.                      │ Spotify  │ │SoundCloud│             │
│                                └──────────┘ └──────────┘             │
│ LIHAT MUSIK ↗                  ┌──────────┐ ┌──────────┐             │
│                                │ YouTube  │ │ Apple    │             │
│                                └──────────┘ └──────────┘             │
│                         horizontal platform marquee  ───────────────│
└──────────────────────────────────────────────────────────────────────┘
```

### 4.3 Rilisan terbaru

Buat satu feature release yang lebih besar daripada kartu katalog biasa. Artwork square berada di kiri. Informasi rilisan berada di kanan.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ RILISAN TERBARU                                                      │
│                                                                      │
│ ┌──────────────────────┐        SINGLE · 2025                        │
│ │                      │        JUDUL RILISAN                        │
│ │   SQUARE ARTWORK     │        Deskripsi pendek atau catatan         │
│ │   dark cover art     │        rilisan.                              │
│ │                      │        BUKA RILISAN ↗       SINGLE           │
│ └──────────────────────┘                                             │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.4 Editorial story / photo story

Gunakan dua atau tiga blok editorial yang bergantian posisi. Satu blok dapat berupa foto portrait atau foto panggung lebar, blok berikutnya berupa teks besar dengan nomor section dan metadata kecil. Jangan membuat semua section menjadi card yang sama bentuknya.

### 4.5 Katalog rilisan — wajib horizontal carousel

Katalog harus tampak sebagai **horizontal track**, bukan grid yang memenuhi layar. Kartu memiliki artwork square, nomor index kecil, format/tahun, judul, platform, dan arrow.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ KATALOG RILISAN                                      SPOTIFY ↗        │
│ SEMUA                                                               │
│ RILISAN.                           GESER UNTUK MENJELAJAH  ←  →      │
│                                                                      │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────  │
│ │ artwork 01   │  │ artwork 02   │  │ artwork 03   │  │ artwork ...│
│ │ 01           │  │ 02           │  │ 03           │  │            │
│ │ SINGLE · 25  │  │ REMIX · 24   │  │ EP · 24      │  │            │
│ │ title        │  │ title        │  │ title        │  │            │
│ │ SoundCloud ↗ │  │ Spotify ↗    │  │ YouTube ↗    │  │            │
│ └──────────────┘  └──────────────┘  └──────────────┘  └───────────  │
└──────────────────────────────────────────────────────────────────────┘
```

Di desktop, tampilkan sekitar 3 kartu penuh dan sebagian kartu berikutnya sebagai affordance untuk scroll. Di mobile, tampilkan satu kartu penuh dan sekitar 15–20% kartu berikutnya. Beri shadow yang jelas tetapi tetap lembut. Artwork dan teks tidak boleh overflow keluar dari frame.

### 4.6 Video and remix

Gunakan satu feature video besar dan dua kartu pendamping yang lebih kecil. Semua kartu memakai thumbnail gelap dengan overlay gradient, label kecil, judul, dan tombol play bundar.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ VISUAL                                                               │
│ VIDEO                                                                │
│ & REMIX.                                                             │
│                                                                      │
│ ┌──────────────────────────────────────┐ ┌────────────────────────┐ │
│ │                                      │ │                        │ │
│ │         FEATURE VIDEO                │ │   REMIX / CLIP         │ │
│ │         large cinematic thumbnail    │ │                        │ │
│ │                         ◉ PLAY       │ └────────────────────────┘ │
│ └──────────────────────────────────────┘ ┌────────────────────────┐ │
│                                          │   SECONDARY VIDEO       │ │
│                                          └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.7 Live section

Live section adalah panel lebar dengan background foto panggung atau hero image yang gelap. Copy berada di kiri. Statistik seperti next show, venue, atau status berada di kanan. Gunakan tombol cyan untuk tiket, RSVP, atau notifikasi.

### 4.8 Signal / newsletter

Akhiri homepage dengan blok besar yang terasa seperti terminal komunikasi: judul “JANGAN KETINGGALAN.”, copy pendek, dan input atau CTA untuk menerima kabar rilisan serta jadwal.

## 5. Music page — struktur visual

Urutan visual:

1. **Hero music** dengan background artwork rilisan terbaru, judul “MUSIK AKBAR.”, dan mini panel rilisan terbaru di kanan bawah.
2. **Platform hub** dengan headline “PILIH TEMPATNYA.” dan daftar platform berbentuk row/card.
3. **Featured release story** dengan artwork besar di kiri dan catatan rilisan di kanan.
4. **Embedded players** dalam dua media frame yang rapi.
5. **Catalog carousel** horizontal.
6. **Spotify CTA**.
7. **Signal block** dan footer.

Embed SoundCloud harus selalu berada di dalam media frame dengan overflow tersembunyi, border, radius kecil, background gelap, dan shadow yang terlihat. Jangan biarkan iframe keluar dari container. Kartu embed tidak boleh lebih lebar daripada viewport mobile.

```text
MOBILE MUSIC PAGE — 390 px
┌──────────────────────────────┐
│ logo                   menu  │
├──────────────────────────────┤
│ MUSIK                        │
│ AKBAR.                       │
│                              │
│ [dark release artwork]       │
│ RILISAN TERBARU              │
│ title                        │
│ DENGAR ↗                     │
├──────────────────────────────┤
│ DENGARKAN DI SINI            │
│ PILIH                        │
│ TEMPATNYA.                   │
│ [Spotify]                    │
│ [SoundCloud]                 │
│ [YouTube]                    │
├──────────────────────────────┤
│ artwork                      │
│ CATATAN RILISAN              │
│ release title                │
│ body copy                    │
├──────────────────────────────┤
│ DENGAR LANGSUNG.             │
│ ┌──────────────────────────┐ │
│ │ SoundCloud media frame   │ │
│ │ contained, no overflow   │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ SEMUA RILISAN.       ← →    │
│ ┌──────────────┐ ┌─────────  │
│ │ artwork      │ │ next     │
│ │ title        │ │          │
│ └──────────────┘ └─────────  │
└──────────────────────────────┘
```

## 6. Contact / Inquiry page — struktur visual

Halaman inquiry terasa seperti contact sheet atau booking desk premium, bukan form standar.

```text
DESKTOP
┌──────────────────────────────────────────────────────────────────────┐
│ BOOKING / PERFORMANCE                                                │
│ BOOKING                                                              │
│ INQUIRY.                         STATUS                              │
│ Intro singkat.                   AKAN DITINJAU                       │
├──────────────────────────────────────────────────────────────────────┤
│ CONTACT / WORK TOGETHER             SEND A MESSAGE                   │
│ LET'S MAKE                         BOOKING INQUIRY.                  │
│ A SIGNAL.                          [BOOKING] [REMIX] [COLLAB]         │
│                                     ┌────────┐ ┌────────┐             │
│ Email owner                         │ NAME   │ │ EMAIL  │             │
│ Bandung Barat — Indonesia            └────────┘ └────────┘             │
│                                     ┌────────┐ ┌────────┐             │
│                                     │ ORG    │ │ EVENT  │             │
│                                     └────────┘ └────────┘             │
│                                     BUDGET CONTEXT                    │
│                                     BRIEF / MESSAGE                   │
│                                     [ KIRIM INQUIRY ]                 │
└──────────────────────────────────────────────────────────────────────┘
```

Pada mobile, kolom kontak tampil lebih dulu, kemudian form satu kolom. Input harus tinggi dan mudah disentuh. Label input menggunakan monospace uppercase kecil. Gunakan garis bawah atau border tipis terang, bukan input putih besar yang tampak seperti aplikasi administrasi.

## 7. Mobile-first rules — viewport 390 px

- Gunakan padding horizontal sekitar 20–24 px. Tidak ada elemen yang menyentuh tepi viewport tanpa alasan visual.
- Judul display boleh besar, tetapi pecah berdasarkan kata atau baris yang direncanakan. Jangan memotong kata di tengah dengan `word-break: break-all`.
- Setiap embed, image, card, button, dan carousel harus memiliki `max-width: 100%` serta `min-width: 0` pada parent flex/grid.
- Section harus ditumpuk secara vertikal dengan jarak yang konsisten. Hindari dua kolom sempit yang menghasilkan teks bertabrakan.
- Carousel tetap horizontal dan dapat digeser dengan satu jari. Jangan mengubah katalog menjadi grid panjang.
- Tombol utama memiliki tinggi sentuh minimal sekitar 44 px dan teks tetap terbaca.
- Navigasi desktop disembunyikan dari layout mobile; gunakan menu panel yang jelas.
- Shadow cukup kuat untuk memisahkan embed/card dari background, tetapi tidak menghasilkan glow neon di seluruh halaman.
- Teks sekunder harus tetap memiliki kontras yang jelas terhadap background. Hindari abu-abu yang terlalu gelap.
- Semua foto dan artwork harus memakai crop yang disengaja. Jangan biarkan wajah atau objek utama terpotong secara acak.

## 8. Prompt utama untuk AI image generator

Salin prompt berikut ke AI gambar:

```text
Create a high-fidelity visual website layout reference for an Indonesian electronic music producer and remixer named AKBAR NAWASUNDA. Show a premium dark editorial artist website, not a generic startup landing page. The visual identity is nocturnal electronic music, art archive, and live performance culture.

Design a full responsive website concept with a desktop homepage and a mobile 390px composition shown side by side. Use a deep blue-black background, graphite panels, off-white typography, electric cyan accents, indigo and violet gradients, subtle grain, thin translucent borders, soft but visible shadows, and restrained glow. Use a bold geometric editorial sans-serif display typeface, a clean modern sans-serif body typeface, and small uppercase monospace metadata.

Desktop homepage structure: thin top navigation with AKBAR NAWASUNDA wordmark, MUSIC, VISUALS, LIVE, ARCHIVE, ABOUT, EPK, CONTACT, ID/EN switcher, and a small latest-news link. Large asymmetric hero with oversized headline “AKBAR NAWASUNDA.” on the left, a high-contrast editorial portrait of the artist on the right, a small hand-drawn mascot doodle, a cyan primary play button, a visual link, and a scroll cue. Below it, a music platform section with a large “DENGAR KARYANYA.” headline and modular Spotify, SoundCloud, YouTube, and Apple Music cards. Follow with a featured release section: square album artwork, release title, metadata, short story, and a link.

Continue with editorial photo/story blocks, then a clearly horizontal release catalog carousel with square album artworks, numbered cards, release format and year, platform label, arrow controls, and a partially visible next card to communicate horizontal scrolling. Add a cinematic video and remix section with one large feature thumbnail and two smaller thumbnails, dark gradient overlays, labels, titles, and round play buttons. Add a wide live-performance panel with a stage photograph, event information, and a cyan RSVP or ticket button. Finish with a signal/newsletter block and a structured multi-column footer.

The mobile 390px version must be intentional and polished: compact header with logo and menu button, vertically stacked sections, readable headlines that wrap by whole words, one-column contact and form layouts, contained SoundCloud-style media frames, no overflow, and a one-card-plus-partial-next-card horizontal catalog carousel. Make all cards, images, embeds, buttons, and text stay inside the viewport. Use strong contrast and generous vertical rhythm.

Art direction: cinematic portrait photography, dark stage light, cyan rim light, abstract electronic waveform details, monochrome album artwork with one electric accent, precise grid alignment, premium independent artist identity, tactile archive interface, editorial magazine composition, quiet confidence, controlled intensity.
```

## 9. Negative prompt

```text
Do not create a white website, bright corporate SaaS dashboard, generic music streaming app, gaming UI, cyberpunk overload, excessive neon, glassmorphism everywhere, giant unreadable text, random word breaking, cramped mobile layout, overlapping text, clipped faces, overflowing iframes, broken cards, tiny low-contrast labels, excessive rounded corners, pastel colors, stock corporate photography, or a conventional three-column blog grid.
```

## 10. Prompt pendek untuk satu halaman mobile

```text
Premium 390px mobile website for Indonesian electronic artist Akbar Nawasunda. Deep blue-black background, off-white Syne-style editorial typography, electric cyan accents, graphite cards, subtle grain, visible soft shadows. Compact logo header with menu button. Large readable hero headline “AKBAR NAWASUNDA.” with dark cinematic portrait and cyan rim light. Vertical sections for latest release, music platforms, contained SoundCloud player, and a horizontal album-release carousel showing one full card plus part of the next card. Use intentional whole-word wrapping, 20px side padding, strong contrast, no overflow, no overlapping elements, no aggressive neon, no rounded SaaS design. Editorial music archive, premium independent producer identity.
```

## 11. Hal yang harus dinilai dari hasil gambar AI

Hasil visual dianggap sesuai apabila hierarki hero terlihat jelas dalam tiga detik pertama, katalog rilisan terbaca sebagai carousel horizontal, embed player tampak terkunci di dalam frame, dan mobile 390 px terlihat seperti komposisi yang memang dirancang untuk ponsel. Jika gambar AI menghasilkan teks yang tidak akurat, prioritaskan **proporsi, grouping, whitespace, warna, dan arah art direction**. Teks final tetap harus dibangun ulang di website dengan font dan konten asli.

## References

Dokumen ini dirumuskan berdasarkan struktur source code aktif proyek Akbar Nawasunda:

[1]: https://github.com/akbarnawasunda/akbar-next "Akbar Nawasunda website repository"

[2]: https://github.com/akbarnawasunda/akbar-next/blob/main/client/src/pages/Home.tsx "Homepage structure"

[3]: https://github.com/akbarnawasunda/akbar-next/blob/main/client/src/pages/Music.tsx "Music page structure"

[4]: https://github.com/akbarnawasunda/akbar-next/blob/main/client/src/pages/Inquiry.tsx "Inquiry page structure"

[5]: https://github.com/akbarnawasunda/akbar-next/blob/main/client/src/index.css "Visual tokens and typography"

[6]: https://github.com/akbarnawasunda/akbar-next/blob/main/client/src/components/NightFrequencyChrome.tsx "Shared header and footer structure"
