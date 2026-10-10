# Paket Dokumen: Pola Layout ala martingarrix.com untuk Akbar Nawasunda

Folder ini berisi dokumen-dokumen yang diturunkan dari **struktur dan pola layout** situs `martingarrix.com` (diamati 2026-10-10), lalu disesuaikan untuk website Akbar Nawasunda.

## Isi paket

| File | Isi |
|---|---|
| [`PRD.md`](./PRD.md) | Product Requirements Document: tujuan, pengguna, fitur, prioritas, metrik, scope |
| [`DESIGN.md`](./DESIGN.md) | Design system: warna, tipografi, grid, spacing, komponen visual, motion |
| [`LAYOUT.md`](./LAYOUT.md) | Layout per halaman dan per breakpoint (wireframe teks) |
| [`SITEMAP.md`](./SITEMAP.md) | Information architecture, navigasi, dan routing |
| [`COMPONENTS.md`](./COMPONENTS.md) | Katalog komponen UI: spesifikasi props, state, dan perilaku |
| [`CONTENT.md`](./CONTENT.md) | Model konten, aturan copy, dan template teks |
| [`ACCEPTANCE.md`](./ACCEPTANCE.md) | Checklist penerimaan, QA, performa, aksesibilitas, SEO |

## Cara memakai paket ini

1. **Baca `PRD.md` dulu** untuk memastikan tujuan dan scope sudah sesuai.
2. **`DESIGN.md` dan `LAYOUT.md`** adalah acuan utama untuk tampilan. Keduanya bisa langsung dipakai untuk membuat atau merevisi halaman.
3. **`COMPONENTS.md`** dipakai saat membangun komponen di `app/` dan `app/_components/`.
4. **`CONTENT.md`** dipakai saat mengisi konten rilisan, live, dan video.
5. **`ACCEPTANCE.md`** dipakai sebagai checklist sebelum merge.

## Hubungan dengan dokumen yang sudah ada

Repo ini sudah memiliki arah desain yang kuat di [`/DESIGN.md`](../../DESIGN.md) dan [`docs/design-language.md`](../design-language.md) (identitas "Liquid Signal", partikel, Sundanese, palet `ink`). Paket ini **tidak menggantikan** dokumen tersebut. Posisinya:

- Dokumen lama menjawab **"Akbar itu siapa dan bagaimana rasanya."**
- Paket ini menjawab **"Halaman disusun seperti apa agar rilisan, live, dan press mudah ditemukan."**

Jika ada konflik, **`/DESIGN.md` menang untuk identitas visual**, sedangkan paket ini menang untuk **struktur layout dan pola komponen**.

## Batasan penting

- Yang diambil adalah **pola**: hero foto penuh, daftar tur dengan CTA tiket, grid rilisan, blok video terbaru, strip foto editorial dengan kutipan, deretan tautan sosial, banner cookie, dan peringatan penipuan.
- **Tidak** menyalin aset, foto, logo, nama rilisan, teks, atau identitas merek milik Martin Garrix. Semua konten contoh di paket ini memakai placeholder milik Akbar atau teks netral.
- Nilai warna dan font pada `DESIGN.md` adalah **usulan yang diselaraskan dengan palet dan font Akbar yang sudah ada**. Nilai CSS asli situs referensi tidak diekstrak secara teknis (situs hanya dapat dibaca sebagai teks dan struktur), jadi jangan diasumsikan sama persis.
- Dokumen ini tidak menyentuh kode. Penerapan ke kode adalah tahap berikutnya dan perlu persetujuan dari pemilik repo.
