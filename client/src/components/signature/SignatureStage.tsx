import { MaterialLiquidField } from "@/components/signature/MaterialLiquidField";
import { SundaScript } from "@/components/signature/SundaScript";
import { TabularCounter } from "@/components/signature/SignalType";
import { SUNDA_NAME } from "@/content/sundaneseScript";
import {
  PHRASE_SCROLL_TARGET,
  STAGE_PHRASES,
  STAGE_PHRASE_META,
} from "@/signature/stagePhrases";
import { releases as catalogReleases } from "@/content/artistPlatform";
import {
  publicJourney,
  publicPlatformLinks,
  usePublicArtistContent,
} from "@/content/publicContent";
import { useSignatureState } from "@/signature/useSignature";
import { useCallback, useRef } from "react";
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
  /** Judul daftar frasa saat partikel hidup… */
  spelling: string;
  /** …dan saat tidak. Panggung tidak boleh mengaku sedang menyusun apa pun
      kalau partikelnya memang mati. */
  spellingStatic: string;
  /** Label aksi tombol frasa, `%s` diganti nama yang dituju. */
  jump: (name: string) => string;
};

const COPY: Record<"id" | "en", StageCopy> = {
  id: {
    releases: "RILISAN",
    since: "MULAI",
    platforms: "PLATFORM",
    spelling: "NAMA YANG DISUSUN",
    spellingStatic: "NAMA & ALIAS",
    jump: name => `Gulir ke bagian saat partikel menyusun ${name}`,
  },
  en: {
    releases: "RELEASES",
    since: "SINCE",
    platforms: "PLATFORMS",
    spelling: "NAMES BEING SPELLED",
    spellingStatic: "NAME & ALIAS",
    jump: name => `Scroll to where the particles spell ${name}`,
  },
};

/**
 * Tahun "MULAI" yang ditampilkan mengikuti frasa yang SEDANG disusun
 * partikel — dulu satu angka tetap untuk seluruh panggung, padahal
 * "AKBAR NAWASUNDA" dan "DJ AKBAR REMIX" adalah dua identitas dengan dua
 * sejarah berbeda. Kalau partikel berpindah nama, angka tahunnya harus
 * ikut berpindah.
 *
 * Dicocokkan lewat TEKS judul (`STAGE_PHRASE_META[i].text` vs
 * `journey.milestones[].title`), bukan indeks — urutannya memang berbeda:
 * milestone perjalanan dimulai dari alias (2020), sedangkan daftar frasa
 * panggung dimulai dari nama resmi. Kalau milestone-nya bertahun pasti,
 * pakai itu. Kalau tidak (mis. "SEKARANG" — era yang masih berjalan sampai
 * hari ini), pakai tahun kalender saat ini: itulah makna harfiah "sekarang",
 * dan angkanya akan ikut maju tiap tahun tanpa perlu disentuh lagi.
 */
