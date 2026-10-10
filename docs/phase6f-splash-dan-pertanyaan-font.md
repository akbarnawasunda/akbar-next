# Fase 6F — Splash kepotong, splash "tidak ada", dan jawaban soal sumber font

> Catatan historis: durasi 460/1450 ms di bawah sudah disupersede oleh optimasi
> 9 Oktober 2026. Kontrak loading aktif sekarang dirangkum di
> `docs/notes/loading-and-transition.md`.

## 1. "Bisa ambil font selain Google Fonts?"

[FACT] Bisa, dan situs ini **sudah** melakukannya: Clash Display, General
Sans, dan Azeret Mono berasal dari **Fontshare** (Indian Type Foundry), bukan
Google. Semua font disimpan sebagai berkas di repo
(`client/public/assets/fonts/`) dan tidak pernah dipanggil dari CDN mana pun.

[FACT] Batasan yang jujur: dari dalam sandbox ini **hanya registry npm yang
bisa dijangkau** — `api.fontshare.com`, `raw.githubusercontent.com`, dan
`fonts.gstatic.com` semuanya gagal tersambung (diuji dengan curl; hanya
`registry.npmjs.org` menjawab 200). Jadi untuk saat ini saya hanya bisa
mengambil huruf yang diterbitkan ke npm. Itu tetap jauh lebih luas daripada
Google Fonts: Uncut Sans (uncut.wtf), Commit Mono, Monaspace (GitHub), Geist
(Vercel) semuanya ada di npm dan bukan huruf Google. Kalau Anda ingin huruf
berbayar/khusus (Pangram Pangram, Displaay, Grilli, atau huruf pesanan),
berkasnya cukup Anda kirimkan — pemasangannya sama saja.

## 2. "Font keseluruhan berasa kurang"

[FACT] Saya uji dugaan itu, bukan menuruti atau menolaknya:
`docs/notes/body-voice-candidates.png` memperlihatkan paragraf dan label yang
sama dalam tiga pasangan — General Sans + Azeret Mono (sekarang), Uncut Sans
+ Commit Mono, Uncut Sans + Monaspace Neon.

[INTERP] Kesimpulan saya setelah melihatnya: **perbedaannya tipis sekali.**
Mengganti huruf badan teks tidak akan menyelesaikan rasa "kurang khas"; ia
hanya memindahkan netralitas dari satu grotesk ke grotesk lain, sambil
menambah berat unduh dan risiko keterbacaan. Yang benar-benar mengubah watak
halaman adalah huruf judul (sudah diganti di Fase 6E) dan **cara menyetelnya**
— ukuran, jarak, warna, ritme. Karena itu saya tidak mengganti huruf badan
teks, dan ini keputusan, bukan penundaan.

[FACT] Catatan teknis dari proses ini: perender pratinjau saya semula mengisi
lubang huruf (counter) karena memakai aturan nonzero. Sudah diperbaiki ke
even-odd, dan **kedua gambar bukti dirender ulang**
(`display-candidates.png`, `body-voice-candidates.png`). Keputusan Fase 6E
tetap berdiri setelah render yang benar.

## 3. "Loading kepotong di desktop, lengkap di mobile" — BUG

[FACT] Aritmetikanya: kata "Nawasunda" memakai **4,53em** pada tracking
+0,02em (diukur dari `big-shoulders-display-800.woff2`), sedangkan kotak
splash dipatok `width: min(92%, 560px)` dengan padding `0 4vw`. Di layar
1440px kotaknya ±445px bersih, sementara kata itu ±870px. Jadi memang
terpotong — dan di ponsel kotaknya mengikuti lebar layar, jadi utuh. Persis
seperti yang Anda lihat.
[FACT] Perbaikan: kotak jadi `min(92vw, 1100px)`, dan ukuran hurufnya
**diturunkan dari lebar kotak itu sendiri**:
`font-size: max(2.4rem, calc((min(92vw, 1100px) - 8vw) / 4.6))`. Pembagi 4,6
di atas lebar kata 4,53em memberi sisa ±1,5%. Dengan rumus ini kata itu tidak
bisa terpotong di lebar layar berapa pun — bukan ditebak per breakpoint.
`client/index.html`.

## 4. "Animasi loading seperti tidak ada" — juga BUG, sebab lain

[FACT] Splash disetel `sessionStorage` "sekali per sesi". Sekali Anda reload
di desktop, splash tidak pernah muncul lagi sampai tab ditutup — sedangkan di
ponsel sesinya biasanya baru, jadi selalu tampil penuh. Itu menjelaskan
kenapa terasa "ada di mobile, hilang di web".
[FACT] Perbaikan: kunjungan berikutnya tidak lagi melewatkan splash diam-
diam, tapi mendapat **versi ringkas ±460ms** (`an-splash-quick`): hanya
aksara + nama, isi pendukung disembunyikan, sekuens dipercepat ±3×. Jalur
`prefers-reduced-motion` tetap: tidak ada splash sama sekali.
[FACT] Sekuensnya juga ditata ulang supaya terbaca sebagai satu gerakan dan
dipimpin identitas: **aksara ditulis dulu** (0–0,62 dtk) → nama Latin naik
(0,30–1,12) → garis signal menyapu (0,62–1,40). `MIN_VISIBLE` 1400 → **1450**
karena di 1400 ms garis terakhir masih terpotong.

[FACT] **Kontrak tes berubah dengan sengaja**: `server/editorialRedesign.test.ts`
dulu memaku `MIN_VISIBLE = 1400` / `MAX_VISIBLE = 2200` dan judul "splash
hanya tampil sekali per sesi". Sekarang memaku pasangan penuh/ringkas
(`seen ? 460 : 1450`, `seen ? 900 : 2200`) dan keberadaan `an-splash-quick`.

## Verifikasi

[FACT] `pnpm check` 0 galat · `vitest` 56 berkas / **330 tes** ·
`audit-layout` **0 pelanggaran** · `pnpm build` · server di-restart ·
`verify-ssr` **32/32 ALL GREEN** · HTML terlayani memuat `an-splash-quick`
dan rumus lebar barunya.

## Yang masih belum terbukti

[FACT] Tanpa browser di sandbox, yang dijamin adalah **aritmetika lebarnya**
(kata tidak mungkin melebihi kotak) dan **urutan waktunya** (sekuens selesai
1,40 dtk < 1,45 dtk tampil minimum). Kehalusan gerakannya sendiri belum
pernah saya lihat berjalan.
