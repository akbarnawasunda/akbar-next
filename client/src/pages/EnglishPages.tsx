import { ArrowDownRight, ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, Disc3, Mail, MapPin, Play, Radio, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useRoute } from "wouter";
import { BrandMotionMark } from "@/components/BrandMotionMark";
import { EnglishChannelLinks, EnglishFooter, EnglishHeader } from "@/components/EnglishChrome";
import { OfficialMediaFrame } from "@/components/OfficialMediaFrame";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { PlatformMarquee, SectionIndex } from "@/components/PlatformMarquee";
import { currentRelease, officialBrand, releases, verifiedArtistProfile, videos } from "@/content/artistPlatform";
import type { CmsRelease, CmsVisual } from "@/content/publicContent";
import { publicPlatformLinks, usePublicArtistContent } from "@/content/publicContent";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import "./EcosystemPages.css";
import "./OfficialEmbeds.css";
import "./MediaEnhancements.css";
import "@/components/OfficialBrand.css";
import "./Home.css";
import "./HomeStates.css";
import "./HomeRefinement.css";
import "./HomeArtistUpgrade.css";
import "./PlatformMediaUpgrade.css";
import "./HomePortraitRefinement.css";
import "./HomePlatformCards.css";
import "./HomeLayoutRefinement.css";
import "./HomeMotionRefinement.css";
import "./HomePortfolioPatterns.css";

