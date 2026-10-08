# JEDAG RUN — Design Doc (evolusi rhythm-runner)

**Tanggal:** 8 Oktober 2026 · **Branch:** `arena/81fea9cf-akbar-next` (dari `main` `5b3a0d4`) · **Status: do not merge until verified**

Dokumen ini menjawab pertanyaan terbuka di handoff (§5.7), memilih arah konsep,
dan mencatat mekanik yang diubah. Implementasi mengikuti dokumen ini.

---

## 1. Jawaban atas pertanyaan terbuka

| # | Pertanyaan | Keputusan | Alasan |
|---|---|---|---|
| 1 | Beat clock: BPM konstan vs analyser WebAudio? | **BPM konstan, 120 BPM (ketukan = 0.5 s)**, dihitung dari waktu world | Deterministik, bisa dites, murah. Fallback synth di `JedagRunAudio.ts` sudah memakai grid 250 ms per langkah (ketukan = 500 ms, aksen bass tiap 1 s), jadi grid game dan synth selaras. Analyser WebAudio ditunda: butuh BGM ber-BPM tetap yang diketahui, dan biaya perf tidak sepadan. |
| 2 | Karakter: geometris vs `drawImage` maskot? | **Maskot `akbar-mascot-doodle.webp` via `drawImage`**, dipotong lingkaran di kepala. **Fallback geometris** (mata + mulut per ekspresi) bila gambar belum siap / gagal dimuat. | Maskot terbaca di 34 px karena latar hitam dan lingkaran biru membentuk kepala yang jelas. Emoji (generik) dihapus. |
| 3 | Drop frenzy: apa yang berubah selama 3.6 s? | **Nilai note ×2 selama drop** (sama seperti DOUBLE SCORE) + denyut ketukan pada jalan + kedipan bingkai (sudah ada). Tetap 3.6 s. | Payoff terasa di gameplay, bukan hanya visual. Tidak menambah state baru. |
| 4 | Skop | **Tier 1 penuh + Tier 2 #1 (karakter) + Tier 2 #2 (beat clock)**. Tidak ada mode baru. | Tier 2 #2 adalah ide khas; Tier 2 #1 adalah identitas visual. Keduanya kecil secara kode karena world sudah terpisah. |
| 5 | Evolusi vs konsep baru | **Evolusi JEDAG RUN**, bukan konsep baru. | Lihat §2. |

---

## 2. Opsi konsep

| Opsi | Deskripsi | Kelebihan | Kekurangan |
|---|---|---|---|
| **A. Evolusi JEDAG RUN (rekomendasi)** | Auto-runner yang lompat-lompat, dengan note dan obstacle yang tersinkron ke ketukan 120 BPM; maskot sebagai pemain; drop = ×2 selama 3.6 s. | Sudah ada world seeded, renderer, audio, leaderboard, test. Nama "JEDAG" langsung terbaca sebagai dentuman. Perubahan kecil per lapisan. | Runner-nya masih runner; kekhasan datang dari ritme dan maskot, bukan genre. |
| B. Konsep baru: "Kick Drum Dodge" (lompat hanya pada ketukan bass, grid kuantisasi penuh) | Pemain hanya bisa lompat pada ketukan. | Sangat khas. | Membuang seluruh basis kode dan leaderboard; fairness sulit tanpa beat audio nyata; tidak ada audio ber-BPM tetap yang bisa dijamin. Melanggar "jangan tambah mode". |
| C. Konsep baru: "Mixer" (geser fader kiri-kanan mengikuti bass) | Puzzle ritme 2D. | Unik. | Terlalu jauh dari game yang sudah ada; butuh desain ulang besar; bukan evolusi. |

**Rekomendasi: A.** Kekhasan dibangun dengan satu ide mekanik yang diingat:
**"note dan obstacle jatuh di ketukan — kamu berlari di atas dentuman."** Opsi B
akan lebih khas tetapi merupakan game baru dan melanggar batasan handoff.

---

## 3. Ide mekanik yang diubah / ditambah

### 3.1 Beat clock (Tier 2 #2)
- Konstanta `BEAT_SECONDS = 0.5` (120 BPM) dan `COUNTDOWN_SECONDS = 1.0`.
- World menghitung `beatClock` (detik sejak GO) dan `beatIndex` (floor). Tick ketukan
  terjadi tepat di frame ketika `beatIndex` berubah → `beatTick` (boolean, hanya untuk frame itu).
- **Spawn obstacle dan arc note hanya boleh terjadi di frame yang mengandung tick.**
  Timer tetap berjalan seperti sebelumnya (gap acak), tetapi spawn ditunda ke ketukan
  berikutnya. Akibatnya gap menjadi kelipatan ½ detik: pola tetap acak, tetapi selalu
  di grid. Fairness tidak berubah karena kecepatan dan ruang tidak berubah.
- Power-up tidak dikuantisasi (bukan bagian ritme utama).
- `beatPulse` (1 → 0 dalam ~0.25 s setelah tick) dikirim ke renderer untuk denyut jalan
  dan sedikit bob pemain. Reduced-motion: amplitudo denyut 0.

