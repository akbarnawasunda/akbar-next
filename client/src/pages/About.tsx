import { ArrowUpRight, MapPin, Radio } from "lucide-react";
import { Link } from "wouter";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { Reveal } from "@/components/Reveal";
import { SundaScript } from "@/components/signature/SundaScript";
import { SUNDA_NAME } from "@/content/sundaneseScript";
import { officialBrand, verifiedArtistProfile } from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./ArchiveStage.css";

/**
 * Salinan profil dua bahasa. `AboutView` dipakai `/about` dan `/en/about`,
 * jadi biografi, kutipan, pita potret, CTA, dan jalur lanjut selalu satu
 * komposisi di kedua bahasa.
 */
const copy = {
  id: {
    kicker: "Profil artis",
    title: "Akbar Nawasunda.",
    heroTitle: "Akbar Nawasunda.",
    portraitAlt: "Potret resmi Akbar Nawasunda",
    portraitCaption: "Potret resmi",
    facts: { based: "Basis", alias: "Alias", since: "Mulai" },
    listenCta: "Dengar musik",
    listenHref: "/music",
    bioMeta: "Biografi",
    bioTitle: "Perjalanan musik.",
    statementFallback:
      "Karya orisinal dirilis sebagai Akbar Nawasunda; katalog remix juga dikenal melalui DJ Akbar Remix.",
    bandLabel: "Nama, ditulis dengan aksara Sunda",
    bandCaption: "Akbar Nawasunda ditulis dalam aksara Sunda — akar Bandung Barat yang tetap melekat di tiap rilisan.",
    outlineMeta: "Satu jalur keluar",
    outlineCopy:
      "Booking panggung, remix, lisensi, atau kolaborasi — semuanya masuk lewat satu jalur inquiry resmi.",
    outlineCta: "KIRIM INQUIRY",
    outlineHref: "/inquire?source=about",
    pathMeta: "Lanjut dari sini",
    pathTitle: "Dengar, telusuri, atau ajak kerja sama.",
    path: [
      {
        href: "/music",
        title: "Dengar rilisan",
        copy: "Katalog lengkap dengan artwork, metadata, dan tautan dengar resmi.",
      },
      {
        href: "/universe",
        title: "Telusuri perjalanan",
        copy: "Satu nama, dua era — linimasa babak dan rilisannya.",
      },
      {
        href: "/epk",
        title: "EPK & press kit",
        copy: "Bio siap pakai, foto resmi, dan kebutuhan promo untuk media.",
      },
      {
        href: "/live",
        title: "Jadwal live",
        copy: "Tanggal terkonfirmasi dan jalur booking panggung.",
      },
    ],
  },
  en: {
    kicker: "ARTIST PROFILE",
    title: "Akbar Nawasunda.",
    heroTitle: "Akbar Nawasunda.",
    portraitAlt: "Official portrait of Akbar Nawasunda",
    portraitCaption: "Official portrait",
    facts: { based: "Based in", alias: "Alias", since: "Active since" },
    listenCta: "Hear the music",
    listenHref: "/en/music",
    bioMeta: "Biography",
    bioTitle: "The musical journey.",
    statementFallback:
      "Original work is released as Akbar Nawasunda; the remix catalog is also known through DJ Akbar Remix.",
    bandLabel: "His name, written in Sundanese script",
    bandCaption: "Akbar Nawasunda written in Sundanese script — the West Bandung root that stays in every release.",
    outlineMeta: "One official route",
    outlineCopy:
      "Stage booking, remix, licensing, or collaboration — it all arrives through one official inquiry route.",
    outlineCta: "SEND INQUIRY",
    outlineHref: "/en/inquire?source=about",
    pathMeta: "Continue from here",
    pathTitle: "Listen, explore, or start a collaboration.",
    path: [
      {
        href: "/en/music",
        title: "Hear the releases",
        copy: "The full catalog with artwork, metadata, and official listening links.",
      },
      {
        href: "/en/universe",
        title: "Follow the journey",
        copy: "One name, two eras — the chapter timeline and its releases.",
      },
      {
        href: "/en/epk",
        title: "EPK & press kit",
        copy: "A ready biography, official photos, and promo material for media.",
      },
      {
        href: "/en/live",
        title: "Live dates",
        copy: "Confirmed dates and the stage booking route.",
      },
    ],
  },
} as const;

