# COMPONENTS — Katalog Komponen UI

- **Versi:** 1.0 (draft)
- **Tanggal:** 2026-10-10
- **Acuan:** [`DESIGN.md`](./DESIGN.md), [`LAYOUT.md`](./LAYOUT.md)

Nama komponen mengikuti konvensi folder `app/_components/` dan `client/src/components/` yang sudah ada. Nama file yang disarankan ada di kolom "Lokasi".

---

## 1. Ringkasan

| # | Komponen | Lokasi yang disarankan | Dipakai di | Prioritas |
|---|---|---|---|---|
| C-01 | `CookieBanner` | `app/_components/CookieBanner.tsx` | Semua | P0 |
| C-02 | `SiteHeader` | `app/_components/SiteHeader.tsx` | Semua | P0 |
| C-03 | `SiteFooter` | `app/_components/SiteFooter.tsx` | Semua | P0 |
| C-04 | `OfficialChannelsStrip` | `app/_components/OfficialChannelsStrip.tsx` | Semua | P0 |
| C-05 | `HeroFeature` | `app/_components/HeroFeature.tsx` | Beranda | P0 |
| C-06 | `LiveStrip` | `app/_components/LiveStrip.tsx` | Beranda, Live | P0 |
| C-07 | `LiveRow` | `app/_components/LiveRow.tsx` | Live | P0 |
| C-08 | `ReleaseCard` | `app/_components/ReleaseCard.tsx` | Beranda, Music, Archive | P0 |
| C-09 | `ReleaseGrid` | `app/_components/ReleaseGrid.tsx` | Beranda, Music | P0 |
| C-10 | `VideoFeature` | `app/_components/VideoFeature.tsx` | Beranda, Visuals | P0 |
| C-11 | `VideoFacade` | `app/_components/VideoFacade.tsx` | Visuals, Music detail | P0 |
| C-12 | `ListenLinks` | `app/_components/ListenLinks.tsx` | Music detail, Hero | P0 |
| C-13 | `SocialLinks` | `app/_components/SocialLinks.tsx` | Footer, Beranda | P0 |
| C-14 | `FilterBar` | `app/_components/FilterBar.tsx` | Music | P0 |
| C-15 | `EditorialStrip` | `app/_components/EditorialStrip.tsx` | Beranda, About | P1 |
| C-16 | `QuoteBlock` | `app/_components/QuoteBlock.tsx` | About, Beranda | P1 |
| C-17 | `SectionHeader` | `app/_components/SectionHeader.tsx` | Semua | P0 |
| C-18 | `Button` (varian) | `components/ui/button.tsx` | Semua | P0 |
| C-19 | `Chip` | `components/ui/chip.tsx` | Music, Live | P0 |
| C-20 | `InquireForm` | `app/_components/InquireForm.tsx` | Inquire | P0 |
| C-21 | `Lightbox` | `app/_components/Lightbox.tsx` | Visuals, EPK | P1 |
| C-22 | `EmptyState` | `app/_components/EmptyState.tsx` | Semua blok dinamis | P0 |

---

## 2. Spesifikasi komponen

### C-01 `CookieBanner`

- **Props:** `policyHref: string`
- **State:** `hidden | visible` disimpan di `localStorage` dengan kunci `consent.v1`.
- **Tombol:** "Tolak semua", "Kelola", "Terima semua". Ketiganya setara secara visual.
- **Perilaku:** muncul hanya jika belum ada pilihan. Skrip non-esensial dimuat setelah "Terima" atau "Kelola" memilih analitik.
- **A11y:** `role="region"`, `aria-label="Pengaturan cookie"`, fokus pertama ke tombol Terima jika muncul.

### C-02 `SiteHeader`

- **Props:** `locale: 'id' | 'en'`, `currentPath: string`
- **State:** `scrolled: boolean`, `menuOpen: boolean`
- **Perilaku:** sticky; latar berubah setelah scroll 80 px. Menu mobile membuka dialog fullscreen dengan `focus trap` dan tutup dengan Esc.
- **A11y:** tautan aktif memakai `aria-current="page"`. Tombol menu punya `aria-expanded`.

