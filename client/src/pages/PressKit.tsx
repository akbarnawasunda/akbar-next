import { useState } from "react";
import { ArrowUpRight, Download, Mail, Printer } from "lucide-react";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import {
  allPlatformLinks,
  officialBrand,
  releases,
  verifiedArtistProfile,
} from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./VercelAssetOverrides.css";
import "./ArtistModules.css";
import "./EpkReady.css";

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
  const [portraitSrc, setPortraitSrc] = useState(officialBrand.editorialPortrait);
  const bookingEmail = press?.bookingEmail || verifiedArtistProfile.bookingEmail;
  const pressEmail = press?.pressEmail || bookingEmail;
  const selectedReleases = releases.slice(0, 3);

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
    { label: "ONE SHEET", title: "Artist one sheet", copy: "Ringkasan artis untuk kebutuhan editorial dan booking.", href: press?.oneSheetUrl },
    { label: "PRESS IMAGES", title: "Press image set", copy: "Materi visual resmi untuk publikasi dan promosi.", href: press?.photoPackUrl },
    { label: "BRAND KIT", title: "Logo package", copy: "Paket logo resmi untuk kebutuhan partner dan media.", href: press?.logoPackUrl },
    { label: "SHOW NOTES", title: "Event requirements", copy: "Dokumen kebutuhan teknis untuk koordinasi pertunjukan.", href: press?.technicalRiderUrl },
  ].filter((asset): asset is typeof asset & { href: string } => Boolean(asset.href));

  const assets = [...coreAssets, ...cmsAssets];

  return (
    <div className="nf-page an-epk-ready">
      <NightHeader active="/epk" />
      <main>
        <section className="nf-epk-hero an-epk-hero-enhanced">
          <div className="an-epk-hero-grid">
            <div>
              <p className="nf-page-eyebrow">AKBAR NAWASUNDA / ONLINE EPK</p>
              <h1>PRESS &<br />BOOKING.</h1>
              <p>{press?.intro || "Informasi untuk promoter, media, playlist editor, dan kolaborator."}</p>
              <div className="an-epk-hero-actions">
                <a className="nf-button" {...externalProps(mail(pressEmail, "Press / booking inquiry"))}>
                  <Mail size={16} /> CONTACT PRESS
                </a>
                <button className="an-epk-print" type="button" onClick={() => window.print()}>
                  <Printer size={15} /> SAVE / PRINT EPK
                </button>
              </div>
            </div>
            <aside className="an-epk-hero-card">
              <div className="an-epk-hero-image">
                <img
                  src={portraitSrc}
                  alt="Editorial portrait artwork of Akbar Nawasunda"
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
              </div>
              <div className="an-epk-hero-card-copy">
                <span>EDITORIAL / PRESS</span>
                <strong>AKBAR<br />NAWASUNDA</strong>
                <small>{verifiedArtistProfile.location} · {verifiedArtistProfile.aliases[0]}</small>
              </div>
            </aside>
          </div>
        </section>

        <section className="nf-section an-epk-sheet-section">
          <div className="an-epk-document">
            <div>
              <p className="nf-page-eyebrow">ARTIST SNAPSHOT</p>
              <h2>AKBAR NAWASUNDA.</h2>
              <p>{verifiedArtistProfile.longBio}</p>
              <div className="an-epk-genre-row">
                {verifiedArtistProfile.genres.map(genre => <span key={genre}>{genre}</span>)}
              </div>
            </div>
            <aside className="an-epk-facts">
              <div><span>BASED IN</span><b>{verifiedArtistProfile.location}</b></div>
              <div><span>ALIAS</span><b>{verifiedArtistProfile.aliases.join(" / ")}</b></div>
              <div><span>WORK</span><b>Producer / Remixer</b></div>
              <div><span>CONTACT</span><b>{pressEmail}</b></div>
            </aside>
          </div>
        </section>

        <section className="nf-section dark-panel an-epk-capabilities">
          <div className="nf-section-title">
            <div><p className="nf-page-eyebrow">CAPABILITIES</p><h2>BUILT FOR<br />THE DROP.</h2></div>
            <p>Format kerja yang tersedia untuk performance, produksi, kolaborasi, dan penggunaan musik.</p>
          </div>
          <div className="an-epk-capability-grid">
            {verifiedArtistProfile.services.map((service, index) => (
              <article key={service} className="an-epk-capability">
                <span>0{index + 1}</span>
                <h3>{service}</h3>
                <p>{index === 0 ? "Request remix dengan brief, referensi, dan target rilis yang jelas." : index === 1 ? "Aransemen khusus untuk memperkuat karakter lagu dan kebutuhan konten." : index === 2 ? "Bangun karya bersama dari ide awal sampai materi siap dipublikasikan." : "Lisensi musik untuk kebutuhan konten, partner, dan penggunaan komersial."}</p>
              </article>
            ))}
          </div>
          <p className="an-epk-licensing-note"><strong>LICENSING NOTE</strong>{verifiedArtistProfile.licensing}</p>
        </section>

        <section className="nf-section">
          <div className="nf-section-title">
            <div><p className="nf-page-eyebrow">ASET RESMI</p><h2>ASET<br />RESMI.</h2></div>
            <p>{cmsAssets.length ? "Aset yang tersedia secara resmi dapat diakses langsung dari kartu di bawah." : "Aset yang tersedia secara resmi untuk event tambahan dapat diminta melalui kontak press resmi."}</p>
          </div>
          <div className={`an-epk-assets${assets.length > 3 ? " has-extended-assets" : ""}`}>
            {assets.map(asset => (
              <a className="an-epk-asset" {...externalProps(asset.href)} key={asset.title}>
                <span>{asset.label}</span>
                <h3>{asset.title}</h3>
                <p>{asset.copy}</p>
                <b>{asset.href.startsWith("mailto:") ? "REQUEST BY EMAIL" : "OPEN OFFICIAL ASSET"}{asset.href.startsWith("mailto:") ? <Mail size={14} /> : <Download size={14} />}</b>
              </a>
            ))}
          </div>
        </section>

        <section className="nf-section dark-panel">
          <div className="nf-section-title">
            <div><p className="nf-page-eyebrow">RILISAN PILIHAN</p><h2>RILISAN<br />PILIHAN.</h2></div>
            <p>Tautan resmi untuk editor, promotor, dan kolaborator.</p>
          </div>
          <div className="an-epk-release-list">
            {selectedReleases.map(release => (
              <a className="an-epk-release" key={release.title} href={release.href} target="_blank" rel="noreferrer">
                <ResilientArtworkImage src={release.image} backupSrc={officialBrand.socialPreview} alt={`Artwork ${release.title}`} />
                <div><span>{release.platform} · {release.year}</span><h3>{release.title}</h3><p>{release.format} <ArrowUpRight size={12} /></p></div>
              </a>
            ))}
          </div>
        </section>

        <section className="nf-section an-epk-contact-panel">
          <div className="an-booking-grid">
            <div>
              <p className="nf-page-eyebrow">BOOKING / COLLABORATION</p>
              <h2>KONTAK<br />PROYEK.</h2>
              <p>Kirim konteks untuk performance, remix, kolaborasi, atau licensing. Ketersediaan dan tarif dikonfirmasi setelah inquiry ditinjau.</p>
            </div>
            <div className="an-booking-actions">
              <a href="/inquire?type=booking&source=epk">BOOKING INQUIRY <ArrowUpRight size={16} /></a>
              <a href="/inquire?type=remix&source=epk">REMIX / COLLABORATE <ArrowUpRight size={16} /></a>
              <a {...externalProps(mail(pressEmail, "Press material request"))}>PRESS CONTACT <Mail size={16} /></a>
            </div>
          </div>
        </section>

        <section className="nf-section">
          <div className="nf-section-title">
            <div><p className="nf-page-eyebrow">KANAL RESMI</p><h2>PLATFORM<br />RESMI.</h2></div>
            <div className="an-epk-genre-row">
              {allPlatformLinks.slice(0, 5).map(link => <a className="nf-text-button" href={link.href} target="_blank" rel="noreferrer" key={link.label}><PlatformIcon label={link.label} />{link.label}<ArrowUpRight size={14} /></a>)}
            </div>
          </div>
        </section>
      </main>
      <NightFooter />
    </div>
  );
}
