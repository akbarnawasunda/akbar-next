# Cara menulis tes di repo ini

## Aturan utama: uji yang dilihat pengunjung, bukan isi file

Banyak tes lama di `server/*.test.ts` membaca file source sebagai teks lalu
memeriksa `expect(source).toContain("...")`. Pola itu terlihat seperti tes,
tapi sebenarnya mengunci source code: ganti nama variabel, pindahkan komponen,
atau perbaiki satu kalimat copy — tes merah, padahal situs baik-baik saja.
Sebaliknya, tes seperti itu tetap hijau kalau halaman benar-benar rusak saat
dirender.

Standar baru:

1. **Default: render halamannya.** `client/src/entry-server.tsx` mengekspor
   `render(url, prefetch)`. Prefetch bisa di-stub, jadi tes berjalan tanpa
   database:

   ```ts
   const { html, head } = await render("/music", {
     documents: async () => [],
   });
   ```

   Contoh lengkap: `server/publicPageRendering.test.ts`.

2. **Periksa HTML hasil render**, bukan teks source. Kalau sesuatu penting
   untuk pengunjung (teks, link, thumbnail, atribut aksesibilitas), pasti
   terlihat di sana.

3. **Tes source hanya untuk yang memang tidak muncul di HTML**: aturan CSS
   (`prefers-reduced-motion`), media query di dalam hook, isi file statis
   seperti `sitemap.xml` atau `client/index.html`. Beri komentar alasannya.
   Contoh: blok kedua di `server/homeEnhancements.test.ts`.

4. **Jangan menulis assertion pada nama impor, nama variabel, atau baris JSX.**
   Itu bukan kontrak; itu detail implementasi.

5. **Level crawler diuji terpisah** oleh `scripts/verify-ssr.sh` (status code,
   canonical, `og:*`, redirect, 404) terhadap server produksi asli di CI.

## Menjalankan tes

```bash
pnpm test            # vitest, hanya mengumpulkan server/**
pnpm check           # typecheck
pnpm build           # build client + SSR + serverless
bash scripts/verify-ssr.sh   # butuh BASE=... ke server yang sudah jalan
```

## Utang teknis yang disadari

Masih ada belasan file di `server/` yang memakai pola `toContain` pada source.
Aturannya: **jangan tambah yang baru**, dan setiap kali salah satunya pecah
karena refactor, tulis ulang jadi tes render seperti di atas, jangan tambal
string-nya.
