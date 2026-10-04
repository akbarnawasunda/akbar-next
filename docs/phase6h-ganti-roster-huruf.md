# Fase 6H — Huruf diganti, bukan ditambah

"Bukan nambah cuy, tapi ganti." Jadi diganti.

## Roster lama → baru

| peran | sebelum | sesudah |
|---|---|---|
| judul / H1 / wordmark | Syne 800 → Big Shoulders Display 800 | **Big Shoulders Display 800** (tetap) |
| H2 / H3 / UI | Clash Display 500/600/700 | **Schibsted Grotesk 700** |
| badan teks | General Sans 400/500/600 | **Schibsted Grotesk 400/500** |
| label / angka / konsol | Azeret Mono 400/500/600 | **Sometype Mono 400/500** |
| identitas aksara | Noto Sans Sundanese 400 | tetap |

[FACT] **11 berkas / 218.048 B → 8 berkas / 114.012 B.** Turun 48%. Tiga
keluarga lama dihapus dari repo, bukan sekadar berhenti dipakai:
`clash-display-{500,600,700}`, `general-sans-{400,500,600}`,
`azeret-mono-{400,500,600}` — direktori `fontshare/` kini kosong.

[FACT] Dasar pemilihan: `docs/notes/body-swap-candidates.png` — empat
pasangan badan+mono pada paragraf, kalimat kecil, dan label yang sama.
[INTERP] Schibsted Grotesk dipilih karena punya watak yang jelas (bentuk
lebih padat, x-height tinggi, apertur lebih tertutup) tanpa mengorbankan
keterbacaan paragraf di layar gelap — sesuatu yang tidak bisa dikatakan
untuk kandidat serif (Redaction), yang hairline-nya berisiko bergetar pada
teks kecil di latar hitam. Sometype Mono dipilih karena lebih hangat dan
sedikit nyeleneh dibanding mono teknis, tapi lebarnya masih mirip Azeret
sehingga label dan angka tidak perlu dihitung ulang.
[INTERP] Clash Display dibuang sepenuhnya karena setelah H1 memakai Big
Shoulders, keberadaan huruf display kedua hanya membuat hierarki kabur.
Sekarang: satu suara judul, satu suara baca, satu konsol, satu aksara.

## Berkas yang disentuh

[FACT] `client/src/index.css` (blok `@font-face` ditulis ulang + lima token),
`client/src/shell/EditorialRefresh.css` (override token lokal),
`client/src/signature/field/particleField.ts` (`WORDMARK_FONT` — partikel
nama kini merasterisasi huruf judul yang benar; sebelumnya masih menunjuk
Syne yang berkasnya sudah tidak ada), `client/index.html` (dua preload
diganti + splash), `scripts/audit-layout.mjs` (daftar font lokal).

## Kontrak tes yang berubah (disengaja)

[FACT] `server/editorialOptimization.test.ts` dulu memaku keberadaan tiga
berkas Fontshare dan tiga token lama. Tes itu ditulis ulang menjadi: tujuh
berkas baru **harus ada**, empat berkas lama **harus sudah tidak ada**
(termasuk `syne-800.woff2`), token menunjuk huruf baru, dan tidak ada satu
pun rujukan ke `fonts.googleapis.com` / `fonts.gstatic.com` /
`api.fontshare.com`. Yang dijaga tetap sama: semua huruf dilayani dari repo.

## Verifikasi

[FACT] `pnpm check` 0 galat · `vitest` 56 berkas / **330 tes** ·
`audit-layout` **0 pelanggaran** · `pnpm build` · server di-restart ·
`verify-ssr` **32/32 ALL GREEN** · ketiga berkas huruf dilayani 200
(schibsted 24.344 B, sometype 10.000 B, big shoulders 14.556 B) · bundle
hasil build tidak lagi memuat nama huruf lama.

## Catatan jujur

[FACT] Tanpa browser di sandbox, penilaian rupa berasal dari render
fontTools pada teks sungguhan, bukan tangkapan layar. Yang pasti: ukuran
unduh turun 48% dan tidak ada huruf yang hilang dari halaman mana pun
(semua token punya `@font-face`, diperiksa `audit-layout`).
