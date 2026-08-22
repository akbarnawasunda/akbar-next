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
    <section className="nf-epk-hero"><p className="nf-page-eyebrow">AKBAR NAWASUNDA / ONLINE EPK</p><h1>PRESS &<br/>BOOKING.</h1><p>{press?.intro || "Halaman referensi singkat untuk promoter, media, playlist editor, dan calon kolaborator. Semua kontak dan tautan di sini mengarah ke sumber resmi."}</p><div className="an-epk-hero-actions"><a className="nf-button" href={mail(pressEmail, "Press / booking inquiry")}><Mail size={16}/> CONTACT PRESS</a><button className="an-epk-print" type="button" onClick={() => window.print()}><Printer size={15}/> SAVE / PRINT EPK</button></div></section>
    <section className="nf-section"><div className="an-epk-document"><div><p className="nf-page-eyebrow">ARTIST SNAPSHOT</p><h2>AKBAR NAWASUNDA.</h2><p>{verifiedArtistProfile.longBio}</p><div className="an-epk-genre-row">{verifiedArtistProfile.genres.map(genre => <span key={genre}>{genre}</span>)}</div></div><aside className="an-epk-facts"><div><span>BASED IN</span><b>{verifiedArtistProfile.location}</b></div><div><span>ALIAS</span><b>{verifiedArtistProfile.aliases.join(" / ")}</b></div><div><span>WORK</span><b>Producer / Remixer</b></div><div><span>CONTACT</span><b>{pressEmail}</b></div></aside></div></section>
    <section className="nf-section dark-panel"><div className="nf-section-title"><div><p className="nf-page-eyebrow">OFFICIAL MATERIALS</p><h2>YANG SUDAH<br/><em>TERSEDIA.</em></h2></div><p>EPK ini sengaja hanya menampilkan aset yang sudah tersedia secara resmi. Material event-spesifik dapat diminta lewat kontak di atas.</p></div><div className="an-epk-assets">{assets.map(asset => <a className="an-epk-asset" href={asset.href} target={asset.href.startsWith("mailto:") ? undefined : "_blank"} rel={asset.href.startsWith("mailto:") ? undefined : "noreferrer"} key={asset.title}><span>{asset.label}</span><h3>{asset.title}</h3><p>{asset.copy}</p><b>{asset.href.startsWith("mailto:") ? "REQUEST BY EMAIL" : "OPEN OFFICIAL ASSET"}<ArrowUpRight size={14}/></b></a>)}</div></section>
    <section className="nf-section"><div className="nf-section-title"><div><p className="nf-page-eyebrow">PILIHAN RILISAN</p><h2>TRACK YANG BISA<br/><em>LANGSUNG DICEK.</em></h2></div><p>Pilihan rilisan yang dapat dibuka langsung oleh editor, promotor, dan calon kolaborator.</p></div><div className="an-epk-release-list">{selectedReleases.map(release => <a className="an-epk-release" key={release.title} href={release.href} target="_blank" rel="noreferrer"><img src={release.image} alt="" /><div><span>{release.platform} · {release.year}</span><h3>{release.title}</h3><p>{release.format} <ArrowUpRight size={12}/></p></div></a>)}</div></section>
    <section className="nf-section dark-panel"><div className="an-booking-grid"><div><p className="nf-page-eyebrow">BOOKING / COLLABORATION</p><h2>BICARAKAN<br/><em>PROYEKNYA.</em></h2><p>Untuk performance, remix request, custom arrangement, kolaborasi, atau licensing, kirim konteks proyek melalui inquiry. Tidak ada tarif atau availability yang dijanjikan otomatis dari halaman ini.</p></div><div className="an-booking-actions"><a href="/inquire?type=booking&source=epk">BOOKING INQUIRY <ArrowUpRight size={16}/></a><a href="/inquire?type=remix&source=epk">REMIX / COLLABORATE <ArrowUpRight size={16}/></a><a href={mail(pressEmail, "Press material request")}>PRESS CONTACT <Mail size={16}/></a></div></div></section>
    <section className="nf-section"><div className="nf-section-title"><div><p className="nf-page-eyebrow">CHANNEL RESMI</p><h2>IKUTI SUMBER<br/><em>ASLINYA.</em></h2></div><div className="an-epk-genre-row">{allPlatformLinks.slice(0, 5).map(link => <a className="nf-text-button" href={link.href} target="_blank" rel="noreferrer" key={link.label}><PlatformIcon label={link.label}/>{link.label}</a>)}</div></div></section>
  </main><NightFooter /></div>;
}
