/**
 * Kata yang disusun partikel di panggung beranda.
 *
 * Satu sumber kebenaran untuk dua pembaca: engine partikel (menyusun huruf)
 * dan komponen panggung (menulis baris konteks di bawahnya). Kalau keduanya
 * menyimpan daftar sendiri, suatu hari huruf dan keterangannya akan bercerita
 * hal berbeda.
 *
 * Dua frasa, bukan tiga. Jalur scroll panggung sekarang 140vh (sebelumnya
 * 240vh) — artinya hanya ada ~40vh perjalanan nyata. Tiga frasa di ruang
 * sependek itu berarti tiap kata hanya sempat setengah terbentuk sebelum
 * diganti. Dua frasa menyisakan ~0,36 progres untuk masing-masing sebelum
 * titik dilepas terbang di `RELEASE_PROGRESS`.
 *
 * KEDUA FRASA DITULIS LATIN — dan itu keputusan yang sudah pernah salah
 * sekali. Percobaan menyusun frasa kedua dengan aksara Sunda membuat alias
 * "DJ AKBAR REMIX" hilang dari layar: partikel adalah titik-titik, jadi
 * tanda tempel aksara (rarangkén) yang halus itu tidak pernah terbaca pada
 * kerapatan titik berapa pun, dan yang tersisa hanya gumpalan. Aksara Sunda
 * sekarang hidup sebagai TEKS SUNGGUHAN (lihat
 * `client/src/content/sundaneseScript.ts` + `SundaScript.tsx`), tempat ia
 * dirender dengan font aslinya dan benar-benar terbaca.
 *
 * Nama domain (akbarnawasunda.my.id) tetap hidup sebagai teks di DOM lewat
 * `alsoKnownAs` panggung.
 */
export const STAGE_PHRASES: string[][] = [
  ["AKBAR", "NAWASUNDA"],
  ["DJ AKBAR", "REMIX"],
];

/**
 * Keterangan tiap frasa untuk baris indeks di bawah panggung.
 *
 * Panggung TIDAK boleh menebak isi daftar di atas: kalau frasanya berubah,
 * keterangannya ikut dari sini. `kind` dipakai panggung untuk memutuskan
 * frasa mana yang pantas ditemani pelat aksara (hanya nama resmi).
 */
export const STAGE_PHRASE_META: {
  /** Teks satu baris, persis seperti yang disusun partikel. */
  text: string;
  kind: "name" | "alias";
}[] = [
  { text: "AKBAR NAWASUNDA", kind: "name" },
  { text: "DJ AKBAR REMIX", kind: "alias" },
];

/**
 * Posisi scroll (dalam progres 0..1 jalur panggung) tempat tiap frasa
 * benar-benar sudah tersusun utuh.
 *
 * Dipakai tombol daftar frasa di `SignatureStage`: menekan "02" membawa
 * pengunjung ke titik jalur tempat partikel menyusun alias — bukan animasi
 * palsu, hanya menggulir ke posisi yang memang sudah ada. Nilainya dijaga
 * tes: `phraseFor(PHRASE_SCROLL_TARGET[i])` harus sama dengan `i`, dan
 * semuanya harus di bawah `RELEASE_PROGRESS` (di atas itu titik sudah
 * dilepas dan tidak ada kata yang tersusun).
 */
export const PHRASE_SCROLL_TARGET = [0.18, 0.56];

/** Progres saat titik berhenti ditarik pegas dan mulai terbang bebas. */
export const RELEASE_PROGRESS = 0.75;

/** Di bawah ambang ini panggung dianggap sudah lewat, titik ikut dilepas. */
export const RELEASE_VISIBILITY = 0.3;

/** Frasa yang sedang disusun pada posisi scroll ini. */
export function phraseFor(progress: number) {
  return progress < 0.42 ? 0 : 1;
}

/**
 * Seberapa jauh titik sudah "dilepas" (0 = masih menyusun nama, 1 = seluruh
 * titik terbang bebas). Dipakai engine partikel sebagai gelombang pelepasan
 * dan oleh panggung untuk meredupkan teks konteksnya.
 */
export function releaseRampFor(progress: number, visibility: number) {
  const byProgress = (progress - RELEASE_PROGRESS) / 0.18;
  const byVisibility = (RELEASE_VISIBILITY - visibility) / 0.26;
  return Math.max(0, Math.min(1, Math.max(byProgress, byVisibility)));
}
