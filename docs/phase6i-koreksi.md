# Fase 6I — Koreksi: tiga keputusan saya yang membuat tampilan lebih buruk

Pemilik situs: "kok sama aja dan bahkan lebih konyol, makin jelek."
Dia benar. Fase ini membatalkan tiga hal.

## Lebih dulu: fontnya memang terpasang

[FACT] Diperiksa di bundle hasil build, bukan diklaim: ketujuh `@font-face`
ada (`Schibsted Grotesk` ×3, `Sometype Mono` ×2, `Big Shoulders Display`,
`Noto Sans Sundanese`) dengan URL yang benar, berkasnya ada di
`dist/public/assets/fonts/fontsource/`, dan dilayani 200 oleh server. Jadi
penyebabnya bukan instalasi huruf, melainkan tiga keputusan desain saya.

## 1. REGRESI TERBESAR — H2/H3 kehilangan suaranya

[FACT] Saat Clash Display dibuang, saya menyetel
`--font-display: "Schibsted Grotesk"`. Token itu dipakai **seluruh H2/H3 di
semua halaman**. Akibatnya setiap sub-judul di situs berubah dari huruf
display berkarakter menjadi grotesk biasa — yang persis sama dengan huruf
badan teksnya.
[INTERP] Itulah sebabnya terasa "sama aja": hampir seluruh halaman tiba-tiba
bersuara satu nada. Saya menghitung ukuran dan berat unduh, tapi tidak
menghitung akibat ini.
[FACT] Diperbaiki: `--font-display` kembali memegang suara display —
`"Big Shoulders Display"` — di `client/src/index.css` dan
`client/src/shell/EditorialRefresh.css`. Hierarki kembali tiga tingkat:
judul display → sub-judul display → badan grotesk → label mono.

## 2. Kemiringan 9° — dicabut

[FACT] Kemiringan itu dipasang lewat `font-style: oblique 9deg`, artinya
browser **memalsukan** kemiringan dari huruf tegak (faux italic).
[INTERP] Pada huruf kental dan ringkas seperti Big Shoulders, hasilnya
terbaca murahan — dan itu tanda khas pekerjaan amatir. Saya sempat
membenarkannya dengan alasan "searah aksara Sunda"; alasan itu tidak
menyelamatkan hasil yang jelek. Dicabut dari hero, header, footer, dan
splash. `.an-markslant` ditinggalkan di `index.css` sebagai catatan
kegagalan, dan sekarang bernilai `font-style: normal`.
[INTERP] Aturannya untuk ke depan: miring hanya sah kalau hurufnya memang
punya potongan miring rancangan sendiri.

## 3. Judul hero terlalu besar

[FACT] 17,4vw (desktop) itu berteriak, apalagi digabung kemiringan palsu.
Diturunkan: desktop `clamp(3.6rem, 12vw, 12rem)`, menengah 9vw, dasar 8vw,
ponsel 14vw. Splash ikut turun (pembagi 4,75 → 5,4).
[INTERP] 12vw masih memimpin halaman — Big Shoulders tetap 2× lebih tinggi
dari huruf lama pada lebar baris yang sama — tanpa terdengar seperti poster
diskon.

## Yang TIDAK dibatalkan

[FACT] Roster huruf baru tetap: Big Shoulders Display (judul & sub-judul),
Schibsted Grotesk (badan/UI), Sometype Mono (label), Noto Sans Sundanese
(aksara). 8 berkas / 114.012 B, tetap turun 48% dari 218.048 B.
[INTERP] Alasannya: masalahnya bukan pada huruf-huruf itu, melainkan pada
cara saya memasangkannya.

## Verifikasi

[FACT] `pnpm check` 0 galat · `vitest` 56 berkas / **330 tes** ·
`audit-layout` **0 pelanggaran** · `pnpm build` · server di-restart ·
`verify-ssr` **32/32 ALL GREEN** · string `oblique` sudah tidak ada sama
sekali di hasil build.

## Permintaan

[FACT] Saya tidak punya browser di sandbox ini, jadi setiap penilaian rupa
saya berasal dari render font dan perhitungan — bukan dari melihat halaman.
Dua kali terakhir, screenshot dari pemilik situs yang menemukan masalah
nyata (judul menyatu, splash terpotong). Screenshot beranda setelah fase ini
akan lebih berharga daripada tebakan saya berikutnya.
