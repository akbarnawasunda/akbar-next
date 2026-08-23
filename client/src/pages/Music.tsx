import FanSignalInline from "@/components/FanSignalInline";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { ArrowUpRight } from "lucide-react";
import { OfficialMediaFrame } from "@/components/OfficialMediaFrame";
import { PlatformIcon } from "@/components/PlatformIcon";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { currentRelease, officialBrand, releases } from "@/content/artistPlatform";
import { publicPlatformLinks, usePublicArtistContent } from "@/content/publicContent";
import { Link } from "wouter";
import "./EcosystemPages.css";
import "./OfficialEmbeds.css";
import "./MediaEnhancements.css";
import "./PlatformMediaUpgrade.css";

const soundcloudDrops = [
  { title: "Masih Mencintainya — Papinka", url: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda" },
  { title: "Ngertenono Ati Medium Hall", url: "https://soundcloud.com/akbarnawasunda/ngertenono_ati_medium_hall_mbfrecords" },
];
const soundcloudEmbed = (url: string) => `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%230a1737&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
const releaseSlug = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function Music() {
  const cms = usePublicArtistContent();
  const editablePlatformLinks = publicPlatformLinks(cms.data);
  const cmsReleases = cms.data?.releases ?? [];
  const cmsCatalog = cmsReleases.map(item => {
    const archive = releases.find(release => release.title.trim().toLowerCase() === item.title.trim().toLowerCase());
    return { title: item.title, format: item.format || archive?.format || "Single", year: item.year || archive?.year || "—", platform: item.platform || archive?.platform || "Official link", href: item.url || archive?.href || "https://soundcloud.com/akbarnawasunda", image: item.artworkUrl || archive?.image || officialBrand.socialPreview };
  });
  const catalog = [...cmsCatalog, ...releases.filter(legacy => !cmsCatalog.some(current => current.title.trim().toLowerCase() === legacy.title.trim().toLowerCase()))];
  const cmsCurrent = cmsReleases.find(item => item.isCurrent) || cmsReleases[0];
  const featured = cmsCurrent ? { ...currentRelease, title: cmsCurrent.title, type: cmsCurrent.platform || "OFFICIAL RELEASE", href: cmsCurrent.url || currentRelease.href, artwork: cmsCurrent.artworkUrl || currentRelease.image, story: cmsCurrent.story, credits: cmsCurrent.credits } : { ...currentRelease, artwork: currentRelease.image, story: undefined, credits: undefined };
  const embeddedDrops = cmsReleases.filter(item => item.embedUrl).slice(0, 2).map(item => ({ title: item.title, url: item.embedUrl! }));
  const players = embeddedDrops.length ? embeddedDrops : soundcloudDrops;

  return <div className="nf-page"><NightHeader active="/music" /><main>
    <section className="nf-page-hero" style={{ "--page-image": `url(${featured.artwork || officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">MUSIC</p><h1>MUSIC<br/>ARCHIVE.</h1><p>Rilisan original dan remix resmi Akbar Nawasunda.</p></div><div className="nf-hero-note"><span>{cms.isLoading ? "MEMUAT KATALOG" : "RILISAN TERBARU"}</span><strong>{featured.title}</strong><a className="nf-text-button" href={featured.href} target="_blank" rel="noreferrer">DENGAR <ArrowUpRight size={15} /></a></div></section>
    <section className="nf-platform-hub"><div className="nf-platform-hub-copy"><p className="nf-page-eyebrow">PLATFORM RESMI</p><h2>PILIH<br/>PLATFORM.</h2><div className="nf-platform-grid">{editablePlatformLinks.map(platform => <a key={platform.label} href={platform.href} target="_blank" rel="noreferrer"><PlatformIcon label={platform.label} />{platform.label}<ArrowUpRight size={15} /></a>)}</div></div></section>
    <section className="nf-section an-story-section"><div className="an-story-art"><ResilientArtworkImage src={featured.artwork} backupSrc={officialBrand.socialPreview} alt={`Artwork ${featured.title}`} /></div><div className="an-story-copy"><span className="an-story-label">{featured.story ? "CATATAN RILISAN" : "RILISAN TERBARU"}</span><h2>{featured.title}</h2><p>{featured.story || "Detail rilisan akan tampil jika sudah dipublikasikan."}</p><div className="an-story-credits">{featured.credits || "Credit resmi belum dipublikasikan."}</div><Link className="nf-text-button" href={`/music/${releaseSlug(featured.title)}`}>DETAIL RILISAN <ArrowUpRight size={15}/></Link></div></section>
    <section className="nf-section"><div className="nf-section-title"><div><p className="nf-page-eyebrow">DENGAR LANGSUNG</p><h2>DENGAR<br/>LANGSUNG.</h2></div><p>Player opsional. Tautan resmi selalu tersedia.</p></div><div className="nf-embed-grid">{players.map(drop => { const known = catalog.find(release => release.title.toLowerCase().includes(drop.title.toLowerCase().split(" — ")[0])); return <OfficialMediaFrame key={drop.url} title={drop.title} provider="SoundCloud" sourceUrl={drop.url} embedUrl={soundcloudEmbed(drop.url)} artwork={known?.image || officialBrand.socialPreview} backupArtwork={officialBrand.socialPreview} description="Tautan resmi selalu tersedia." />; })}</div></section>
    <section className="nf-section dark-panel"><div className="nf-section-title"><div><p className="nf-page-eyebrow">KATALOG</p><h2>SEMUA<br/>RILISAN.</h2></div><p>{cmsReleases.length ? "Katalog CMS dan arsip resmi." : "Arsip resmi Akbar Nawasunda."}</p></div><div className="nf-catalog">{catalog.map((release, index) => <Link key={`${release.title}-${index}`} className="nf-catalog-card" href={`/music/${releaseSlug(release.title)}`}><ResilientArtworkImage className="nf-catalog-art" src={release.image} backupSrc={officialBrand.socialPreview} alt={`Artwork ${release.title}`} /><span className="index">{String(index + 1).padStart(2, "0")}</span><PlatformIcon label={release.platform} /><p>{release.format} · {release.year}</p><h3>{release.title}</h3><b>{release.platform}<ArrowUpRight size={14} /></b></Link>)}</div></section>
    <section className="nf-section"><div className="nf-section-title"><div><p className="nf-page-eyebrow">TAUTAN RESMI</p><h2>PLATFORM<br/>RESMI.</h2></div><a className="nf-button" href={editablePlatformLinks.find(link => link.label === "Spotify")?.href || "https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw"} target="_blank" rel="noreferrer"><PlatformIcon label="Spotify" /> SPOTIFY</a></div></section>
    <section className="nf-signal-block" id="signal"><div><p className="nf-page-eyebrow">FAN SIGNAL</p><h2>UPDATE<br/>MUSIC.</h2><p>Kabar rilisan dan jadwal dari kanal resmi.</p></div><FanSignalInline /></section>
  </main><NightFooter /></div>;
}