### C-03 `SiteFooter`

- **Props:** `locale`, `socials: SocialLink[]`
- **Konten:** kolom navigasi, `SocialLinks`, copyright, switcher bahasa.

### C-04 `OfficialChannelsStrip`

- **Props:** `message: string`, `ctaHref: string`, `ctaLabel: string`
- **Konten default:** pesan bahwa Akbar tidak pernah meminta pembayaran lewat DM. Tautan ke `/kanal-resmi`.
- **Visual:** latar `ink-soft`, border kiri 2px `alert`.
- **A11y:** `role="note"`.

### C-05 `HeroFeature`

- **Props:**
  - `kicker: string` (contoh: "RILIS BARU · SINGLE · 2026")
  - `title: string`
  - `subtitle?: string`
  - `image: ImageAsset`
  - `primaryCta: { label: string; href: string }`
  - `secondaryCta?: { label: string; href: string }`
- **Perilaku:** gambar `priority` di Next.js. Overlay gradasi ke `ink`. Animasi masuk sekali. Tidak auto-play.
- **Fallback:** jika gambar gagal, latar `ink` dengan wordmark.
- **A11y:** H1 dipakai untuk `title`. Gambar hero dekoratif jika ada teks yang sama, `alt=""`.

### C-06 `LiveStrip`

- **Props:** `events: LiveEvent[]`, `limit?: number` (default 3), `archiveHref: string`
- **Perilaku:** urut tanggal naik. Jika kosong, render `EmptyState` dengan pesan dan tautan arsip.
- **Tampilan:** lihat `LAYOUT.md` bagian 2.

### C-07 `LiveRow`

- **Props:** `event: LiveEvent`
- **Tampilan:** tanggal (`DD MMM`), kota dan negara, nama acara, venue, CTA.
- **CTA:** "Tiket" jika `ticketUrl` ada, jika tidak "Detail". Tautan tiket `rel="noopener"` dan `target="_blank"`.
- **Status:** chip "Hampir penuh" atau "Sold out" jika di-set di Studio.

### C-08 `ReleaseCard`

- **Props:** `release: Release`, `priority?: boolean`
- **Konten:** artwork 1:1, judul, artis, tipe sebagai label kecil, tahun.
- **Interaksi:** seluruh kartu adalah tautan ke `/music/[slug]`. Tombol dengar cepat (ikon) hanya jika ada satu link utama.
- **Hover:** naik 4 px, border `signal` tipis.

### C-09 `ReleaseGrid`

- **Props:** `releases: Release[]`, `columns?: 2 | 3 | 4`, `showMore?: boolean`
- **Perilaku:** pagination dengan tombol "Muat lebih banyak" (bukan infinite scroll).

### C-10 `VideoFeature`

- **Props:** `video: Video`, `archiveHref: string`
- **Tampilan:** thumbnail 16:9, tombol putar, judul, deskripsi singkat.
- **Perilaku:** klik membuka `VideoFacade`.

### C-11 `VideoFacade`

- **Props:** `videoId: string`, `provider: 'youtube' | 'vimeo' | 'self'`, `poster: ImageAsset`, `title: string`
- **Perilaku:** tampilkan poster dulu. Iframe dimuat setelah klik. Tidak ada request pihak ketiga sebelum klik.
- **A11y:** tombol "Putar video: {title}".

### C-12 `ListenLinks`

- **Props:** `links: { platform: 'spotify' | 'apple' | 'youtube' | 'soundcloud' | 'other'; href: string; label: string }[]`
- **Tampilan:** baris label dengan panah, bukan hanya ikon.
- **Urutan:** urut sesuai input. Jika kosong, komponen tidak dirender.

### C-13 `SocialLinks`

- **Props:** `links: SocialLink[]`, `variant: 'row' | 'stack'`
- **Tampilan:** monokrom, label teks. Ikon opsional (`simple-icons` sudah ada di dependency).

### C-14 `FilterBar`

