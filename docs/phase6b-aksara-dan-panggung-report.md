# Fase 6B — Perbaikan: pelat aksara Sunda & panggung yang tidak menyembunyikan apa pun

**Akbar Nawasunda — akbarnawasunda.my.id**
Tanggal: 2026-10-04 · Branch: `arena/01a10161-akbar-next` · Lanjutan dari `docs/phase6-signature-report.md`
Pemicu: dua keluhan pemilik — (1) "kok teks Sunda-nya gitu sih?", (2) "partikel cuma ada AKBAR
NAWASUNDA doang, DJ AKBAR REMIX-nya hilang".

Label: **[FACT]** bisa diverifikasi dari berkas/perintah di repo · **[INTERP]** penilaian desain saya ·
**[INVENT]** buatan saya tanpa sumber.

---

## 1. Dua kerusakan, dan kenapa keduanya salah saya

### A. Alias "DJ AKBAR REMIX" hilang [FACT]
Pada Fase 6 saya mengganti frasa kedua panggung dengan aksara Sunda
(`STAGE_PHRASES[1] = ["ᮓᮤᮏᮦ ᮃᮊ᮪ᮘᮁ", "ᮛᮦᮙᮤᮊ᮪ᮞ᮪"]`). Akibatnya berlapis:
- Alias Latin **tidak lagi disusun partikel** — satu-satunya tempat ia muncul di layar.
- Aksara Sunda **juga tidak terbaca sebagai partikel**: tulisannya memakai tanda tempel kecil di atas dan
  di bawah huruf dasar (rarangkén). Titik partikel berdiameter 1,6px dengan jarak antar-titik beberapa
  piksel tidak akan pernah membentuk tanda sehalus itu — yang muncul gumpalan. [INTERP, konsisten dengan
  bukti kerapatan di `docs/notes/particle-fill-vs-edge.png`]
- Di DOM, `.an-signature-stage-word` **selalu** tertulis "AKBAR NAWASUNDA" (hard-code), jadi bahkan teks
  cadangannya pun tidak pernah menyebut alias. Alias hanya hidup di satu kalimat `sr-only`. [FACT]

Kesimpulan jujur: saya memasang identitas pada lapisan yang paling rapuh di seluruh situs. Partikel mati
pada `prefers-reduced-motion`, hemat data, perangkat lemah, dan JS gagal — empat kondisi yang semuanya
nyata. [INTERP]

### B. Aksara tampil rusak [FACT]
Versi pertama memasang deret aksara sebagai `<p>` biasa: `font-size` ≈1rem, `line-height: 1.5`,
`display: flex` dengan `align-items: baseline`, tanpa keterangan apa pun. Tiga masalah sekaligus:
1. `line-height` 1,5 **memotong rarangkén** di atas dan di bawah huruf — inilah penyebab bentuknya terlihat
   salah;
2. ukurannya terlalu kecil untuk aksara yang detailnya padat;
3. tanpa kunci baca, pembaca yang tidak mengenal aksara Sunda hanya melihat karakter asing — identitas
   berubah jadi teka-teki. [INTERP]

Catatan metode: saya **tidak bisa** memverifikasi bentuk akhirnya di sandbox ini. Pillow di sini tidak punya
raqm/HarfBuzz (`PIL.features.check('raqm') == False`) [FACT], jadi pratinjau lokal pasti menempatkan tanda
tempel di posisi yang salah dan akan menyesatkan. Peramban memakai HarfBuzz dan menyusunnya dengan benar.
Jadi perbaikan di bawah menyerang **penyebab struktural** (ruang vertikal, ukuran, kunci baca), bukan menebak
dari gambar palsu.

---

## 2. Yang dibangun sekarang

### 2.1 Satu sumber isi: `client/src/content/sundaneseScript.ts` (baru) [FACT]
Semua deret aksara tinggal di satu berkas, masing-masing **wajib** berpasangan dengan bacaan Latin.
Aturan yang ditulis di dalamnya: tanpa klaim makna, hanya nama yang memang milik artis ini, selalu ada
padanan Latin. Dulu deretnya ditulis langsung di dua tempat berbeda.

