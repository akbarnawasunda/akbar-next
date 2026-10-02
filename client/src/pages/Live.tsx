import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";
import FanSignalSection from "@/components/FanSignalSection";
import { FAN_SIGNAL_SOURCES } from "@shared/types";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { CtaPanel, EventCountdown } from "@/components/editorial/EditorialKit";
import { Link } from "wouter";
import { officialBrand, verifiedArtistProfile } from "@/content/artistPlatform";
import {
  publicUpcomingEvents,
  usePublicArtistContent,
} from "@/content/publicContent";
import "./EcosystemPages.css";
import "./Live.css";
import "./ShowcaseStage.css";

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
      <main id="main-content" tabIndex={-1}>
        {/* Panggung: foto pertunjukan sebagai latar penuh, tipografi di
            atas scrim. */}
        <section className="an-live-hero" aria-labelledby="live-title">
          {featured?.posterUrl ? (
            <img
              className="an-live-hero-bg"
              src={featured.posterUrl}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
            />
          ) : (
            <picture className="an-live-hero-bg">
              <source
                media="(max-width: 640px)"
                srcSet="/assets/akbar-night-frequency-stage-mobile-optimized.webp"
                type="image/webp"
              />
              <source
                srcSet="/assets/akbar-night-frequency-stage-optimized.webp"
                type="image/webp"
              />
              <img
                src="/assets/akbar-night-frequency-stage-optimized.webp"
                alt=""
                aria-hidden="true"
                width={1440}
                height={1440}
                loading="eager"
                decoding="async"
              />
            </picture>
          )}
          <span className="an-live-hero-scrim" aria-hidden="true" />
          <div className="an-live-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              {featured ? "Show berikutnya" : "Terbuka untuk booking"}
            </p>
            <h1 id="live-title">Booking &amp; panggung.</h1>
            <p className="an-meta">BOOKING / REMIX / KOLABORASI</p>
            <p className="an-vis-lede">
              {signal?.message ||
                "Untuk booking penampilan, remix custom, dan kolaborasi, kirim detail proyek lewat email."}
            </p>
            <div className="an-live-hero-actions">
              {featured?.ticketUrl ? (
                <a
                  className="an-btn an-btn--solid"
                  href={featured.ticketUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Ticket size={14} /> Ambil tiket
                </a>
              ) : (
                <a
                  className="an-btn an-btn--solid"
                  href={inquiryHref("Booking inquiry")}
                >
                  <Ticket size={14} /> Kirim brief booking
                </a>
              )}
              <a
                className="an-btn an-btn--quiet"
                href={inquiryHref("Booking inquiry")}
              >
                Email studio <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Show berikutnya sebagai dokumen: tanggal besar, detail venue,
            hitung mundur, dan aksi. */}
        {featured ? (
          <section
            className="an-section an-live-next"
            id="next-show"
            aria-labelledby="next-show-title"
          >
            <div className="an-live-next-copy">
              <p className="an-meta">Show berikutnya</p>
              <p className="an-live-date">
                {formatDate(featured.date, featured.time)}
              </p>
              <h2 id="next-show-title" className="an-title">
                {featured.title}
              </h2>
              <p className="an-live-place">
                {featured.venue ? <span>{featured.venue}</span> : null}
                {featured.city ? <span>{featured.city}</span> : null}
                {featured.country ? <span>{featured.country}</span> : null}
              </p>
              <div className="an-live-next-actions">
                {featured.ticketUrl ? (
                  <a
                    className="an-btn an-btn--solid"
                    href={featured.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Ticket size={13} /> Ambil tiket
                  </a>
                ) : null}
                {featured.rsvpUrl ? (
                  <a
                    className="an-btn an-btn--quiet"
                    href={featured.rsvpUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    RSVP <ArrowUpRight size={13} />
                  </a>
                ) : null}
                {featured.mapsUrl ? (
                  <a
                    className="an-btn an-btn--quiet"
                    href={featured.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin size={13} /> Lihat peta
                  </a>
                ) : null}
              </div>
            </div>
            <div className="an-live-next-side">
              <p className="an-meta">
                Status: {featured.status?.toUpperCase() || "ANNOUNCED"}
              </p>
              <EventCountdown
                target={featured.date}
                labels={["HARI", "JAM", "MENIT", "DETIK"]}
                idleLabel="Hitung mundur menuju show berikutnya"
              />
            </div>
          </section>
        ) : (
          <section
            className="an-section an-live-next"
            id="next-show"
            aria-labelledby="next-show-title"
          >
            <div className="an-live-next-copy">
              <p className="an-meta">Kalender</p>
              <h2 id="next-show-title" className="an-title">
                Belum ada tanggal publik.
              </h2>
              <p className="an-live-place">
                <span>Slot panggung &amp; studio masih terbuka</span>
              </p>
              <p className="an-vis-lede">
                Begitu ada show yang dikonfirmasi, tanggal, venue, zona waktu,
                dan tautan tiketnya akan tampil di sini lebih dulu.
              </p>
              <div className="an-live-next-actions">
                <a
                  className="an-btn an-btn--solid"
                  href={inquiryHref("Booking inquiry")}
                >
                  Ajukan tanggal <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Jadwal terkonfirmasi sebagai indeks. */}
        {events.length ? (
          <section className="an-section" aria-labelledby="live-index-title">
            <header className="an-head">
              <h2 id="live-index-title" className="an-title">
                Jadwal terkonfirmasi.
              </h2>
              <p className="an-meta">
                {events.length} event · waktu lokal venue
              </p>
            </header>
            <ul className="an-index an-live-index">
              {events.map(event => {
                const eventHref =
                  event.ticketUrl || event.rsvpUrl || inquiryHref("Booking inquiry");
                const place = [event.venue, event.city, event.country]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <li className="an-live-row" key={event._id}>
                    <span className="an-live-row-date">
                      {formatDate(event.date, event.time)}
                    </span>
                    {eventHref ? (
                      <a
                        className="an-live-row-title"
                        href={eventHref}
                        target={eventHref.startsWith("http") ? "_blank" : undefined}
                        rel={
                          eventHref.startsWith("http") ? "noreferrer" : undefined
                        }
                      >
                        {event.title}
                      </a>
                    ) : (
                      <span className="an-live-row-title">{event.title}</span>
                    )}
                    <span className="an-live-row-place">
                      {event.mapsUrl ? (
                        <a
                          className="an-event-location-link"
                          href={event.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MapPin size={12} aria-hidden="true" />{" "}
                          {place || "Detail venue menyusul"}{" "}
                          <ArrowUpRight size={11} aria-hidden="true" />
                        </a>
                      ) : (
                        <>
                          <MapPin size={12} aria-hidden="true" />{" "}
                          {place || "Detail venue menyusul"}
                        </>
                      )}
                    </span>
                    <a
                      className="an-live-row-action"
                      href={eventHref}
                      target={eventHref.startsWith("http") ? "_blank" : undefined}
                      rel={eventHref.startsWith("http") ? "noreferrer" : undefined}
                      aria-label={`${event.title} — buka sumber resmi`}
                    >
                      {event.ticketUrl ? "Tiket" : event.rsvpUrl ? "RSVP" : "Info"}{" "}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <section
            className="an-section an-live-booking"
            aria-labelledby="booking-options-title"
          >
            <div className="an-live-booking-copy">
              <p className="an-meta">Booking</p>
              <h2 id="booking-options-title" className="an-title">
                Booking dan kolaborasi.
              </h2>
              <p>
                Belum ada jadwal publik yang dikonfirmasi. Untuk performa, remix
                custom, atau kolaborasi, kirim konteks proyek dan tanggal yang
                diinginkan.
              </p>
              <div className="an-live-next-actions">
                <a
                  className="an-btn an-btn--solid"
                  href={inquiryHref("Booking inquiry")}
                >
                  Kirim brief booking <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
            <ul className="an-index an-live-booking-options">
              <li>
                <a
                  className="an-index-row"
                  href={inquiryHref("Custom remix inquiry")}
                >
                  <span className="an-meta">01</span>
                  <span className="an-live-option-copy">
                    <strong>Remix custom</strong>
                    <small>
                      Remix, aransemen, dan produksi musik untuk proyek atau
                      konten.
                    </small>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  className="an-index-row"
                  href={inquiryHref("Collaboration inquiry")}
                >
                  <span className="an-meta">02</span>
                  <span className="an-live-option-copy">
                    <strong>Kolaborasi</strong>
                    <small>
                      Kolaborasi rilisan, visual, dan performance bersama.
                    </small>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </li>
            </ul>
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
