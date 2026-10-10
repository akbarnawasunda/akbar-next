# Deployment checklist

Aplikasi aktif memakai **Next.js App Router** di Vercel. Halaman dirender lewat Next.js; tRPC dan OAuth callback ditangani oleh Route Handlers yang memanggil router/server services yang sudah ada. Database, Drizzle, dan logika bisnis tidak perlu dipindahkan untuk deploy website. Vercel menggunakan framework **Next.js** dan output directory **`.next`**, yang ditetapkan di `vercel.json`.

## Environment variables

Set variabel yang sesuai pada environment Vercel. Jangan commit nilai rahasia atau file `.env` ke repositori.

| Variabel | Kegunaan | Catatan |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origin canonical situs | Production: `https://akbarnawasunda.my.id`; dipakai metadata dan OG URL. |
| `DATABASE_URL` | Koneksi MySQL/TiDB | Gunakan connection string Aiven yang benar. |
| `DATABASE_SSL_CA` | CA certificate Aiven | Opsional; jika diisi, validasi sertifikat TLS diaktifkan. Nilai multiline dapat memakai `\\n`. |
| `JWT_SECRET` | Menandatangani session cookie | Nama utama yang dibaca server. `SESSION_SECRET` diterima sebagai fallback. |
| `SESSION_SECRET` | Fallback secret session | Gunakan secret acak minimal 64 karakter jika `JWT_SECRET` tidak diset. |
| `NEXT_PUBLIC_APP_ID` | ID aplikasi OAuth yang dibaca browser | Tetap publik sesuai pola integrasi OAuth yang ada. Server menerima `APP_ID` sebagai override bila diperlukan. |
| `NEXT_PUBLIC_OAUTH_PORTAL_URL` | Portal login OAuth | Dibaca saat pengguna memulai login. |
| `OAUTH_SERVER_URL` | Base URL OAuth | Dibutuhkan untuk pertukaran token dan sinkronisasi user. |
| `OWNER_OPEN_ID` | Identitas owner/admin | Harus sama dengan open ID user owner yang mengelola Studio. |
| `DASHBOARD_USERNAME` | Username login Studio | Default `owner` bila tidak diset. |
| `DASHBOARD_PASSWORD` | Password login Studio | Wajib minimal 16 karakter; simpan sebagai secret. |
| `BUILT_IN_FORGE_API_URL` | Endpoint storage dan API internal | Dibutuhkan untuk upload asset. |
| `BUILT_IN_FORGE_API_KEY` | Credential API internal | Simpan hanya sebagai secret environment server-side. |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | Endpoint analytics | Opsional. |
| `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` | Website ID analytics | Opsional; dipakai bersama endpoint. |

## Urutan verifikasi

Jalankan pemeriksaan lokal sebelum push:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm test
NEXT_PUBLIC_SITE_URL=http://localhost:4101 corepack pnpm build
NEXT_PUBLIC_SITE_URL=http://localhost:4101 PORT=4101 corepack pnpm start
BASE=http://localhost:4101 bash scripts/verify-next.sh
```

Jika tabel database sudah tersedia dan `DATABASE_URL` telah diset, migrasikan data legacy dengan:

```bash
corepack pnpm db:migrate-content
```

Skrip migrasi bersifat idempoten berdasarkan `slug`. Skrip membaca `public/data/content.json` dan `public/data/releases.json`, lalu memetakan hero, latest update, featured links, dan releases ke `artistContent`.

## Verifikasi setelah deployment

Pastikan `/api/trpc/auth.me?batch=1&input=%7B%7D` menghasilkan JSON, bukan halaman HTML. Jalankan `scripts/verify-next.sh` terhadap deployment, lalu uji submit **FAN SIGNAL** dan **INQUIRY**, periksa data database, tinjau log Vercel, dan buka `/admin` untuk memastikan Studio owner-only dapat diakses setelah login.

Deployment production selalu menggunakan `pnpm build` dan Node.js 24.x. URL kompatibilitas lama ditangani dengan redirect permanen di Next.js; tidak ada runtime Vite/Express kedua.
