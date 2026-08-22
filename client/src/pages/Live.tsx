import { ArrowUpRight, CalendarDays, MapPin, Radio, Ticket } from "lucide-react";
import FanSignalInline from "@/components/FanSignalInline";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand } from "@/content/artistPlatform";
import { useSanityArtistContent } from "@/sanity/publicContent";
import "./EcosystemPages.css";
import "./VercelAssetOverrides.css";
import "./ArtistModules.css";

const formatDate = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function Live() {
  const cms = useSanityArtistContent();
  const events = cms.data?.events ?? [];
  const featured = events.find(event => event.isFeatured) || events[0];
  const signal = cms.data?.live;
  return <div className="nf-page"><NightHeader active="/live" /><main><section className="nf-page-hero" style={{ "--page-image": `url(${featured?.posterUrl || officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">LIVE / SHOW SIGNAL</p><h1>WHEN THE<br/><em>ROOM IS READY.</em></h1><p>{signal?.message || "Tanggal pertunjukan akan muncul di sini setelah diumumkan secara resmi. Masuk ke Fan Signal untuk mendapat kabar lebih awal."}</p></div><div className="nf-hero-note"><span>{featured ? "NEXT SHOW" : (signal?.status || "LIVE SIGNAL")}</span><strong>{featured ? featured.title : "NO DATE ANNOUNCED"}</strong>{featured?.ticketUrl ? <a className="nf-text-button" href={featured.ticketUrl} target="_blank" rel="noreferrer">GET TICKETS <ArrowUpRight size={15}/></a> : <a className="nf-text-button" href="#signal">GET FIRST NOTICE <ArrowUpRight size={15}/></a>}</div></section><section className="nf-section an-event-section"><div className="an-event-head"><div><p className="nf-page-eyebrow">TOUR / LIVE DATES</p><h2>MEET THE<br/><em>FREQUENCY.</em></h2></div><p className="nf-page-eyebrow">{events.length ? `${events.length} CONFIRMED EVENT${events.length > 1 ? "S" : ""}` : "EVENT SIGNAL STANDING BY"}</p></div>{events.length ? <div className="an-event-grid">{events.map(event => <article className="an-event-card" key={event._id}><div className="an-event-date"><CalendarDays size={17}/><br/>{formatDate(event.date)}</div><div><span>{event.status?.toUpperCase() || "ANNOUNCED"}</span><h3>{event.title}</h3><p><MapPin size={13}/> {event.venue ? `${event.venue}, ` : ""}{event.city || ""}{event.country ? ` · ${event.country}` : ""}</p></div><div className="an-event-actions">{event.ticketUrl && <a href={event.ticketUrl} target="_blank" rel="noreferrer"><Ticket size={13}/> TICKETS</a>}{event.rsvpUrl && <a href={event.rsvpUrl} target="_blank" rel="noreferrer">RSVP <ArrowUpRight size={13}/></a>}</div></article>)}</div> : <div className="an-event-empty"><div><strong>NO DATE CONFIRMED YET.</strong><p>Jadwal, ticket link, RSVP, kota, dan poster akan muncul otomatis setelah event resmi dipublikasikan dari AN // Studio.</p></div></div>}</section><section className="nf-signal-block an-motion-band" id="signal"><div><p className="nf-page-eyebrow"><Radio size={14}/> FAN SIGNAL / LIVE</p><h2>BE FIRST<br/><em>IN THE ROOM.</em></h2><p>Pilih jalur paling dekat untuk mendapat kabar show dan rilisan berikutnya.</p></div><FanSignalInline source="footer" /></section></main><NightFooter /></div>;
}
