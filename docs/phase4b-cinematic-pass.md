# Fase 4B — Hero Sinematik + Pita Terang

Lintasan kedua setelah pemilik situs **dua kali** menyampaikan hal yang sama:
*"gak ada yang berubah design nya, coba pikir matang matang bikin design yang
lebih canggih dan keren."*

Fase 4A (atmosfer, grid, grain, strip frekuensi, indeks bagian) gagal
meyakinkan. Kesimpulan saya: masalahnya bukan detail, tapi **siluet halaman
pertama**. Perubahan halus tidak terhitung sebagai perubahan oleh orang yang
membuka situs selama sepuluh detik. Karena itu 4B mengambil dua keputusan
besar, bukan belasan kecil.

---

## 1. Yang berubah (besar, bukan halus)

| | Sebelum | Sesudah |
| --- | --- | --- |
| Foto hero | panel di kanan, 62% lebar layar | **menutupi seluruh layar pertama** |
| Scrim foto | dua gradien (kiri + bawah) | tiga lapis: bawah, kiri, + cuci steel dari kanan atas |
| Judul hero | `clamp(3.3rem, 7.6vw, 7.8rem)` | **`clamp(3.6rem, 12.4vw, 12.4rem)`** — hampir dua kali |
| Tinggi baris judul | 0.9 | 0.86 (lebih rapat, lebih seperti poster) |
| Bagian kanal resmi | gelap, sama seperti bagian lain | **membalik jadi kertas terang** — satu-satunya bidang terang di situs |
| Maskot | sudut kiri-atas panel foto | dipindah ke bawah masthead (dulu tidak pernah bertabrakan dengan logo karena panel mulai di 62%) |

Semua di atas **CSS murni pada DOM yang sudah ada**: tidak ada bagian baru,
tidak ada teks baru, tidak ada aset baru, tidak ada `!important`, tidak ada
nilai warna yang ditulis lepas dari token.

## 2. Kenapa ini tidak akan terpotong

Judul hero memakai `white-space: nowrap` per kata, jadi ukurannya harus
dihitung, bukan dikira:

- kata terpanjang, "NAWASUNDA.", pada Clash Display 600 ≈ **5,7em**;
- pada `12.4vw`, kata itu memakai ≈ **71vw**;
- ruang teks yang tersedia ≈ **90vw** (dua gutter `clamp(20px, 5vw, 88px)`).

Sisa ruang ≈19vw — cukup lebar untuk perbedaan metrik font antar-peramban.
Batas atas `12.4rem` juga menjaga layar sangat lebar (≥1560px) tetap di dalam
kontainer 1560px. `server/mobileLayout.test.ts` tetap mengunci clamp versi
ponsel (tidak disentuh sama sekali: seluruh blok 4B dikurung
`@media (min-width: 768px)`).

## 3. Pita terang: cara membalik warna tanpa membalik token

Bagian kanal resmi jadi kertas, dan seluruh isinya (judul, label, baris, ikon
platform, angka indeks, garis pemisah, marquee, tombol kaki) ikut terbaca.
Caranya bukan membalik token global — itu akan merusak halaman lain — tetapi:

1. latar memakai `var(--paper)` apa adanya;
2. teks memakai `var(--ink)`;
3. elemen yang sebelumnya membaca token gelap diberi warna eksplisit;
4. aksen steel asli (**≈1,9:1** di atas kertas — gagal) diganti
   `color-mix(--signal 42%, --ink)` (**≈5,4:1**) hanya di dalam pita ini.

Kontras dasar paper/ink tetap **16,36:1** seperti yang sudah diukur di Phase 4.
Tidak ada warna baru: semuanya campuran dari token yang sama.

## 4. Verifikasi

| Gerbang | Hasil |
| --- | --- |
| `pnpm check` | bersih |
| `pnpm test` | **311/311** (54 berkas) |
| `scripts/verify-ssr.sh` | **32/32** |
| `node scripts/audit-layout.mjs` | 0 pelanggaran, 58 berkas |
| `pnpm build` | bersih |
| CSS di chunk hasil build | `12.4vw`, `an-channels{--band-rule…`, `--band-accent`, `an-hero-plate:before` terkonfirmasi di `Home-*.css` |
| SSR | 200 di 10 rute, termasuk host preview |

## 5. Yang belum bisa saya buktikan (jujur)

Sandbox ini tidak punya browser dan tidak bisa memasangnya (repositori Debian
maupun CDN browser tidak bisa dijangkau dari sandbox — hanya npm dan GitHub).
Jadi **tiga hal ini perlu dilihat mata manusia**, dan mudah disetel kalau
ternyata meleset:

1. **Crop foto potret** pada latar penuh — crop vertikalnya jauh lebih ketat
   daripada sebelumnya. Kalau kepala terpotong, satu angka `object-position`
   (sekarang `50% 18%`) yang diubah.
2. **Kekuatan scrim** — kalau wajah terlalu gelap, turunkan lapisan 180deg
   pertama; kalau teks kurang terbaca, naikkan.
3. **Pita terang** — kalau terasa terlalu kontras untuk situs malam, alternatif
   yang paling dekat: pakai `--ink-card` sebagai latar pita (jeda ritme tetap
   ada, tanpa bidang putih).

## 6. Cara melihatnya

- **Preview langsung di panel Arena**: server produksi hasil build berjalan di
  port 4101 di sandbox ini. Ini yang paling cepat.
- **Produksi**: setelah PR #10 di-merge ke `main`, Vercel men-deploy otomatis
  dan `akbarnawasunda.my.id` ikut berubah.
- Tautan preview Vercel untuk branch tidak bisa dibagikan: deployment-nya
  dilindungi login Vercel (*Protected Deployment*).
