# Cleanup Decisions

Tanggal review: 2026-08-22

## Backup

Backup branch dibuat sebelum perubahan destructive:

`backup/pre-cleanup-20260822-175717`

Branch tersebut menunjuk ke commit sebelum cleanup dan tidak dihapus.

## Deleted

### `legacy-vite-scaffold/`

Folder ini dihapus seluruhnya karena hanya berisi scaffold contoh yang tidak dipakai oleh build aktif. Halaman representative-nya merender `Example Page`, `Loader2`, contoh markdown, dan contoh button. Folder tersebut juga dikecualikan dari `tsconfig.json`, sedangkan build aktif memakai `client/` sebagai root Vite.

### `public/vercel.json`

File ini dihapus karena tidak memiliki referensi dari source aktif dan mendeskripsikan konfigurasi asset deployment lama. Deployment aktif memakai root `vercel.json`, dengan Vite `root` di `client`, `publicDir` di `client/public`, dan output `dist/public`.

## Preserved

### `client/public/legacy/`

Dipertahankan karena `client/src/components/LegacyDocument.tsx` masih mengambil `/legacy/privacy.html`, `/legacy/404.html`, dan `/legacy/style.css`. Menghapusnya akan mematahkan route privacy dan fallback 404.

### `legacy-next/`

Dipertahankan sebagai arsip karena bukan bagian typecheck/build aktif, tetapi mungkin masih dibutuhkan untuk historical reference atau deployment Next.js lama. Penghapusannya memerlukan verifikasi deployment eksternal terpisah.

### `dist/` dan `.manus-logs/`

Tidak diubah oleh cleanup repository. `dist/` adalah build output yang sudah di-ignore Git, sedangkan `.manus-logs/` adalah artifact development lokal. Keduanya dapat dibersihkan lokal tanpa commit repository.

## Verification requirement

Setelah penghapusan, jalankan typecheck, test suite, build, dan smoke test route publik serta endpoint API. Jangan menghapus `client/src`, `server`, `shared`, database configuration, route files, atau environment handling berdasarkan nama folder saja.


## Validation result

Typecheck, 42-test suite, and production build passed after the cleanup. On the local server, `/` returned HTML 200, `/privacy` rendered the preserved privacy page through `LegacyDocument`, `/route-that-does-not-exist` rendered the preserved 404 page, and `/api/trpc/auth.me` returned JSON 200. No active route was observed to depend on `legacy-vite-scaffold` or `public/vercel.json`.
