/**
 * Atmosfer "instrumen" NIGHT FREQUENCY — lapisan dekoratif halaman.
 *
 * Tiga hal yang perlu dipahami sebelum mengubah berkas ini:
 *
 * 1. TIDAK ADA MAKNA DATA di sini. Grid, grain, aurora, dan garis pindai
 *    hanya tekstur. Tidak ada satu pun angka atau klaim yang dibaca dari
 *    audio/rilisan, jadi tidak ada yang bisa menyesatkan.
 * 2. Murni dekoratif: seluruh pohon `aria-hidden`, `pointer-events: none`,
 *    dan tanpa teks. Pembaca layar tidak pernah menemukannya.
 * 3. Nol permintaan jaringan baru. Grain adalah satu SVG inline (data URI);
 *    sisanya gradien CSS. Tidak ada video, tidak ada canvas, tidak ada JS
 *    per-frame — jadi LCP/TBT tidak tersentuh.
 *
 * Dua lapis z-index sengaja dipisah:
 * - `--deep`  (di bawah konten) : aurora, grid, dan rel tepi halaman;
 * - `--film`  (di atas konten)  : grain + garis pindai tipis, supaya foto
 *   dan artwork ikut terasa seperti satu bahan cetak yang sama.
 * Keduanya tetap di bawah particle field (--z-field), player, dan nav.
 *
 * Garis progres gulir memakai CSS scroll-timeline (`@supports` di CSS).
 * Di peramban yang belum mendukungnya, garisnya tidak dirender sama sekali —
 * tidak ada indikator palsu yang macet di 0%.
 */
export function NightAtmosphere() {
  return (
    <>
      <div className="instr-atmosphere instr-atmosphere--deep" aria-hidden="true">
        <span className="instr-aurora" />
        <span className="instr-grid" />
        <span className="instr-rail instr-rail--left" />
        <span className="instr-rail instr-rail--right" />
      </div>
      <div className="instr-atmosphere instr-atmosphere--film" aria-hidden="true">
        <span className="instr-grain" />
        <span className="instr-scan" />
      </div>
      <span className="instr-progress" aria-hidden="true" />
    </>
  );
}