### 3.2 Countdown "READY" (Tier 1 #5)
- `start()` memberi `countdown = 1.0 s` dalam mode `running`. Selama countdown: jarak,
  spawn, tabrakan, dan physics **tidak** berjalan (`update()` hanya mengurangi countdown).
- Input lompat selama countdown **diabaikan** (agar tidak lompat otomatis saat GO).
- Renderer menggambar "3 · 2 · 1" di tengah. Pause saat countdown tetap berfungsi.

### 3.3 Hit feedback (Tier 1 #2)
- Pilihan: **hidupkan sinyalnya** (bukan hapus). `hitFlash` dan `shake` sudah dihitung
  world; sekarang ikut `getRenderState()` (`damageFlash`, `shake`).
- Renderer: kilasan merah tipis (alpha dari `damageFlash`) dan guncangan kecil
  (maks ~6 px logis, turun 18/s). Reduced-motion: tanpa guncangan, kilasan alpha dibagi dua.
- Guncangan lama berbasis `level > 1` (jitter acak tiap frame) dihapus — itu kebisingan,
  bukan sinyal, dan bertentangan dengan reduced-motion.

### 3.4 Drop payoff (Tier 1 #3)
- Selama `dropTime > 0`, nilai note dikali 2 (sama dengan DOUBLE SCORE). Tidak ada
  mekanik lain. Popup note menampilkan nilai yang sudah dikali.

### 3.5 NEW BEST (Tier 1 #4)
- `gameOver()`: jika `finalScore > best sebelumnya && finalScore > 0` → `newBest = true`.
- Overlay game-over menampilkan badge "NEW BEST" (bukan hanya teks), dan pengumuman
  screen reader. Tidak ada SFX baru (menghindari audio tambahan); bisa ditambah nanti.

### 3.6 Karakter (Tier 2 #1)
- Emoji ekspresi dihapus. Kepala pemain = maskot di dalam lingkaran (radius 17 px) dengan
  ring glow sesuai ekspresi (ring sudah ada).
- Sebelum gambar siap (atau gagal): wajah geometris — dua mata persegi + mulut sesuai
  kelompok ekspresi (senyum: collect/near-miss/level-up; o: jump/drop; datar: running/neutral/paused; cemberut: hit/game-over).
- Gambar dimuat sekali di renderer (`new Image()`), tidak ada loop baru.

### 3.7 Aksesibilitas HUD (Tier 1 #1)
- `aria-live` dicabut dari HUD (yang di-update tiap 3 frame).
- Live region terpisah yang sangat kecil (`sr-only`) hanya mengumumkan perubahan **mode**:
  READY, LIVE, PAUSED, SIGNAL ENDED (+ skor dan NEW BEST bila ada).

---

## 4. Yang TIDAK disentuh

- Palet neon game (tidak diganti palet situs; tidak ada `--acid` baru).
- Partikel game tetap dibatasi 180; tidak ada loop rAF baru; tetap satu canvas 2D.
- Seeded RNG (seed 73), demo mode `?demo=1`, pause saat hidden/off-screen, best lokal, leaderboard,
  gate username, tutorial, share, audio fallback synth.
- Signal Mark, shell editorial, partikel situs, hero, dock — tidak disentuh.

---

## 5. Strategi tuning

- **Beat-sync:** spawn terkunci ke grid 120 BPM. Sinkronisasi dengan **BGM file** (`bgmUrl`)
  tidak dijamin: tempo file belum diketahui. Fallback synth selaras secara perkiraan
  (start audio dan start world terjadi pada gesture yang sama; selisih ±50 ms).
  **Perlu tuning manual di browser**: dengarkan apakah aksen bass jatuh di ketukan
  yang sama dengan spawn.
- **Difficulty ramp:** tidak diubah. Gap obstacle hanya dibulatkan ke grid; batas bawah
  gap (0.95 − 0.24 s) menjadi 1.0 s setelah pembulatan — sedikit lebih lapang di level tinggi.
  Dicatat sebagai hasil yang disengaja.
- **Drop ×2:** nilai note ×2 selama 3.6 s; diuji lewat test deterministik (lihat §6).

---

## 6. Rencana verifikasi

- **Test world (deterministik):** countdown memblokir gerak dan lompat; spawn obstacle dan
  arc note hanya di frame tick ketukan (`beatClock mod BEAT < dt`); dua world seed sama
  menghasilkan state identik setelah N frame.
- **Test kontrak source** (hanya untuk yang tidak muncul di HTML): renderer memakai
  `drawImage` dan fallback; tidak ada emoji ekspresi; HUD tidak punya `aria-live`;
  reduced-motion dicek pada guncangan dan denyut.
- **Verifikasi penuh:** `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm audit:layout`
  (2 error pre-existing di `studio.css` diharapkan), SSR smoke (`scripts/verify-ssr.sh`).
- **Batasan sandbox:** tidak ada browser. FPS, game feel, sinkron audio, dan keterbacaan
  maskot di 34×68 **belum diukur langsung**. Perlu tuning manual di browser.

---

## 7. Catatan implementasi

Lihat commit dan PR untuk daftar file. Tidak ada perubahan di luar folder game,
`JedagRunCanvas.tsx/.css`, dan test game.
