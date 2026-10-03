import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { CtaPanel, EventCountdown } from "@/components/editorial/EditorialKit";
import { Link } from "wouter";
import { officialBrand, verifiedArtistProfile } from "@/content/artistPlatform";
import {
  publicConfirmedEvents,
  usePublicArtistContent,
} from "@/content/publicContent";
import "./EcosystemPages.css";
import "./Live.css";
import "./ShowcaseStage.css";

const formatDate = (
  value: string,
  time: string | undefined,
  locale: "id" | "en"
) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const dateText = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    dateStyle: "medium",
  }).format(parsed);
  return time
    ? `${dateText} · ${time}`
    : new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed);
};

const inquiryHref = (type: string) =>
  `mailto:${verifiedArtistProfile.bookingEmail}?subject=${encodeURIComponent(
    `${type} — Akbar Nawasunda`
  )}`;

/**
 * Salinan dua bahasa untuk panggung live. Satu komposisi (`LiveView`) dipakai
 * `/live` dan `/en/live`, jadi versi EN tidak lagi punya struktur terpisah
 * yang tertinggal dari versi ID.
 */
const copy = {
  id: {
    kickerFeatured: "Show berikutnya",
    kickerOpen: "Terbuka untuk booking",
    title: "Booking & panggung.",
    meta: "BOOKING / REMIX / KOLABORASI",
    ledeFallback:
      "Untuk booking penampilan, remix custom, dan kolaborasi, kirim detail proyek lewat email.",
    ticketCta: "Ambil tiket",
    briefCta: "Kirim brief booking",
    emailCta: "Email studio",
    nextShowMeta: "Show berikutnya",
    statusLabel: "Status",
    countdownLabels: ["HARI", "JAM", "MENIT", "DETIK"],
    countdownIdle: "Hitung mundur menuju show berikutnya",
    emptyMeta: "Kalender",
    emptyTitle: "Belum ada tanggal publik.",
    emptyPlace: "Slot panggung & studio masih terbuka",
    emptyCopy:
      "Begitu ada show yang dikonfirmasi, tanggal, venue, zona waktu, dan tautan tiketnya akan tampil di sini lebih dulu.",
    emptyCta: "Ajukan tanggal",
    indexTitle: "Jadwal terkonfirmasi.",
    indexMeta: (count: number) => `${count} event · waktu lokal venue`,
    placeFallback: "Detail venue menyusul",
    rowTicket: "Tiket",
    rowRsvp: "RSVP",
    rowInfo: "Info",
    rowAria: (title: string) => `${title} — buka sumber resmi`,
    venueMap: "Lihat peta",
    bookingMeta: "Booking",
    bookingTitle: "Booking dan kolaborasi.",
    bookingCopy:
      "Belum ada jadwal publik yang dikonfirmasi. Untuk performa, remix custom, atau kolaborasi, kirim konteks proyek dan tanggal yang diinginkan.",
    bookingBrief: "Kirim brief booking",
    remixTitle: "Remix custom",
    remixCopy: "Remix, aransemen, dan produksi musik untuk proyek atau konten.",
    collabTitle: "Kolaborasi",
    collabCopy: "Kolaborasi rilisan, visual, dan performance bersama.",
    ctaTitle: (
      <>
        AJUKAN TANGGAL
        <br />
        DAN KONSEPNYA.
      </>
    ),
    ctaCopy:
      "Kirim tanggal, lokasi, durasi set, dan konteks acara. Setiap inquiry dibaca langsung oleh studio.",
    ctaForm: "FORM INQUIRY",
    ctaEmail: "EMAIL STUDIO",
    signalTitle: (
      <>
        IKUTI
        <br />
        KABARNYA.
      </>
    ),
    signalCopy:
      "Info rilisan, video, dan jadwal manggung — langsung dari kanal resmi.",
  },
  en: {
    kickerFeatured: "Next show",
    kickerOpen: "Open for booking",
    title: "Booking & stage.",
    meta: "BOOKING / REMIX / COLLABORATION",
    ledeFallback:
      "For live bookings, custom remixes, and collaborations, send the project details by email.",
    ticketCta: "Get tickets",
    briefCta: "Send booking brief",
    emailCta: "Email the studio",
    nextShowMeta: "Next show",
    statusLabel: "Status",
    countdownLabels: ["DAYS", "HOURS", "MINUTES", "SECONDS"],
    countdownIdle: "Countdown to the next confirmed show",
    emptyMeta: "Calendar",
    emptyTitle: "No confirmed show is public yet.",
    emptyPlace: "Stage and studio slots are still open",
    emptyCopy:
      "Once a show is confirmed, the date, venue, time zone, and ticket link appear here first.",
    emptyCta: "Propose a date",
    indexTitle: "Confirmed dates.",
    indexMeta: (count: number) => `${count} events · local venue time`,
    placeFallback: "Venue details to follow",
    rowTicket: "Tickets",
    rowRsvp: "RSVP",
    rowInfo: "Info",
    rowAria: (title: string) => `${title} — open the official source`,
    venueMap: "View map",
    bookingMeta: "Booking",
    bookingTitle: "Booking and collaboration.",
    bookingCopy:
      "No public date is confirmed yet. For a performance, custom remix, or collaboration, send the project context and your preferred dates.",
    bookingBrief: "Send booking brief",
    remixTitle: "Custom remix",
    remixCopy:
      "Remix, arrangement, and music production for a project or content.",
    collabTitle: "Collaboration",
    collabCopy: "Release, visual, and performance collaboration.",
    ctaTitle: (
      <>
        PROPOSE A DATE
        <br />
        AND THE CONCEPT.
      </>
    ),
    ctaCopy:
      "Send the date, location, set length, and event context. Every inquiry is read directly by the studio.",
    ctaForm: "INQUIRY FORM",
    ctaEmail: "EMAIL THE STUDIO",
    signalTitle: (
      <>
        FOLLOW
        <br />
        THE SIGNAL.
      </>
    ),
    signalCopy:
      "New releases, videos, and live dates — straight from the official channels.",
  },
} as const;

