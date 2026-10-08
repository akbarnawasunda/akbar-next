import { useEffect, useState } from "react";
import { ArrowUpRight, Download, Mail, Printer } from "lucide-react";
import { Link } from "wouter";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { EmailText } from "@/components/EmailText";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import {
  formatPublicIndex,
  officialBrand,
  releases,
  verifiedArtistProfile,
} from "@/content/artistPlatform";
import { publicPlatformLinks, usePublicArtistContent } from "@/content/publicContent";
import { Reveal } from "@/components/Reveal";
import "./EcosystemPages.css";
import "./EpkReady.css";
import "./PressStage.css";

const capabilityType = ["remix", "remix", "collaboration", "licensing"] as const;

/**
 * Salinan EPK dua bahasa. `PressView` dipakai `/epk` dan `/en/epk`, jadi
 * lembar fakta, daftar aset, rail rilisan, dan panel kontak selalu satu
 * komposisi di kedua bahasa.
 */
const copy = {
  id: {
    kicker: "Lembar fakta artis",
    // Phase 3 §8: H1 = "Press & booking." (purpose-first) — nama artis
    // sudah menjadi brand persisten di header, tidak perlu diulang di H1.
    title: "Press & booking.",
    ledeFallback:
      "Informasi untuk promoter, media, playlist editor, dan kolaborator.",
    contactCta: "Kontak press",
    printCta: "SAVE / PRINT EPK",
    sheetLabel: "Identitas & kontak",
    sheetFacts: {
      basedIn: "Berbasis di",
      alias: "Alias",
      role: "Peran",
      roleValue: "Producer / Remixer",
      bio: "Bio singkat",
      genres: "Genre",
      contact: "Kontak",
    },
    portraitAlt: "Potret editorial Akbar Nawasunda",
    summaryMeta: "Ringkasan",
    summaryTitle: "Tentang Akbar Nawasunda.",
    workFormatsMeta: "Format kerja",
    capabilitiesFallback:
      "Format kerja yang tersedia untuk performance, produksi, kolaborasi, dan penggunaan musik.",
    capabilityCopy: [
      "Request remix dengan brief, referensi, dan target rilis yang jelas.",
      "Aransemen khusus untuk memperkuat karakter lagu dan kebutuhan konten.",
      "Bangun karya bersama dari ide awal sampai materi siap dipublikasikan.",
      "Lisensi musik untuk kebutuhan konten, partner, dan penggunaan komersial.",
    ],
    licensingLabel: "LICENSING NOTE",
    assetsMeta: "Aset",
    assetsTitle: "Aset yang tersedia secara resmi.",
    assetsNotePublished:
      "Aset yang tersedia secara resmi dapat diakses langsung dari baris di bawah.",
    assetsNoteRequest:
      "Aset yang tersedia secara resmi untuk event tambahan dapat diminta melalui kontak press resmi.",
    assetsRequestAction: "Request by email",
    assetsOpenAction: "Open official asset",
    releasesMeta: "Rilisan pilihan",
    releasesTitle: "Tautan resmi untuk editor dan promotor.",
    releasesCta: "Buka katalog",
    releasesHref: "/music",
    contactLabel: "Kontak",
    contactTitle: "Kontak proyek.",
    contactCopy:
      "Kirim konteks untuk performance, remix, kolaborasi, atau licensing. Ketersediaan dan tarif dikonfirmasi setelah inquiry ditinjau.",
    contactLinks: {
      bookingTitle: "Booking inquiry",
      bookingCopy: "Performance, acara, dan festival.",
      remixTitle: "Remix / collaborate",
      remixCopy: "Remix, aransemen, dan kolaborasi rilisan.",
      pressTitle: "Press contact",
      pressCopy: "Materi publikasi, wawancara, dan kebutuhan media.",
    },
    platformsMeta: "Platform resmi",
    platformsTitle: "Dengar di kanal resminya.",
    mailSubjects: {
      pressInquiry: "Press / booking inquiry",
      pressMaterial: "Press material request",
    },
    coreAssets: [
      {
        label: "BRAND MARK",
        title: "Official logo",
        copy: "Logo resmi Akbar Nawasunda untuk kebutuhan pengenalan dan materi publikasi.",
      },
      {
        label: "IDENTITY VISUAL",
        title: "Official visual",
        copy: "Visual identitas resmi yang dapat dilihat sebagai referensi publikasi digital.",
      },
      {
        label: "PRESS CONTACT",
        title: "Request material",
        copy: "Untuk materi beresolusi tinggi atau kebutuhan khusus event, hubungi jalur resmi.",
      },
    ],
    cmsAssets: [
      {
        label: "ONE SHEET",
        title: "Artist one sheet",
        copy: "Ringkasan artis untuk kebutuhan editorial dan booking.",
      },
      {
        label: "PRESS IMAGES",
        title: "Press image set",
        copy: "Materi visual resmi untuk publikasi dan promosi.",
      },
      {
        label: "BRAND KIT",
        title: "Logo package",
        copy: "Paket logo resmi untuk kebutuhan partner dan media.",
      },
      {
        label: "SHOW NOTES",
        title: "Event requirements",
        copy: "Dokumen kebutuhan teknis untuk koordinasi pertunjukan.",
      },
    ],
  },
  en: {
    kicker: "Artist fact sheet",
    // Phase 3 §8: H1 = "Press & booking." (purpose-first) — the artist
    // name is already the persistent header brand.
    title: "Press & booking.",
    ledeFallback:
      "Information for promoters, media, playlist editors, and collaborators.",
    contactCta: "Press contact",
    printCta: "SAVE / PRINT EPK",
    sheetLabel: "Identity & contact",
    sheetFacts: {
      basedIn: "Based in",
      alias: "Alias",
      role: "Role",
      roleValue: "Producer / Remixer",
      bio: "Short bio",
      genres: "Genres",
      contact: "Contact",
    },
    portraitAlt: "Editorial portrait of Akbar Nawasunda",
    summaryMeta: "Overview",
    summaryTitle: "About Akbar Nawasunda.",
    workFormatsMeta: "Working formats",
    capabilitiesFallback:
      "Working formats available for performance, production, collaboration, and music usage.",
    capabilityCopy: [
      "Request a remix with a clear brief, references, and release target.",
      "Custom arrangement to strengthen a song's character and content needs.",
      "Build a work together from the first idea through publishable material.",
      "Music licensing for content, partner, and commercial use.",
    ],
    licensingLabel: "LICENSING NOTE",
    assetsMeta: "Assets",
    assetsTitle: "Officially available assets.",
    assetsNotePublished:
      "Officially published assets open directly from the rows below.",
    assetsNoteRequest:
      "Available on request. Additional official event assets can be requested through the official press contact.",
    assetsRequestAction: "Request by email",
    assetsOpenAction: "Open official asset",
    releasesMeta: "Selected releases",
    releasesTitle: "Official links for editors and promoters.",
    releasesCta: "Open catalog",
    releasesHref: "/en/music",
    contactLabel: "Contact",
    contactTitle: "Project contact.",
    contactCopy:
      "Send the context for a performance, remix, collaboration, or licensing request. Availability and terms are confirmed after the inquiry is reviewed.",
    contactLinks: {
      bookingTitle: "Booking inquiry",
      bookingCopy: "Performance, events, and festivals.",
      remixTitle: "Remix / collaborate",
      remixCopy: "Remix, arrangement, and release collaboration.",
      pressTitle: "Press contact",
      pressCopy: "Publication material, interviews, and media needs.",
    },
    platformsMeta: "Official platforms",
    platformsTitle: "Listen on the official channels.",
    mailSubjects: {
      pressInquiry: "Press / booking inquiry",
      pressMaterial: "Press material request",
    },
    coreAssets: [
      {
        label: "BRAND MARK",
        title: "Official logo",
        copy: "The official Akbar Nawasunda logo for recognition and publication material.",
      },
      {
        label: "IDENTITY VISUAL",
        title: "Official visual",
        copy: "The official identity visual, usable as a reference for digital publication.",
      },
      {
        label: "PRESS CONTACT",
        title: "Request material",
        copy: "For high-resolution material or special event needs, use the official route.",
      },
    ],
    cmsAssets: [
      {
        label: "ONE SHEET",
        title: "Artist one sheet",
        copy: "Artist summary for editorial and booking use.",
      },
      {
        label: "PRESS IMAGES",
        title: "Press image set",
        copy: "Official visual material for publication and promotion.",
      },
      {
        label: "BRAND KIT",
        title: "Logo package",
        copy: "Official logo package for partners and media.",
      },
      {
        label: "SHOW NOTES",
        title: "Event requirements",
        copy: "Technical requirement document for show coordination.",
      },
    ],
  },
} as const;

