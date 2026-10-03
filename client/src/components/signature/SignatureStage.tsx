import { TabularCounter } from "@/components/signature/SignalType";
import { releases as catalogReleases } from "@/content/artistPlatform";
import {
  publicJourney,
  publicPlatformLinks,
  usePublicArtistContent,
} from "@/content/publicContent";
import { useSignatureState } from "@/signature/useSignature";
import "./SignatureStage.css";

/**
 * Panggung wordmark.
 *
 * Ini satu-satunya tempat partikel menyusun nama: sebuah bidang kosong milik
 * sendiri, bukan tumpukan di belakang judul hero. Strukturnya dua lapis:
 * `data-signal-stage-track` (jalur scroll yang tingginya dibaca runtime
 * menjadi progres 0..1) dan `data-signal-stage` (kotak yang diukur partikel).
 *
 * `data-live` mengikuti runtime: hanya `true` kalau particle field benar-
 * benar hidup di perangkat ini. Kalau tidak (reduced motion, hemat data,
 * perangkat lemah, atau JS mati), jalur panjangnya runtuh jadi section biasa
 * dan wordmark tetap terbaca sebagai teks di DOM untuk screen reader dan
 * mesin pencari.
 *
 * Isi panggung = IDENTITAS SAJA (Phase 3 §2 baris 1): nama, baris aka, dan
 * statistik yang dihitung. Baris era/jalan-perjalanan lama sengaja dihapus —
 * isian itu milik /universe (PERJALANAN) dan tidak boleh diulang di beranda.
 *
 * Scroll tetap scroll: tidak ada event yang dicegat, semuanya `position:
 * sticky` biasa.
 */

type StageCopy = {
  releases: string;
  since: string;
  platforms: string;
};

const COPY: Record<"id" | "en", StageCopy> = {
  id: { releases: "RILISAN", since: "MULAI", platforms: "PLATFORM" },
  en: { releases: "RELEASES", since: "SINCE", platforms: "PLATFORMS" },
};

/** Tahun pertama yang bisa dibaca dari milestone perjalanan; jatuh ke 2020. */
function startYearOf(years: string[]) {
  for (const year of years) {
    const parsed = Number.parseInt(year, 10);
    if (Number.isFinite(parsed) && parsed > 1900) return parsed;
  }
  return 2020;
}

export function SignatureStage({
  alsoKnownAs,
  lang = "id",
}: {
  alsoKnownAs: string;
  lang?: "id" | "en";
}) {
  const tier = useSignatureState(snapshot => snapshot.capability.tier);
  const ready = useSignatureState(snapshot => snapshot.fieldReady);
  const live = ready && tier !== "off";
  const copy = COPY[lang];

  const cms = usePublicArtistContent();
  const journey = publicJourney(cms.data);
  const platforms = publicPlatformLinks(cms.data).length;
  const releaseCount = cms.data?.releases?.length || catalogReleases.length;
  const startYear = startYearOf(journey.milestones.map(m => m.year));

  return (
    <section className="an-signature-stage" data-live={live}>
      <div className="an-signature-stage-track" data-signal-stage-track>
        <div className="an-signature-stage-sticky">
          <div className="an-signature-stage-field" data-signal-stage>
            <h2 className="an-signature-stage-word">
              <span>AKBAR</span> <span>NAWASUNDA</span>
            </h2>
            {/* Nama alternatif yang ikut disusun partikel saat digulir —
                tetap ada di DOM supaya terbaca screen reader dan crawler. */}
            <p className="sr-only">{alsoKnownAs}</p>
          </div>

          <div className="an-signature-stage-context">
            <dl className="an-signature-stage-stats">
              <div>
                <dt className="sr-only">{copy.releases}</dt>
                <dd>
                  <TabularCounter value={releaseCount} label={copy.releases} />
                </dd>
              </div>
              <div>
                <dt className="sr-only">{copy.since}</dt>
                <dd>
                  <TabularCounter value={startYear} label={copy.since} />
                </dd>
              </div>
              <div>
                <dt className="sr-only">{copy.platforms}</dt>
                <dd>
                  <TabularCounter value={platforms} label={copy.platforms} />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
