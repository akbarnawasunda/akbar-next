# Legacy Content Migration Audit — akbarnawasunda-portofolio

**Sumber yang diaudit:** `akbarnawasunda/akbarnawasunda-portofolio`, branch `main`, tree `7f11906d25b6168b1f633172b8d0cf273f492a3d`.

## Ringkasan keputusan

Konten yang benar-benar dipublikasikan oleh repository lama kini menjadi **fallback terverifikasi** di platform baru. Sanity tetap menjadi sumber utama bila owner menerbitkan data yang lebih baru. Informasi yang hanya berupa interaksi legacy, statistik berpotensi kedaluwarsa, atau alat LAB tidak dipindahkan sebagai konten artist platform.

| Area | Keputusan |
|---|---|
| Identitas | Dipindahkan: Akbar Nawasunda, alias DJ Akbar Remix, Bandung Barat, Indonesia. |
| Bio | Dipindahkan dari `data/content.json`, dengan penyuntingan kecil untuk konsistensi bahasa dan tanpa menambah klaim baru. |
| Genre | Dipindahkan: Breakbeat, Indo Bass, Jedag Jedug, Jungle Dutch, Kendang Chops. |
| Rilisan | Ditambahkan dua remix SoundCloud dan dua katalog legacy tambahan; katalog lama kini berisi delapan rilisan fallback. |
| Platform | Ditambahkan Deezer, Amazon Music, Tidal, TikTok, dan X ke hub seluruh platform. |
| Booking / lisensi | Dipindahkan: email, remix request, custom arrangement, collaboration, licensing, dan prinsip penggunaan musik. |
| Foto / press download / event | Tetap berstatus siap-isi karena repository lama tidak menyediakan paket foto, PDF one-sheet, rider, atau jadwal event yang dapat diverifikasi. |

## Audit sumber per file

| File legacy | Peran lama | Keputusan pada platform baru |
|---|---|---|
| `data/content.json` | Sumber utama bio, lokasi, platform, email, lisensi, genre, dan copy publik. | Dipindahkan ke `verifiedArtistProfile`, `allPlatformLinks`, About, dan EPK fallback. |
| `data/releases.json` | Katalog rilis dan tautan official. | Dipindahkan ke fallback `releases`; detail cerita/credits dibiarkan kosong karena file tidak memuat data tersebut. |
| `index.html` | Metadata, pesan positioning, genre, discoverability, dan form collab lama. | Dipakai sebagai konfirmasi positioning dan layanan; fitur LAB lama tidak dibawa kembali. |
| `epk.html` | Bio, genre, platform, booking contact, dan layanan. | Dipakai sebagai sumber untuk EPK/Booking yang baru. |
| `assets/js/seo-jsonld.js` | Alias, genre, lokasi, sameAs, dan release schema. | Dipakai untuk memverifikasi alias/genre/platform; tautan Instagram `arthazra` tidak dipakai karena bertentangan dengan `content.json` dan homepage yang menunjuk `@akbarnawasunda`. |
| `README.md` | Peta arsitektur dan daftar fitur lama. | Dipakai untuk membedakan sumber data kanonik dari file interaksi. |
| `admin.html` | Permukaan CMS lama berbasis GitHub PAT. | Tidak dipindahkan; fungsinya sudah digantikan oleh Sanity Studio dan Owner Studio. |
| `assets/js/content-render.js` | Renderer `content.json` dan `releases.json`. | Dipakai sebagai konfirmasi field yang benar-benar tampil di situs lama. |
| `assets/js/translations.js` | Teks multi-bahasa legacy. | Tidak dipindahkan pada tahap ini; website baru masih memakai bahasa Indonesia/English terarah. |
| `assets/js/newsletter.js` | FormSubmit ke inbox legacy. | Tidak dipindahkan; Fan Signal platform baru memakai backend sendiri. |
| `assets/js/smart-collab.js` | Deteksi link dan field BPM/key untuk request kolaborasi. | Dicatat sebagai ide pengembangan berikutnya; belum dipindahkan agar booking flow tetap sederhana. |
| `assets/js/app.js`, `audio.js`, `jedag-run.js`, `wav-export.js`, `particles.js`, `fx.js`, `previews.js`, `embed-skin.js`, `footer.js`, `share-card.js` | Presentasi dan interaksi legacy. | Tidak dipakai sebagai sumber artist claim; LAB/audio/game sengaja tidak dikembalikan. |
| `assets/css/*`, `404.html`, `privacy.html`, `manifest.webmanifest`, `sw.js`, `robots.txt`, `sitemap.xml`, `vercel.json`, workflow GitHub | Infrastruktur/presentasi legacy. | Dicatat, tetapi bukan sumber konten artis. |
| `assets/media/logo-an.png`, `favicon.png`, `og-image.png` | Aset brand legacy. | Sudah diintegrasikan lebih awal ke storage dan digunakan pada platform baru. |
| `assets/media/*.mp3` | Sampel audio Jedag Pad/Engine. | Tidak dibawa karena halaman LAB sudah dihapus dari pengalaman publik. |

## Catatan integritas data

Repository lama menyebut statistik seperti follower, subscriber, views, platform count, dan track count. Angka tersebut **tidak dipindahkan** karena bersifat waktu-sensitif dan tidak ada sinkronisasi analytics aktif di platform baru. Data itu sebaiknya nanti ditarik dari sumber resmi/API, bukan disalin sebagai angka statis.

Repository lama juga memuat beberapa link Spotify hardcoded lama di HTML/JavaScript yang berbeda dari `data/content.json`. Platform baru memakai URL yang ada di sumber data legacy dan sudah digunakan pada sistem sebelumnya, bukan URL hardcoded yang berisiko lama.
