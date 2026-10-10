# Cleanup decisions: single Next.js runtime

Tanggal migrasi: 2026-10-10

## Keputusan arsitektur

Next.js App Router adalah satu-satunya runtime situs. Kode Vite/Express lama tidak dipertahankan sebagai rollback atau referensi executable. Jalur data/editorial, UI React yang dipakai halaman, dan layanan server yang masih dibutuhkan dipindahkan ke halaman App Router, Route Handlers, dan adapter request/cookie framework-netral.

URL publik yang masih masuk lewat rute legacy yang diketahui diarahkan dengan redirect permanen di `next.config.ts`. URL aset aplikasi lama yang tidak mempunyai padanan tidak disajikan lagi. Aset statis aktif hanya berada di `public/`, dan splash pre-hydration dimuat dari `public/assets/js/preloader.js`.

## Dihapus setelah audit referensi

- Entri situs Vite (`client/index.html`, `client/src/App.tsx`, `main.tsx`, entry client/server), konfigurasi Vite aplikasi, dan helper navigasi Wouter.
- Server Express, Vite SSR, handler Vercel SSR/tRPC lama, proxy Express lama, dan skrip smoke test khusus implementasi tersebut.
- `legacy-next/`, `legacy-vite/`, serta `client/public/` yang merupakan salinan dari root `public/`.
- HTML/CSS legacy, JavaScript halaman statis lama, komponen `LegacyDocument`, template scaffold Vite, dan konfigurasi TypeScript khusus Vite yang tidak dipakai oleh halaman Next.
- Dependency aplikasi Wouter/Express dan plugin Vite aplikasi. Vite hanya tersisa sebagai dependency dev yang dipakai engine transform Vitest; tidak ada script, config, output, maupun entry point aplikasi Vite.

## Dipertahankan

- `client/src/pages/` dan komponen React yang masih menjadi UI App Router; path direktori belum dipindah agar impor CSS, komponen, dan alias aset tetap stabil.
- `client/src/lib/route-prefetch.ts`, helper server-only yang dipakai Next untuk data query dan metadata rute. Ini bukan entry point Vite.
- `server/routers.ts`, Drizzle, database helpers, auth, dan layanan domain yang masih dipanggil Route Handlers atau Server Components.
- `public/data/content.json` dan `public/data/releases.json` sebagai input migrasi konten idempoten, bersama aset, font, dan audio yang masih dipakai situs.
- Redirect permanen untuk URL legacy yang telah diketahui, tanpa menghidupkan ulang dokumen atau runtime lama.

## Visibilitas managed storage

Rute unduh membatasi key ke `users/{id}/assets/*` dan `generated/*`, tetapi sengaja tidak meminta sesi login karena URL tersebut dipakai pada konten situs publik. URL bersifat **public-by-URL**, bukan private storage: suffix UUID membuat tebakan sulit, tetapi bukan kontrol akses. UI Asset Library/Asset Picker kini memperingatkan agar file rahasia atau data pribadi tidak diunggah. Jika file privat kelak dibutuhkan, gunakan rute autentikasi dan signed URL terpisah.

## Validasi Node 24.x

Dijalankan dengan Node `v24.21.0` dan pnpm `10.34.6`:

- `pnpm install --frozen-lockfile` — berhasil.
- `pnpm check` — berhasil.
- `pnpm test` — 72 file, 417 tes lulus.
- `pnpm audit` — tidak ada kerentanan yang diketahui.
- `pnpm audit:layout` — tidak ada pelanggaran kebijakan fondasi; laporan informasional masih mencatat 1.141 deklarasi `!important` dan meminta pemeriksaan visual browser pada lebar ponsel.
- `pnpm build` — berhasil dengan Next.js 16.4.0/Turbopack.
- `scripts/verify-next.sh` terhadap `next start` Node 24 — 51 pemeriksaan HTTP lulus, termasuk HTML mentah kedua locale, loading, redirects, 404 slug/rute, media fallback, noindex, aset aktif, dan tRPC health.
- URL storage dengan nama file berisi spasi, `#`, dan `?` sudah diuji melewati router setelah percent-encoding; respons berhenti di guard konfigurasi (503) karena credential Forge tidak tersedia, bukan 400 dari validasi path.

## Batas verifikasi

Hasil di atas membuktikan konsistensi typecheck, kontrak unit, dependency audit, build, dan smoke HTTP yang diuji; hasil ini **bukan** bukti bahwa semua bug situs sudah ditemukan. Audit layout sendiri tidak mengukur overflow/tumpang-tindih visual pada perangkat nyata, dan tidak ada browser automation/browser binary di sandbox untuk visual QA manual. Akses database, OAuth, email, form produksi, dan storage/media upstream tidak diverifikasi dengan kredensial/layanan produksi; smoke media di sandbox memverifikasi fallback lokal ketika upstream tidak tersedia, sedangkan route storage yang valid mengembalikan 503 karena `BUILT_IN_FORGE_API_URL`/`BUILT_IN_FORGE_API_KEY` tidak dikonfigurasi.