export function AboutView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
  const cms = usePublicArtistContent();
  const profile = cms.data?.profile;
  // CMS profil belum punya field EN, jadi bahasa Inggris memakai fallback
  // resmi (artistPlatform) supaya halaman EN tidak menampilkan teks ID.
  const shortBio =
    locale === "en"
      ? verifiedArtistProfile.shortBioEn
      : profile?.shortBio || verifiedArtistProfile.shortBio;
  // /about adalah pemilik biografi panjang; halaman lain memakai versi
  // singkatnya sendiri supaya tidak ada paragraf yang diulang antarhalaman.
  const longBio =
    locale === "en"
      ? verifiedArtistProfile.longBioEn
      : profile?.longBio || verifiedArtistProfile.longBio;
  const genres = profile?.genres?.length
    ? profile.genres
    : verifiedArtistProfile.genres;
  const location = profile?.location || verifiedArtistProfile.location;
  const locationUrl = profile?.locationUrl;
  const portrait = profile?.portraitImage || officialBrand.portrait;

  return (
    <main id="main-content" tabIndex={-1}>
        {/* Potret resmi dan identitas: foto memegang separuh halaman,
            tipografi tidak ditumpuk di atasnya. */}
        <section className="an-ab-hero" aria-labelledby="about-title">
          <figure className="an-ab-hero-plate">
            <ResilientArtworkImage
              src={portrait}
              backupSrc={officialBrand.portraitFallback}
              alt={t.portraitAlt}
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>{t.portraitCaption}</figcaption>
          </figure>
          <div className="an-ab-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              {t.kicker}
            </p>
            <h1 id="about-title">{t.heroTitle}</h1>
            <p className="an-ab-lede">{shortBio}</p>
            {/* Dulu tiga kotak statistik (Basis/Alias/Sejak) — bentuk yang
                sama persis diulang di /visuals dan /universe, jadi halaman
                ini terasa seperti templat "infobox" generik. Alias-nya pun
                sudah tertulis lagi di bawah (baris "Aka ..." pada aside
                biografi). Sekarang basis & tahun aktif jadi satu baris
                keterangan — bahasa metadata yang sama dipakai label
                platform/tanggal di seluruh situs, bukan kartu statistik. */}
            <p className="an-meta an-ab-meta-line">
              {t.facts.based} {location} · {t.facts.since.toLowerCase()} 2020
            </p>
            <div className="an-ab-hero-actions">
              <Link className="an-btn an-btn--solid" href={t.listenHref}>
                {t.listenCta} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              {locationUrl ? (
                <a
                  className="an-btn an-btn--quiet"
                  href={locationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin size={14} aria-hidden="true" /> {location}
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* Biografi sebagai halaman baca: satu kolom teks yang terukur,
            pernyataan artis jadi kutipan besar. */}
        <Reveal>
          <section
            className="an-section an-ab-bio"
            aria-labelledby="about-bio-title"
          >
            <div className="an-ab-bio-aside an-rise">
              <p className="an-meta">{t.bioMeta}</p>
              <p className="an-meta">
                Aka {verifiedArtistProfile.aliases.join(" / ")}
              </p>
            </div>
            <div className="an-ab-bio-body an-rise">
              <h2 id="about-bio-title" className="an-title">
                {t.bioTitle}
              </h2>
              <p className="an-ab-long">{longBio}</p>
              {profile?.artistStatement ? (
                <blockquote className="an-ab-quote">
                  “{profile.artistStatement}”
                </blockquote>
              ) : (
                <p className="an-ab-long">{t.statementFallback}</p>
              )}
              <ul className="an-ab-genres">
                {genres.map(genre => (
                  <li key={genre}>
                    <Radio size={12} aria-hidden="true" /> {genre}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        {/* Jeda visual sebelum jalur lanjut — bukan foto kedua (lihat
            akbar-next#liquid-signal: foto editorial di sini dulu adalah
            komposit AI "cyberpunk poster", bukan potret asli). Namanya
            sendiri, dalam aksara Sunda, jadi gambarnya: identitas dari
            materi yang nyata, bukan dekorasi karangan. */}
        <section className="an-ab-band" aria-label={t.bandLabel}>
          <SundaScript entry={SUNDA_NAME} lang={locale} tone="monument" />
          <p className="an-ab-band-caption">{t.bandCaption}</p>
        </section>

        {/* Pitch booking direduksi jadi SATU jalur keluar (Phase 3:
            layanan/harga/form adalah tugas /epk — bukan /about). */}
        <section className="an-section an-ab-outline" aria-label={t.outlineMeta}>
          <p className="an-meta">{t.outlineMeta}</p>
          <p className="an-ab-outline-copy">{t.outlineCopy}</p>
          <a className="an-btn an-btn--quiet" href={t.outlineHref}>
            {t.outlineCta} <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </section>

        <section
          className="an-section an-ab-path"
          aria-labelledby="about-path-title"
        >
          <header className="an-head">
            <p className="an-meta">{t.pathMeta}</p>
            <h2 id="about-path-title" className="an-title">
              {t.pathTitle}
            </h2>
          </header>
          <div className="an-ab-path-grid">
            {t.path.map(item => (
              <Link className="an-ab-path-item" href={item.href} key={item.title}>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.copy}</small>
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
    </main>
  );
}

export default function About() {
  return (
    <div className="nf-page an-about-page">
      <NightHeader active="/about" />
      <AboutView locale="id" />
      <NightFooter />
    </div>
  );
}
