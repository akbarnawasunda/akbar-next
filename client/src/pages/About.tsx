import { ArrowUpRight, MapPin, Radio, Sparkles } from "lucide-react";
import { ArtistSignalMotion } from "@/components/ArtistSignalMotion";
import { ScrambleText } from "@/components/ScrambleText";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand } from "@/content/artistPlatform";
import { useSanityArtistContent } from "@/sanity/publicContent";
import "./EcosystemPages.css";
import "./ArtistModules.css";

const fallbackBio = "Akbar Nawasunda adalah produser dan remixer elektronik dari Bandung Barat, Indonesia. Proyeknya bergerak di antara energi breakbeat, remix, dan momentum dancefloor—dengan fokus pada sound yang dibangun untuk speaker, layar, dan kerumunan.";

export default function About() {
  const cms = useSanityArtistContent();
  const profile = cms.data?.profile;
  const shortBio = profile?.shortBio || fallbackBio;
  const longBio = profile?.longBio || "AN // NIGHT FREQUENCY adalah ruang resmi untuk mengikuti rilisan, visual, dan perjalanan live Akbar Nawasunda. Profil lengkap, kredensial produksi, dan dokumentasi era akan diterbitkan dari Studio saat materi final tersedia.";
  const genres = profile?.genres?.length ? profile.genres : ["Electronic", "Breakbeat", "Remix"];
  return <div className="nf-page an-about-page"><NightHeader active="/about" /><main><section className="nf-page-hero an-about-hero" style={{ "--page-image": `url(${profile?.portraitImage || officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">ABOUT / ARTIST PROFILE</p><ScrambleText as="h1" text={"SIGNAL\nFROM THE\nSOURCE."} className="an-about-title" /><p>{shortBio}</p></div><ArtistSignalMotion className="an-about-motion" /><div className="nf-hero-note"><span>BASE SIGNAL</span><strong>{profile?.location || "BANDUNG BARAT, INDONESIA"}</strong><a className="nf-text-button" href="/music">EXPLORE RELEASES <ArrowUpRight size={15} /></a></div></section><section className="nf-section an-profile-section"><div className="an-profile-aside"><p className="nf-page-eyebrow">ARTIST BIOGRAPHY</p><MapPin size={18} /><span>{profile?.location || "Bandung Barat, Indonesia"}</span></div><div className="an-profile-copy"><h2>BUILT FOR<br /><em>THE NIGHT.</em></h2><p>{longBio}</p>{profile?.artistStatement ? <blockquote>“{profile.artistStatement}”</blockquote> : <p className="an-profile-note">Full official biography, production milestones, dan media credits dapat dipublikasikan dari AN // Studio saat materi telah disetujui.</p>}<div className="an-genre-row">{genres.map(genre => <span key={genre}><Radio size={12} /> {genre}</span>)}</div></div></section><section className="nf-section dark-panel an-about-path"><div><p className="nf-page-eyebrow">ENTER THE SIGNAL</p><h2>LISTEN. WATCH.<br /><em>FOLLOW THE NEXT DROP.</em></h2></div><div className="an-about-actions"><a className="nf-button" href="/music"><Sparkles size={16} /> RELEASE VAULT</a><a className="nf-text-button" href="/epk">PRESS & BOOKING <ArrowUpRight size={15} /></a></div></section></main><NightFooter /></div>;
}
