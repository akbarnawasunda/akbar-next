import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { PlatformIcon } from "@/components/PlatformIcon";
import { allPlatformLinks, officialBrand, releases, verifiedArtistProfile } from "@/content/artistPlatform";
import { useSanityArtistContent } from "@/sanity/publicContent";
import { ArrowUpRight, Mail, Printer } from "lucide-react";
import "./EcosystemPages.css";
import "./VercelAssetOverrides.css";
import "./ArtistModules.css";
import "./EpkReady.css";

const mail = (address: string, subject: string) => `mailto:${address}?subject=${encodeURIComponent(subject)}`;

export default function PressKit() {
  const cms = useSanityArtistContent();
  const press = cms.data?.pressKit;
  const bookingEmail = press?.bookingEmail || verifiedArtistProfile.bookingEmail;
  const pressEmail = press?.pressEmail || bookingEmail;
  const selectedReleases = releases.slice(0, 3);
  const assets = [
    { label: "BRAND MARK", title: "Official logo", copy: "Logo resmi Akbar Nawasunda untuk kebutuhan pengenalan dan materi publikasi.", href: officialBrand.logo },
    { label: "IDENTITY VISUAL", title: "Official visual", copy: "Visual identitas resmi yang dapat dilihat sebagai referensi publikasi digital.", href: officialBrand.socialPreview },
    { label: "PRESS CONTACT", title: "Request material", copy: "Untuk foto resolusi tinggi, tech requirement, atau kebutuhan khusus event, hubungi jalur resmi.", href: mail(pressEmail, "Press material request") },
  ];
  return <div className="nf-page an-epk-ready"><NightHeader active="/epk" /><main>
    <section className="nf-epk-hero"><p className="nf-page-eyebrow">AKBAR NAWASUNDA / ONLINE EPK</p><h1>PRESS &<br/>BOOKING.</h1><p>{press?.intro || "Informasi untuk promoter, media, playlist editor, dan kolaborator."}</p><div className="an-epk-hero-actions"><a className="nf-button" href={mail(pressEmail, "Press / booking inquiry")}><Mail size={16}/> CONTACT PRESS</a><button className="an-epk-print" type="button" onClick={() => window.print()}><Printer size={15}/> SAVE / PRINT EPK</button></div></section>
    <section className="nf-section"><div className="an-epk-document"><div><p className="nf-page-eyebrow">ARTIST SNAPSHOT</p><h2>AKBAR NAWASUNDA.</h2><p>{verifiedArtistProfile.longBio}</p><div className="an-epk-genre-row">{verifiedArtistProfile.genres.map(genre => <span key={genre}>{genre}</span>)}</div></div><aside className="an-epk-facts"><div><span>BASED IN</span><b>{verifiedArtistProfile.location}</b></div><div><span>ALIAS</span><b>{verifiedArtistProfile.aliases.join(" / ")}</b></div><div><span>WORK</span><b>Producer / Remixer</b></div><div><span>CONTACT</span><b>{pressEmail}</b></div></aside></div></section>
    <section className="nf-section dark-panel"><div className="nf-section-title"><div><p className="nf-page-eyebrow">ASET RESMI</p><h2>ASET<br/>RESMI.</h2></div><p>Aset yang tersedia secara resmi. Materi event dapat diminta melalui kontak di atas.</p></div><div className="an-epk-assets">{assets.map(asset => <a className="an-epk-asset" href={asset.href} target={asset.href.startsWith("mailto:") ? undefined : "_blank"} rel={asset.href.startsWith("mailto:") ? undefined : "noreferrer"} key={asset.title}><span>{asset.label}</span><h3>{asset.title}</h3><p>{asset.copy}</p><b>{asset.href.startsWith("mailto:") ? "REQUEST BY EMAIL" : "OPEN OFFICIAL ASSET"}<ArrowUpRight size={14}/></b></a>)}</div></section>
    <section className="nf-section"><div className="nf-section-title"><div><p className="nf-page-eyebrow">RILISAN PILIHAN</p><h2>RILISAN<br/>PILIHAN.</h2></div><p>Tautan resmi untuk editor, promotor, dan kolaborator.</p></div><div className="an-epk-release-list">{selectedReleases.map(release => <a className="an-epk-release" key={release.title} href={release.href} target="_blank" rel="noreferrer"><img src={release.image} alt="" /><div><span>{release.platform} · {release.year}</span><h3>{release.title}</h3><p>{release.format} <ArrowUpRight size={12}/></p></div></a>)}</div></section>
    <section className="nf-section dark-panel"><div className="an-booking-grid"><div><p className="nf-page-eyebrow">BOOKING / COLLABORATION</p><h2>KONTAK<br/>PROYEK.</h2><p>Kirim konteks untuk performance, remix, kolaborasi, atau licensing. Ketersediaan dan tarif dikonfirmasi setelah inquiry ditinjau.</p></div><div className="an-booking-actions"><a href="/inquire?type=booking&source=epk">BOOKING INQUIRY <ArrowUpRight size={16}/></a><a href="/inquire?type=remix&source=epk">REMIX / COLLABORATE <ArrowUpRight size={16}/></a><a href={mail(pressEmail, "Press material request")}>PRESS CONTACT <Mail size={16}/></a></div></div></section>
    <section className="nf-section"><div className="nf-section-title"><div><p className="nf-page-eyebrow">KANAL RESMI</p><h2>PLATFORM<br/>RESMI.</h2></div><div className="an-epk-genre-row">{allPlatformLinks.slice(0, 5).map(link => <a className="nf-text-button" href={link.href} target="_blank" rel="noreferrer" key={link.label}><PlatformIcon label={link.label}/>{link.label}</a>)}</div></div></section>
  </main><NightFooter /></div>;
}
