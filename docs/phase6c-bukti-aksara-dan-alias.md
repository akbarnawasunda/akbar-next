# Fase 6C — Bukti: aksara yang terbaca, alias yang tidak hilang

Anda menyampaikan dua keluhan yang sama dua kali. Pengulangan saya anggap
sebagai tanda bahwa jawaban "sudah diperbaiki" tidak cukup. Fase ini tidak
menambah fitur; isinya hanya **pembuktian** dan satu koreksi yang muncul dari
pembuktian itu.

## 1. Aksara Sunda — apa yang sebenarnya salah

[FACT] Bentuk aksaranya **tidak** salah susun. Saya membentuk ulang teks
`ᮃᮊ᮪ᮘᮁ ᮔᮝᮞᮥᮔ᮪ᮓ` dengan HarfBuzz (mesin yang dipakai peramban) langsung dari
berkas font di repo: 13 glif, satu per titik-kode, dengan GDEF/GSUB/GPOS utuh.
Panglayar `ᮁ` dan panyuku `ᮥ` ber-advance 0 (benar-benar tanda gabung, menempel
di atas/bawah), sedangkan pamaeh `᮪` (290) dan panéléng `ᮦ` (375) memang tanda
berjarak — begitulah rancangan aksaranya, bukan cacat.

[FACT] Yang salah adalah **bobot 700**. Pada 700 goresan menebal sampai mata
huruf tertutup dan satu baris terbaca seperti coretan miring. Bukti empat bobot
berdampingan: `docs/notes/aksara-weight-compare.png`; hasil pembentukan:
`docs/notes/aksara-shaping-check.png`.

[FACT] Perubahan: `client/public/assets/fonts/fontsource/noto-sans-sundanese-400.woff2`
(4.988 B) masuk, berkas 700 dihapus. `client/src/index.css` dan
`client/src/components/signature/SundaScript.css` kini `font-weight: 400`,
dengan komentar yang melarang menaikkannya tanpa melihat gambar pembanding dulu.
Total font: **208.392 B** (11 woff2).

[FACT] **Kontrak tes sengaja diubah**: `server/sundaneseScript.test.ts` tadinya
memaku nama berkas `-700.woff2`. Sekarang memaku `-400.woff2` dan
`font-weight: 400` di kedua berkas CSS. Saya mengubah tes karena kontraknya
yang berubah, bukan untuk menghindari kegagalan.

[FACT] Tidak ada font Unicode Sunda lain di npm selain
`@fontsource/noto-sans-sundanese` (sudah saya telusuri registry). [INTERP]
Jadi perawakan yang bersudut dan agak miring itu watak huruf cetaknya sendiri;
tidak bisa dihilangkan dengan ganti font — hanya bisa diatur lewat bobot,
ukuran, jarak baris (1.9) dan warna, dan itulah yang dikerjakan di sini.

## 2. Alias "DJ AKBAR REMIX" — dibuktikan dengan perilaku, bukan klaim

[FACT] Berkas baru `server/stagePhraseRotation.test.ts` menjalankan **mesin
partikel yang asli** (`client/src/signature/field/particleField.ts`), menyadap
setiap panggilan `fillText` pada kanvas contoh, lalu menggeser `stage.progress`
dari `PHRASE_SCROLL_TARGET[0]` ke `[1]`. Yang dibuktikan:

1. kedua kata frasa 0 (`AKBAR`, `NAWASUNDA`) benar-benar dirasterisasi;
2. setelah bergulir, `DJ AKBAR` **dan** `REMIX` dirasterisasi — dan `REMIX`
   memang belum ada sebelum pergeseran, jadi rotasinya nyata, bukan kebetulan;
3. hal yang sama terjadi pada lebar 390×780 (ponsel);
4. tidak satu pun titik-kode `U+1B80–1BBF` pernah sampai ke perasterisasi —
   aksara tidak akan pernah dicoba digambar sebagai partikel lagi.

[FACT] Pada HTML hasil SSR `/`: `DJ AKBAR` muncul 3×, `REMIX` 5×. Aliasnya ada
di sumber halaman bahkan sebelum JavaScript jalan.

[INTERP] Dugaan saya soal keluhan kedua: yang Anda lihat adalah keadaan sebelum
dorongan 6B, atau partikel di perangkat Anda jatuh ke jalur diam. Karena itu
poin 3 di bawah.

## 3. Koreksi kejujuran pada panggung diam

[FACT] Saat partikel mati (tenaga rendah, `prefers-reduced-motion`, atau kanvas
tidak tersedia), daftar di bawah panggung dulu tetap berjudul "NAMA YANG
DISUSUN" padahal tidak ada yang sedang disusun. Judulnya kini bercabang:
`spelling` saat hidup, `spellingStatic` ("NAMA & ALIAS" / "NAME & ALIAS") saat
diam — `client/src/components/signature/SignatureStage.tsx`. Pada jalur diam
itu kedua nama tetap terbaca sebagai teks biasa, jadi alias tidak pernah
bergantung pada partikel.

[FACT] Tambahan kecil: baris frasa yang bisa diklik kini menumbuhkan satu garis
pendek warna sinyal saat disorot/difokus (`::after`, tanpa simpul teks baru,
dinonaktifkan pada `prefers-reduced-motion`) — supaya terlihat bahwa baris itu
memang bisa ditekan. `client/src/components/signature/SignatureStage.css`.

## Verifikasi

[FACT] `pnpm check` 0 galat · `vitest` **56 berkas / 330 tes** lulus ·
`audit-layout` 0 pelanggaran (59 berkas) · `pnpm build` sukses · server
dijalankan ulang di `0.0.0.0:4101` · `verify-ssr.sh` **32/32 ALL GREEN**.

## Risiko yang belum terbukti

[FACT] Tidak ada peramban/tangkapan layar di sandbox (Chromium gagal pasang),
jadi penilaian rupa aksara berdasar gambar hasil HarfBuzz+Pillow, bukan
tangkapan layar peramban. Pembentukannya setara, penghalusan tepi tidak.
[FACT] Alih aksara `ᮃᮊ᮪ᮘᮁ ᮔᮝᮞᮥᮔ᮪ᮓ` tetap **usulan** dan masih perlu
pengesahan pemilik nama.
