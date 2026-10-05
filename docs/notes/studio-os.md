# Studio OS — workspace owner (/admin, /studio, /assets)

Workspace privat Akbar Nawasunda dipakai dari satu kerangka: **Studio OS**.
Tidak ada CMS pihak ketiga. Sanity (`cms/sanity-studio`) sudah dihapus; seluruh
konten publik dibaca dari editor internal yang tersimpan di database proyek ini.

## Struktur

| Berkas                                   | Peran                                                                |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `client/src/studio/studio.css`           | Token warna, permukaan kaca, aurora, scrollbar, animasi, breakpoint.   |
| `client/src/studio/StudioKit.tsx`        | Primitif: `StudioHero`, `Panel`, `Stat`, `Pill`, `StudioTabs`, dll.    |
| `client/src/components/DashboardLayout.tsx` | Shell: sidebar rail, topbar, command palette, dock mobile.          |

Nama `DashboardLayout` sengaja dipertahankan supaya seluruh halaman studio tidak
perlu diubah importnya.

## Perilaku chrome

- **Sidebar** dapat diciutkan menjadi rail ikon (status disimpan di
  `localStorage` dengan kunci `studio-rail-collapsed`). Di bawah 1024 px sidebar
  berubah menjadi drawer dengan scrim.
- **Topbar** lengket: breadcrumb, pemicu command palette, dan tautan live site.
- **Command palette** `⌘K` / `Ctrl K`: navigasi antar rute studio dan aksi cepat
  (tulis rilisan baru, upload media, ciutkan sidebar, keluar).
- **Pintasan**: `⌘B` ciutkan sidebar, `⌘S` menyimpan dokumen yang terbuka di
  Content Studio, `Esc` menutup drawer.
- **Dock mobile** di bawah layar untuk empat rute utama + palette.

## Halaman

- `/admin` — Control Room: statistik langsung, enam jalur kerja, alur
  edit → publish → verify, dan catatan status sistem.
- `/studio` — Content Studio dengan empat tab: **Overview** (quick actions, page
  mirror, gallery analytics), **Compose** (editor + preview + save bar lengket),
  **Library** (pencarian, filter tipe/status), **Archives** (visual archive,
  portrait archive, leaderboard).
- `/assets` — Asset Library: drag & drop upload, pencarian, filter tipe media,
  salin URL, dan penghitung pemakaian di dokumen Studio.
- `/studio/inquiries` — Inbox booking/remix/collab/licensing dengan filter
  status dan balas cepat lewat email.
- `/studio/broadcasts` — Fan Signal: pembuatan draft Resend dan kontrol kirim
  dua langkah (saat ini dijeda).

## Aturan desain

1. Satu bahasa visual: ink gelap, aurora cyan–violet, panel kaca, label mono
   huruf besar, radius 16–22 px.
2. Jangan menulis ulang gaya per halaman — pakai `StudioKit`.
3. Studio tidak pernah memuat lapisan editorial publik (lihat `PublicShell`,
   `isStudioRoute`), jadi bundel publik tidak terbebani.
4. Semua animasi dimatikan otomatis pada `prefers-reduced-motion`.
