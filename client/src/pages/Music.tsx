import FanSignalInline from "@/components/FanSignalInline";
import { ArrowUpRight } from "lucide-react";
import { ArtistSignalMotion } from "@/components/ArtistSignalMotion";
import { OfficialMediaFrame } from "@/components/OfficialMediaFrame";
import { PlatformIcon } from "@/components/PlatformIcon";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { allPlatformLinks, currentRelease, officialBrand, releases } from "@/content/artistPlatform";
import { useSanityArtistContent } from "@/sanity/publicContent";
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
  const cms = useSanityArtistContent();
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
    <section className="nf-page-hero" style={{ "--page-image": `url(${featured.artwork || officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">MUSIC / KATALOG RESMI</p><h1>MUSIK,<br/>DALAM SATU ARSIP.</h1><p>Rilisan original dan remix resmi Akbar Nawasunda. Setiap kartu di bawah mengarah ke sumber yang bisa dibuka langsung.</p></div><ArtistSignalMotion className="music-hero-motion" /><div className="nf-hero-note"><span>{cms.isLoading ? "SYNCING CATALOG" : "CURRENT RELEASE"}</span><strong>{featured.title}</strong><a className="nf-text-button" href={featured.href} target="_blank" rel="noreferrer">OPEN OFFICIAL LINK <ArrowUpRight size={15} /></a></div></section>
    <section className="nf-platform-hub"><div className="nf-platform-hub-copy"><p className="nf-page-eyebrow">SEMUA PLATFORM</p><h2>DENGAR<br/><em>CARA KAMU.</em></h2><p>Pilih platform yang biasa kamu pakai. Tidak ada pintu palsu—semuanya menuju akun atau karya resmi Akbar Nawasunda.</p><div className="nf-platform-grid">{allPlatformLinks.map(platform => <a key={platform.label} href={platform.href} target="_blank" rel="noreferrer"><PlatformIcon label={platform.label} />{platform.label}<ArrowUpRight size={15} /></a>)}</div></div><ArtistSignalMotion className="nf-platform-motion" /></section>
    <section className="nf-section an-story-section"><div className="an-story-art"><img src={featured.artwork || officialBrand.socialPreview} alt={`Artwork ${featured.title}`} onError={event => { event.currentTarget.src = officialBrand.socialPreview; }} /></div><div className="an-story-copy"><span className="an-story-label">{featured.story ? "CATATAN RILISAN" : "RILISAN TERBARU"}</span><h2>{featured.title}<br/><em>DALAM KONTEKS.</em></h2><p>{featured.story || "Cerita proses dan credits akan muncul di sini jika sudah diterbitkan. Untuk sekarang, gunakan tautan resmi untuk mendengarkan rilisan ini."}</p><div className="an-story-credits">{featured.credits || "Credits resmi belum dipublikasikan."}</div><Link className="nf-text-button" href={`/music/${releaseSlug(featured.title)}`}>LIHAT DETAIL RILISAN <ArrowUpRight size={15}/></Link></div></section>
    <section className="nf-section"><div className="nf-section-title"><div><p className="nf-page-eyebrow">DENGAR LANGSUNG</p><h2>PUTAR JIKA<br/><em>PLAYER TERSEDIA.</em></h2></div><p>Beberapa browser memblokir player pihak ketiga. Karena itu, setiap player selalu punya tombol sumber resmi yang tetap bisa dibuka.</p></div><div className="nf-embed-grid">{players.map(drop => { const known = catalog.find(release => release.title.toLowerCase().includes(drop.title.toLowerCase().split(" — ")[0])); return <OfficialMediaFrame key={drop.url} title={drop.title} provider="SoundCloud" sourceUrl={drop.url} embedUrl={soundcloudEmbed(drop.url)} artwork={known?.image || officialBrand.socialPreview} description="Player adalah opsi tambahan; tautan resmi selalu tersedia." />; })}</div></section>
    <section className="nf-section dark-panel"><div className="nf-section-title"><div><p className="nf-page-eyebrow">KATALOG / RILISAN TERPILIH</p><h2>SEMUA RILISAN,<br/><em>SATU TEMPAT.</em></h2></div><p>{cmsReleases.length ? "Katalog diambil dari CMS dan dilengkapi arsip terverifikasi." : "Setiap rilisan di bawah ini berasal dari arsip resmi Akbar Nawasunda."}</p></div><div className="nf-catalog">{catalog.map((release, index) => <Link key={`${release.title}-${index}`} className="nf-catalog-card" href={`/music/${releaseSlug(release.title)}`}><img className="nf-catalog-art" src={release.image || officialBrand.socialPreview} alt="" loading="lazy" onError={event => { event.currentTarget.src = officialBrand.socialPreview; }} /><span className="index">{String(index + 1).padStart(2, "0")}</span><PlatformIcon label={release.platform} /><p>{release.format} · {release.year}</p><h3>{release.title}</h3><b>{release.platform}<ArrowUpRight size={14} /></b></Link>)}</div></section>
    <section className="nf-section"><div className="nf-section-title"><div><p className="nf-page-eyebrow">TAUTAN RESMI</p><h2>MASUK LEWAT<br/><em>PLATFORM PILIHANMU.</em></h2></div><a className="nf-button" href="https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw" target="_blank" rel="noreferrer"><PlatformIcon label="Spotify" /> OPEN SPOTIFY</a></div></section>
    <section className="nf-signal-block" id="signal"><div><p className="nf-page-eyebrow">FAN SIGNAL</p><h2>TAHU<br/><em>LEBIH DULU.</em></h2><p>Masuk sebelum rilisan, visual, atau jadwal berikutnya diumumkan.</p></div><FanSignalInline /></section>
  </main><NightFooter /></div>;
}
