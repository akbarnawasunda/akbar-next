# REFACTOR STATE — Akbar Nawasunda Website

> File ini single source of truth untuk status migrasi.
> Setiap sesi Manus baru WAJIB baca file ini dulu.
> Setiap sesi selesai WAJIB update file ini.

---

## STATUS SEKARANG

**Fase aktif:** FASE 1 — Audit
**Terakhir update:** (belum ada)
**Terakhir commit:** (belum ada)

---

## CHECKLIST FASE

- [ ] **FASE 1** — Audit repo
- [ ] **FASE 2** — Fix bug kritis (halaman blank, text invisible, import rusak)
- [ ] **FASE 3** — Homepage polish
- [ ] **FASE 4** — /music
- [ ] **FASE 5** — /visuals
- [ ] **FASE 6** — /live, /about, /privacy
- [ ] **FASE 7** — English pages (/en/*)
- [ ] **FASE 8** — Hapus file orphan
- [ ] **FASE 9** — Final verification

---

## DESIGN TOKENS (JANGAN UBAH)

--ink: #0a0a09
--ink-soft: #131211
--paper: #f0ebdd
--acid: #d8ff00
--signal: #ff4a1c
--mute: rgba(240, 235, 220, 0.60)
--ink-line: rgba(240, 235, 220, 0.14)

Font:
--font-display: Fraunces
--font-body: Switzer
--font-mono: JetBrains Mono

Hanya boleh didefinisikan di client/src/index.css.

---

## ATURAN MUTLAK

### Warna DILARANG
ungu #8a5cff, cyan #76efff, mint #79d6c7, pink #c4428e,
gold #d8ff65, biru #6ca9d5

### Font DILARANG
Space Grotesk, DM Serif Display, IBM Plex Mono, Inter, Clash Display

### CSS DILARANG
- box-shadow glow
- filter: blur() dekoratif
- border-radius > 0
- opacity: 0 default tanpa safety timer
- content-visibility: auto
- !important (kecuali 3 kasus khusus)

### Kode DILARANG
- Append CSS ke file panjang. REPLACE kalau fix.
- Push commit beruntun (Vercel cancel build)
- Hapus test karena gagal (update test kalau usang)
- Ubah index.css tanpa izin user

---

## WORKFLOW WAJIB

1. Baca file ini dulu
2. Baca file yang akan diubah
3. Cek siapa yang import file itu
4. Tulis rencana. Tunggu user setuju.
5. Ubah 1 file
6. Jalankan pnpm build. Gagal → rollback.
7. Jalankan pnpm test. Gagal → fix atau update test.
8. Commit: [scope] deskripsi
9. Update file ini
10. Push. Tunggu 1 menit. Cek Vercel.

---

## ROLLBACK

git reset --hard HEAD~1
git checkout <file>

---

## LOG SESI

### Sesi 1
- Tanggal: -
- Status: belum mulai
- Yang dikerjakan: -
