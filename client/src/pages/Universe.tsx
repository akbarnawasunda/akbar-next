import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import {
  officialBrand,
  releases,
} from "@/content/artistPlatform";
import {
  publicJourney,
  usePublicArtistContent,
} from "@/content/publicContent";
import {
  EditorialSection,
  SignalIndicator,
} from "@/components/editorial/EditorialKit";
import { EraTimeline } from "@/components/signature/EraTimeline";
import { publicEras } from "@/content/eras";
import { Reveal } from "@/components/Reveal";
import "./EcosystemPages.css";
import "./ArchiveStage.css";

/**
 * Salinan PERJALANAN dua bahasa. `UniverseView` dipakai `/universe` dan
 * `/en/universe`, jadi pembuka, catatan studio, dan indeks jalur keluar
 * selalu satu komposisi di kedua bahasa.
 *
 * Kontrak Phase 3 (baris 7): halaman ini menceritakan satu-satunya cerita
 * yang tidak diceritakan halaman lain — bagaimana satu artis menjadi dua
 * nama lintas era — lewat linimasa babak sebagai tulang punggung. TIDAK
 * berisi: biografi panjang (pemilik tunggal: /about), dinding artwork
 * terpisah (tiap babak sudah memuat rilisannya), blok foto (visual —
 * /visuals#portraits), baris layanan booking (tugas /epk).
 */
const copy = {
  id: {
    kicker: "Arsip resmi · 2020—sekarang",
    title: "Perjalanan Akbar Nawasunda.",
    lede:
      "Dari DJ Akbar Remix ke Akbar Nawasunda — satu katalog, beberapa babak, dan semua tautan resminya di satu tempat.",
    portraitAlt: "Artwork editorial Akbar Nawasunda dengan tema future city",
    portraitCaption: "Arsip visual",
    facts: { since: "Mulai", based: "Basis", releases: "Rilisan" },
    basedValue: "Bandung Barat",
    exploreCta: "Telusuri babak",
    timelineTitle: (
      <>
        SATU NAMA,
        <br />
        BANYAK BABAK.
      </>
    ),
    timelineLede:
      "Setiap babak terbaca penuh di halaman ini. Gulir untuk melihat garis babak menyala dan artwork terkait berganti.",
    timelineIndicator: "ARSIP INTERAKTIF",
    studioMeta: "Catatan visual",
    studioTitle: "Dari studio.",
    studioCopy:
      "Salah satu arah visual dari dunia Akbar Nawasunda: industrial, kontras, dan dekat dengan energi electronic bass.",
    studioNote: "Bukan rilisan audio",
    studioAlt: "Potret editorial Akbar Nawasunda dengan cahaya merah",
    studioCta: "Lihat visual",
    exitsMeta: "Jalur keluar",
    exitsTitle: "Lanjut dari sini.",
    exitsCopy:
      "Katalog penuh untuk didengar, arsip visual untuk dilihat — dua jalur resmi keluar dari halaman ini.",
    exits: [
      {
        number: "01",
        title: "Katalog rilisan",
        copy: "Semua rilisan, artwork, dan tautan dengar resminya.",
        href: "/music",
      },
      {
        number: "02",
        title: "Arsip visual",
        copy: "Tayangan resmi, arsip, dan studi potret.",
        href: "/visuals",
      },
    ],
  },
  en: {
    kicker: "Official archive · 2020—now",
    title: "The Akbar Nawasunda journey.",
    lede:
      "From DJ Akbar Remix to Akbar Nawasunda — one catalog, several chapters, and every official link in one place.",
    portraitAlt: "Editorial artwork of Akbar Nawasunda with a future city theme",
    portraitCaption: "Visual archive",
    facts: { since: "Started", based: "Based in", releases: "Releases" },
    basedValue: "Bandung Barat",
    exploreCta: "Explore the chapters",
    timelineTitle: (
      <>
        ONE NAME,
        <br />
        MANY CHAPTERS.
      </>
    ),
    timelineLede:
      "Every chapter reads in full on this page. Scroll to see the chapter line light up and the related artwork change.",
    timelineIndicator: "INTERACTIVE ARCHIVE",
    studioMeta: "Visual note",
    studioTitle: "From the studio.",
    studioCopy:
      "One visual direction from the Akbar Nawasunda world: industrial, high contrast, and close to the energy of electronic bass.",
    studioNote: "Not an audio release",
    studioAlt: "Editorial portrait of Akbar Nawasunda in red light",
    studioCta: "See the visuals",
    exitsMeta: "Exit routes",
    exitsTitle: "Continue from here.",
    exitsCopy:
      "The full catalog to listen, the visual archive to look — the two official exits from this page.",
    exits: [
      {
        number: "01",
        title: "Release catalog",
        copy: "Every release, artwork, and official listening link.",
        href: "/en/music",
      },
      {
        number: "02",
        title: "Visual archive",
        copy: "Official screenings, archive, and portrait studies.",
        href: "/en/visuals",
      },
    ],
  },
} as const;

