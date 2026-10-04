/**
 * Atmosfer halaman NIGHT FREQUENCY — lapisan dekoratif.
 *
 * FASE 6 — dari delapan ornamen jadi empat. Yang dihapus (aurora, garis
 * pindai, strip gelombang, siku bingkai hero, strip frekuensi hero) tidak
 * punya alasan selain "menambah tekstur", dan delapan hal yang sama-sama
 * minta perhatian berarti tidak ada satu pun yang menang.
 *
 * FASE 7 nomor 6 — dari empat jadi DUA. Kriterianya diperketat lagi: bukan
 * lagi "masing-masing menjawab satu pertanyaan", tapi "menandai batas,
 * atau menandai keadaan" (lihat docs/notes/inventaris-ornamen.md). Dua
 * yang dibuang (`instr-topo`, `instr-grain`) punya alasan estetika yang
 * nyata — identitas tempat, satu material cetak — tapi keduanya tekstur,
 * bukan penanda. Dibuang beserta aturan CSS-nya di InstrumentLayer.css,
 * bukan disembunyikan `display: none`, supaya berkasnya ikut mengecil.
 *
 * Yang tersisa:
 * 1. `instr-rail`     — DI MANA tepi halamannya? Menandai BATAS kolom kerja.
 * 2. `instr-progress` — SEBERAPA JAUH saya menggulir? Menandai KEADAAN
 *    (posisi gulir), angka nyata dari CSS scroll-timeline, tanpa JS.
 *
 * Aturan yang tidak berubah:
 * - tidak ada makna data yang dikarang di sini;
 * - seluruh pohon `aria-hidden`, `pointer-events: none`, tanpa teks;
 * - nol permintaan jaringan baru;
 * - `instr-progress` hanya dirender kalau peramban mendukung
 *   `animation-timeline: scroll()` — tanpa itu tidak ada indikator palsu.
 */
export function NightAtmosphere() {
  return (
    <>
      <div
        className="instr-atmosphere instr-atmosphere--deep"
        aria-hidden="true"
      >
        <span className="instr-rail instr-rail--left" />
        <span className="instr-rail instr-rail--right" />
      </div>
      <span className="instr-progress" aria-hidden="true" />
    </>
  );
}