const mail = (address: string, subject: string) =>
  `mailto:${address}?subject=${encodeURIComponent(subject)}`;

const externalProps = (href: string) => ({
  href,
  target: href.startsWith("mailto:") ? undefined : "_blank",
  rel: href.startsWith("mailto:") ? undefined : "noreferrer",
});

export function PressView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
  const cms = usePublicArtistContent();
  const press = cms.data?.pressKit;
  const profile = cms.data?.profile;

  const [portraitSrc, setPortraitSrc] = useState(
    press?.editorialImage || profile?.portraitImage || officialBrand.editorialPortrait
  );

  const bookingEmail = press?.bookingEmail || verifiedArtistProfile.bookingEmail;
  const pressEmail = press?.pressEmail || bookingEmail;

  const selectedReleases = cms.data?.releases?.length
    ? cms.data.releases
        .map((item) => {
          const fallback = releases.find(
            (release) =>
              release.title.trim().toLowerCase() === item.title.trim().toLowerCase()
          );
          return {
            title: item.title,
            format: item.format || fallback?.format || "Release",
            year: item.year || fallback?.year || "—",
            platform: item.platform || fallback?.platform || "Official link",
            href: item.url || fallback?.href || "https://soundcloud.com/akbarnawasunda",
            image: item.artworkUrl || fallback?.image || officialBrand.socialPreview,
          };
        })
        .slice(0, 3)
    : releases.slice(0, 3);

  const editablePlatformLinks = publicPlatformLinks(cms.data);
  const portrait =
    press?.editorialImage || profile?.portraitImage || officialBrand.editorialPortrait;
  const bio = press?.snapshotBio || profile?.longBio || verifiedArtistProfile.longBio;
  // Lembar fakta memakai bio SINGKAT yang terverifikasi (snapshot),
  // sedangkan bagian "Tentang" di bawah tetap memakai bio panjang.
  // CMS profil belum punya field EN, jadi versi EN memakai fallback resmi
  // supaya halaman EN tidak pernah menampilkan teks Indonesia.
  const shortBio =
    locale === "en"
      ? verifiedArtistProfile.shortBioEn
      : profile?.shortBio || verifiedArtistProfile.shortBio;
  const location =
    press?.snapshotLocation || profile?.location || verifiedArtistProfile.location;
  const genres = press?.snapshotGenres?.length
    ? press.snapshotGenres
    : profile?.genres?.length
      ? profile.genres
      : verifiedArtistProfile.genres;
  const alias = press?.snapshotAlias || verifiedArtistProfile.aliases.join(" / ");
  const capabilitiesIntro = press?.capabilitiesIntro || t.capabilitiesFallback;
  const licensingNote = press?.licensingNote || verifiedArtistProfile.licensing;

  useEffect(() => {
    setPortraitSrc(portrait);
  }, [portrait]);

  const coreAssets = [
    { ...t.coreAssets[0], href: officialBrand.logo },
    { ...t.coreAssets[1], href: officialBrand.socialPreview },
    {
      ...t.coreAssets[2],
      href: mail(pressEmail, t.mailSubjects.pressMaterial),
    },
  ];

  const cmsAssets = [
    { ...t.cmsAssets[0], href: press?.oneSheetUrl },
    { ...t.cmsAssets[1], href: press?.photoPackUrl },
    { ...t.cmsAssets[2], href: press?.logoPackUrl },
    { ...t.cmsAssets[3], href: press?.technicalRiderUrl },
  ].filter((asset): asset is typeof asset & { href: string } => Boolean(asset.href));

  const assets = [...coreAssets, ...cmsAssets];

  return (
    <main id="main-content" tabIndex={-1}>
        {/* EPK dibuka seperti lembar fakta: identitas di kiri, fact sheet
            dengan foto dan kontak di kanan. Printer tetap di baris pertama. */}
        <section className="an-press-hero" aria-labelledby="press-title">
          <div className="an-press-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              {t.kicker}
            </p>
            <h1 id="press-title">{t.title}</h1>
            <p className="an-press-lede">{press?.intro || t.ledeFallback}</p>
            <div className="an-press-hero-actions">
              <a
                className="an-btn an-btn--solid"
                {...externalProps(mail(pressEmail, t.mailSubjects.pressInquiry))}
              >
                <Mail size={14} aria-hidden="true" /> {t.contactCta}
              </a>
              <button
                className="an-btn an-btn--quiet an-press-print"
                type="button"
                onClick={() => window.print()}
              >
                <Printer size={14} aria-hidden="true" /> {t.printCta}
              </button>
            </div>
          </div>
          <aside className="an-press-sheet" aria-label={t.sheetLabel}>
            <figure className="an-press-sheet-plate">
              <img
                src={portraitSrc}
                alt={t.portraitAlt}
                width={667}
                height={1000}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={() => {
                  if (portraitSrc !== officialBrand.portraitFallback) {
                    setPortraitSrc(officialBrand.portraitFallback);
                  }
                }}
              />
            </figure>
            <dl className="an-press-sheet-facts">
              <div>
                <dt>{t.sheetFacts.basedIn}</dt>
                <dd>{location}</dd>
              </div>
              <div>
                <dt>{t.sheetFacts.alias}</dt>
                <dd>{alias}</dd>
              </div>
              <div>
                <dt>{t.sheetFacts.role}</dt>
                <dd>{t.sheetFacts.roleValue}</dd>
              </div>
              <div className="an-press-sheet-row--stack">
                <dt>{t.sheetFacts.bio}</dt>
                <dd className="an-press-sheet-bio">{shortBio}</dd>
              </div>
              <div>
                <dt>{t.sheetFacts.genres}</dt>
                <dd>{genres.join(" · ")}</dd>
              </div>
              {/* Baris kontak memegang lebar penuh sheet (seperti baris bio):
                  email adalah fakta terpenting dan satu token terpanjang —
                  satu kolom 58% tidak cukup untuknya di banyak lebar desktop
                  (docs/desktop-visual-qa-cursor-pass.md §3). */}
              <div className="an-press-sheet-row--stack">
                <dt>{t.sheetFacts.contact}</dt>
                <dd>
                  <a href={mail(pressEmail, t.mailSubjects.pressInquiry)}>
                    <EmailText value={pressEmail} />
                  </a>
                </dd>
              </div>
            </dl>
          </aside>
        </section>

        {/* Ringkasan dan format kerja: teks di kiri, indeks format di kanan. */}
        <Reveal>
          <section
            className="an-section an-press-summary"
            aria-labelledby="press-summary-title"
          >
            <div className="an-press-summary-copy an-rise">
              <p className="an-meta">{t.summaryMeta}</p>
              <h2 id="press-summary-title" className="an-title">
                {t.summaryTitle}
              </h2>
              <p className="an-press-bio">{bio}</p>
              <ul className="an-press-genres">
                {genres.map(genre => (
                  <li key={genre}>{genre}</li>
                ))}
              </ul>
            </div>
            <div className="an-press-summary-side an-rise">
              <p className="an-meta">{t.workFormatsMeta}</p>
              <p className="an-press-capabilities-intro">{capabilitiesIntro}</p>
              <ol className="an-index an-press-capability-list">
                {verifiedArtistProfile.services.map((service, index) => (
                  <li key={service}>
                    <Link
                      className="an-index-row"
                      href={`${locale === "en" ? "/en" : ""}/inquire?type=${
                        capabilityType[index] ?? "collaboration"
                      }&source=epk`}
                    >
                      <span className="an-meta">
                        {formatPublicIndex(index)}
                      </span>
                      <span className="an-press-capability-copy">
                        <strong>{service}</strong>
                        <small>
                          {t.capabilityCopy[index] ?? t.capabilityCopy[0]}
                        </small>
                      </span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="an-press-licensing-note">
                <strong>{t.licensingLabel}</strong> {licensingNote}
              </p>
            </div>
          </section>
        </Reveal>

        {/* Aset resmi sebagai baris yang bisa dibuka/diminta — bukan kartu. */}
        <section
          className="an-section an-press-assets"
          aria-labelledby="press-assets-title"
        >
          <header className="an-head an-head--row">
            <div>
              <p className="an-meta">{t.assetsMeta}</p>
              <h2 id="press-assets-title" className="an-title">
                {t.assetsTitle}
              </h2>
            </div>
            <p className="an-press-note">
              {cmsAssets.length
                ? t.assetsNotePublished
                : t.assetsNoteRequest}
            </p>
          </header>
          <ul className="an-index an-press-asset-list">
            {assets.map(asset => (
              <li key={asset.title}>
                <a
                  className="an-index-row an-press-asset"
                  {...externalProps(asset.href)}
                >
                  <span className="an-meta">{asset.label}</span>
                  <span className="an-press-asset-copy">
                    <strong>{asset.title}</strong>
                    <small>{asset.copy}</small>
                  </span>
                  <span className="an-press-asset-action">
                    {asset.href.startsWith("mailto:") ? (
                      <>
                        {t.assetsRequestAction}{" "}
                        <Mail size={13} aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        {t.assetsOpenAction}{" "}
                        <Download size={13} aria-hidden="true" />
                      </>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Rilisan pilihan sebagai rail, sama seperti katalog di beranda. */}
        <section
          className="an-section an-press-releases"
          aria-labelledby="press-releases-title"
        >
          <header className="an-head an-head--row">
            <div>
              <p className="an-meta">{t.releasesMeta}</p>
              <h2 id="press-releases-title" className="an-title">
                {t.releasesTitle}
              </h2>
            </div>
            <Link className="an-btn an-btn--quiet" href={t.releasesHref}>
              {t.releasesCta} <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </header>
          <div className="an-rail an-press-release-rail">
            {selectedReleases.map(release => (
              <a
                className="an-release"
                key={release.title}
                href={release.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="an-release-art">
                  <ResilientArtworkImage
                    src={release.image}
                    backupSrc={officialBrand.socialPreview}
                    alt={`Artwork ${release.title}`}
                  />
                </span>
                <span className="an-release-meta">
                  <small>
                    {release.platform} · {release.year}
                  </small>
                  <strong>{release.title}</strong>
                  <em>
                    {release.format} <ArrowUpRight size={12} aria-hidden="true" />
                  </em>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Panel kontak: satu-satunya permukaan terang di halaman ini. */}
        <section
          className="an-section an-epk-contact-panel"
          aria-labelledby="press-contact-title"
        >
          <div className="an-press-contact">
            <div className="an-press-contact-copy">
              <p className="an-press-contact-label">{t.contactLabel}</p>
              <h2 id="press-contact-title">{t.contactTitle}</h2>
              <p>{t.contactCopy}</p>
            </div>
            <div className="an-press-contact-actions">
              <Link
                className="an-press-contact-link"
                href={`${locale === "en" ? "/en" : ""}/inquire?type=booking&source=epk`}
              >
                <strong>{t.contactLinks.bookingTitle}</strong>
                <small>{t.contactLinks.bookingCopy}</small>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link
                className="an-press-contact-link"
                href={`${locale === "en" ? "/en" : ""}/inquire?type=remix&source=epk`}
              >
                <strong>{t.contactLinks.remixTitle}</strong>
                <small>{t.contactLinks.remixCopy}</small>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <a
                className="an-press-contact-link"
                {...externalProps(mail(pressEmail, t.mailSubjects.pressMaterial))}
              >
                <strong>{t.contactLinks.pressTitle}</strong>
                <small>{t.contactLinks.pressCopy}</small>
                <Mail size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          className="an-section an-press-platforms"
          aria-labelledby="press-platforms-title"
        >
          <header className="an-head">
            <p className="an-meta">{t.platformsMeta}</p>
            <h2 id="press-platforms-title" className="an-title">
              {t.platformsTitle}
            </h2>
          </header>
          <ul className="an-press-platform-list">
            {editablePlatformLinks.slice(0, 6).map(link => (
              <li key={link.label}>
                <a
                  className="an-press-platform"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <PlatformIcon label={link.label} />
                  <span>{link.label}</span>
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>
    </main>
  );
}

export default function PressKit() {
  return (
    <div className="nf-page an-epk-ready">
      <NightHeader active="/epk" />
      <PressView locale="id" />
      <NightFooter />
    </div>
  );
}
