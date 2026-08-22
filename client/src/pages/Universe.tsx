import { ArrowUpRight, Disc3, Music2, Radio, Sparkles } from "lucide-react";
import FanSignalInline from "@/components/FanSignalInline";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand, releases, verifiedArtistProfile } from "@/content/artistPlatform";
import "./EcosystemPages.css";
import "./ArchiveUpgrade.css";

const routes = [
  { number: "01", title: "DENGAR RILISAN", copy: "Masuk ke katalog, artwork, dan tautan dengar resmi yang tersedia.", href: "/music", icon: Disc3 },
  { number: "02", title: "REMIX / KOLAB", copy: "Kirim konteks project untuk remix request, custom arrangement, atau kolaborasi.", href: "/inquire?type=remix&source=archive", icon: Sparkles },
  { number: "03", title: "BOOKING / LISENSI", copy: "Gunakan jalur inquiry resmi untuk performance, kebutuhan penggunaan musik, atau kerja sama.", href: "/inquire?type=booking&source=archive", icon: Music2 },
];

export default function Universe() {
  return <div className="nf-page an-archive-page"><NightHeader active="/universe" /><main>
    <section className="nf-page-hero an-archive-hero" style={{ "--page-image": `url(${officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">AN ARCHIVE / ARTIST RECORD</p><h1>AKBAR<br/>NAWASUNDA.</h1><p>Catatan perjalanan dari DJ Akbar Remix ke Akbar Nawasunda—dibangun dari rilisan, artwork, genre, dan kanal resmi yang tersedia.</p></div><div className="nf-hero-note"><span>ARCHIVE START</span><strong>2020 / BANDUNG BARAT</strong><a className="nf-text-button" href="#origin">BACA PERJALANAN <ArrowUpRight size={15} /></a></div></section>
    <section id="origin" className="nf-section"><div className="an-archive-origin"><div><p className="nf-page-eyebrow">ASAL MULA</p><h2>DARI REMIX KE RILISAN ORISINAL.</h2><p>{verifiedArtistProfile.longBio}</p><div className="an-archive-genres">{verifiedArtistProfile.genres.map(genre => <span key={genre}>{genre}</span>)}</div></div><div className="an-archive-timeline"><article><span>2020</span><div><h3>DJ Akbar Remix</h3><p>Awal perjalanan sebagai bedroom producer independen dengan fokus pada reinterpretasi lagu populer.</p></div></article><article><span>NOW</span><div><h3>Akbar Nawasunda</h3><p>Rilisan orisinal dan remix resmi yang menggabungkan melodi pop, electronic bass, dan energi dance-floor.</p></div></article></div></div></section>
    <section className="nf-section dark-panel"><div className="nf-section-title"><div><p className="nf-page-eyebrow">SELECTED DROPS</p><h2>ARTWORK YANG<br/><em>MENYIMPAN ERA.</em></h2></div><p>Empat entry dari arsip yang dapat dibuka langsung melalui platform resminya.</p></div><div className="an-archive-release-grid">{releases.slice(0, 4).map(release => <a className="an-archive-release" href={release.href} target="_blank" rel="noreferrer" key={release.title}><img src={release.image || officialBrand.socialPreview} alt={`Artwork ${release.title}`} onError={event => { event.currentTarget.src = officialBrand.socialPreview; }} /><div><span>{release.year} · {release.platform}</span><h3>{release.title}</h3><p>OPEN RELEASE <ArrowUpRight size={13}/></p></div></a>)}</div></section>
    <section className="nf-section"><div className="an-archive-routes"><div><p className="nf-page-eyebrow">WORK WITH AKBAR</p><h2>JALUR YANG<br/>JELAS.</h2><p>Archive ini bukan dunia fiktif. Ini pintu ke musik, proyek, dan kontak resmi yang bisa dipakai sekarang.</p></div><div className="an-archive-route-list">{routes.map(route => { const Icon = route.icon; return <a href={route.href} key={route.title}><span>{route.number}</span><strong>{route.title}</strong><Icon size={18}/><small>{route.copy}</small></a>; })}</div></div></section>
    <section className="nf-signal-block" id="signal"><div><p className="nf-page-eyebrow">FAN SIGNAL</p><h2>UPDATE RILISAN,<br/><em>LANGSUNG KE KAMU.</em></h2><p>Masuk untuk menerima kabar visual, rilisan, dan agenda berikutnya dari kanal resmi.</p></div><FanSignalInline /></section>
  </main><NightFooter /></div>;
}