function yearForPhrase(
  phraseText: string,
  milestones: { year: string; title: string }[]
) {
  const normalized = phraseText.trim().toLowerCase();
  const match = milestones.find(
    milestone => milestone.title.trim().toLowerCase() === normalized
  );
  if (match) {
    const parsed = Number.parseInt(match.year, 10);
    if (Number.isFinite(parsed) && parsed > 1900) return parsed;
  }
  return new Date().getFullYear();
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
  // Frasa yang SEDANG disusun partikel. State diskret (hanya berubah sekali
  // sepanjang jalur), jadi aman dibaca React.
  const activePhrase = useSignatureState(snapshot => snapshot.stagePhrase);
  const trackRef = useRef<HTMLDivElement | null>(null);

  /**
   * Bawa pengunjung ke posisi jalur tempat frasa ke-`index` tersusun utuh.
   *
   * Ini BUKAN membajak scroll: tidak ada event yang dicegat, tidak ada
   * animasi buatan. Rumusnya kebalikan persis dari cara runtime membaca
   * progres (`pointerSignal.readStage`): progres = -trackTop / (tinggi
   * jalur - tinggi viewport). Jadi tombol ini hanya menghitung ke mana
   * halaman harus digulir, lalu memakai `window.scrollTo` biasa.
   *
   * Hormat pada preferensi gerak: kalau pengguna meminta gerak dikurangi,
   * perpindahannya langsung (`auto`), bukan meluncur.
   */
  const jumpToPhrase = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track || typeof window === "undefined") return;
    const viewport = window.innerHeight || 1;
    const travel = Math.max(1, track.offsetHeight - viewport);
    const target =
      track.getBoundingClientRect().top +
      window.scrollY +
      (PHRASE_SCROLL_TARGET[index] ?? 0) * travel;
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: Math.max(0, target),
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);
  const copy = COPY[lang];

  const cms = usePublicArtistContent();
  const journey = publicJourney(cms.data);
  const platforms = publicPlatformLinks(cms.data).length;
  const releaseCount = cms.data?.releases?.length || catalogReleases.length;
  const startYear = yearForPhrase(
    STAGE_PHRASE_META[activePhrase]?.text ?? "",
    journey.milestones
  );

  return (
    <section className="an-signature-stage" data-live={live}>
      <div
        className="an-signature-stage-track"
        data-signal-stage-track
        ref={trackRef}
      >
        <div className="an-signature-stage-sticky">
          <div className="an-signature-stage-field" data-signal-stage>
            <MaterialLiquidField />
            {/* Teks panggung mengikuti frasa yang sedang disusun partikel.
                Dulu di sini selalu tertulis "AKBAR NAWASUNDA" sementara
                partikel sudah berpindah ke alias — DOM dan layar bercerita
                hal berbeda. Sekarang satu sumber: STAGE_PHRASES. */}
            <h2 className="an-signature-stage-word">
              {STAGE_PHRASES[activePhrase]?.map((word, index) => (
                <span key={`${word}-${index}`}>{word}</span>
              ))}
            </h2>
            <p className="sr-only">{alsoKnownAs}</p>
          </div>

          {/* DAFTAR FRASA — alias tidak boleh hanya hidup sebagai partikel.
              Partikel bisa mati (reduced motion, hemat data, perangkat
              lemah, JS gagal) dan titik yang sedang buyar tidak terbaca
              siapa pun. Baris ini selalu teks sungguhan, dan baris yang
              sedang disusun ditandai. */}
          <div className="an-signature-stage-phrases">
            <p className="an-signature-stage-phrases-label">
              {live ? copy.spelling : copy.spellingStatic}
            </p>
            <ol className="an-signature-stage-phrase-list">
              {STAGE_PHRASE_META.map((phrase, index) => {
                const body = (
                  <>
                    <span className="an-signature-stage-phrase-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="an-signature-stage-phrase-body">
                      <span className="an-signature-stage-phrase-text">
                        {phrase.text}
                      </span>
                      {/* Pelat aksara hanya menemani NAMA RESMI. Alias
                          adalah nama panggung berbahasa Inggris;
                          menuliskannya dengan aksara Sunda akan jadi
                          kostum, bukan identitas. */}
                      {phrase.kind === "name" ? (
                        <SundaScript
                          entry={SUNDA_NAME}
                          lang={lang}
                          tone="inline"
                        />
                      ) : null}
                    </span>
                  </>
                );

                return (
                  <li key={phrase.text} data-kind={phrase.kind}>
                    {/* Peningkatan bertahap: tombol hanya muncul kalau
                        panggungnya benar-benar hidup. Tanpa particle field
                        jalur scroll-nya runtuh, jadi tombol yang menggulir
                        ke "posisi frasa" tidak akan menuju apa pun —
                        barisnya tetap tampil sebagai teks biasa. */}
                    {live ? (
                      <button
                        type="button"
                        className="an-signature-stage-phrase"
                        data-active={index === activePhrase}
                        aria-current={
                          index === activePhrase ? "true" : undefined
                        }
                        aria-label={copy.jump(phrase.text)}
                        onClick={() => jumpToPhrase(index)}
                      >
                        {body}
                      </button>
                    ) : (
                      <span
                        className="an-signature-stage-phrase"
                        data-active={false}
                      >
                        {body}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
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
