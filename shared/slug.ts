/**
 * Satu-satunya pembuat slug rilisan.
 *
 * Slug dipakai di tempat yang harus sepakat: tautan katalog, command palette,
 * prefetch SSR, JSON-LD, dan resolver `/music/:slug`. Dulu fungsinya disalin
 * di enam berkas; kalau salah satu salinan berubah, tautan masih terlihat
 * benar tetapi mendarat di halaman kosong.
 */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
