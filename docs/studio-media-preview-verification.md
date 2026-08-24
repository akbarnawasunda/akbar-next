# Studio media and preview verification

Tanggal: 24 Agustus 2026

Deployment live `https://akbarnawasunda.my.id/studio` berhasil dimuat setelah commit `3ad67ed` didorong ke branch `main`. Halaman menampilkan Control Room, Public site map, Content Studio, dan Asset Library tanpa error deployment.

Verified live UI surfaces:

- Content Studio protected workspace tampil dengan workflow Rilisan lagu, Jadwal pertunjukan, Tautan resmi, dan Profil & lokasi.
- Public site map menampilkan route `/`, `/music`, `/visuals`, `/live`, `/universe`, `/about`, `/epk`, `/inquire`, `/licensing`, dan `/privacy`.
- Editor menampilkan field media, field link, dan mode publish/draft.
- Production build dan seluruh test suite lulus setelah implementasi.
- Browser session live tidak terautentikasi penuh untuk menguji upload aktual; upload dan save tetap harus diuji oleh owner dari sesi Studio yang login.

Catatan: verifikasi ini hanya mencakup deployment dan render UI. Tidak ada data CMS yang diubah selama verifikasi.

Verifikasi tambahan via browser live setelah dua scroll: halaman produksi tetap menampilkan Public site map lengkap dan quick actions tanpa error navigasi. Area editor berada lebih bawah pada halaman; sesi browser verifikasi tidak memiliki kredensial owner untuk menguji mutation upload/save, sehingga pengujian transaksi tetap perlu dilakukan oleh owner dari sesi login Studio.

Verifikasi deployment direct dengan URL share sementara menampilkan halaman login owner yang normal. Fitur privat seperti upload dan live preview tidak diuji pada deployment direct karena sesi tidak terautentikasi; tidak ada password, OTP, atau token yang diminta/dipakai. Metadata Vercel tetap mengonfirmasi deployment production READY dibangun dari commit `3ad67edf7452b0c023039ba7edd4bf7bf9bab556`.

Verifikasi final pada custom domain dengan cache-buster setelah cache dan service worker lokal dibersihkan: `https://akbarnawasunda.my.id/studio?studioBuild=3ad67ed` menampilkan helper `Media & preview`, tombol `Upload baru`, dan panel `03 // Live preview` dengan tombol `BUKA HALAMAN`. Ini mengonfirmasi fitur baru sudah disajikan oleh production domain dari commit `3ad67ed`.
