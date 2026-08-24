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

Verifikasi visual terbaru pada production setelah commit `291d900`: field media di Content Studio menampilkan tombol `Choose from Asset Library` dan `Upload baru`; live page berhasil hidrasi dengan dokumen CMS yang ada. Fitur grid thumbnail foto terpasang di bundle dan akan muncul di bawah field ketika Asset Library memiliki gambar managed; setiap thumbnail menampilkan foto utuh, nama file, tipe, serta tanda centang ketika dipilih.

Verifikasi paling baru pada production deployment `6cbacc4`: setelah Studio selesai memuat, field media menampilkan 11 thumbnail foto bawaan website secara langsung—Akbar logo, Night Frequency hero, hero mobile, stage, official portrait, RMX mark, social preview, editorial portrait red, archive portrait yellow, logo fallback, dan RMX mark fallback. Setiap kartu memiliki nama file, label `Website`, tipe file, dan tombol yang dapat langsung memilih foto ke field. Deployment Vercel berstatus READY dan domain production menampilkan UI ini.
