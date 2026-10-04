import type { SundaneseEntry } from "@/content/sundaneseScript";
import { SUNDA_LABEL } from "@/content/sundaneseScript";
import "./SundaScript.css";

/**
 * PELAT NAMA AKSARA SUNDA.
 *
 * Masalah versi pertama (dan kenapa komponen ini ada):
 * deret aksara ditempel begitu saja di bawah judul, dengan ukuran kecil,
 * `line-height` 1.5, dan tanpa kunci baca. Hasilnya dua hal buruk
 * sekaligus — tanda atas/bawah huruf (rarangkén) terjepit sehingga
 * bentuknya rusak, dan bagi yang tidak mengenal aksaranya ia hanya
 * "karakter aneh" tanpa penjelasan.
 *
 * Komponen ini memperbaikinya dengan tiga keputusan:
 * 1. UKURAN & RUANG. Aksara tidak pernah lebih kecil dari teks isi dan
 *    selalu punya `line-height` longgar, jadi tanda tempelnya utuh.
 * 2. SELALU BERPASANGAN. Aksara tidak pernah tampil sendirian: di
 *    sebelahnya ada label mono ("AKSARA SUNDA") dan bacaan Latinnya.
 *    Pembaca mendapat kunci, bukan teka-teki.
 * 3. SATU SUMBER. Isinya datang dari `client/src/content/sundaneseScript.ts`,
 *    tidak pernah ditulis ulang di halaman.
 *
 * AKSESIBILITAS. Seluruh pelat `aria-hidden` di tempat yang namanya sudah
 * dibacakan oleh H1 atau teks `sr-only` di dekatnya (hero dan panggung) —
 * kalau tidak, pembaca layar menyebut nama yang sama dua kali dan yang
 * kedua hampir pasti salah ucap. Pemanggil bisa mematikannya lewat
 * `decorative={false}` kalau suatu saat dipakai di tempat yang namanya
 * belum pernah disebut.
 *
 * KALAU FONT AKSARA GAGAL DIMUAT: `--font-sunda` jatuh ke font isi, deret
 * aksara mengecil jadi karakter pengganti, dan label + bacaan Latin di
 * sebelahnya tetap menjelaskan apa yang seharusnya ada di situ. Tidak ada
 * layout yang runtuh dan tidak ada informasi yang hilang.
 */
export function SundaScript({
  entry,
  lang = "id",
  tone = "hero",
  decorative = true,
}: {
  entry: SundaneseEntry;
  lang?: "id" | "en";
  /** `hero` = pelat penuh dengan kunci baca · `inline` = satu baris ringkas. */
  tone?: "hero" | "inline";
  decorative?: boolean;
}) {
  return (
    <p
      className="an-sunda"
      data-tone={tone}
      {...(decorative ? { "aria-hidden": true as const } : {})}
    >
      <span className="an-sunda-script" lang="su">
        {entry.script}
      </span>
      <span className="an-sunda-key">
        <span className="an-sunda-label">{SUNDA_LABEL[lang]}</span>
        <span className="an-sunda-dot" />
        <span className="an-sunda-latin">{entry.latin}</span>
      </span>
    </p>
  );
}
