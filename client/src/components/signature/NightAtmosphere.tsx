/**
 * Atmosfer halaman NIGHT FREQUENCY — lapisan dekoratif.
 *
 * FASE 6 — dari delapan ornamen jadi empat. Yang dihapus (aurora, garis
 * pindai, strip gelombang, siku bingkai hero, strip frekuensi hero) tidak
 * punya alasan selain "menambah tekstur", dan delapan hal yang sama-sama
 * minta perhatian berarti tidak ada satu pun yang menang. Yang tersisa
 * masing-masing menjawab satu pertanyaan:
 *
 * 1. `instr-topo`  — DI MANA ini? Garis kontur: bentuk tanah tempat
 *    artisnya tinggal. Ini satu-satunya lapisan yang membawa identitas.
 * 2. `instr-rail`  — DI MANA tepi halamannya? Dua garis sejajar kontainer,
 *    jadi lebar kerja terlihat, bukan ditebak.
 * 3. `instr-grain` — SATU BAHAN. Foto, artwork, dan permukaan UI diikat
 *    jadi satu material cetak, bukan tiga sumber gambar berbeda.
 * 4. `instr-progress` — SEBERAPA JAUH saya menggulir? Satu-satunya lapisan
 *    yang membawa angka nyata (CSS scroll-timeline, tanpa JS).
 *
 * Aturan yang tidak berubah:
 * - tidak ada makna data yang dikarang di sini;
 * - seluruh pohon `aria-hidden`, `pointer-events: none`, tanpa teks;
 * - nol permintaan jaringan baru (grain = satu SVG data URI, sisanya CSS);
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
        <span className="instr-topo" />
        <span className="instr-rail instr-rail--left" />
        <span className="instr-rail instr-rail--right" />
      </div>
      <div
        className="instr-atmosphere instr-atmosphere--film"
        aria-hidden="true"
      >
        <span className="instr-grain" />
      </div>
      <span className="instr-progress" aria-hidden="true" />
    </>
  );
}