### 2.2 Komponen baru: `SundaScript.tsx` + `SundaScript.css` (baru) [FACT]
Pelat nama, bukan karakter lepas. Tiga perbaikan yang mengikat:
- **Ruang**: `line-height: 1.9` pada deret aksara (dikunci tes), `font-size` clamp(1.45rem → 2.1rem) pada
  nada `hero` — tidak pernah lebih kecil dari teks isi.
- **Kunci baca selalu ikut**: label mono "AKSARA SUNDA" / "SUNDANESE SCRIPT" + bacaan Latin
  "AKBAR NAWASUNDA" di bawah deretnya.
- **Aman kalau font gagal**: `--font-sunda` jatuh ke font isi; label + bacaan Latin tetap menjelaskan apa
  yang seharusnya ada. Tidak ada layout yang runtuh.
- Aksesibilitas: pelat `aria-hidden` di tempat yang namanya sudah dibacakan H1/`sr-only` — supaya pembaca
  layar tidak menyebut nama yang sama dua kali.

Dipakai di: hero beranda ID, hero beranda EN, dan baris nama di panggung. [FACT]

### 2.3 Partikel kembali Latin, dan alasannya ditulis di kode [FACT]
`STAGE_PHRASES` kembali ke `["AKBAR","NAWASUNDA"]` + `["DJ AKBAR","REMIX"]`. Rujukan ke font aksara dicabut
dari `particleField.ts`. Komentar di `stagePhrases.ts` mencatat kenapa — supaya tidak ada yang mengulangi
percobaan yang sama enam bulan lagi.

### 2.4 Panggung tidak lagi menyembunyikan apa pun [FACT]
Di `SignatureStage.tsx`:
- Judul statis panggung sekarang **mengikuti frasa yang sedang disusun** (`stagePhrase` dari store), bukan
  lagi teks hard-code. DOM dan layar tidak bisa lagi bercerita hal berbeda.
- **Daftar frasa baru** di bawah bidang partikel: dua baris, bernomor `01`/`02`, berisi "AKBAR NAWASUNDA"
  (dengan pelat aksara) dan "DJ AKBAR REMIX". Selalu teks sungguhan, selalu terlihat — termasuk saat
  partikel mati. Baris yang sedang disusun ditandai garis aksen + latar tipis.
- Pelat aksara **hanya menemani nama resmi**. Alias tidak ditulis dengan aksara Sunda: "DJ ... REMIX" adalah
  nama panggung berbahasa Inggris, dan mentransliterasikannya secara fonetis akan jadi kostum, bukan
  identitas. [INTERP — ini juga perubahan sikap dari Fase 6, yang sempat melakukannya.]

### 2.5 Tambahan "biar betah": nomor frasa jadi kontrol sungguhan [FACT]
Setiap baris daftar adalah `<button>` yang **menggulir ke posisi jalur tempat frasa itu tersusun utuh**
(`PHRASE_SCROLL_TARGET = [0.18, 0.56]`). Rumusnya kebalikan persis dari cara runtime membaca progres di
`pointerSignal.readStage`, jadi tidak ada angka ajaib dan tidak ada animasi palsu.
- **Tidak membajak scroll**: tidak ada event yang dicegat; hanya `window.scrollTo` (dikunci tes).
- **Hormat `prefers-reduced-motion`**: perpindahannya `auto`, bukan meluncur.
- **Peningkatan bertahap**: kalau panggung tidak hidup, barisnya tetap tampil tetapi bukan tombol — karena
  jalur scroll-nya memang runtuh dan tombol itu tidak akan menuju apa pun.
- Fokus keyboard: ring `--signal` 2px, offset 2px. Mode kontras paksa: penanda aktif memakai `Highlight`,
  tidak bergantung warna saja.

Kenapa ini yang saya pilih, bukan efek baru [INTERP]: pengunjung bertahan kalau ia mengerti apa yang sedang
dilihatnya dan merasa punya kendali. Sebelumnya panggung meminta orang menggulir tanpa memberi tahu ada dua
nama di sana. Sekarang kedua nama terbaca, dan satu ketukan membawanya langsung ke nama yang ia penasaran.

---

## 3. Tes sebagai kontrak — supaya ini tidak terulang [FACT]

