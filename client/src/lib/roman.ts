/**
 * Angka Romawi untuk daftar pendek (platform resmi, dsb).
 *
 * Dipakai di tempat yang dulu memakai nomor Arab berpadding-nol
 * (`01`, `02`, ...) — permintaan langsung: daftar kanal sosial terasa
 * lebih "editorial" dengan angka Romawi daripada nomor dua digit generik.
 *
 * Hanya mendukung 1..3999 (batas notasi Romawi klasik tanpa tanda garis
 * atas); daftar nyata di situs ini jauh lebih pendek dari itu, jadi input
 * di luar jangkauan jatuh ke representasi Arab biasa daripada melempar.
 */
const ROMAN_TABLE: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function toRoman(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 3999) {
    return String(value);
  }
  let remaining = value;
  let result = "";
  for (const [amount, symbol] of ROMAN_TABLE) {
    while (remaining >= amount) {
      result += symbol;
      remaining -= amount;
    }
  }
  return result;
}
