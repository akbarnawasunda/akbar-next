# ACCEPTANCE — Checklist Penerimaan dan QA

- **Versi:** 1.0 (draft)
- **Tanggal:** 2026-10-10
- **Acuan:** [`PRD.md`](./PRD.md) bagian 5, 7, dan 8

Gunakan checklist ini sebelum merge atau rilis. Setiap item harus lulus, atau diberi catatan alasan jika ditunda.

---

## 1. Fitur P0

- [ ] F-01 Hero beranda tampil dengan judul, dua CTA, dan gambar.
- [ ] F-02 Strip live menampilkan maksimal 3 live terdekat, atau pesan kosong yang benar.
- [ ] F-03 Grid rilisan menampilkan 4–5 kartu dengan link ke detail.
- [ ] F-04 Blok video memutar video hanya setelah klik.
- [ ] F-05 Strip kanal resmi tampil di semua halaman dan menautkan ke `/kanal-resmi`.
- [ ] F-06 Banner cookie muncul sekali, menyimpan pilihan, dan tidak memuat skrip non-esensial sebelum pilihan.
- [ ] F-07 Tautan sosial tampil di footer dan beranda.
- [ ] F-08 Halaman Music memiliki filter dan tombol dengar per platform.
- [ ] F-09 Halaman Live menampilkan upcoming di atas dan arsip di bawah.
- [ ] F-10 Halaman Visuals memuat embed dengan poster.
- [ ] F-11 EPK dapat diunduh; form inquire mengirim dan menampilkan status.
- [ ] F-12 Menu desktop dan mobile berfungsi, termasuk tutup dengan Esc.
- [ ] F-13 Footer memuat semua tautan wajib.

## 2. Layout dan visual

- [ ] Beranda memiliki maksimal 6 blok utama (`LAYOUT.md` bagian 2).
- [ ] Setiap blok punya satu CTA utama.
- [ ] Warna hanya memakai token dari `DESIGN.md` bagian 2.
- [ ] Font hanya memakai Recons, NEXROID, Good Times, Towards (signature), dan Noto Sans Sundanese (Sundanese). Fluorite hanya di JEDAG RUN.
- [ ] Tidak ada font dari CDN pihak ketiga (sesuai kebijakan `font-synthesis: none` dan lokal).
- [ ] Jarak antar blok sesuai `DESIGN.md` bagian 4.2.
- [ ] Layout diuji di 360, 390, 768, 1024, 1440 px tanpa scroll horizontal.
- [ ] Hero mobile tidak memotong judul penting.

## 3. Aksesibilitas (WCAG 2.2 AA)

- [ ] Kontras teks utama minimal 4.5:1, teks besar minimal 3:1.
- [ ] Semua elemen interaktif bisa dijangkau dengan Tab, dengan urutan logis.
- [ ] `:focus-visible` terlihat di semua tombol dan tautan.
- [ ] Semua gambar informatif punya `alt`; gambar dekoratif `alt=""`.
- [ ] Dialog (menu mobile, lightbox, cookie) punya focus trap dan tutup dengan Esc.
- [ ] Animasi menghormati `prefers-reduced-motion`.
- [ ] Form punya label, error terhubung dengan `aria-describedby`, dan status diumumkan.
- [ ] Heading berurutan (satu H1 per halaman).

## 4. Performa

- [ ] LCP mobile ≤ 2.5 detik di koneksi 4G simulasi.
- [ ] CLS ≤ 0.1; gambar hero dan artwork punya ukuran eksplisit.
- [ ] INP ≤ 200 ms untuk navigasi dan filter.
- [ ] Gambar memakai `next/image` dengan `sizes` yang benar; hero memakai `priority`.
- [ ] Embed video tidak dimuat sebelum klik.
- [ ] Bundle halaman beranda tidak naik lebih dari 10% dibanding baseline.
- [ ] Skor Lighthouse mobile performa ≥ 85.

## 5. SEO dan metadata

- [ ] Setiap rute punya judul, description, canonical, dan hreflang ID/EN.
- [ ] Open Graph dan Twitter card terisi untuk beranda, music detail, dan live.
- [ ] JSON-LD `MusicGroup`, `MusicRecording`, atau `Event` sesuai konten.
- [ ] `public/sitemap.xml` memuat `/kanal-resmi` dan rute baru lain.
- [ ] Rute 404 memberi `noindex`.
- [ ] `pnpm test` dan `scripts/verify-next.sh` lulus.

## 6. Konten

- [ ] Semua tanggal live sudah dikonfirmasi penyelenggara.
- [ ] Setiap rilisan punya minimal satu link dengar yang valid.
- [ ] Setiap tautan tiket mengarah ke domain resmi penyelenggara.
- [ ] Banner kanal resmi sudah disetujui tim.
- [ ] Foto editorial memiliki izin pemakaian dan kredit.
- [ ] Copy ID dan EN sudah diperiksa dan konsisten.

## 7. Keamanan dan privasi

- [ ] Tidak ada secret, token, atau connection string di repo.
- [ ] Form inquire memiliki honeypot dan validasi server-side.
- [ ] Tautan eksternal dengan `target="_blank"` memakai `rel="noopener noreferrer"`.
- [ ] Halaman Privacy diperbarui jika ada layanan pihak ketiga baru.
- [ ] Tidak ada analitik yang aktif sebelum persetujuan cookie.

## 8. Lintas perangkat dan browser

- [ ] Chrome, Safari (iOS dan macOS), Firefox, dan Edge versi terbaru.
- [ ] Android Chrome pada layar 360 dan 390 px.
- [ ] Mode gelap sistem tidak merusak tampilan (situs memang gelap, tapi tidak boleh bentrok).

## 9. Perintah verifikasi

```bash
pnpm install
pnpm check          # TypeScript
pnpm test           # Vitest
pnpm audit:layout   # Guardrail CSS dan font
pnpm build          # Build produksi
pnpm start & bash scripts/verify-next.sh   # Smoke test produksi
```

## 10. Definisi selesai (Definition of Done)

Fitur dianggap selesai jika:

1. Semua item P0 di bagian 1 lulus.
2. Bagian 2–5 lulus untuk halaman yang terdampak.
3. Ada screenshot desktop dan mobile di PR.
4. Dokumen terkait (`LAYOUT.md`, `COMPONENTS.md`) diperbarui bila ada perubahan keputusan.
5. Disetujui oleh pemilik produk.
