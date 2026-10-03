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
 * Nama domain (akbarnawasunda.my.id) tetap hidup sebagai teks di DOM lewat
 * `alsoKnownAs` panggung, jadi yang dilepas hanyalah versi partikelnya.
 */
/**
 * Frasa kedua ditulis dengan aksara Sunda (blok Unicode U+1B80–1BFF):
 * ᮓᮤᮏᮦ ᮃᮊ᮪ᮘᮁ ᮛᮦᮙᮤᮊ᮪ᮞ᮪ = alias "DJ AKBAR REMIX" yang sudah dipakai
 * artis di platform. Versi Latinnya tetap hidup sebagai teks di DOM lewat
 * `alsoKnownAs` panggung, jadi pembaca layar dan mesin pencari tidak
 * kehilangan apa pun kalau aksaranya tidak bisa dirender.
 *
 * Transliterasi ini USULAN dan masih perlu konfirmasi pemilik — lihat
 * docs/phase6-signature-report.md. Tidak ada klaim makna yang dilekatkan
 * padanya di mana pun di situs ini.
 */
export const STAGE_PHRASES: string[][] = [
  ["AKBAR", "NAWASUNDA"],
  ["ᮓᮤᮏᮦ ᮃᮊ᮪ᮘᮁ", "ᮛᮦᮙᮤᮊ᮪ᮞ᮪"],
];

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