export function UniverseView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
  const cms = usePublicArtistContent();
  const journey = publicJourney(cms.data);
  const cmsReleases = cms.data?.releases ?? [];
  // Katalog dihitung utuh (CMS + fallback statis) untuk fakta "Rilisan"
  // di pembuka — dinding artwork-nya sudah dihapus (Phase 3: tiap babak
  // memuat rilisannya sendiri di linimasa).
  const catalog = [
    ...cmsReleases.map(item => ({ title: item.title })),
    ...releases
      .filter(
        release =>
          !cmsReleases.some(
            item =>
              item.title.trim().toLowerCase() ===
              release.title.trim().toLowerCase()
          )
      )
      .map(release => ({ title: release.title })),
  ];
  const eras = publicEras(cms.data, locale);
  const readingGuide =
    locale === "en"
      ? journey.introEn || journey.intro
      : journey.intro || journey.introEn;

  return (
    <main id="main-content" tabIndex={-1}>
        {/* Pembuka arsip: satu potret arsip sebagai jangkar, dua nama di
            lede, dan pedoman baca yang menjelaskan cara membaca halaman. */}
        <section className="an-arc-hero" aria-labelledby="archive-title">
          <figure className="an-arc-hero-plate">
            <img
              src={officialBrand.archivePortrait}
              alt={t.portraitAlt}
              width={800}
              height={1000}
              loading="eager"
              decoding="async"
            />
            <figcaption>{t.portraitCaption}</figcaption>
          </figure>
          <div className="an-arc-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              {t.kicker}
            </p>
            <h1 id="archive-title">{t.title}</h1>
            <p className="an-arc-lede">{t.lede}</p>
            {readingGuide ? <p className="an-arc-lede">{readingGuide}</p> : null}
            <dl className="an-facts">
              <div>
                <dt>{t.facts.since}</dt>
                <dd>2020</dd>
              </div>
              <div>
                <dt>{t.facts.based}</dt>
                <dd>{t.basedValue}</dd>
              </div>
              <div>
                <dt>{t.facts.releases}</dt>
                <dd>{catalog.length}</dd>
              </div>
            </dl>
            <div className="an-arc-hero-actions">
              <a className="an-btn an-btn--quiet" href="#timeline">
                {t.exploreCta} <ArrowDown size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* Linimasa babak — tulang punggung halaman: satu nama, dua era,
            tiap era membuka dokumen rilisannya. */}
        <EditorialSection
          id="timeline"
          title={t.timelineTitle}
          lede={t.timelineLede}
          aside={<SignalIndicator label={t.timelineIndicator} />}
        >
          <EraTimeline eras={eras} lang={locale} />
        </EditorialSection>

        {/* Catatan dari studio: satu gambar, satu keterangan — jembatan
            menuju arsip visual tanpa memindah konten /visuals ke sini. */}
        <Reveal>
          <section
            className="an-section an-arc-studio"
            aria-labelledby="archive-studio-title"
          >
            <figure className="an-arc-studio-plate an-rise">
              <img
                src={officialBrand.editorialPortrait}
                alt={t.studioAlt}
                width={667}
                height={1000}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="an-arc-studio-copy an-rise">
              <p className="an-meta">{t.studioMeta}</p>
              <h2 id="archive-studio-title" className="an-title">
                {t.studioTitle}
              </h2>
              <p>{t.studioCopy}</p>
              <p className="an-arc-note">{t.studioNote}</p>
              <div className="an-arc-hero-actions">
                <Link
                  className="an-btn an-btn--quiet"
                  href={locale === "en" ? "/en/visuals" : "/visuals"}
                >
                  {t.studioCta} <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Indeks jalur keluar: dua rute resmi. Baris layanan (remix/
            booking/licensing) adalah tugas /epk, bukan halaman cerita. */}
        <section
          className="an-section an-arc-routes"
          aria-labelledby="archive-routes-title"
        >
          <div className="an-arc-route-head">
            <p className="an-meta">{t.exitsMeta}</p>
            <h2 id="archive-routes-title" className="an-title">
              {t.exitsTitle}
            </h2>
            <p>{t.exitsCopy}</p>
          </div>
          <ul className="an-index an-arc-route-list">
            {t.exits.map(route => (
              <li key={route.title}>
                <Link className="an-index-row" href={route.href}>
                  <span className="an-meta">{route.number}</span>
                  <span className="an-arc-route-copy">
                    <strong>{route.title}</strong>
                    <small>{route.copy}</small>
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
    </main>
  );
}

export default function Universe() {
  return (
    <div className="nf-page an-archive-page">
      <NightHeader active="/universe" />
      <UniverseView locale="id" />
      <NightFooter />
    </div>
  );
}
