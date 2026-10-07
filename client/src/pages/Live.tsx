import { ArrowUpRight, MapPin, Radio, Ticket } from "lucide-react";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { EventCountdown } from "@/components/editorial/EditorialKit";
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
    title: "Jadwal & panggung.",
    meta: "JADWAL / VENUE / TIKET",
    ledeFallback:
      "Tanggal yang sudah dikonfirmasi tampil di sini lebih dulu. Untuk mengajukan tanggal, gunakan jalur booking resmi.",
    ticketCta: "Ambil tiket",
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
    emptyStatus: "TERBUKA UNTUK BOOKING",
    emptyBasisLabel: "Basis",
    emptyGenreLabel: "Genre",
    indexTitle: "Jadwal terkonfirmasi.",
    indexMeta: (count: number) => `${count} event · waktu lokal venue`,
    placeFallback: "Detail venue menyusul",
    rowTicket: "Tiket",
    rowRsvp: "RSVP",
    rowInfo: "Info",
    rowAria: (title: string) => `${title} — buka sumber resmi`,
    venueMap: "Lihat peta",
    // Keadaan kosong (belum ada tanggal) dulu berhenti persis di blok
    // "show berikutnya" — satu-satunya halaman utama tanpa jalur lanjut
    // ke halaman lain, jadi terasa terpotong dibanding /about dan
    // /universe yang selalu menutup dengan indeks ke halaman lain. Tiga
    // tautan nyata di bawah ini (bukan kalender/tanggal karangan) dipakai
    // untuk mengisi jeda itu dengan niat, bukan ruang kosong mentah.
    emptyPathMeta: "Sambil menunggu tanggal",
    emptyPathTitle: "Dengar dulu, atau telusuri perjalanannya.",
    emptyPath: [
      {
        href: "/music",
        title: "Dengar rilisan",
        copy: "Katalog lengkap dengan artwork, metadata, dan tautan dengar resmi.",
      },
      {
        href: "/universe",
        title: "Telusuri perjalanan",
        copy: "Satu nama, dua era — linimasa babak dan rilisannya.",
      },
      {
        href: "/epk",
        title: "EPK & press kit",
        copy: "Bio siap pakai, foto resmi, dan kebutuhan promo untuk media.",
      },
    ],
  },
  en: {
    kickerFeatured: "Next show",
    kickerOpen: "Open for booking",
    title: "Dates & stage.",
    meta: "DATES / VENUES / TICKETS",
    ledeFallback:
      "Confirmed dates appear here first. To propose a date, use the official booking route.",
    ticketCta: "Get tickets",
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
    emptyStatus: "OPEN FOR BOOKING",
    emptyBasisLabel: "Based in",
    emptyGenreLabel: "Genre",
    indexTitle: "Confirmed dates.",
    indexMeta: (count: number) => `${count} events · local venue time`,
    placeFallback: "Venue details to follow",
    rowTicket: "Tickets",
    rowRsvp: "RSVP",
    rowInfo: "Info",
    rowAria: (title: string) => `${title} — open the official source`,
    venueMap: "View map",
    emptyPathMeta: "While you wait for a date",
    emptyPathTitle: "Hear the music, or follow the journey.",
    emptyPath: [
      {
        href: "/en/music",
        title: "Hear the releases",
        copy: "The full catalog with artwork, metadata, and official listening links.",
      },
      {
        href: "/en/universe",
        title: "Follow the journey",
        copy: "One name, two eras — the chapter timeline and its releases.",
      },
      {
        href: "/en/epk",
        title: "EPK & press kit",
        copy: "A ready biography, official photos, and promo material for media.",
      },
    ],
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
        {/* Panggung: saat ada foto pertunjukan nyata, itu jadi latar penuh.
            Tanpa jadwal terkonfirmasi (keadaan sekarang), halaman ini
            TIDAK memaksa foto pertunjukan karangan — dulu di sini
            "akbar-night-frequency-stage", foto jalan malam asli yang
            ditumpuki teks chrome/neon 3D "AKBAR NAWASUNDA RMX" dan tulisan
            kursif "SWAG" mengkilap: gaya poster DJ generik yang persis
            dilarang DESIGN.md.
            [Visual recomposition] Versi sebelumnya menggantinya dengan
            latar RATA + logo kecil 0.5 opacity mengambang di pojok — jujur,
            tapi nyaris kosong penuh (hero ini tingginya sampai 74svh).
            Sekarang latarnya foto panggung teater KOSONG asli (satu lampu
            sorot, tirai gelap) — bukan foto pertunjukan karangan, tapi
            tetap foto NYATA yang relevan: panggung yang benar-benar ada,
            menunggu tanggal. Metafora jujur, bukan gambar pengisi. */}
        <section
          className={`an-live-hero${
            featured?.posterUrl ? "" : " an-live-hero--quiet"
          }`}
          aria-labelledby="live-title"
        >
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
            <>
              <img
                className="an-live-hero-bg an-live-hero-bg--stage"
                src="/assets/akbar-editorial-stage-bg.webp"
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
              />
              <img
                className="an-live-hero-mark"
                src={officialBrand.logo}
                alt=""
                aria-hidden="true"
                width={220}
                height={150}
                loading="eager"
                decoding="async"
              />
            </>
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
            {/* /live = permukaan tanggal, bukan pitch booking kedua
                (Phase 3 §2 baris 6). Aksi di sini hanya aksi tanggal. */}
            {featured?.ticketUrl ? (
              <div className="an-live-hero-actions">
                <a
                  className="an-btn an-btn--solid"
                  href={featured.ticketUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Ticket size={14} aria-hidden="true" /> {t.ticketCta}
                </a>
              </div>
            ) : null}
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
              {/* Satu blok keluar booking (Phase 3 §2 baris 6): form
                  inquiry yang sudah terarah + email sebagai jalur cadangan. */}
              <div className="an-live-next-actions">
                <Link
                  className="an-btn an-btn--solid"
                  href={
                    locale === "en"
                      ? "/en/inquire?type=booking&source=live"
                      : "/inquire?type=booking&source=live"
                  }
                >
                  {t.emptyCta} <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
                <a
                  className="an-btn an-btn--quiet"
                  href={inquiryHref("Booking inquiry")}
                >
                  {t.emailCta} <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </div>
            </div>
            {/* [Visual recomposition] Kolom kedua grid ini dulu tidak
                dirender sama sekali di keadaan kosong — `.an-live-next`
                tetap dua kolom (1.15fr/0.85fr), jadi sisa 0.85fr-nya
                adalah ruang kosong mentah, bukan jeda yang disengaja.
                Diisi fakta nyata yang sudah ada di codebase (status,
                basis, genre) — bukan dekorasi baru — supaya bentuknya
                tetap sama persis dengan panel sisi "show berikutnya",
                dan ruang itu akhirnya membawa informasi. */}
            <div className="an-live-next-side">
              <p className="an-meta">
                {t.statusLabel}: {t.emptyStatus}
              </p>
              <p className="an-live-place">
                <MapPin size={12} aria-hidden="true" />
                <span>{verifiedArtistProfile.location}</span>
              </p>
              <ul className="an-live-genres">
                {verifiedArtistProfile.genres.map(genre => (
                  <li key={genre}>
                    <Radio size={11} aria-hidden="true" /> {genre}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Jalur lanjut — hanya saat keadaan kosong (belum ada tanggal).
            Begitu sudah ada show terkonfirmasi, halaman ini sudah punya isi
            (show berikutnya + indeks jadwal) yang menutupnya dengan cukup;
            blok ini dulu hilang total di keadaan kosong, jadi /live jadi
            satu-satunya halaman utama yang berhenti tanpa menunjuk ke mana
            pun. Tiga tautan di sini sama persis dengan pola "jalur lanjut"
            di /about — bukan pola baru, primitif yang sama dipakai di sini
            karena masalahnya sama. */}
        {!featured && (
          <section
            className="an-section an-live-path"
            aria-labelledby="live-path-title"
          >
            <header className="an-head">
              <p className="an-meta">{t.emptyPathMeta}</p>
              <h2 id="live-path-title" className="an-title an-title--human">
                {t.emptyPathTitle}
              </h2>
            </header>
            <div className="an-live-path-grid">
              {t.emptyPath.map(item => (
                <Link
                  className="an-live-path-item"
                  href={item.href}
                  key={item.title}
                >
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.copy}</small>
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              ))}
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
        ) : null}

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