import { useSignatureState } from "@/signature/useSignature";
import "./SignatureStage.css";

/**
 * Panggung wordmark.
 *
 * Ini satu-satunya tempat partikel menyusun nama AKBAR NAWASUNDA: sebuah
 * bidang kosong milik sendiri, bukan tumpukan di belakang judul hero (di sana
 * partikel dan teks sama-sama kalah terbaca).
 *
 * `data-signal-stage` dibaca Signature Runtime lewat satu pengukuran rect yang
 * sudah dibatasi rAF — halaman tidak memasang efeknya sendiri.
 *
 * Tanpa JavaScript, atau saat runtime mematuhi reduced motion / hemat data,
 * teks `h2`-nya tetap tampil utuh. Begitu particle field hidup, teks itu
 * dipudarkan (tetap di DOM untuk screen reader dan mesin pencari) dan
 * partikel yang mengambil alih.
 */
export function SignatureStage({
  index,
  caption,
  note,
}: {
  index: string;
  caption: string;
  note: string;
}) {
  const tier = useSignatureState(snapshot => snapshot.capability.tier);
  const ready = useSignatureState(snapshot => snapshot.fieldReady);
  const live = ready && tier !== "off";

  return (
    <section className="an-signature-stage" data-live={live}>
      <div className="an-signature-stage-head">
        <span className="an-signature-stage-index">{index}</span>
        <span className="an-signature-stage-caption">{caption}</span>
      </div>

      <div className="an-signature-stage-field" data-signal-stage>
        <h2 className="an-signature-stage-word">
          <span>AKBAR</span> <span>NAWASUNDA</span>
        </h2>
      </div>

      <p className="an-signature-stage-note">{note}</p>
    </section>
  );
}
