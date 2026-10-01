import { useSignatureState } from "@/signature/useSignature";
import "./SignatureStage.css";

/**
 * Panggung wordmark.
 *
 * Ini satu-satunya tempat partikel menyusun nama: sebuah bidang kosong milik
 * sendiri, bukan tumpukan di belakang judul hero (di sana partikel dan teks
 * sama-sama kalah terbaca).
 *
 * Strukturnya dua lapis:
 * - `data-signal-stage-track` — jalur scroll yang tinggi. Posisinya dibaca
 *   runtime menjadi progres 0..1 untuk mengganti kata yang disusun partikel.
 * - `data-signal-stage` — kotak sticky tempat huruf benar-benar digambar.
 *
 * Scroll tetap scroll: tidak ada event yang dicegat, tidak ada scrolljacking.
 * Semuanya `position: sticky` biasa, jadi keyboard, roda, dan assistive
 * technology bekerja seperti halaman normal.
 *
 * Tanpa JavaScript, saat runtime mematuhi reduced motion / hemat data, atau
 * di perangkat yang terlalu lemah, jalur panjangnya runtuh jadi satu section
 * biasa dan teksnya tampil utuh.
 */
export function SignatureStage({
  index,
  caption,
  note,
  alsoKnownAs,
}: {
  index: string;
  caption: string;
  note: string;
  alsoKnownAs: string;
}) {
  const tier = useSignatureState(snapshot => snapshot.capability.tier);
  const ready = useSignatureState(snapshot => snapshot.fieldReady);
  const live = ready && tier !== "off";

  return (
    <section className="an-signature-stage" data-live={live}>
      <div className="an-signature-stage-track" data-signal-stage-track>
        <div className="an-signature-stage-sticky">
          <div className="an-signature-stage-head">
            <span className="an-signature-stage-index">{index}</span>
            <span className="an-signature-stage-caption">{caption}</span>
          </div>

          <div className="an-signature-stage-field" data-signal-stage>
            <h2 className="an-signature-stage-word">
              <span>AKBAR</span> <span>NAWASUNDA</span>
            </h2>
            {/* Nama alternatif yang ikut disusun partikel saat digulir —
                tetap ada di DOM supaya terbaca screen reader dan crawler. */}
            <p className="sr-only">{alsoKnownAs}</p>
          </div>

          <p className="an-signature-stage-note">{note}</p>
        </div>
      </div>
    </section>
  );
}
