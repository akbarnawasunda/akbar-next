# Inventaris ornamen (lapisan hias)

Status: **nomor 2 — selesai, tidak mengubah kode.** Fase 7, rencana poin 2.

## [FAKTA] Koreksi premis sebelum mulai

Rencana Fase 7 menyebut "delapan ornamen" (aurora, grid, edge rail, grain,
scanline, frequency strip, waves, frame corners) sebagai titik berangkat.
Setelah ditelusuri di kode yang benar-benar berjalan sekarang, itu bukan
keadaan saat ini — itu keadaan **sebelum Fase 6**. Komentar di
`client/src/components/signature/NightAtmosphere.tsx` (baris 1-14) sudah
menulis riwayatnya sendiri:

> "FASE 6 — dari delapan ornamen jadi empat. Yang dihapus (aurora, garis
> pindai, strip gelombang, siku bingkai hero, strip frekuensi hero) tidak
> punya alasan selain 'menambah tekstur'..."

Jadi Fase 6 **sudah** memangkas 8 → 4. `docs/phase6-signature-report.md §5`
dan komentar di `client/src/pages/HomeStage.css:602` ("FASE 6 — siku
bingkai, strip frekuensi, dan bar-nya DIHAPUS") menguatkan ini. Dicek satu
per satu di seluruh `client/src/**/*.css` — tidak ada lagi aturan CSS aktif
untuk aurora, siku bingkai (frame corners), atau strip frekuensi; yang
tersisa dari nama-nama itu hanya komentar sejarah.

**Akibatnya nomor 6 dikerjakan dari 4 ornamen aktif menuju 2, bukan dari 8
menuju 2.** Tujuannya (ornamen tinggal yang punya fungsi) tetap sama persis
seperti instruksi; yang berubah hanya angka awal karena faktanya sudah
berbeda dari asumsi rencana.

## Lapisan hias global (dipakai di SEMUA halaman publik)

Dirender oleh `<NightAtmosphere />`
(`client/src/components/signature/NightAtmosphere.tsx`), dipanggil sekali
dari `client/src/shell/PublicShell.tsx:54` — artinya keempatnya aktif di
**setiap route publik**, bukan cuma beranda. Gaya ada di
`client/src/shell/InstrumentLayer.css`.

| # | Lapisan | Selektor | Berkas | Alasan fungsi (tertulis di kode) | Biaya |
|---|---|---|---|---|---|
| 1 | Garis kontur (pengganti grid) | `.instr-topo` | `InstrumentLayer.css:38-57` | [TAFSIR] Identitas tempat ("bentuk tanah tempat artisnya tinggal") — bukan penanda batas atau keadaan, murni tekstur/identitas visual. | 1 `repeating-radial-gradient`, 0 request jaringan |
| 2 | Rel tepi halaman | `.instr-rail` (`--left`/`--right`) | `InstrumentLayer.css:66-80` | [FAKTA] "DI MANA tepi halamannya?" — menandai **batas** kolom kerja (lebar kontainer `--hx-max`/`--hx-gutter`) secara visual. | 2 elemen statis, gradient linear |
| 3 | Grain (tekstur cetak) | `.instr-grain` | `InstrumentLayer.css:88-94` | [TAFSIR] "satu bahan" — menyatukan foto/artwork/UI jadi satu material. Tekstur, bukan penanda batas/keadaan. | 1 SVG data-URI (inline, 0 request), opacity 4,5% |
| 4 | Progres gulir | `.instr-progress` | `InstrumentLayer.css:103-124` | [FAKTA] "SEBERAPA JAUH saya menggulir?" — menandai **keadaan** (posisi scroll), angka nyata dari `animation-timeline: scroll()`, bukan dikarang. | 1 elemen, CSS murni, tanpa JS, mati di browser lama (`@supports`) |

Keempatnya sudah patuh aturan: `aria-hidden`, `pointer-events: none`, tanpa
teks, tanpa `!important`, tanpa `backdrop-filter`, punya pasangan
`prefers-reduced-motion: reduce` (hanya `.instr-progress` yang beranimasi;
lihat `InstrumentLayer.css:220-225`).

## Lapisan hias yang BUKAN bagian dari delapan ornamen (di luar cakupan nomor 6)

Ditemukan saat menyusuri kode, dicatat supaya tidak ikut terpangkas tanpa
sengaja — ini bukan ornamen atmosfer, tapi penanda keadaan fungsional atau
komponen interaktif:

| Lapisan | Berkas | Kenapa di luar cakupan |
|---|---|---|
| Particle field (`.an-signature-field`, wordmark partikel) | `components/signature/SignatureBackground.tsx/.css` | [FAKTA] Bukan dari daftar 8 ornamen brief. Ini sinyal identitas interaktif utama situs (menggambar wordmark dari partikel, berubah mode sesuai rute/frekuensi) — sudah pernah dievaluasi terpisah (`docs/notes/particle-fill-vs-edge.png`, `rmx-motion-mark-notes.md`). Mati total di `prefers-reduced-motion`. |
| Wave bars pemutar audio (`.an-global-player-wave`, `.an-artwork-card-wave`, `.ed-wave`) | `GlobalAudioPlayer.css`, `InteractiveArtworkCard.css`, `EditorialKit.css` | [FAKTA] Menandai **keadaan** (sedang memutar/loading) — fungsinya persis kriteria "boleh tinggal" di nomor 6, tapi ini bukan ornamen atmosfer latar, melainkan indikator UI lokal pada komponen pemutar. |
| Tirai transisi rute + scanline (`.an-route-signal-scanline`) | `components/signature/RouteSignalCurtain.css` | [FAKTA] Efek transisi antar-halaman (durasi 620ms, sekali jalan saat berpindah rute), bukan lapisan ambient yang menetap di layar. |
| Scanline kartu teaser game (`.game-teaser-scanline`) | `pages/Home.css:1328` | [TAFSIR] Dekorasi lokal satu kartu (gaya "kaset game retro") untuk teaser `/jedag-run`, bukan lapisan situs-lebar. Nilainya kontekstual (menandakan "ini game"), skalanya kecil (satu kartu, bukan seluruh halaman). |

## Kesimpulan untuk nomor 6

[TAFSIR] Memakai kriteria instruksi sendiri — "yang tinggal hanya yang
punya alasan fungsi (menandai batas, atau menandai keadaan)" — hasilnya
sudah jelas dari tabel di atas:

- **Tinggal:** `.instr-rail` (menandai batas kolom) dan `.instr-progress`
  (menandai keadaan gulir).
- **Dibuang:** `.instr-topo` dan `.instr-grain` — keduanya tekstur/identitas,
  bukan penanda batas atau keadaan. Fungsinya nyata secara estetika, tapi
  tidak memenuhi kriteria fungsional yang dipakai rencana ini untuk
  memutuskan apa yang tinggal.

Ini mengubah hasil akhir dari "8 jadi 2" (seperti ditulis rencana) menjadi
**"4 jadi 2"** — isinya sama (dua lapisan dengan alasan fungsi), jumlah
awalnya saja yang dikoreksi sesuai fakta kode.
