# Deployment checklist

Aplikasi ini berjalan sebagai **Vite + Express + tRPC**. Vercel menggunakan `pnpm install --frozen-lockfile`, menjalankan `pnpm build`, lalu menyajikan hasil client dari `dist/public` sesuai `vercel.json`.

## Environment variables

Set semua variabel berikut pada environment Vercel yang digunakan untuk deployment. Jangan commit nilai secret atau file `.env` ke repositori.

| Variabel                 | Kegunaan                          | Catatan                                                                                          |
| ------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`           | Koneksi MySQL/TiDB                | Gunakan connection string Aiven yang benar.                                                      |
| `DATABASE_SSL_CA`        | CA certificate Aiven              | Opsional; jika diisi, validasi sertifikat TLS diaktifkan. Nilai multiline dapat memakai `\\n`.   |
| `JWT_SECRET`             | Menandatangani session cookie     | Nama utama yang dibaca template. `SESSION_SECRET` juga diterima sebagai fallback kompatibilitas. |
| `SESSION_SECRET`         | Fallback secret session           | Gunakan secret acak minimal 64 karakter jika `JWT_SECRET` tidak diset.                           |
| `VITE_APP_ID`            | ID aplikasi OAuth                 | Dibutuhkan untuk alur login.                                                                     |
| `OAUTH_SERVER_URL`       | Base URL OAuth                    | Dibutuhkan untuk pertukaran token dan sinkronisasi user.                                         |
| `OWNER_OPEN_ID`          | Identitas owner/admin             | Harus sama dengan open ID user owner yang akan mengelola studio.                                 |
| `BUILT_IN_FORGE_API_URL` | Endpoint storage dan API internal | Dibutuhkan untuk upload asset.                                                                   |
| `BUILT_IN_FORGE_API_KEY` | Credential API internal           | Simpan hanya sebagai secret environment server-side.                                             |

## Urutan verifikasi

Jalankan pemeriksaan lokal berikut sebelum push:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

Jika tabel database sudah tersedia dan `DATABASE_URL` telah diset, migrasikan data legacy dengan:

```bash
pnpm db:migrate-content
```

Skrip migrasi bersifat idempoten berdasarkan `slug`. Skrip membaca `public/data/content.json` dan `public/data/releases.json`, lalu memetakan hero, latest update, featured links, dan releases ke `artistContent`.

## Verifikasi setelah deployment

Pastikan request `GET /api/trpc/auth.me?batch=1&input=%7B%7D` menghasilkan JSON, bukan `index.html`. Kemudian uji submit **FAN SIGNAL** dan **INQUIRY**, periksa data pada database, tinjau log Vercel, dan buka `/admin` untuk memastikan panel owner-only dapat diakses setelah login. Route `/admin` tidak lagi memuat JavaScript legacy atau token GitHub dari browser.

Jika deployment perlu dibatalkan, revert commit terakhir dan push kembali ke branch yang terhubung dengan Vercel. Periksa log deployment sebelum melakukan percobaan berikutnya.
