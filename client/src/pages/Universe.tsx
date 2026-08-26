import { ArrowUpRight, Disc3, Music2, Sparkles } from "lucide-react";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand, releases, verifiedArtistProfile } from "@/content/artistPlatform";
import { publicJourney, publicPhotoStories, usePublicArtistContent } from "@/content/publicContent";
import { ArtistPhotoStorySection } from "@/components/ArtistEditorialSections";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import "./EcosystemPages.css";
import "./ArchiveUpgrade.css";
import "./ArchiveArtwork.css";

const routes = [
  { number: "01", title: "DENGAR RILISAN", copy: "Masuk ke katalog, artwork, dan tautan dengar resmi yang tersedia.", href: "/music", icon: Disc3 },
  { number: "02", title: "REMIX / KOLAB", copy: "Kirim konteks project untuk remix request, custom arrangement, atau kolaborasi.", href: "/inquire?type=remix&source=archive", icon: Sparkles },
  { number: "03", title: "BOOKING / LISENSI", copy: "Gunakan jalur inquiry resmi untuk performance, kebutuhan penggunaan musik, atau kerja sama.", href: "/inquire?type=booking&source=archive", icon: Music2 },
];

export default function Universe() {
  const cms = usePublicArtistContent();
  const journey = publicJourney(cms.data);
  const photoStories = publicPhotoStories(cms.data);
  const cmsReleases = cms.data?.releases ?? [];
  const cmsCatalog = cmsReleases.map(item => {
    const fallback = releases.find(release => release.title.trim().toLowerCase() === item.title.trim().toLowerCase());
    return {
      title: item.title,
      year: item.year || fallback?.year || "—",
      platform: item.platform || fallback?.platform || "Official link",
      href: item.url || fallback?.href || "https://soundcloud.com/akbarnawasunda",
      image: item.artworkUrl || fallback?.image || officialBrand.socialPreview,
    };
  });
  const catalog = [...cmsCatalog, ...releases.filter(release => !cmsCatalog.some(item => item.title.trim().toLowerCase() === release.title.trim().toLowerCase())).map(release => ({ title: release.title, year: release.year, platform: release.platform, href: release.href, image: release.image }))];
  return <div className="nf-page an-archive-page"><NightHeader active="/universe" /><main>
    <section className="nf-page-hero an-archive-hero" style={{ "--page-image": `url(${officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">ARSIP AKBAR</p><h1>AKBAR<br/>NAWASUNDA.</h1><p>Perjalanan dari DJ Akbar Remix ke Akbar Nawasunda.</p></div><div className="nf-hero-note"><span>SEJAK</span><strong>2020 / BANDUNG BARAT</strong><a className="nf-text-button" href="#origin">BACA PROFIL <ArrowUpRight size={15} /></a></div></section>
    <section id="origin" className="nf-section"><div className="an-archive-origin"><div><p className="nf-page-eyebrow">PERJALANAN</p><h2>{journey.title || "PERJALANAN MUSIK."}</h2><p>{journey.intro || verifiedArtistProfile.longBio}</p><div className="an-archive-genres">{verifiedArtistProfile.genres.map(genre => <span key={genre}>{genre}</span>)}</div></div><div className="an-archive-timeline">{journey.milestones.map((milestone, index) => <article key={`${milestone.year}-${milestone.title}-${index}`}><span>{milestone.year}</span><div><h3>{milestone.title}</h3><p>{milestone.body}</p></div></article>)}</div></div></section>
    <section className="nf-section an-archive-art-feature"><div className="an-archive-art-frame"><img src={officialBrand.archivePortrait} alt="Artwork editorial Akbar Nawasunda dengan tema future city" loading="lazy" decoding="async" width={800} height={1000} /></div><div className="an-archive-art-copy"><p className="nf-page-eyebrow">ARAH VISUAL / 001</p><h2>DARI<br/>STUDIO.</h2><p>Salah satu arah visual dari dunia Akbar Nawasunda: industrial, kontras, dan dekat dengan energi electronic bass.</p><p className="an-archive-art-note">CATATAN VISUAL · BUKAN RILISAN AUDIO</p><a className="nf-button" href="/visuals">LIHAT VISUALS <ArrowUpRight size={15}/></a></div></section>
    <ArtistPhotoStorySection photoStories={photoStories} />
    <section className="nf-section dark-panel"><div className="nf-section-title"><div><p className="nf-page-eyebrow">RILISAN PILIHAN</p><h2>ARTWORK<br/>RILISAN.</h2></div><p>Buka di platform resmi.</p></div><div className="an-archive-release-grid">{catalog.slice(0, 6).map(release => <a className="an-archive-release" href={release.href} target="_blank" rel="noreferrer" key={release.title}><ResilientArtworkImage src={release.image} backupSrc={officialBrand.socialPreview} alt={`Artwork ${release.title}`} /><div><span>{release.year} · {release.platform}</span><h3>{release.title}</h3><p>BUKA RILISAN <ArrowUpRight size={13}/></p></div></a>)}</div></section>
    <section className="nf-section"><div className="an-archive-routes"><div><p className="nf-page-eyebrow">KONTAK</p><h2>JALUR<br/>RESMI.</h2><p>Music, remix, booking, dan licensing.</p></div><div className="an-archive-route-list">{routes.map(route => { const Icon = route.icon; return <a href={route.href} key={route.title}><span>{route.number}</span><strong>{route.title}</strong><Icon size={18}/><small>{route.copy}</small></a>; })}</div></div></section>
  </main><NightFooter /></div>;
}