export function LiveView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
  const cms = usePublicArtistContent();
  /* Satu sumber "terkonfirmasi" dengan aturan slot JADWAL di nav
     (publicContent.ts) — tidak boleh ada dua definisi. */
  const events = publicConfirmedEvents(cms.data);
  const featured = events.find(event => event.isFeatured) || events[0];
  const signal = cms.data?.live;

  return (
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
              {featured ? t.kickerFeatured : t.kickerOpen}
            </p>
            <h1 id="live-title">{t.title}</h1>
            <p className="an-meta">{t.meta}</p>
            <p className="an-vis-lede">
              {signal?.message || t.ledeFallback}
            </p>
            <div className="an-live-hero-actions">
              {featured?.ticketUrl ? (
                <a
                  className="an-btn an-btn--solid"
                  href={featured.ticketUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Ticket size={14} /> {t.ticketCta}
                </a>
              ) : (
                <a
                  className="an-btn an-btn--solid"
                  href={inquiryHref("Booking inquiry")}
                >
                  <Ticket size={14} /> {t.briefCta}
                </a>
              )}
              <a
                className="an-btn an-btn--quiet"
                href={inquiryHref("Booking inquiry")}
              >
                {t.emailCta} <ArrowUpRight size={14} />
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
              <p className="an-meta">{t.nextShowMeta}</p>
              <p className="an-live-date">
                {formatDate(featured.date, featured.time, locale)}
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
                    <Ticket size={13} /> {t.ticketCta}
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
                    <MapPin size={13} /> {t.venueMap}
                  </a>
                ) : null}
              </div>
            </div>
            <div className="an-live-next-side">
              <p className="an-meta">
                {t.statusLabel}: {featured.status?.toUpperCase() || "ANNOUNCED"}
              </p>
              <EventCountdown
                target={featured.date}
                labels={[...t.countdownLabels]}
                idleLabel={t.countdownIdle}
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
              <p className="an-meta">{t.emptyMeta}</p>
              <h2 id="next-show-title" className="an-title">
                {t.emptyTitle}
              </h2>
              <p className="an-live-place">
                <span>{t.emptyPlace}</span>
              </p>
              <p className="an-vis-lede">{t.emptyCopy}</p>
              <div className="an-live-next-actions">
                <a
                  className="an-btn an-btn--solid"
                  href={inquiryHref("Booking inquiry")}
                >
                  {t.emptyCta} <ArrowUpRight size={13} />
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
                {t.indexTitle}
              </h2>
              <p className="an-meta">{t.indexMeta(events.length)}</p>
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
                      {formatDate(event.date, event.time, locale)}
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
                          {place || t.placeFallback}{" "}
                          <ArrowUpRight size={11} aria-hidden="true" />
                        </a>
                      ) : (
                        <>
                          <MapPin size={12} aria-hidden="true" />{" "}
                          {place || t.placeFallback}
                        </>
                      )}
                    </span>
                    <a
                      className="an-live-row-action"
                      href={eventHref}
                      target={eventHref.startsWith("http") ? "_blank" : undefined}
                      rel={eventHref.startsWith("http") ? "noreferrer" : undefined}
                      aria-label={t.rowAria(event.title)}
                    >
                      {event.ticketUrl
                        ? t.rowTicket
                        : event.rsvpUrl
                          ? t.rowRsvp
                          : t.rowInfo}{" "}
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
              <p className="an-meta">{t.bookingMeta}</p>
              <h2 id="booking-options-title" className="an-title">
                {t.bookingTitle}
              </h2>
              <p>{t.bookingCopy}</p>
              <div className="an-live-next-actions">
                <a
                  className="an-btn an-btn--solid"
                  href={inquiryHref("Booking inquiry")}
                >
                  {t.bookingBrief} <ArrowUpRight size={14} />
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
                    <strong>{t.remixTitle}</strong>
                    <small>{t.remixCopy}</small>
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
                    <strong>{t.collabTitle}</strong>
                    <small>{t.collabCopy}</small>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </section>
        )}

        <CtaPanel
          id="booking"
          title={t.ctaTitle}
          copy={t.ctaCopy}
          actions={
            <>
              <Link
                className="ed-button"
                href={
                  locale === "en"
                    ? "/en/inquire?type=booking&source=live"
                    : "/inquire?type=booking&source=live"
                }
              >
                {t.ctaForm} <ArrowUpRight size={14} />
              </Link>
              <a className="ed-button--ghost" href={inquiryHref("Booking inquiry")}>
                {t.ctaEmail} <ArrowUpRight size={14} />
              </a>
            </>
          }
        />

        {/* Formulir langganan hanya ada di beranda. Dulu section yang sama
            dipasang di lima halaman, jadi pengunjung melihat blok yang sama
            berulang kali. Sekarang satu pemilik: beranda. */}
    </main>
  );
}

export default function Live() {
  return (
    <div className="nf-page">
      <NightHeader active="/live" />
      <LiveView locale="id" />
      <NightFooter />
    </div>
  );
}