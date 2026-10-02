import { useEffect, useState } from "react";
import { ArrowUpRight, Download, Mail, Printer } from "lucide-react";
import { Link } from "wouter";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
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

/** Salinan penjelasan per format kerja, sejajar dengan daftar layanan resmi. */
const capabilityCopy = [
  "Request remix dengan brief, referensi, dan target rilis yang jelas.",
  "Aransemen khusus untuk memperkuat karakter lagu dan kebutuhan konten.",
  "Bangun karya bersama dari ide awal sampai materi siap dipublikasikan.",
  "Lisensi musik untuk kebutuhan konten, partner, dan penggunaan komersial.",
];

const capabilityType = ["remix", "remix", "collaboration", "licensing"] as const;

const mail = (address: string, subject: string) =>
  `mailto:${address}?subject=${encodeURIComponent(subject)}`;

const externalProps = (href: string) => ({
  href,
  target: href.startsWith("mailto:") ? undefined : "_blank",
  rel: href.startsWith("mailto:") ? undefined : "noreferrer",
});

export default function PressKit() {
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
  const location =
    press?.snapshotLocation || profile?.location || verifiedArtistProfile.location;
  const genres = press?.snapshotGenres?.length
    ? press.snapshotGenres
    : profile?.genres?.length
      ? profile.genres
      : verifiedArtistProfile.genres;
  const alias = press?.snapshotAlias || verifiedArtistProfile.aliases.join(" / ");
  const capabilitiesIntro =
    press?.capabilitiesIntro ||
    "Format kerja yang tersedia untuk performance, produksi, kolaborasi, dan penggunaan musik.";
  const licensingNote = press?.licensingNote || verifiedArtistProfile.licensing;

  useEffect(() => {
    setPortraitSrc(portrait);
  }, [portrait]);

  const coreAssets = [
    {
      label: "BRAND MARK",
      title: "Official logo",
      copy: "Logo resmi Akbar Nawasunda untuk kebutuhan pengenalan dan materi publikasi.",
      href: officialBrand.logo,
    },
    {
      label: "IDENTITY VISUAL",
      title: "Official visual",
      copy: "Visual identitas resmi yang dapat dilihat sebagai referensi publikasi digital.",
      href: officialBrand.socialPreview,
    },
    {
      label: "PRESS CONTACT",
      title: "Request material",
      copy: "Untuk materi beresolusi tinggi atau kebutuhan khusus event, hubungi jalur resmi.",
      href: mail(pressEmail, "Press material request"),
    },
  ];

  const cmsAssets = [
    {
      label: "ONE SHEET",
      title: "Artist one sheet",
      copy: "Ringkasan artis untuk kebutuhan editorial dan booking.",
      href: press?.oneSheetUrl,
    },
    {
      label: "PRESS IMAGES",
      title: "Press image set",
      copy: "Materi visual resmi untuk publikasi dan promosi.",
      href: press?.photoPackUrl,
    },
    {
      label: "BRAND KIT",
      title: "Logo package",
      copy: "Paket logo resmi untuk kebutuhan partner dan media.",
      href: press?.logoPackUrl,
    },
    {
      label: "SHOW NOTES",
      title: "Event requirements",
      copy: "Dokumen kebutuhan teknis untuk koordinasi pertunjukan.",
      href: press?.technicalRiderUrl,
    },
  ].filter((asset): asset is typeof asset & { href: string } => Boolean(asset.href));

  const assets = [...coreAssets, ...cmsAssets];

  return (
    <div className="nf-page an-epk-ready">
      <NightHeader active="/epk" />
      <main id="main-content" tabIndex={-1}>
        {/* EPK dibuka seperti lembar fakta: identitas di kiri, fact sheet
            dengan foto dan kontak di kanan. Printer tetap di baris pertama. */}
        <section className="an-press-hero" aria-labelledby="press-title">
          <div className="an-press-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              Press &amp; booking
            </p>
            <h1 id="press-title">Akbar Nawasunda.</h1>
            <p className="an-press-lede">
              {press?.intro ||
                "Informasi untuk promoter, media, playlist editor, dan kolaborator."}
            </p>
            <div className="an-press-hero-actions">
              <a
                className="an-btn an-btn--solid"
                {...externalProps(mail(pressEmail, "Press / booking inquiry"))}
              >
                <Mail size={14} aria-hidden="true" /> Kontak press
              </a>
              <button
                className="an-btn an-btn--quiet an-press-print"
                type="button"
                onClick={() => window.print()}
              >
                <Printer size={14} aria-hidden="true" /> SAVE / PRINT EPK
              </button>
            </div>
          </div>
          <aside className="an-press-sheet" aria-label="Fact sheet artis">
            <figure className="an-press-sheet-plate">
              <img
                src={portraitSrc}
                alt="Potret editorial Akbar Nawasunda"
                width={667}
                height={1000}
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
                <dt>Berbasis di</dt>
                <dd>{location}</dd>
              </div>
              <div>
                <dt>Alias</dt>
                <dd>{alias}</dd>
              </div>
              <div>
                <dt>Peran</dt>
                <dd>Producer / Remixer</dd>
              </div>
              <div>
                <dt>Kontak</dt>
                <dd>
                  <a href={mail(pressEmail, "Press / booking inquiry")}>
                    {pressEmail}
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
              <p className="an-meta">Ringkasan</p>
              <h2 id="press-summary-title" className="an-title">
                Tentang Akbar Nawasunda.
              </h2>
              <p className="an-press-bio">{bio}</p>
              <ul className="an-press-genres">
                {genres.map(genre => (
                  <li key={genre}>{genre}</li>
                ))}
              </ul>
            </div>
            <div className="an-press-summary-side an-rise">
              <p className="an-meta">Format kerja</p>
              <p className="an-press-capabilities-intro">{capabilitiesIntro}</p>
              <ol className="an-index an-press-capability-list">
                {verifiedArtistProfile.services.map((service, index) => (
                  <li key={service}>
                    <Link
                      className="an-index-row"
                      href={`/inquire?type=${
                        capabilityType[index] ?? "collaboration"
                      }&source=epk`}
                    >
                      <span className="an-meta">
                        {formatPublicIndex(index)}
                      </span>
                      <span className="an-press-capability-copy">
                        <strong>{service}</strong>
                        <small>
                          {capabilityCopy[index] ?? capabilityCopy[0]}
                        </small>
                      </span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="an-press-licensing-note">
                <strong>LICENSING NOTE</strong> {licensingNote}
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
              <p className="an-meta">Aset</p>
              <h2 id="press-assets-title" className="an-title">
                Aset yang tersedia secara resmi.
              </h2>
            </div>
            <p className="an-press-note">
              {cmsAssets.length
                ? "Aset yang tersedia secara resmi dapat diakses langsung dari baris di bawah."
                : "Aset yang tersedia secara resmi untuk event tambahan dapat diminta melalui kontak press resmi."}
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
                        Request by email{" "}
                        <Mail size={13} aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        Open official asset{" "}
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
              <p className="an-meta">Rilisan pilihan</p>
              <h2 id="press-releases-title" className="an-title">
                Tautan resmi untuk editor dan promotor.
              </h2>
            </div>
            <Link className="an-btn an-btn--quiet" href="/music">
              Buka katalog <ArrowUpRight size={14} aria-hidden="true" />
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
              <p className="an-press-contact-label">Kontak</p>
              <h2 id="press-contact-title">Kontak proyek.</h2>
              <p>
                Kirim konteks untuk performance, remix, kolaborasi, atau
                licensing. Ketersediaan dan tarif dikonfirmasi setelah inquiry
                ditinjau.
              </p>
            </div>
            <div className="an-press-contact-actions">
              <Link
                className="an-press-contact-link"
                href="/inquire?type=booking&source=epk"
              >
                <strong>Booking inquiry</strong>
                <small>Performance, acara, dan festival.</small>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link
                className="an-press-contact-link"
                href="/inquire?type=remix&source=epk"
              >
                <strong>Remix / collaborate</strong>
                <small>Remix, aransemen, dan kolaborasi rilisan.</small>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <a
                className="an-press-contact-link"
                {...externalProps(mail(pressEmail, "Press material request"))}
              >
                <strong>Press contact</strong>
                <small>Materi publikasi, wawancara, dan kebutuhan media.</small>
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
            <p className="an-meta">Platform resmi</p>
            <h2 id="press-platforms-title" className="an-title">
              Dengar di kanal resminya.
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
      <NightFooter />
    </div>
  );
}
