import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";
import FanSignalSection from "@/components/FanSignalSection";
import { FAN_SIGNAL_SOURCES } from "@shared/types";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import {
  CtaPanel,
  EditorialSection,
  EmptyState,
  EventCountdown,
  SignalIndicator,
} from "@/components/editorial/EditorialKit";
import { Link } from "wouter";
import { officialBrand, verifiedArtistProfile } from "@/content/artistPlatform";
import {
  publicUpcomingEvents,
  usePublicArtistContent,
} from "@/content/publicContent";
import "./EcosystemPages.css";
import "./Live.css";

const formatDate = (value: string, time?: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const dateText = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(parsed);
  return time
    ? `${dateText} · ${time}`
    : new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed);
};

const inquiryHref = (type: string) =>
  `mailto:${verifiedArtistProfile.bookingEmail}?subject=${encodeURIComponent(
    `${type} — Akbar Nawasunda`
  )}`;

export default function Live() {
  const cms = usePublicArtistContent();
  const events = publicUpcomingEvents(cms.data).filter(
    event => !/no date announced|tba/i.test(event.title)
  );
  const featured = events.find(event => event.isFeatured) || events[0];
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
            <span>
              {featured ? "SHOW BERIKUTNYA" : "TERBUKA UNTUK BOOKING"}
            </span>
            <strong>
              {featured ? featured.title : "BOOKING / REMIX / KOLABORASI"}
            </strong>
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
              <a
                className="nf-text-button"
                href={inquiryHref("Booking inquiry")}
              >
                HUBUNGI STUDIO <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </section>

        {featured ? (
          <EditorialSection
            id="next-show"
            title={featured.title}
            lede={[
              formatDate(featured.date, featured.time),
              featured.venue,
              featured.city,
              featured.country,
            ]
              .filter(Boolean)
              .join(" · ")}
            aside={
              <>
                <SignalIndicator
                  label={`STATUS: ${featured.status?.toUpperCase() || "ANNOUNCED"}`}
                />
                <EventCountdown
                  target={featured.date}
                  labels={["HARI", "JAM", "MENIT", "DETIK"]}
                  idleLabel="Hitung mundur menuju show berikutnya"
                />
                <div className="ed-cta__actions">
                  {featured.ticketUrl ? (
                    <a
                      className="ed-button"
                      href={featured.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Ticket size={13} /> AMBIL TIKET
                    </a>
                  ) : null}
                  {featured.rsvpUrl ? (
                    <a
                      className="ed-button--ghost"
                      href={featured.rsvpUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      RSVP <ArrowUpRight size={13} />
                    </a>
                  ) : null}
                  {featured.mapsUrl ? (
                    <a
                      className="ed-button--ghost"
                      href={featured.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin size={13} /> LIHAT PETA
                    </a>
                  ) : null}
                </div>
              </>
            }
          />
        ) : (
          <EditorialSection
            id="next-show"
            title={
              <>
                KALENDER
                <br />
                SEDANG TERBUKA.
              </>
            }
            lede="Belum ada tanggal publik yang dikonfirmasi, tapi slot panggung dan studio masih bisa diambil."
          >
            <EmptyState
              title="BELUM ADA JADWAL PUBLIK"
              copy="Begitu ada show yang dikonfirmasi, tanggal, venue, zona waktu, dan tautan tiketnya akan tampil di sini lebih dulu."
              action={
                <a className="ed-button" href={inquiryHref("Booking inquiry")}>
                  AJUKAN TANGGAL <ArrowUpRight size={13} />
                </a>
              }
            />
          </EditorialSection>
        )}

        {events.length ? (
          <section className="nf-section an-event-section">
            <div className="an-event-head">
              <div>
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
              {events.map(event => (
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
                      <a
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
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
                AJUKAN BOOKING <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="an-booking-options">
              <a
                className="an-booking-option"
                href={inquiryHref("Custom remix inquiry")}
              >
                <span>01</span>
                <strong>REMIX CUSTOM</strong>
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
                <strong>KOLABORASI</strong>
                <small>
                  Kolaborasi rilisan, visual, dan performance bersama.
                </small>
                <ArrowUpRight size={15} />
              </a>
            </div>
          </section>
        )}

        <CtaPanel
          id="booking"
          title={
            <>
              AJUKAN TANGGAL
              <br />
              DAN KONSEPNYA.
            </>
          }
          copy="Kirim tanggal, lokasi, durasi set, dan konteks acara. Setiap inquiry dibaca langsung oleh studio."
          actions={
            <>
              <Link className="ed-button" href="/inquire?type=booking&source=live">
                FORM INQUIRY <ArrowUpRight size={14} />
              </Link>
              <a className="ed-button--ghost" href={inquiryHref("Booking inquiry")}>
                EMAIL STUDIO <ArrowUpRight size={14} />
              </a>
            </>
          }
        />

        <FanSignalSection
          source={FAN_SIGNAL_SOURCES.live}
          className="fan-signal-section--motion"
          title={
            <>
              IKUTI
              <br />
              KABARNYA.
            </>
          }
          description="Info rilisan, video, dan jadwal manggung — langsung dari kanal resmi."
        />
      </main>
      <NightFooter />
    </div>
  );
}