Berkas baru `server/sundaneseScript.test.ts` (13 tes). Yang dikunci:
1. Deret aksara hanya berisi blok U+1B80–1BFF (tidak ada huruf Latin nyasar) dan **selalu** punya bacaan
   Latin.
2. Potongan nama menyusun nama lengkap yang sama persis.
3. Label pendamping hanya menyebut **sistem tulisannya**, bukan arti/filosofi/sejarah apa pun.
4. `@font-face` aksara punya `unicode-range` (kalau hilang, 5 kB terunduh sia-sia di setiap halaman Latin).
5. `.an-sunda-script` punya `line-height` 1,8–1,9 — penyebab kerusakan pertama tidak bisa kembali diam-diam.
6. Komponennya selalu merender kunci baca bersama aksaranya.
7. **Frasa partikel wajib Latin** — percobaan yang menghilangkan alias akan langsung merahkan tes.
8. Keterangan frasa sama persis dengan yang disusun partikel.
9. Target scroll tiap tombol benar-benar jatuh di wilayah frasa itu (`phraseFor(target) === index`) dan
   sebelum titik dilepas.
10. Tombolnya tidak memakai `preventDefault`/`wheel`, dan menghormati `prefers-reduced-motion`.
11. **Tiga tes render SSR**: HTML yang benar-benar dikirim server harus memuat kedua nama sebagai teks,
    deret aksara, label, dan bacaan Latin — di beranda ID maupun EN.

Satu tes lama ikut saya rapikan tanpa mengubah kontraknya: `server/internationalization.test.ts` mencocokkan
potongan kalimat hero EN sebagai string sumber, dan Prettier sempat memindahkan pemenggalan barisnya. Yang
saya perbaiki **kodenya** (dikembalikan ke pemenggalan semula), bukan tesnya. [FACT]

---

## 4. Verifikasi [FACT]

```
corepack pnpm install --frozen-lockfile        → Done
corepack pnpm check                            → tsc --noEmit, 0 error
corepack pnpm test                             → 55 berkas / 326 tes, semua lulus (dari 54/311)
node scripts/audit-layout.mjs                  → 0 pelanggaran (59 berkas discan)
corepack pnpm build                            → sukses
PORT=4101 NODE_ENV=production node dist/index.js   → bind 0.0.0.0, di-restart sesudah build
BASE=http://localhost:4101 bash scripts/verify-ssr.sh → PASS=32 FAIL=0, ALL GREEN
```

Pemeriksaan isi pada server produksi yang berjalan:
- `GET /` memuat `ᮃᮊ᮪ᮘᮁ ᮔᮝᮞᮥᮔ᮪ᮓ` (2×: hero + panggung), `AKSARA SUNDA` (2×), `DJ AKBAR` (3×),
  `NAMA YANG DISUSUN` (1×);
- `GET /en` memuat deret aksara yang sama (2×) dengan label `SUNDANESE SCRIPT` (2×).

**Yang masih belum terbukti** [FACT]: tetap tidak ada browser di sandbox ini (unduhan Chromium gagal),
dan Pillow di sini tanpa HarfBuzz. Jadi yang belum dilihat mata: (1) bentuk akhir rarangkén setelah shaping
peramban, (2) rupa daftar frasa di layar nyata, (3) rasa perpindahan `scrollTo` di perangkat sentuh.
Yang sudah terbukti: isinya benar-benar terkirim, kontraknya terkunci tes, dan tidak ada lagi informasi
yang hanya hidup di dalam partikel.

---

## 5. Yang masih perlu Anda putuskan [INTERP]

1. **Ejaan aksara** masih usulan dan menunggu konfirmasi Anda. Kalau ada koreksi, satu berkas yang diubah:
   `client/src/content/sundaneseScript.ts` — hero, panggung, dan versi Inggris ikut berubah sendiri.
2. **Apakah alias juga ingin ber-aksara?** Saya memilih tidak (alasan di §2.4). Kalau Anda ingin, tinggal
   menambah satu entri di berkas yang sama.
3. **Notasi "×"** masih belum dipakai sebagai tanda — kandidat terkuat berikutnya, menunggu arahan Anda.
