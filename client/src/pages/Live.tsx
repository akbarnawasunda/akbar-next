import { ArrowUpRight, CalendarDays, MapPin, Radio, Ticket } from "lucide-react";
import FanSignalInline from "@/components/FanSignalInline";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand, verifiedArtistProfile } from "@/content/artistPlatform";
import { publicUpcomingEvents, usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./Live.css";

const formatDate = (value: string, time?: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const dateText = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(parsed);
  return time
    ? `${dateText} · ${time}`
    : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
};

const inquiryHref = (type: string) =>
  `mailto:${verifiedArtistProfile.bookingEmail}?subject=${encodeURIComponent(
    `${type} — Akbar Nawasunda`
  )}`;

export default function Live() {
  const cms = usePublicArtistContent();
  const events = publicUpcomingEvents(cms.data).filter(
    (event) => !/no date announced|tba/i.test(event.title)
  );
  const featured = events.find((event) => event.isFeatured) || events[0];
  const signal = cms.data?.live;

  return (
    <div className="nf-page">
      <NightHeader active="/live" />
      <main>
        <section
          className="nf-page-hero"
          style={
            {
              "--page-image": `url(${featured?.posterUrl || officialBrand.socialPreview})`,
            } as React.CSSProperties
          }
        >
          <div>
            <p className="nf-page-eyebrow">BOOKING / LIVE</p>
            <h1>
              BOOKING
              <br />
              DAN KOLABORASI.
            </h1>
            <p>
              {signal?.message ||
                "Untuk booking penampilan, remix custom, dan kolaborasi, kirim detail proyek lewat email."}
            </p>
          </div>
          <div className="nf-hero-note">
            <span>{featured ? "SHOW BERIKUTNYA" : "AVAILABLE FOR INQUIRY"}</span>
            <strong>{featured ? featured.title : "BOOKING / REMIX / COLLAB"}</strong>
            {featured?.ticketUrl ? (
              <a
                className="nf-text-button"
                href={featured.ticketUrl}
                target="_blank"
                rel="noreferrer"
              >
                TIKET <ArrowUpRight size={14} />
              </a>
            ) : (
              <a className="nf-text-button" href={inquiryHref("Booking inquiry")}>
                HUBUNGI STUDIO <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </section>

        {events.length ? (
          <section className="nf-section an-event-section">
            <div className="an-event-head">
              <div>
                <p className="nf-page-eyebrow">JADWAL LIVE</p>
                <h2>
                  SHOW
                  <br />
                  BERIKUTNYA.
                </h2>
              </div>
              <span className="nf-page-eyebrow">
                {events.length} EVENT TERKONFIRMASI
              </span>
            </div>
            <div className="an-event-grid">
              {events.map((event) => (
                <article className="an-event-card" key={event._id}>
                  <div className="an-event-date">
                    <CalendarDays size={16} />
                    <br />
                    {formatDate(event.date, event.time)}
                  </div>
                  <div>
                    <span>{event.status?.toUpperCase() || "ANNOUNCED"}</span>
                    <h3>{event.title}</h3>
                    <p>
                      {event.mapsUrl ? (
                        <a
                          className="an-event-location-link"
                          href={event.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MapPin size={12} />{" "}
                          {event.venue ? `${event.venue}, ` : ""}
                          {event.city || ""}
                          {event.country ? ` · ${event.country}` : ""}
                          <ArrowUpRight size={11} />
                        </a>
                      ) : (
                        <>
                          <MapPin size={12} />{" "}
                          {event.venue ? `${event.venue}, ` : ""}
                          {event.city || ""}
                          {event.country ? ` · ${event.country}` : ""}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="an-event-actions">
                    {event.ticketUrl && (
                      <a href={event.ticketUrl} target="_blank" rel="noreferrer">
                        <Ticket size={12} /> TICKETS
                      </a>
                    )}
                    {event.rsvpUrl && (
                      <a href={event.rsvpUrl} target="_blank" rel="noreferrer">
                        RSVP <ArrowUpRight size={12} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="nf-section an-booking-grid">
            <div>
              <p className="nf-page-eyebrow">INQUIRY RESMI</p>
              <h2>
                BOOKING
                <br />
                DAN KERJA SAMA.
              </h2>
              <p>
                Belum ada jadwal publik yang dikonfirmasi. Untuk performa, remix
                custom, atau kolaborasi, kirim konteks proyek dan tanggal yang
                diinginkan.
              </p>
              <a className="nf-button" href={inquiryHref("Booking inquiry")}>
                BOOKING PERFORMANCE <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="an-booking-options">
              <a
                className="an-booking-option"
                href={inquiryHref("Custom remix inquiry")}
              >
                <span>01</span>
                <strong>CUSTOM REMIX</strong>
                <small>
                  Remix, aransemen, dan produksi musik untuk proyek atau konten.
                </small>
                <ArrowUpRight size={15} />
              </a>
              <a
                className="an-booking-option"
                href={inquiryHref("Collaboration inquiry")}
              >
                <span>02</span>
                <strong>COLLABORATION</strong>
                <small>Kolaborasi rilisan, visual, dan performance bersama.</small>
                <ArrowUpRight size={15} />
              </a>
            </div>
          </section>
        )}

        <section className="nf-signal-block an-motion-band" id="signal">
          <div>
            <p className="nf-page-eyebrow">
              <Radio size={13} /> KABAR &amp; RILISAN
            </p>
            <h2>
              FOLLOW
              <br />
              UPDATE.
            </h2>
            <p>Info rilisan, video, dan jadwal dari kanal resmi.</p>
          </div>
          <FanSignalInline source="footer" />
        </section>
      </main>
      <NightFooter />
    </div>
  );
}