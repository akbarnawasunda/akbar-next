import { ArrowUpRight, Disc3, Music2, Radio, Sparkles } from "lucide-react";
import FanSignalInline from "@/components/FanSignalInline";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand, releases, verifiedArtistProfile } from "@/content/artistPlatform";
import "./EcosystemPages.css";
import "./ArchiveUpgrade.css";
import "./ArchiveArtwork.css";

const routes = [
  { number: "01", title: "DENGAR RILISAN", copy: "Masuk ke katalog, artwork, dan tautan dengar resmi yang tersedia.", href: "/music", icon: Disc3 },
  { number: "02", title: "REMIX / KOLAB", copy: "Kirim konteks project untuk remix request, custom arrangement, atau kolaborasi.", href: "/inquire?type=remix&source=archive", icon: Sparkles },
  { number: "03", title: "BOOKING / LISENSI", copy: "Gunakan jalur inquiry resmi untuk performance, kebutuhan penggunaan musik, atau kerja sama.", href: "/inquire?type=booking&source=archive", icon: Music2 },
];

export default function Universe() {
  return <div className="nf-page an-archive-page"><NightHeader active="/universe" /><main>
    <section className="nf-page-hero an-archive-hero" style={{ "--page-image": `url(${officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">AN ARCHIVE</p><h1>AKBAR<br/>NAWASUNDA.</h1><p>Perjalanan dari DJ Akbar Remix ke Akbar Nawasunda.</p></div><div className="nf-hero-note"><span>SEJAK</span><strong>2020 / BANDUNG BARAT</strong><a className="nf-text-button" href="#origin">BACA PROFIL <ArrowUpRight size={15} /></a></div></section>
    <section id="origin" className="nf-section"><div className="an-archive-origin"><div><p className="nf-page-eyebrow">PERJALANAN</p><h2>PERJALANAN<br/>MUSIK.</h2><p>{verifiedArtistProfile.longBio}</p><div className="an-archive-genres">{verifiedArtistProfile.genres.map(genre => <span key={genre}>{genre}</span>)}</div></div><div className="an-archive-timeline"><article><span>2020</span><div><h3>DJ Akbar Remix</h3><p>Awal perjalanan sebagai bedroom producer independen dengan fokus pada reinterpretasi lagu populer.</p></div></article><article><span>NOW</span><div><h3>Akbar Nawasunda</h3><p>Rilisan orisinal dan remix resmi yang menggabungkan melodi pop, electronic bass, dan energi dance-floor.</p></div></article></div></div></section>
    <section className="nf-section an-archive-art-feature"><div className="an-archive-art-frame"><img src={officialBrand.archivePortrait} alt="Artwork editorial Akbar Nawasunda dengan tema future city" loading="lazy" decoding="async" width={800} height={1000} /></div><div className="an-archive-art-copy"><p className="nf-page-eyebrow">VISUAL LANGUAGE / 001</p><h2>THE FUTURE<br/>IS HERE.</h2><p>Salah satu arah visual dari dunia Akbar Nawasunda: industrial, kontras, dan dekat dengan energi electronic bass.</p><p className="an-archive-art-note">ARCHIVE VISUAL · BUKAN RILISAN AUDIO</p><a className="nf-button" href="/visuals">LIHAT VISUALS <ArrowUpRight size={15}/></a></div></section>
    <section className="nf-section dark-panel"><div className="nf-section-title"><div><p className="nf-page-eyebrow">RILISAN PILIHAN</p><h2>ARTWORK<br/>RILISAN.</h2></div><p>Buka di platform resmi.</p></div><div className="an-archive-release-grid">{releases.slice(0, 4).map(release => <a className="an-archive-release" href={release.href} target="_blank" rel="noreferrer" key={release.title}><img src={release.image || officialBrand.socialPreview} alt={`Artwork ${release.title}`} onError={event => { event.currentTarget.src = officialBrand.socialPreview; }} /><div><span>{release.year} · {release.platform}</span><h3>{release.title}</h3><p>BUKA RILISAN <ArrowUpRight size={13}/></p></div></a>)}</div></section>
    <section className="nf-section"><div className="an-archive-routes"><div><p className="nf-page-eyebrow">KONTAK</p><h2>JALUR<br/>RESMI.</h2><p>Music, remix, booking, dan licensing.</p></div><div className="an-archive-route-list">{routes.map(route => { const Icon = route.icon; return <a href={route.href} key={route.title}><span>{route.number}</span><strong>{route.title}</strong><Icon size={18}/><small>{route.copy}</small></a>; })}</div></div></section>
    <section className="nf-signal-block" id="signal"><div><p className="nf-page-eyebrow">FAN SIGNAL</p><h2>UPDATE<br/>RILISAN.</h2><p>Kabar visual, rilisan, dan jadwal dari kanal resmi.</p></div><FanSignalInline /></section>
  </main><NightFooter /></div>;
}