- **Props:** `options: Option[]`, `value: string`, `onChange(value)`, `sort?: SortOption`
- **Perilaku:** filter sebagai `role="radiogroup"` atau tab. Hasil diumumkan dengan `aria-live="polite"`.

### C-15 `EditorialStrip`

- **Props:** `images: ImageAsset[]` (maks 3), `caption?: string`
- **Perilaku:** scroll horizontal snap di mobile. Tidak ada autoplay.

### C-16 `QuoteBlock`

- **Props:** `quote: string`, `attribution?: string`
- **Tampilan:** NEXROID 40–48 px desktop, 28 px mobile. Tanda kutip tipis `signal-dim`.

### C-17 `SectionHeader`

- **Props:** `kicker?: string`, `title: string`, `actionLabel?: string`, `actionHref?: string`
- **Tampilan:** kicker label kecil di atas, judul H2, tautan aksi di kanan (desktop) atau di bawah (mobile).

### C-18 `Button`

| Varian | Kapan dipakai |
|---|---|
| `primary` | Satu per blok: dengar, tiket, kirim |
| `secondary` | Aksi kedua: lihat semua, kelola |
| `ghost` | Aksi tersier dan tautan dalam kartu |
| `link` | Tautan inline |

Ukuran: `md` 48 px tinggi (default), `sm` 36 px. Tombol wajib punya state `:focus-visible`.

### C-19 `Chip`

- **Props:** `tone: 'neutral' | 'live' | 'alert'`, `children`
- **Tone live:** titik kecil `signal` di kiri.

### C-20 `InquireForm`

- **Field:** nama, email, jenis (Booking / Media / Lisensi / Lainnya), pesan, honeypot (`website`) untuk anti-spam.
- **Validasi:** zod (sudah ada di dependency). Pesan error di bawah field dengan `aria-describedby`.
- **Submit:** lewat endpoint tRPC atau route handler yang sudah ada. Status `idle | sending | success | error`.
- **Setelah sukses:** tampilkan pesan dan tombol "Kirim lagi", bukan reset diam-diam.

### C-21 `Lightbox`

- **Props:** `images: ImageAsset[]`, `index: number`, `onClose()`
- **Perilaku:** Esc untuk tutup, panah kiri/kanan untuk navigasi, fokus kembali ke pemicu saat tutup.

### C-22 `EmptyState`

- **Props:** `title: string`, `description?: string`, `action?: { label; href }`
- **Tampilan:** teks `bone-dim`, satu tautan. Tidak ada ilustrasi.

---

## 3. Tipe data bersama

```ts
type ImageAsset = { src: string; alt: string; width: number; height: number };

type Release = {
  slug: string;
  title: string;
  artists: string;          // "Akbar Nawasunda" atau "DJ Akbar Remix"
  type: 'single' | 'ep' | 'album' | 'remix';
  releasedAt: string;       // ISO date
  artwork: ImageAsset;
  links: ListenLinkInput[];
};

type LiveEvent = {
  id: string;
  date: string;             // ISO date
  city: string;
  country: string;
  eventName: string;
  venue?: string;
  ticketUrl?: string;
  status?: 'on-sale' | 'low' | 'sold-out' | 'details';
};

type Video = {
  id: string;
  title: string;
  description?: string;
  provider: 'youtube' | 'vimeo' | 'self';
  providerId: string;
  poster: ImageAsset;
};

type ListenLinkInput = { platform: 'spotify' | 'apple' | 'youtube' | 'soundcloud' | 'other'; href: string; label: string };
type SocialLink = { platform: string; href: string; label: string };
type Option = { value: string; label: string };
type SortOption = { value: string; label: string };
```

Catatan: tipe di atas adalah **kontrak awal**. Sesuaikan dengan skema Drizzle dan Studio yang sudah ada sebelum implementasi.

## 4. Aturan pemakaian komponen

- Komponen baru harus bisa dipakai di ID dan EN tanpa perubahan kode.
- Komponen yang punya animasi wajib punya fallback `prefers-reduced-motion`.
- Jangan membuat komponen baru jika sudah ada padanan di `components/ui/`.
- Setiap komponen P0 wajib punya minimal satu test render (Vitest).
