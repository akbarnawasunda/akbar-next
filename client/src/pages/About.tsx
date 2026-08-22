import { ArrowUpRight, MapPin, Radio, Sparkles } from "lucide-react";
import { ArtistSignalMotion } from "@/components/ArtistSignalMotion";
import { ScrambleText } from "@/components/ScrambleText";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand, verifiedArtistProfile } from "@/content/artistPlatform";
import { useSanityArtistContent } from "@/sanity/publicContent";
import "./EcosystemPages.css";
import "./ArtistModules.css";

export default function About() {
  const cms = useSanityArtistContent();
  const profile = cms.data?.profile;
  const shortBio = profile?.shortBio || verifiedArtistProfile.shortBio;
  const longBio = profile?.longBio || verifiedArtistProfile.longBio;
  const genres = profile?.genres?.length ? profile.genres : verifiedArtistProfile.genres;
  return <div className="nf-page an-about-page"><NightHeader active="/about" /><main><section className="nf-page-hero an-about-hero" style={{ "--page-image": `url(${profile?.portraitImage || officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">ABOUT / ARTIST PROFILE</p><ScrambleText as="h1" interactive duration={2400} text={"SIGNAL\nFROM THE\nSOURCE."} className="an-about-title" /><p>{shortBio}</p></div><ArtistSignalMotion className="an-about-motion" /><div className="nf-hero-note"><span>BASE SIGNAL</span><strong>{profile?.location || verifiedArtistProfile.location.toUpperCase()}</strong><a className="nf-text-button" href="/music">EXPLORE RELEASES <ArrowUpRight size={15} /></a></div></section><section className="nf-section an-profile-section"><div className="an-profile-aside"><p className="nf-page-eyebrow">ARTIST BIOGRAPHY</p><MapPin size={18} /><span>{profile?.location || verifiedArtistProfile.location}</span><span>AKA {verifiedArtistProfile.aliases.join(" / ")}</span></div><div className="an-profile-copy"><ScrambleText as="h2" interactive duration={2400} text={"BUILT FOR\nTHE NIGHT."} /><p>{longBio}</p>{profile?.artistStatement ? <blockquote>“{profile.artistStatement}”</blockquote> : <p className="an-profile-note">Karya orisinal dirilis sebagai Akbar Nawasunda; katalog remix juga dikenal melalui DJ Akbar Remix.</p>}<div className="an-genre-row">{genres.map(genre => <span key={genre}><Radio size={12} /> {genre}</span>)}</div></div></section><section className="nf-section dark-panel an-about-path"><div><p className="nf-page-eyebrow">ENTER THE SIGNAL</p><ScrambleText as="h2" interactive duration={2400} text={"LISTEN. WATCH.\nFOLLOW THE NEXT DROP."} /></div><div className="an-about-actions"><a className="nf-button" href="/music"><Sparkles size={16} /> RELEASE VAULT</a><a className="nf-text-button" href="/epk">PRESS & BOOKING <ArrowUpRight size={15} /></a></div></section></main><NightFooter /></div>;
}
