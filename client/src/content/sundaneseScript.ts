/**
 * AKSARA SUNDA — satu-satunya sumber kebenaran.
 *
 * Kenapa file sendiri: sebelumnya deret aksara ditulis langsung di dua
 * tempat (hero dan daftar frasa panggung). Begitu ejaannya dikoreksi
 * pemilik, dua tempat itu pasti akan berbeda suatu hari. Sekarang satu
 * berkas, dan setiap pemakai mengambil dari sini.
 *
 * ATURAN YANG TIDAK BOLEH DILANGGAR DI BERKAS INI
 * 1. Tidak ada klaim makna. Yang ditulis di sini hanya "nama ini, ditulis
 *    dengan aksara Sunda" — bukan arti, bukan filosofi, bukan sejarah.
 * 2. Hanya nama dan kata yang MEMANG milik artis ini yang boleh masuk.
 * 3. Setiap entri wajib punya padanan Latin (`latin`) yang ikut tampil,
 *    supaya pembaca yang tidak mengenal aksara tidak melihat "karakter
 *    asing" tanpa kunci.
 *
 * STATUS: transliterasi di bawah adalah USULAN dan menunggu konfirmasi
 * pemilik. Lihat docs/phase6b-aksara-dan-panggung-report.md §2.
 *
 * Catatan teknis tentang bentuk hurufnya (bukan klaim budaya, hanya cara
 * baca kode ini): aksara Sunda memakai tanda tempel di atas dan di bawah
 * huruf dasar (rarangkén). Karena itu CSS-nya butuh `line-height` longgar
 * (≥1.8) — kalau tidak, tanda atas/bawahnya terpotong dan deretnya
 * terlihat rusak. Itu penyebab tampilan yang salah pada versi pertama.
 */

export type SundaneseEntry = {
  /** Deret aksara Sunda (blok Unicode U+1B80–1BFF). */
  script: string;
  /** Bacaan Latin yang WAJIB ikut ditampilkan di sebelahnya. */
  latin: string;
};

/** Nama resmi: AKBAR NAWASUNDA. */
export const SUNDA_NAME: SundaneseEntry = {
  script: "ᮃᮊ᮪ᮘᮁ ᮔᮝᮞᮥᮔ᮪ᮓ",
  latin: "AKBAR NAWASUNDA",
};

/** Dua kata nama, untuk tempat yang butuh pecahannya. */
export const SUNDA_NAME_PARTS: SundaneseEntry[] = [
  { script: "ᮃᮊ᮪ᮘᮁ", latin: "AKBAR" },
  { script: "ᮔᮝᮞᮥᮔ᮪ᮓ", latin: "NAWASUNDA" },
];

/**
 * Label kecil yang menemani setiap deret aksara.
 *
 * Ini bukan hiasan: tanpa kunci ini, pembaca yang tidak mengenal aksara
 * Sunda hanya melihat karakter yang tidak bisa dibaca. Dengan kunci ini,
 * ia membaca "oh, itu namanya, ditulis dengan aksara daerahnya".
 */
export const SUNDA_LABEL: Record<"id" | "en", string> = {
  id: "AKSARA SUNDA",
  en: "SUNDANESE SCRIPT",
};
