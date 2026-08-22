import { ArrowUpRight, Play } from "lucide-react";
import FanSignalInline from "@/components/FanSignalInline";
import { OfficialMediaFrame } from "@/components/OfficialMediaFrame";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand, videos } from "@/content/artistPlatform";
import { useSanityArtistContent } from "@/sanity/publicContent";
import "./EcosystemPages.css";
import "./OfficialEmbeds.css";
import "./MediaEnhancements.css";

const officialVideos = [{ id: "rv4DK8nVWd0", title: "Garam dan Madu × Backpacker" }, { id: "BOTdDcx31Zc", title: "Akbar Nawasunda — Official Visual" }];
const thumbnailFor = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export default function Visuals() {
  const cms = useSanityArtistContent();
  const cmsVisuals = cms.data?.visuals ?? [];
  const embedded = cmsVisuals.filter(item => item.youtubeId).slice(0, 2).map(item => ({ id: item.youtubeId!, title: item.title }));
  const players = embedded.length ? embedded : officialVideos;
  const archive = cmsVisuals.length ? cmsVisuals.map(item => ({ title: item.title, label: item.label || "OFFICIAL VISUAL", href: item.url || (item.youtubeId ? `https://youtu.be/${item.youtubeId}` : "https://www.youtube.com/@akbarnawasunda"), image: item.imageUrl || (item.youtubeId ? thumbnailFor(item.youtubeId) : officialBrand.socialPreview) })) : videos;
  return <div className="nf-page"><NightHeader active="/visuals" /><main>
    <section className="nf-page-hero" style={{ "--page-image": `url(${officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">VISUAL</p><h1>VIDEO<br/>RESMI.</h1><p>Video dan DJ remix dari kanal resmi Akbar Nawasunda.</p></div><div className="nf-hero-note"><span>{cms.isLoading ? "MEMUAT VIDEO" : "KANAL RESMI"}</span><strong>AKBAR NAWASUNDA</strong><a className="nf-text-button" href="https://www.youtube.com/@akbarnawasunda" target="_blank" rel="noreferrer">YOUTUBE <ArrowUpRight size={15} /></a></div></section>
    <section className="nf-section"><div className="nf-section-title"><div><p className="nf-page-eyebrow">VIDEO PILIHAN</p><h2>DENGAR<br/>DAN TONTON.</h2></div><p>Tekan play untuk memuat player, atau buka YouTube langsung.</p></div><div className="nf-video-embed-grid">{players.map(video => <OfficialMediaFrame key={video.id} title={video.title} provider="YouTube" sourceUrl={`https://youtu.be/${video.id}`} embedUrl={`https://www.youtube-nocookie.com/embed/${video.id}`} artwork={thumbnailFor(video.id)} description="Video dari channel resmi Akbar Nawasunda." />)}</div></section>
    <section className="nf-section dark-panel"><div className="nf-section-title"><div><p className="nf-page-eyebrow">ARSIP VIDEO</p><h2>SEMUA<br/>VIDEO.</h2></div><p>{cmsVisuals.length ? "Arsip dari CMS Akbar Nawasunda." : "Video dari channel resmi."}</p></div><div className="nf-visual-grid">{archive.map(video => <a key={video.title} className="nf-visual-card" href={video.href} target="_blank" rel="noreferrer"><img src={video.image} alt="Akbar Nawasunda official visual artwork" onError={event => { event.currentTarget.src = officialBrand.socialPreview; }} /><div><span>{video.label}</span><h3>{video.title}</h3><p className="nf-text-button">BUKA VIDEO <Play size={14} fill="currentColor" /></p></div></a>)}</div></section>
    <section className="nf-signal-block" id="signal"><div><p className="nf-page-eyebrow">FAN SIGNAL</p><h2>UPDATE<br/>VIDEO.</h2><p>Kabar video dan DJ set dari kanal resmi.</p></div><FanSignalInline /></section>
  </main><NightFooter /></div>;
}
