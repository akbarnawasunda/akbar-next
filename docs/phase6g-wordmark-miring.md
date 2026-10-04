# Fase 6G — Rekomendasi tipografi, dan wordmark miring

Pemilik situs mengirim empat papan referensi (logo DJ, alfabet display
berwarna, logo lettering, daftar font script) lalu memberi kebebasan penuh:
"rekomendasi aja, bebas mau pasang font kayak gimana dan berapa".

## Rekomendasi: JANGAN tambah font

[INTERP] Situs ini sudah punya empat suara — Big Shoulders Display (judul),
General Sans (badan), Azeret Mono (konsol/label), Noto Sans Sundanese
(identitas). Empat sudah batas atas untuk satu situs yang ingin tetap cepat
dan tenang. Menambah huruf kelima tidak akan membuatnya lebih khas; ia hanya
menambah berat unduh dan membuat hierarki goyah.
[INTERP] Referensi pada papan 1 dan 3 bukan font, melainkan *custom
lettering*: satu kata digambar sekali. Bagus sebagai logo, mustahil dipakai
menulis judul halaman, dan hancur di ukuran kecil. Lagi pula hampir semua
contoh di papan itu satu genre yang sama (huruf runcing miring pecah) —
justru "template musisi elektronik" yang pekerjaan ini ingin dihindari.
[INTERP] Papan 2 adalah perlakuan warna, bukan huruf baca. Papan 4 (script
dekoratif) salah daftar suara untuk produser bass, dan berasal dari agregator
font gratis yang lisensi komersialnya sering tidak jelas.

## Yang DIAMBIL dari referensi itu

[INTERP] Satu ide benar dari papan 1 dan 3: nama sebaiknya tampil sebagai
**logo**, bukan sekadar teks judul. Itu bisa dicapai tanpa font baru dan
tanpa gambar baru.

[FACT] Tiga perlakuan dirender dari berkas font yang sudah terpasang —
`docs/notes/wordmark-treatments.png`: (A) lockup tegak, (B) dimiringkan 9°,
(C) dipotong diagonal. **B dipasang.** 9° dipilih karena searah dengan
kemiringan alami aksara Sunda yang berdiri tepat di bawah nama di hero, jadi
kedua baris itu terbaca bersaudara.

[FACT] Dipasang hanya pada NAMA, tidak pernah pada kalimat:
- splash pembuka — `client/index.html` (`.an-splash-word`);
- wordmark header dan footer — `client/src/shell/ChromeRedesign.css`
  (keduanya sekaligus naik ke `var(--font-title)` dan bobot 800; sebelumnya
  masih Clash 600, jadi logo di header bukan huruf yang sama dengan judul);
- judul hero — `client/src/pages/HomeStage.css` (`.hero-title-word`), dengan
  `padding-right: 0.13em` pada maskernya sebagai ruang untuk ujung yang
  menjorok (tinggi huruf × tan 9°).

[FACT] Judul halaman lain (kalimat) tetap tegak. Dokumentasi dan kelas
bersama `.an-markslant` ada di `client/src/index.css`.

## Satu jebakan teknis yang ditemukan saat memasang

[FACT] Versi pertama memakai `transform: skewX(-9deg)` dan **tidak akan
bekerja**: `.hero-title-word` dan `.an-splash-word` sudah punya animasi yang
menulis `transform` dan berakhir di `transform: none`, jadi kemiringannya
tertimpa begitu animasi selesai. Terlihat di CSS hasil build sebelum
diperbaiki. Diganti ke **`font-style: oblique 9deg`** — properti huruf, bukan
transform, jadi tidak bertabrakan dengan animasi apa pun. Terverifikasi ada
di bundle hasil build (`oblique 9deg` di index, Home, dan index.html).

## Verifikasi

[FACT] `pnpm check` 0 galat · `vitest` 56 berkas / **330 tes** ·
`audit-layout` **0 pelanggaran** · `pnpm build` · server di-restart ·
`verify-ssr` **32/32 ALL GREEN**.

## Catatan jujur

[FACT] Tidak ada browser di sandbox: sudut 9° dinilai dari render fontTools,
bukan dari tampilan browser. `font-style: oblique <angle>` disintesis browser;
di mesin yang tidak mendukung sudut kustom, huruf akan tampil tegak — tidak
rusak, hanya tidak miring.