const bookingEmail = verifiedArtistProfile.bookingEmail;
const englishLongBio = "Akbar Nawasunda's musical journey began in 2020 as an independent bedroom producer known as DJ Akbar Remix. His experiments brought popular songs into a Bandung-rooted space of Breakbeat, Jedag Jedug, and Jungle Dutch. Today, as Akbar Nawasunda, he releases original work combining pop melody, electronic bass, and remix energy for global digital platforms.";
const releaseSlug = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const youtubeId = (href: string) => href.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/)?.[1] || "";
const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const soundcloudEmbed = (url: string) => `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%230a1737&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;

type CatalogItem = {
  title: string;
  format: string;
  year: string;
  platform: string;
  href: string;
  image: string;
  story?: string;
  credits?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  platformLinks?: { label: string; href: string }[];
};

function mergedCatalog(cmsReleases: CmsRelease[]): CatalogItem[] {
  const cmsCatalog = cmsReleases.map(item => {
    const fallback = releases.find(release => release.title.trim().toLowerCase() === item.title.trim().toLowerCase());
    return {
      title: item.title,
      format: item.format || fallback?.format || "Release",
      year: item.year || fallback?.year || "—",
      platform: item.platform || fallback?.platform || "Official link",
      href: item.url || fallback?.href || "https://soundcloud.com/akbarnawasunda",
      image: item.artworkUrl || fallback?.image || officialBrand.socialPreview,
      story: item.story,
      credits: item.credits,
      spotifyUrl: item.spotifyUrl,
      appleMusicUrl: item.appleMusicUrl,
      platformLinks: item.platformLinks,
    };
  });
  return [
    ...cmsCatalog,
    ...releases
      .filter(legacy => !cmsCatalog.some(item => item.title.trim().toLowerCase() === legacy.title.trim().toLowerCase()))
      .map(legacy => ({
        title: legacy.title,
        format: legacy.format || "Release",
        year: legacy.year || "—",
        platform: legacy.platform || "Official link",
        href: legacy.href,
        image: legacy.image || officialBrand.socialPreview,
        platformLinks: [],
      })),
  ];
}

function EnglishFrame({ children }: { children: ReactNode }) {
  return <div className="nf-page en-page an-site"><EnglishHeader />{children}<EnglishFooter /></div>;
}

export function EnglishHome() {
  const platformSectionRef = useScrollReveal<HTMLElement>();
  const currentSectionRef = useScrollReveal<HTMLElement>();
  const releaseSectionRef = useScrollReveal<HTMLElement>();
  const visualSectionRef = useScrollReveal<HTMLElement>();
  const liveSectionRef = useScrollReveal<HTMLElement>();
  const signalSectionRef = useScrollReveal<HTMLElement>();
  const cms = usePublicArtistContent();
  const catalog = mergedCatalog(cms.data?.releases ?? []);
  const editablePlatformLinks = publicPlatformLinks(cms.data);
  const current = cms.data?.releases.find(item => item.isCurrent) || cms.data?.releases[0];
  const activeRelease: CatalogItem = current ? {
    title: current.title,
    format: current.format || "Release",
    year: current.year || "—",
    platform: current.platform || currentRelease.type,
    href: current.url || currentRelease.href,
    image: current.artworkUrl || currentRelease.image,
    story: current.story,
    credits: current.credits,
  } : {
    title: currentRelease.title,
    format: "Remix",
    year: "2025",
    platform: currentRelease.type,
    href: currentRelease.href,
    image: currentRelease.image,
  };
  const activeVideos = videos;
  const featuredEvent = cms.data?.events.find(event => event.isFeatured) || cms.data?.events[0];

  return <EnglishFrame><main id="top" className="en-content en-home-parity">
    <section className="an-hero en-parity-hero">
      <div className="home-hero-portrait"><img src={officialBrand.portrait} alt="Portrait of Akbar Nawasunda" width={800} height={1000} fetchPriority="high" decoding="async" /></div>
      <div className="hero-copy"><p className="eyebrow"><span /> AKBAR NAWASUNDA</p><h1 className="hero-title-editorial" data-no-scramble="true" aria-label="Akbar Nawasunda"><span aria-hidden="true"><span className="hero-title-mask"><span className="hero-title-word">AKBAR</span></span>{" "}<span className="hero-title-mask"><span className="hero-title-word">NAWASUNDA.</span></span></span></h1><p className="hero-description">Producer, remixer, and electronic bass artist from Bandung Barat, Indonesia.</p><div className="hero-actions"><a className="button-primary" href={activeRelease.href} target="_blank" rel="noreferrer"><Play size={15} fill="currentColor" /><span>LISTEN NOW</span></a><Link className="button-quiet" href="/en/visuals">VIEW VISUALS <ArrowUpRight size={16} /></Link><a className="hero-signal-link" href="#signal">LATEST UPDATES <ArrowDownRight size={14} /></a></div></div>
      <div className="home-hero-atmosphere" aria-hidden="true"><span className="home-hero-atmosphere-cloud home-hero-atmosphere-cloud-a" /><span className="home-hero-atmosphere-cloud home-hero-atmosphere-cloud-b" /><span className="home-hero-atmosphere-cloud home-hero-atmosphere-cloud-c" /></div>
      <BrandMotionMark src={officialBrand.rmxMark} locale="en" />
    </section>

    <section ref={platformSectionRef} className="home-signal-deck reveal-target" aria-labelledby="en-signal-deck-title"><SectionIndex number="01" label="OFFICIAL PLATFORMS" /><div className="home-signal-copy"><p className="eyebrow"><span /> OFFICIAL PLATFORMS</p><h2 id="en-signal-deck-title">LISTEN<br />ANYWHERE.</h2><Link className="home-deck-cta" href="/en/music">VIEW MUSIC <ArrowUpRight size={15} /></Link></div><div className="home-platform-rack">{editablePlatformLinks.map((platform, index) => <a className={`home-platform-card platform-${platform.label.toLowerCase().replace(/\s+/g, "-")}`} key={platform.label} href={platform.href} target="_blank" rel="noreferrer" aria-label={`Open Akbar Nawasunda on ${platform.label}`}><span className="home-platform-number">0{index + 1}</span><span className="home-platform-icon-shell"><PlatformIcon label={platform.label} /></span><span className="home-platform-copy"><strong>{platform.label}</strong></span><ArrowUpRight className="home-platform-arrow" size={15} /></a>)}</div><PlatformMarquee links={editablePlatformLinks} /></section>

    <section ref={currentSectionRef} className="section section-current reveal-target" id="music"><SectionIndex number="02" label="LATEST RELEASE" /><div className="section-heading"><p className="eyebrow">LATEST RELEASE</p><h2>NOW<br />PLAYING.</h2></div><div className="feature-release"><div className="release-cover"><ResilientArtworkImage src={activeRelease.image} backupSrc={officialBrand.socialPreview} alt={`Artwork for ${activeRelease.title}`} /><span className="cover-orbit" /></div><div className="release-detail"><p className="mono-label">{activeRelease.format} · {activeRelease.year}</p><h3>{activeRelease.title}</h3><p>Open the official release route to listen to this verified catalog entry.</p><div className="release-detail-actions"><a className="text-link" href={activeRelease.href} target="_blank" rel="noreferrer">OPEN RELEASE <ArrowUpRight size={16} /></a><span>{activeRelease.platform}</span></div></div></div></section>

    <section ref={releaseSectionRef} className="section release-section reveal-target"><SectionIndex number="03" label="ALL RELEASES" /><div className="section-inline"><div><p className="eyebrow">DISCOGRAPHY</p><h2>ALL<br />RELEASES.</h2></div><a className="text-link" href={editablePlatformLinks.find(link => link.label === "Spotify")?.href || "https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw"} target="_blank" rel="noreferrer">SPOTIFY <PlatformIcon label="Spotify" /> <ArrowUpRight size={16} /></a></div><div className="release-grid">{catalog.map((release, index) => <a className="release-card" key={release.title} href={release.href} target="_blank" rel="noreferrer">{release.image && <div className="release-card-art"><ResilientArtworkImage src={release.image} backupSrc={officialBrand.socialPreview} alt={`Artwork for ${release.title}`} /></div>}<span className="release-number">0{index + 1}</span><PlatformIcon label={release.platform} /><p>{release.format} · {release.year}</p><h3>{release.title}</h3><span className="release-platform-line">{release.platform} <ArrowUpRight size={14} /></span></a>)}</div></section>

    <section ref={visualSectionRef} className="section visual-section reveal-target"><SectionIndex number="04" label="VIDEOS" /><div className="section-heading"><p className="eyebrow">VISUAL</p><h2>OFFICIAL<br />VIDEO.</h2></div><div className="video-grid">{activeVideos.map((video, index) => <a key={video.title} className={`video-card video-${index + 1}`} href={video.href} target="_blank" rel="noreferrer"><ResilientArtworkImage src={video.image} backupSrc={officialBrand.socialPreview} alt={`${video.title} — official visual artwork`} /><div className="video-overlay" /><div className="video-content"><span>{video.label}</span><h3>{video.title}</h3><div className="round-play"><Play size={17} fill="currentColor" /></div></div></a>)}</div></section>

    <section ref={liveSectionRef} className="section live-section reveal-target"><SectionIndex number="05" label="LIVE DATES" /><div className="live-backdrop" style={{ backgroundImage: "url(/assets/akbar-night-frequency-hero.webp)" }} /><div className="live-copy"><p className="eyebrow">LIVE</p><h2>LIVE<br />DATES.</h2><p>{cms.data?.live?.message || "Dates will appear here after they are officially announced."}</p><Link className="button-primary" href={featuredEvent?.ticketUrl || featuredEvent?.rsvpUrl || "/en/inquire"} target={featuredEvent?.ticketUrl || featuredEvent?.rsvpUrl ? "_blank" : undefined} rel={featuredEvent?.ticketUrl || featuredEvent?.rsvpUrl ? "noreferrer" : undefined}><Ticket size={16} /><span>{featuredEvent?.ticketUrl ? "GET TICKETS" : featuredEvent?.rsvpUrl ? "RSVP SHOW" : "ASK ABOUT BOOKING"}</span></Link></div><div className="live-status"><span>{featuredEvent ? "NEXT CONFIRMED SHOW" : "DATES"}</span><strong>{featuredEvent?.title || <>NO PUBLIC<br />DATE</>}</strong><small>{featuredEvent ? formatEnglishDate(featuredEvent.date) : "TO BE ANNOUNCED"}</small></div>{cms.data?.events.length ? <div className="home-live-events" aria-label="Confirmed live dates">{cms.data.events.slice(0, 3).map(event => { const eventHref = event.ticketUrl || event.rsvpUrl || "/en/live"; return <a className="home-live-event" href={eventHref} target={eventHref.startsWith("http") ? "_blank" : undefined} rel={eventHref.startsWith("http") ? "noreferrer" : undefined} key={event._id}><span>{formatEnglishDate(event.date, event.time)}</span><strong>{event.title}</strong><small>{[event.venue, event.city, event.country].filter(Boolean).join(", ") || "Venue details to follow"}</small><ArrowUpRight size={14} /></a>; })}</div> : null}</section>

    <section ref={signalSectionRef} className="signal-section reveal-target" id="signal"><SectionIndex number="06" label="LATEST UPDATES" /><div><p className="eyebrow"><Sparkles size={14} /> LATEST UPDATES</p><h2>NEW MUSIC<br />AND NEWS.</h2><p>Official release, visual, and live updates from Akbar Nawasunda's channels.</p></div><div className="en-signal-action"><strong>FOLLOW THE OFFICIAL LINKS.</strong><p>Follow the official platforms for new music and future announcements.</p><Link className="button-primary" href="/en/inquire">CONTACT AKBAR <ArrowUpRight size={15} /></Link></div></section>
  </main></EnglishFrame>;
}

export function EnglishMusic() {
  const cms = usePublicArtistContent();
  const cmsReleases = cms.data?.releases ?? [];
  const editablePlatformLinks = publicPlatformLinks(cms.data);
  const catalog = mergedCatalog(cmsReleases);
  const current = cmsReleases.find(item => item.isCurrent) || cmsReleases[0];
  const featured: CatalogItem = current ? (catalog.find(item => item.title.trim().toLowerCase() === current.title.trim().toLowerCase()) || {
    title: current.title,
    format: current.format || "Release",
    year: current.year || "—",
    platform: current.platform || "Official link",
    href: current.url || currentRelease.href,
    image: current.artworkUrl || currentRelease.image,
    story: current.story,
    credits: current.credits,
    spotifyUrl: current.spotifyUrl,
    appleMusicUrl: current.appleMusicUrl,
  }) : {
    title: currentRelease.title,
    format: "Remix",
    year: "2025",
    platform: currentRelease.type,
    href: currentRelease.href,
    image: currentRelease.image,
  };
  const drops = cmsReleases.filter(item => item.embedUrl).slice(0, 2).map(item => ({ title: item.title, url: item.embedUrl! }));
  const players = drops.length ? drops : [{ title: "Masih Mencintainya — Papinka", url: currentRelease.href }, { title: "Ngertenono Ati Medium Hall", url: "https://soundcloud.com/akbarnawasunda/ngertenono_ati_medium_hall_mbfrecords" }];
  return <EnglishFrame><main className="en-content"><section className="nf-page-hero en-hero" style={{ "--page-image": `url(${featured.image || officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">MUSIC / OFFICIAL CATALOG</p><h1>MUSIC<br /><em>BY AKBAR.</em></h1><p>Original releases and official remixes by Akbar Nawasunda.</p></div><div className="nf-hero-note"><span>{cms.isLoading ? "LOADING CATALOG" : "FEATURED RELEASE"}</span><strong>{featured.title}</strong><a className="nf-text-button" href={featured.href} target="_blank" rel="noreferrer">LISTEN <ArrowUpRight size={15} /></a></div></section>
    <section className="nf-section"><div className="en-section-intro"><p className="nf-page-eyebrow">LISTENING LINKS</p><h2>CHOOSE<br /><em>YOUR PLATFORM.</em></h2><p>Use the official links below. Player embeds remain optional and load only when requested.</p></div><div className="nf-platform-grid">{editablePlatformLinks.map(platform => <a key={platform.label} href={platform.href} target="_blank" rel="noreferrer"><PlatformIcon label={platform.label} />{platform.label}<ArrowUpRight size={15} /></a>)}</div></section>
    <section className="nf-section"><div className="en-two-column"><div className="en-aside"><p className="nf-page-eyebrow">FEATURED RELEASE</p><strong>{featured.title}</strong><span>{featured.format || "Release"} · {featured.year || "2025"} · {featured.platform || "Official link"}</span></div><div className="en-copy-block"><p className="nf-page-eyebrow">RELEASE NOTE</p><h2>KEEP<br /><em>LISTENING.</em></h2><p>Release details will appear here when published. The official listening route is always available.</p>{featured.credits && <p className="en-inline-note">CREDITS · {featured.credits}</p>}<Link className="nf-text-button" href={`/en/music/${releaseSlug(featured.title)}`}>OPEN RELEASE DETAIL <ArrowUpRight size={15} /></Link></div></div></section>
    <section className="nf-section dark-panel"><div className="en-section-intro"><p className="nf-page-eyebrow">LISTEN HERE</p><h2>LISTEN<br /><em>DIRECTLY.</em></h2><p>Open a player when you want it, or use the official source link on every card.</p></div><div className="en-visual-grid">{players.map(drop => { const known = catalog.find(item => item.title.toLowerCase().includes(drop.title.toLowerCase().split(" — ")[0])); return <div className="en-visual-card" key={drop.url}><OfficialMediaFrame title={drop.title} provider="SoundCloud" sourceUrl={drop.url} embedUrl={soundcloudEmbed(drop.url)} artwork={known?.image || officialBrand.socialPreview} backupArtwork={officialBrand.socialPreview} description="Official link available." /></div>; })}</div></section>
    <section className="nf-section"><div className="en-section-intro"><p className="nf-page-eyebrow">FULL CATALOG</p><h2>EVERY<br /><em>RELEASE.</em></h2></div><div className="en-catalog">{catalog.map((item, index) => <Link key={`${item.title}-${index}`} className="en-release-card" href={`/en/music/${releaseSlug(item.title)}`}><ResilientArtworkImage src={item.image} backupSrc={officialBrand.socialPreview} alt={`Artwork for ${item.title}`} /><div className="en-release-card-copy"><span>{String(index + 1).padStart(2, "0")} / {item.format} · {item.year}</span><h3>{item.title}</h3><p>{item.platform}</p></div></Link>)}</div></section></main></EnglishFrame>;
}

export function EnglishVisuals() {
  const cms = usePublicArtistContent();
  const cmsVisuals = cms.data?.visuals ?? [];
  const visualItems = cmsVisuals.length ? cmsVisuals.map(item => ({ title: item.title, label: item.label || "OFFICIAL VISUAL", href: item.url || (item.youtubeId ? `https://youtu.be/${item.youtubeId}` : "https://www.youtube.com/@akbarnawasunda"), youtubeId: item.youtubeId || "", image: item.imageUrl || (item.youtubeId ? youtubeThumbnail(item.youtubeId) : officialBrand.socialPreview) })) : videos.map(item => ({ title: item.title, label: item.label, href: item.href, youtubeId: youtubeId(item.href), image: youtubeId(item.href) ? youtubeThumbnail(youtubeId(item.href)) : officialBrand.socialPreview }));
  return <EnglishFrame><main className="en-content"><section className="nf-page-hero en-hero"><div><p className="nf-page-eyebrow">VISUALS / OFFICIAL CHANNEL</p><h1>VIDEO<br /><em>ARCHIVE.</em></h1><p>Visual releases, DJ edits, and official uploads from the Akbar Nawasunda channel.</p></div><div className="nf-hero-note"><span>{cms.isLoading ? "LOADING VISUALS" : "OFFICIAL CHANNEL"}</span><strong>AKBAR NAWASUNDA</strong><a className="nf-text-button" href="https://www.youtube.com/@akbarnawasunda" target="_blank" rel="noreferrer">OPEN YOUTUBE <ArrowUpRight size={15} /></a></div></section><section className="nf-section"><div className="en-section-intro"><p className="nf-page-eyebrow">SELECTED VISUALS</p><h2>WATCH<br /><em>THE VIDEOS.</em></h2><p>Preview thumbnails first. Embedded players load only after you choose to play.</p></div><div className="en-visual-grid">{visualItems.map(item => item.youtubeId ? <div className="en-visual-card" key={item.title}><OfficialMediaFrame title={item.title} provider="YouTube" sourceUrl={item.href} embedUrl={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`} artwork={item.image} backupArtwork={officialBrand.socialPreview} description="Official video channel." /></div> : <a className="en-service-card" href={item.href} target="_blank" rel="noreferrer"><span>{item.label}</span><h3>{item.title}</h3><p>Open the official source to view this visual.</p><ArrowUpRight size={17} /></a>)}</div></section><section className="nf-section dark-panel"><div className="en-contact-panel"><div><p className="nf-page-eyebrow">DIRECTOR / BOOKER / CURATOR</p><h2>NEED THE<br /><em>RIGHT CUT?</em></h2><p>For visual collaboration, licensing, or a release-related brief, send the context directly.</p></div><a className="nf-button" href={`mailto:${bookingEmail}?subject=Visual%20inquiry`}><Mail size={15} /> EMAIL THE STUDIO <ArrowUpRight size={15} /></a></div></section></main></EnglishFrame>;
}

function formatEnglishDate(date: string, time?: string) { const parsed = new Date(date); if (Number.isNaN(parsed.getTime())) return date; const dateText = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(parsed).toUpperCase(); return time ? `${dateText} · ${time}` : dateText; }

export function EnglishLive() {
  const cms = usePublicArtistContent();
  const events = cms.data?.events ?? [];
  const featured = events.find(event => event.isFeatured) || events[0];
  return <EnglishFrame><main className="en-content"><section className="nf-page-hero en-hero"><div><p className="nf-page-eyebrow">LIVE / VERIFIED DATES</p><h1>LIVE<br /><em>DATES.</em></h1><p>{cms.data?.live?.message || "Public dates will appear here after they are officially announced."}</p></div><div className="nf-hero-note"><span>{featured ? "NEXT CONFIRMED SHOW" : "CURRENT STATUS"}</span><strong>{featured?.title || "NO PUBLIC DATE"}</strong>{featured?.ticketUrl ? <a className="nf-text-button" href={featured.ticketUrl} target="_blank" rel="noreferrer">TICKETS <ArrowUpRight size={15} /></a> : <Link className="nf-text-button" href="/en/inquire">BOOKING INQUIRY <ArrowUpRight size={15} /></Link>}</div></section><section className="nf-section"><div className="en-section-intro"><p className="nf-page-eyebrow">EVENT BOARD</p><h2>LIVE<br /><em>DATES.</em></h2><p>Only confirmed, publicly available dates are shown. No placeholder events are published.</p></div>{events.length ? <div className="en-service-grid">{events.map(event => <article className="en-service-card" key={event._id}><span><CalendarDays size={14} /> {formatEnglishDate(event.date, event.time)}</span><h3>{event.title}</h3><p><MapPin size={13} /> {event.venue ? `${event.venue}, ` : ""}{event.city || ""}{event.country ? ` · ${event.country}` : ""}</p><div className="en-action-row">{event.ticketUrl && <a className="nf-text-button" href={event.ticketUrl} target="_blank" rel="noreferrer">TICKETS <ArrowUpRight size={13} /></a>}{event.rsvpUrl && <a className="nf-text-button" href={event.rsvpUrl} target="_blank" rel="noreferrer">RSVP <ArrowUpRight size={13} /></a>}</div></article>)}</div> : <div className="en-empty"><span className="nf-page-eyebrow">DATES / STANDBY</span><strong>No confirmed show is public yet.</strong><p>The calendar stays quiet until a real date, place, and official route are ready to share.</p><Link className="nf-button" href="/en/inquire">ASK ABOUT BOOKING <ArrowUpRight size={15} /></Link></div>}</section><section className="nf-section dark-panel"><div className="en-two-column"><div className="en-aside"><p className="nf-page-eyebrow">OFFICIAL CHANNELS</p><strong>Keep the line open.</strong><p>Follow the official platforms for new releases and future live announcements.</p></div><div className="en-copy-block"><p className="nf-page-eyebrow">BOOKING</p><h2>BRING THE<br /><em>MUSIC.</em></h2><p>Share your city, date window, venue context, and project brief. Availability and terms are discussed directly.</p><a className="nf-button" href={`mailto:${bookingEmail}?subject=Live%20booking%20inquiry`}>EMAIL BOOKING <ArrowUpRight size={15} /></a></div></div></section></main></EnglishFrame>;
}

export function EnglishUniverse() {
  const catalog = mergedCatalog(usePublicArtistContent().data?.releases ?? []);
  return <EnglishFrame><main className="en-content"><section className="nf-page-hero en-hero"><div><p className="nf-page-eyebrow">AN ARCHIVE / ORIGIN</p><h1>THE<br /><em>UNIVERSE.</em></h1><p>A concise route through the sound, identity, and catalog behind Akbar Nawasunda.</p></div><div className="nf-hero-note"><span>ORIGIN</span><strong>2020 / BANDUNG BARAT</strong><a className="nf-text-button" href="#origin">READ THE STORY <ArrowUpRight size={15} /></a></div></section><section className="nf-section" id="origin"><div className="en-two-column"><div className="en-aside"><p className="nf-page-eyebrow">THE BEGINNING</p><strong>From DJ Akbar Remix to Akbar Nawasunda.</strong><span>Independent producer · Bandung Barat · Indonesia</span></div><div className="en-copy-block"><p className="nf-page-eyebrow">THE THROUGH-LINE</p><h2>REBUILD THE<br /><em>ENERGY.</em></h2><p>Akbar Nawasunda began creating independently in 2020 as DJ Akbar Remix, experimenting with Breakbeat, Jedag Jedug, and Jungle Dutch through a Bandung-rooted remix language. The current name carries that energy into original releases that connect pop melody, electronic bass, and remix instinct.</p><div className="en-stat-row"><div className="en-stat"><strong>2020</strong><span>CREATIVE ORIGIN</span></div><div className="en-stat"><strong>{verifiedArtistProfile.location.split(",")[0]}</strong><span>HOME BASE</span></div></div><div className="en-genre-row">{verifiedArtistProfile.genres.map(genre => <span key={genre}>{genre}</span>)}</div></div></div></section><section className="nf-section en-archive-art-feature"><div className="en-archive-art-frame"><img src={officialBrand.archivePortrait} alt="Editorial Akbar Nawasunda artwork about a future city" loading="lazy" decoding="async" width={800} height={1000} /></div><div className="en-archive-art-copy"><p className="nf-page-eyebrow">VISUAL LANGUAGE / 001</p><h2>THE FUTURE<br />IS HERE.</h2><p>One visual direction from the Akbar Nawasunda world: industrial, high-contrast, and close to electronic bass energy.</p><p className="en-archive-art-note">ARCHIVE VISUAL · NOT AN AUDIO RELEASE</p><Link className="nf-button" href="/en/visuals">VIEW VISUALS <ArrowUpRight size={15} /></Link></div></section><section className="nf-section dark-panel"><div className="en-section-intro"><p className="nf-page-eyebrow">RELEASED WORK</p><h2>THE<br /><em>CATALOG.</em></h2><p>Open each title through the official platform route.</p></div><div className="en-catalog">{catalog.slice(0, 6).map((item, index) => <Link key={`${item.title}-${index}`} className="en-release-card" href={`/en/music/${releaseSlug(item.title)}`}><ResilientArtworkImage src={item.image} backupSrc={officialBrand.socialPreview} alt={`Artwork for ${item.title}`} /><div className="en-release-card-copy"><span>{item.year} / {item.platform}</span><h3>{item.title}</h3></div></Link>)}</div></section></main></EnglishFrame>;
}

export function EnglishAbout() {
  const cms = usePublicArtistContent();
  const profile = cms.data?.profile;
  const shortBio = "Producer and remixer from Bandung Barat. Since 2020, he has released original work as Akbar Nawasunda across digital music platforms.";
  const longBio = englishLongBio;
  const location = profile?.location || verifiedArtistProfile.location;
  const genres = profile?.genres?.length ? profile.genres : verifiedArtistProfile.genres;
  return <EnglishFrame><main className="en-content">
    <section className="nf-page-hero en-hero" style={{ "--page-image": `url(${profile?.portraitImage || officialBrand.portrait})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">ABOUT / ARTIST PROFILE</p><h1>AKBAR<br /><em>NAWASUNDA.</em></h1><p>{shortBio}</p></div><div className="nf-hero-note"><span>BASED IN</span><strong>{location}</strong><Link className="nf-text-button" href="/en/music">VIEW MUSIC <ArrowUpRight size={15} /></Link></div></section>
    <section className="nf-section an-profile-section"><div className="an-profile-aside"><p className="nf-page-eyebrow">ARTIST PROFILE</p><MapPin size={18} /><span>{location}</span><span>ALSO KNOWN AS {verifiedArtistProfile.aliases.join(" / ")}</span></div><div className="an-profile-copy"><h2>MUSIC<br />JOURNEY.</h2><p>{longBio}</p>{profile?.artistStatement ? <blockquote>“{profile.artistStatement}”</blockquote> : <p className="an-profile-note">Original work is released as Akbar Nawasunda; the remix catalog is also known through DJ Akbar Remix.</p>}<div className="an-genre-row">{genres.map(genre => <span key={genre}><Radio size={12} /> {genre}</span>)}</div></div></section>
    <section className="nf-section dark-panel an-about-path"><div><p className="nf-page-eyebrow">MUSIC & CONTACT</p><h2>LISTEN TO<br />THE WORK.</h2></div><div className="an-about-actions"><Link className="nf-button" href="/en/music"><Sparkles size={16} /> MUSIC</Link><Link className="nf-text-button" href="/en/epk">PRESS & BOOKING <ArrowUpRight size={15} /></Link></div></section>
  </main></EnglishFrame>;
}

export function EnglishEpk() {
  const cms = usePublicArtistContent();
  const pressKit = cms.data?.pressKit;
  const catalog = mergedCatalog(cms.data?.releases ?? []);
  const editablePlatformLinks = publicPlatformLinks(cms.data);
  const email = pressKit?.bookingEmail || bookingEmail;
  const optionalAssets = [{ label: "ONE SHEET", title: "Artist one sheet", url: pressKit?.oneSheetUrl }, { label: "PRESS IMAGES", title: "Press image set", url: pressKit?.photoPackUrl }, { label: "BRAND KIT", title: "Logo package", url: pressKit?.logoPackUrl }, { label: "SHOW NOTES", title: "Technical rider", url: pressKit?.technicalRiderUrl }].filter(item => item.url);
  return <EnglishFrame><main className="en-content">
    <section className="nf-epk-hero en-hero en-epk-hero"><div className="en-epk-hero-copy"><p className="nf-page-eyebrow">AKBAR NAWASUNDA / ONLINE EPK</p><h1>PRESS &<br /><em>BOOKING.</em></h1><p>Information for promoters, media, playlist editors, and collaborators.</p><div className="en-action-row"><a className="nf-button" href={`mailto:${email}?subject=Akbar%20Nawasunda%20press%20or%20booking`}><Mail size={15} /> CONTACT PRESS</a><Link className="nf-text-button" href="/en/about">READ ARTIST PROFILE <ArrowUpRight size={15} /></Link></div></div><aside className="en-epk-art-card"><img src={officialBrand.editorialPortrait} alt="Editorial portrait artwork of Akbar Nawasunda" loading="eager" decoding="async" width={667} height={1000} /><div><span>EDITORIAL / PRESS</span><strong>AKBAR<br />NAWASUNDA</strong><small>{verifiedArtistProfile.location} · {verifiedArtistProfile.aliases[0]}</small></div></aside></section>
    <section className="nf-section"><div className="en-two-column"><div><p className="nf-page-eyebrow">ARTIST SNAPSHOT</p><h2>AKBAR<br /><em>NAWASUNDA.</em></h2><p>{englishLongBio}</p><div className="en-genre-row">{verifiedArtistProfile.genres.map(genre => <span key={genre}>{genre}</span>)}</div></div><aside className="en-aside"><p className="nf-page-eyebrow">QUICK FACTS</p><strong>{verifiedArtistProfile.location}</strong><span>Also known as {verifiedArtistProfile.aliases.join(" / ")}</span><span>Producer / Remixer</span><span>{email}</span></aside></div></section>
    <section className="nf-section dark-panel"><div className="en-section-intro"><p className="nf-page-eyebrow">CAPABILITIES</p><h2>BUILT FOR<br /><em>THE DROP.</em></h2><p>Working formats available for performance, production, collaboration, and music use.</p></div><div className="en-service-grid">{verifiedArtistProfile.services.map((service, index) => <article className="en-service-card" key={service}><span>0{index + 1}</span><h3>{service}</h3><p>{index === 0 ? "Remix requests with a clear brief, references, and release direction." : index === 1 ? "Custom arrangements shaped around the character of a track or content brief." : index === 2 ? "Build a focused piece together from first idea through publication-ready material." : "Music licensing for content, partners, and commercial use."}</p></article>)}</div><p className="en-inline-note"><strong>LICENSING NOTE · </strong>For music use in content, contact the studio by email. Commercial use is discussed separately; non-commercial use with clear credit is appreciated.</p></section>
    <section className="nf-section"><div className="en-section-intro"><p className="nf-page-eyebrow">PRESS ASSETS</p><h2>OFFICIAL<br /><em>ASSETS.</em></h2><p>{optionalAssets.length ? "Published studio assets are available through the cards below." : "Additional official event assets can be requested through the press contact."}</p></div><div className="en-service-grid">{optionalAssets.length ? optionalAssets.map(item => <a className="en-service-card" href={item.url} key={item.label} target="_blank" rel="noreferrer"><span>{item.label}</span><h3>{item.title}</h3><p>Published file available through the official CMS.</p><ArrowUpRight size={17} /></a>) : <div className="en-empty"><span className="nf-page-eyebrow">ASSET STATUS</span><strong>Available on request.</strong><p>Unavailable photo packs, riders, and contracts stay off the public site until they are officially published.</p><a className="nf-button" href={`mailto:${email}?subject=Press%20asset%20request`}><Mail size={15} /> REQUEST ASSETS</a></div>}</div></section>
    <section className="nf-section dark-panel"><div className="en-section-intro"><p className="nf-page-eyebrow">SELECTED RELEASES</p><h2>RELEASED<br /><em>WORK.</em></h2><p>Official platform routes for editors, promoters, and collaborators.</p></div><div className="en-catalog">{catalog.slice(0, 3).map((release, index) => <a className="en-release-card" href={release.href} target="_blank" rel="noreferrer" key={release.title}><ResilientArtworkImage src={release.image} backupSrc={officialBrand.socialPreview} alt={`Artwork for ${release.title}`} /><div className="en-release-card-copy"><span>{release.platform} · {release.year}</span><h3>{release.title}</h3><p>{release.format}</p></div></a>)}</div></section>
    <section className="nf-section en-contact-panel"><div className="en-two-column"><div><p className="nf-page-eyebrow">BOOKING / COLLABORATION</p><h2>PROJECT<br /><em>CONTACT.</em></h2><p>Share the context for a performance, remix, collaboration, or licensing request. Availability and terms are confirmed after review.</p></div><div className="en-action-row"><Link className="nf-button" href="/en/inquire?type=booking&source=epk">BOOKING INQUIRY <ArrowUpRight size={15} /></Link><a className="nf-text-button" href={`mailto:${email}?subject=Press%20material%20request`}>PRESS CONTACT <Mail size={15} /></a></div></div></section>
    <section className="nf-section"><div className="en-section-intro"><p className="nf-page-eyebrow">OFFICIAL CHANNELS</p><h2>OFFICIAL<br /><em>PLATFORMS.</em></h2></div><div className="nf-platform-grid">{editablePlatformLinks.slice(0, 5).map(link => <a href={link.href} target="_blank" rel="noreferrer" key={link.label}><PlatformIcon label={link.label} />{link.label}<ArrowUpRight size={15} /></a>)}</div></section>
  </main></EnglishFrame>;
}

const inquiryServices = [
  ["01", "Booking", "For shows, curated programs, and event opportunities with a clear date and venue context."],
  ["02", "Remix requests", "Send the source, intended direction, and release or usage context for a considered response."],
  ["03", "Custom arrangements", "Production support for a defined brief, mood, reference, and delivery scope."],
  ["04", "Collaborations", "Bring a focused idea for a track, visual, or cross-disciplinary project."],
];

export function EnglishInquiry() {
  return <EnglishFrame><main className="en-content"><section className="nf-page-hero en-hero"><div><p className="nf-page-eyebrow">INQUIRE / DIRECT CONTACT</p><h1>MAKE A<br /><em>REQUEST.</em></h1><p>Tell the studio what you are building, when it needs to happen, and what kind of response you need.</p></div><div className="nf-hero-note"><span>OFFICIAL ROUTE</span><strong>EMAIL THE STUDIO</strong><a className="nf-text-button" href={`mailto:${bookingEmail}`}>SEND A BRIEF <ArrowUpRight size={15} /></a></div></section><section className="nf-section"><div className="en-section-intro"><p className="nf-page-eyebrow">WHAT CAN WE BUILD?</p><h2>START WITH<br /><em>CONTEXT.</em></h2><p>A strong first message includes the project, date or timeline, location, budget range when relevant, and the exact deliverable you are asking about.</p></div><div className="en-service-grid">{inquiryServices.map(([number, title, copy]) => <article className="en-service-card" key={title}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section><section className="nf-section dark-panel"><div className="en-contact-panel"><div><p className="nf-page-eyebrow">BOOKING / COLLAB / PRESS</p><h2>DIRECT IS<br /><em>BETTER.</em></h2><p>Use the official address below. This route opens your mail client so you keep control of the message and attachments.</p><div className="en-email">{bookingEmail}</div></div><a className="nf-button" href={`mailto:${bookingEmail}?subject=Akbar%20Nawasunda%20inquiry`}><Mail size={15} /> OPEN EMAIL <ArrowUpRight size={15} /></a></div></section></main></EnglishFrame>;
}

export function EnglishLicensing() {
  const routes = [["01", "Content use", "For social, editorial, branded, or platform content that needs a defined track and usage window."], ["02", "Commercial use", "Commercial permissions, fees, exclusivity, and deliverables are discussed case by case."], ["03", "Clearance first", "A request is an opening conversation, not automatic permission to use a recording."], ["04", "Credit matters", "Non-commercial use with clear credit is appreciated, but still needs a confirmed route when rights are involved."]];
  return <EnglishFrame><main className="en-content"><section className="nf-page-hero en-hero"><div><p className="nf-page-eyebrow">LICENSING / MUSIC USAGE</p><h1>LICENSE<br /><em>THE MUSIC.</em></h1><p>For content, campaigns, edits, and other uses that need a clear, direct conversation about rights.</p></div><div className="nf-hero-note"><span>STATUS</span><strong>REQUEST FIRST</strong><a className="nf-text-button" href={`mailto:${bookingEmail}?subject=Music%20licensing%20inquiry`}>ASK ABOUT USE <ArrowUpRight size={15} /></a></div></section><section className="nf-section"><div className="en-section-intro"><p className="nf-page-eyebrow">THE ROUTE</p><h2>CLARITY<br /><em>BEFORE USE.</em></h2><p>Send the title, the project, where it will appear, the territory, duration, audience, and whether the use is commercial or non-commercial.</p></div><div className="en-service-grid">{routes.map(([number, title, copy]) => <article className="en-service-card" key={title}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section><section className="nf-section dark-panel"><div className="en-contact-panel"><div><p className="nf-page-eyebrow">BEFORE YOU PUBLISH</p><h2>DESCRIBE<br /><em>THE USE.</em></h2><p>Rights, approvals, fees, exclusivity, and deliverables depend on the project. This page is an inquiry route, not an automatic license.</p></div><a className="nf-button" href={`mailto:${bookingEmail}?subject=Music%20licensing%20inquiry`}><Mail size={15} /> SEND LICENSING BRIEF <ArrowUpRight size={15} /></a></div></section></main></EnglishFrame>;
}

export function EnglishPrivacy() {
  const sections = [["short-version", "Short version"], ["collection", "What we collect"], ["cookies", "Cookies & storage"], ["services", "Third-party services"], ["rights", "Your rights"]];
  return <EnglishFrame><main className="en-content"><section className="nf-section en-privacy-intro"><div className="en-two-column"><div className="en-copy-block"><p className="nf-page-eyebrow">AKBAR NAWASUNDA / DATA NOTE</p><h1>PRIVACY<br /><em>POLICY.</em></h1><p>This is the English reading of the public data note for the official Akbar Nawasunda website.</p></div><aside className="en-contact-panel"><ShieldCheck size={20} /><div><span className="nf-page-eyebrow">DATA POSTURE</span><h2>LIGHT BY DEFAULT.</h2><p>No advertising, no tracking cookies, and no sale of personal data.</p></div></aside></div></section><section className="nf-section"><div className="en-legal-layout"><nav className="en-legal-index" aria-label="Privacy Policy sections">{sections.map(([id, label], index) => <a href={`#${id}`} key={id}>{String(index + 1).padStart(2, "0")} / {label}</a>)}</nav><div><article className="en-legal-block" id="short-version"><p className="nf-page-eyebrow">01 / THE SHORT VERSION</p><h2>LIGHT ON<br /><em>YOUR DATA.</em></h2><p className="en-legal-note">No advertising, no tracking cookies, no selling data.</p><p>The site is designed to keep data collection limited to what is needed for contact, site operation, and clearly described services.</p></article><article className="en-legal-block" id="collection"><p className="nf-page-eyebrow">02 / WHAT WE COLLECT</p><h2>WHAT ENTERS<br /><em>THE SYSTEM.</em></h2><ul><li>Contact details and project context when you send an inquiry.</li><li>Limited interface or authentication support stored by the browser when required.</li><li>Aggregate, privacy-friendly analytics only when configured by the site owner.</li></ul></article><article className="en-legal-block" id="cookies"><p className="nf-page-eyebrow">03 / COOKIES & LOCAL STORAGE</p><h2>NO HIDDEN<br /><em>TRACKING.</em></h2><p>The site does not set advertising or tracking cookies. Limited local storage may support interface preferences or authentication.</p><p>Spotify, YouTube, and SoundCloud players use a click-to-load pattern. Their services receive requests only after you choose to open or play them, and their own privacy policies then apply.</p></article><article className="en-legal-block" id="services"><p className="nf-page-eyebrow">04 / THIRD-PARTY SERVICES</p><h2>WHO HELPS<br /><em>RUN THE SITE.</em></h2><ul><li>Vercel for hosting and delivery.</li><li>Google Fonts for typefaces.</li><li>Umami when privacy-friendly analytics are configured.</li><li>Spotify, YouTube, and SoundCloud for optional media players.</li><li>Apple Music and other platform services for official release routes.</li></ul></article><article className="en-legal-block" id="rights"><p className="nf-page-eyebrow">05 / YOUR RIGHTS</p><h2>YOUR DATA.<br /><em>YOUR CALL.</em></h2><p>You may ask about access, correction, or deletion of personal data held through an inquiry or site service. Requests should be sent to the official contact address.</p><a className="nf-button" href={`mailto:${bookingEmail}?subject=Privacy%20request`}><Mail size={15} /> CONTACT ABOUT YOUR DATA <ArrowUpRight size={15} /></a></article><p className="en-inline-note"><CheckCircle2 size={14} /> Last reviewed: 14 Aug 2026 · Indonesia</p></div></div></section></main></EnglishFrame>;
}

export function EnglishReleaseDetail() {
  const [, params] = useRoute("/en/music/:slug");
  const cms = usePublicArtistContent();
  const catalog = mergedCatalog(cms.data?.releases ?? []);
  const release = catalog.find(item => releaseSlug(item.title) === params?.slug);
  if (!release && !cms.isLoading) return <EnglishFrame><main className="en-content"><section className="nf-section en-empty"><p className="nf-page-eyebrow">RELEASE NOT FOUND</p><strong>This release is not available.</strong><Link className="nf-button" href="/en/music"><ArrowLeft size={15} /> BACK TO MUSIC</Link></section></main></EnglishFrame>;
  const links = release ? [{ label: release.platform, href: release.href }, ...(release.platformLinks || []), ...(release.spotifyUrl ? [{ label: "Spotify", href: release.spotifyUrl }] : []), ...(release.appleMusicUrl ? [{ label: "Apple Music", href: release.appleMusicUrl }] : [])].filter(link => link.href) : [];
  return <EnglishFrame><main className="en-content"><section className="nf-page-hero en-hero" style={{ "--page-image": `url(${release?.image || officialBrand.socialPreview})` } as React.CSSProperties}><div><Link className="en-back-link" href="/en/music"><ArrowLeft size={14} /> BACK TO MUSIC</Link><p className="nf-page-eyebrow">RELEASE / {release?.format || "LOADING"}</p><h1>{release?.title || "LOADING RELEASE…"}</h1><p>{release ? `${release.format} · ${release.year} · ${release.platform}` : "Loading the official catalog."}</p></div><div className="nf-hero-note"><span>OFFICIAL RELEASE</span><strong>{release?.year || "—"}</strong>{release && <a className="nf-text-button" href={release.href} target="_blank" rel="noreferrer">LISTEN <ArrowUpRight size={15} /></a>}</div></section><section className="nf-section"><div className="en-two-column"><div className="en-release-card"><ResilientArtworkImage src={release?.image || officialBrand.socialPreview} backupSrc={officialBrand.socialPreview} alt={release ? `Artwork for ${release.title}` : "Release artwork loading"} /><div className="en-release-card-copy"><span><Disc3 size={13} /> {release?.format || "RELEASE"}</span></div></div><div className="en-copy-block"><p className="nf-page-eyebrow">ABOUT THE RELEASE</p><h2>{release?.title || "RELEASE"}</h2><p>Release details will appear when published. The official listening route remains available from the platform link.</p><p className="en-inline-note">{release?.credits || "Official credits not published."}</p></div></div></section><section className="nf-section dark-panel"><div className="en-section-intro"><p className="nf-page-eyebrow">LISTEN ON</p><h2>OFFICIAL<br /><em>PLATFORMS.</em></h2></div><div className="en-service-grid">{links.map(link => <a className="en-service-card" key={link.label} href={link.href} target="_blank" rel="noreferrer"><span>{link.label}</span><h3>OPEN PLATFORM</h3><ArrowUpRight size={17} /></a>)}<Link className="en-service-card" href="/en/licensing"><span>USAGE</span><h3>LICENSE THIS TRACK</h3><ArrowUpRight size={17} /></Link></div></section></main></EnglishFrame>;
}
