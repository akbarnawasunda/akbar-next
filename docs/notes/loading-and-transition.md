# Loading dan transisi rute

Kontrak ini berlaku untuk Next.js aktif dan tetap disinkronkan dengan dokumen Vite legacy.

## Splash awal

- Kunjungan pertama: seluruh gerak masuk selesai dalam sekitar **0,53 detik**; splash mulai keluar setelah minimum itu dan selesai sekitar **0,78 detik**.
- Kunjungan berikutnya dalam sesi: versi ringkas selesai sekitar **0,24 detik** dan selesai keluar sekitar **0,42 detik**.
- Kedua versi menampilkan teks “Memuat halaman” atau “Loading page” sesuai bahasa situs; versi ringkas tetap mempertahankan caption itu.
- Splash sendiri meminta dismissal setelah dua frame pertama; ia tidak menunggu hydration React.
- Jaring pengaman JavaScript memulai exit paling lambat pada 1,08 detik (kunjungan pertama) / 0,50 detik (ringkas), dengan batas penghapusan sekitar 1,34 detik / 0,69 detik sejak skrip mulai.
- Jika JavaScript gagal, animasi CSS menyembunyikan overlay setelah 1,6 detik. `prefers-reduced-motion` langsung melepas splash.
- Jam/tanggal WIB dekoratif tidak ikut dibacakan screen reader; status loading punya label yang jelas.

## Loading halaman dan navigasi

- Chunk halaman Next dan `RouteStateBoundary` memiliki fallback `PageLoading`.
- Tidak ada root `app/loading.tsx`: page detail harus menunggu validasi slug agar URL rilis tidak ditemukan tetap mengembalikan HTTP 404 (streaming shell lebih awal dapat mengubahnya menjadi 200).
- Fallback menampilkan “Memuat halaman” atau “Loading page” sesuai locale; tidak ada angka waktu yang terus merender ulang.
- Garis navigasi punya minimum 160 ms dan exit 180 ms. Ia memberi feedback cepat tanpa menahan perpindahan.
- Placeholder iframe musik tetap punya minimum khusus tersendiri untuk mencegah kilatan dokumen iframe kosong; batas itu bukan durasi splash awal.

Jalankan `corepack pnpm test`, `corepack pnpm check`, `corepack pnpm build`, lalu `BASE=http://localhost:4101 bash scripts/verify-next.sh` setelah mengubah jalur loading.
