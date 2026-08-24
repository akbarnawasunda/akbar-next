import { ArrowUpRight, CalendarDays, MapPin, Radio, Ticket } from "lucide-react";
import FanSignalInline from "@/components/FanSignalInline";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand } from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./VercelAssetOverrides.css";
import "./ArtistModules.css";

const formatDate = (value: string, time?: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const dateText = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(parsed);
  return time ? `${dateText} · ${time}` : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
};

export default function Live() {
  const cms = usePublicArtistContent();
  const events = (cms.data?.events ?? []).filter(event => !/no date announced|tba/i.test(event.title));
  const featured = events.find(event => event.isFeatured) || events[0];
  const signal = cms.data?.live;
  return <div className="nf-page"><NightHeader active="/live" /><main><section className="nf-page-hero" style={{ "--page-image": `url(${featured?.posterUrl || officialBrand.socialPreview})` } as React.CSSProperties}><div><p className="nf-page-eyebrow">LIVE</p><h1>JADWAL<br/>PERTUNJUKAN.</h1><p>{signal?.message || "Jadwal akan tampil di sini setelah diumumkan secara resmi."}</p></div><div className="nf-hero-note"><span>{featured ? "SHOW BERIKUTNYA" : "INFO JADWAL"}</span><strong>{featured ? featured.title : "BELUM ADA TANGGAL"}</strong>{featured?.ticketUrl ? <a className="nf-text-button" href={featured.ticketUrl} target="_blank" rel="noreferrer">TIKET <ArrowUpRight size={15}/></a> : <a className="nf-text-button" href="#signal">BERI TAHU SAYA <ArrowUpRight size={15}/></a>}</div></section><section className="nf-section an-event-section"><div className="an-event-head"><div><p className="nf-page-eyebrow">JADWAL</p><h2>LIVE<br/>DATES.</h2></div><span className="nf-page-eyebrow">{events.length ? `${events.length} EVENT TERKONFIRMASI` : "BELUM ADA JADWAL"}</span></div>{events.length ? <div className="an-event-grid">{events.map(event => <article className="an-event-card" key={event._id}><div className="an-event-date"><CalendarDays size={17}/><br/>{formatDate(event.date, event.time)}</div><div><span>{event.status?.toUpperCase() || "ANNOUNCED"}</span><h3>{event.title}</h3><p><MapPin size={13}/> {event.venue ? `${event.venue}, ` : ""}{event.city || ""}{event.country ? ` · ${event.country}` : ""}</p></div><div className="an-event-actions">{event.ticketUrl && <a href={event.ticketUrl} target="_blank" rel="noreferrer"><Ticket size={13}/> TICKETS</a>}{event.rsvpUrl && <a href={event.rsvpUrl} target="_blank" rel="noreferrer">RSVP <ArrowUpRight size={13}/></a>}</div></article>)}</div> : <div className="an-event-empty"><div><span className="nf-page-eyebrow">JADWAL / MENUNGGU</span><strong>BELUM ADA SHOW TERKONFIRMASI.</strong><p>Belum ada tanggal publik yang bisa diumumkan. Dapatkan kabar pertama saat jadwal resmi tersedia.</p></div></div>}</section><section className="nf-signal-block an-motion-band" id="signal"><div><p className="nf-page-eyebrow"><Radio size={14}/> KABAR TERBARU</p><h2>UPDATE<br/>LIVE.</h2><p>Kabar show dan rilisan dari kanal resmi.</p></div><FanSignalInline source="footer" /></section></main><NightFooter /></div>;
}
