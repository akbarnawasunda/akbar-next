import {
  CtaPanel,
  CurrentSignalBoard,
  EditorialSection,
  EmptyState,
  EventCountdown,
  SignalIndicator,
  type SignalRow,
} from "@/components/editorial/EditorialKit";
import { EraTimeline } from "@/components/signature/EraTimeline";
import {
  SignalHeading,
} from "@/components/signature/SignalType";
import { SignatureStage } from "@/components/signature/SignatureStage";
import { publicEras } from "@/content/eras";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Disc3,
  Mail,
  MapPin,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Link, useRoute } from "wouter";
import {
  EnglishFooter,
  EnglishHeader,
} from "@/components/EnglishChrome";
import { OfficialMediaFrame } from "@/components/OfficialMediaFrame";
import { soundcloudEmbedUrl } from "@/components/MusicEmbed";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import VisualPortraitStudies from "@/components/VisualPortraitStudies";
import { ArtistEditorialSections } from "@/components/ArtistEditorialSections";
import { PrivacyView } from "./PrivacyPolicy";
import { LiveView } from "./Live";
import { InquiryView } from "./Inquiry";
import { PressView } from "./PressKit";
import { AboutView } from "./About";
import { UniverseView } from "./Universe";
import { VisualsView } from "./Visuals";
import { ReleaseDetailView } from "./ReleaseDetail";
import { MusicView } from "./Music";
import { LicensingView } from "./Licensing";
import { PlatformMarquee } from "@/components/PlatformMarquee";
import {
  currentRelease,
  formatPublicIndex,
  officialBrand,
  releases,
  verifiedArtistProfile,
  videos,
} from "@/content/artistPlatform";
import type { CmsRelease } from "@/content/publicContent";
import {
  publicJourney,
  publicPhotoStories,
  publicPlatformLinks,
  publicPortraitStudies,
  publicUpcomingEvents,
  usePublicArtistContent,
} from "@/content/publicContent";

import "./EcosystemPages.css";
import "@/components/OfficialBrand.css";
import "./Home.css";
import "@/components/EnglishLayer.css";

const bookingEmail = verifiedArtistProfile.bookingEmail;

const englishLongBio =
  "Akbar Nawasunda's musical journey began in 2020 as an independent bedroom producer known as DJ Akbar Remix. His experiments brought popular songs into a Bandung-rooted space of Breakbeat, Jedag Jedug, and Jungle Dutch. Today, as Akbar Nawasunda, he releases original work combining pop melody, electronic bass, and remix energy for global digital platforms.";

const releaseSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const rightsLabel = (format?: string) =>
  /bootleg/i.test(format || "")
    ? "UNOFFICIAL EDIT · CLEARANCE REQUIRED"
    : /remix|rmx/i.test(format || "")
      ? "REMIX · CLEARANCE REQUIRED"
      : "CATALOG ENTRY";

const rightsAction = (format?: string) =>
  /bootleg/i.test(format || "")
    ? "CLEARANCE / ASK FIRST"
    : "LICENSING / ASK FIRST";

const youtubeId = (href: string) =>
  href.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/
  )?.[1] || "";

const youtubeThumbnail = (id: string) =>
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

function formatEnglishDate(date: string, time?: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  const dateText = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(parsed)
    .toUpperCase();
  return time ? `${dateText} · ${time}` : dateText;
}

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
  const cmsCatalog = cmsReleases.map((item) => {
    const fallback = releases.find(
      (release) =>
        release.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    );
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
      .filter(
        (legacy) =>
          !cmsCatalog.some(
            (item) =>
              item.title.trim().toLowerCase() ===
              legacy.title.trim().toLowerCase()
          )
      )
      .map((legacy) => ({
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

const englishSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function EnglishFrame({ children }: { children: ReactNode }) {
  return (
    <div className="nf-page en-page an-site">
      <EnglishHeader />
      {children}
      <EnglishFooter />
    </div>
  );
}

export function EnglishHome() {
  const cms = usePublicArtistContent();
  const catalog = mergedCatalog(cms.data?.releases ?? []);
  const editablePlatformLinks = publicPlatformLinks(cms.data);
  const current =
    cms.data?.releases.find((item) => item.isCurrent) ||
    cms.data?.releases[0];

  const activeRelease: CatalogItem = current
    ? {
        title: current.title,
        format: current.format || "Release",
        year: current.year || "—",
        platform: current.platform || currentRelease.type,
        href: current.url || currentRelease.href,
        image: current.artworkUrl || currentRelease.image,
        story: current.story,
        credits: current.credits,
      }
    : {
        title: currentRelease.title,
        format: "Remix",
        year: "2025",
        platform: currentRelease.type,
        href: currentRelease.href,
        image: currentRelease.image,
      };

  const activeVideos = videos;
  const publicEvents = publicUpcomingEvents(cms.data);
  const journey = publicJourney(cms.data);
  const photoStories = publicPhotoStories(cms.data);
  const featuredEvent =
    publicEvents.find((event) => event.isFeatured) || publicEvents[0];

  const currentSignalRows: SignalRow[] = [
    {
      label: "LATEST RELEASE",
      value: activeRelease.title,
      note: [activeRelease.format, activeRelease.year, activeRelease.platform]
        .filter(Boolean)
        .join(" · "),
      href: `/en/music/${englishSlug(activeRelease.title)}`,
      actionLabel: "DETAILS",
    },
    featuredEvent
      ? {
          label: "NEXT LIVE",
          value: featuredEvent.title,
          note: [
            formatEnglishDate(featuredEvent.date, featuredEvent.time),
            featuredEvent.venue,
            featuredEvent.city,
          ]
            .filter(Boolean)
            .join(" · "),
          href: "/en/live",
          actionLabel: "DATES",
        }
      : {
          label: "BOOKING STATUS",
          value: "OPEN FOR SHOWS & CUSTOM REMIXES",
          note: "No public date confirmed yet — studio and stage slots are still available.",
          href: "/en/inquire?type=booking&source=home",
          actionLabel: "INQUIRE",
        },
    {
      label: "STUDIO",
      value: "BANDUNG BARAT · BREAKBEAT / INDO BASS",
      note: "Custom remixes, production, and collaborations through the official inquiry line.",
      href: "/en/inquire?type=remix&source=home",
      actionLabel: "SEND BRIEF",
    },
  ];

  const displayHeroTitle = "AKBAR NAWASUNDA.";
  const heroTitleWords = displayHeroTitle.split(/\s+/);

  return (
    <EnglishFrame>
      <main id="top" tabIndex={-1} className="en-content en-home-parity">
        <section className="an-hero">
          <div className="home-hero-portrait">
            {/* Varian responsif yang sama dengan hero beranda ID: master 396 KB
                hanya dipakai sebagai fallback, bukan sumber utama. */}
            <picture className="home-hero-picture">
              <source
                media="(max-width: 640px)"
                srcSet="/assets/akbar-official-portrait-optimized.webp"
                type="image/webp"
              />
              <source
                srcSet="/assets/akbar-nawasunda-official-portrait-1000.webp"
                type="image/webp"
              />
              <img
                src={officialBrand.portrait}
                alt="Portrait of Akbar Nawasunda"
                width={1122}
                height={1402}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>

          <div className="hero-copy">
            <p className="eyebrow">
              <span /> AKBAR NAWASUNDA
            </p>
            <h1
              className="hero-title-editorial"
              data-no-scramble="true"
              aria-label={displayHeroTitle}
            >
              <span aria-hidden="true">
                {heroTitleWords.map((word, index) => (
                  <span
                    className="hero-title-mask"
                    key={`${word}-${index}`}
                    style={{ "--hero-word-index": index } as CSSProperties}
                  >
                    <span className="hero-title-word">{word}</span>
                    {index < heroTitleWords.length - 1 ? " " : null}
                  </span>
                ))}
              </span>
            </h1>
            <p className="hero-description">
              Producer, remixer, and electronic bass artist from Bandung
              Barat, Indonesia.
            </p>
            <div className="hero-actions">
              <a
                className="button-primary"
                href={activeRelease.href}
                target="_blank"
                rel="noreferrer"
                data-signal-magnetic
                data-signal-interactive
              >
                <Play size={14} fill="currentColor" />
                <span>LISTEN NOW</span>
              </a>
              <Link
                className="button-quiet"
                href="/en/visuals"
                data-signal-magnetic
              >
                VIEW VISUALS <ArrowUpRight size={15} />
              </Link>
              <a className="hero-signal-link" href="#signal">
                LATEST UPDATES <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </section>

        <SignatureStage
          lang="en"
          alsoKnownAs="Also known as DJ Akbar Remix and akbarnawasunda.my.id."
        />

        <section className="section section-current" id="music">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LATEST RELEASE</p>
              <h2>
                NOW
                <br />
                PLAYING.
              </h2>
            </div>
          </div>
          <div className="feature-release">
            <div className="release-cover">
              <ResilientArtworkImage
                src={activeRelease.image}
                backupSrc={officialBrand.socialPreview}
                alt={`Artwork for ${activeRelease.title}`}
              />
            </div>
            <div className="release-detail">
              <p className="mono-label">
                {activeRelease.format} · {activeRelease.year}
              </p>
              <h3>{activeRelease.title}</h3>
              <p>
                {activeRelease.story ||
                  "Open the official release route to listen to this verified catalog entry."}
              </p>
              <div className="release-detail-actions">
                <a
                  className="text-link"
                  href={activeRelease.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  OPEN RELEASE <ArrowUpRight size={14} />
                </a>
                <span>{activeRelease.platform}</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="home-signal-deck"
          aria-labelledby="en-signal-deck-title"
        >
          <div className="home-signal-copy">
            <p className="eyebrow">
              <span /> OFFICIAL PLATFORMS
            </p>
            <h2 id="en-signal-deck-title">
              LISTEN
              <br />
              ANYWHERE.
            </h2>
            <Link className="home-deck-cta" href="/en/music">
              VIEW MUSIC <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="home-platform-rack">
            {editablePlatformLinks.map((platform) => (
              <a
                className={`home-platform-card platform-${platform.label
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                key={platform.label}
                href={platform.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open Akbar Nawasunda on ${platform.label}`}
              >
                <span className="home-platform-icon-shell">
                  <PlatformIcon label={platform.label} />
                </span>
                <span className="home-platform-copy">
                  <strong>{platform.label}</strong>
                </span>
                <ArrowUpRight className="home-platform-arrow" size={14} />
              </a>
            ))}
          </div>
          <PlatformMarquee links={editablePlatformLinks} />
        </section>

        <ArtistEditorialSections
          journey={journey}
          showPhotoStory={false}
          locale="en"
        />
        <ArtistEditorialSections
          photoStories={photoStories}
          showJourney={false}
          locale="en"
        />

        <section className="section release-section">
          <div className="section-inline">
            <div>
              <p className="eyebrow">DISCOGRAPHY</p>
              <h2>
                ALL
                <br />
                RELEASES.
              </h2>
            </div>
            <a
              className="text-link"
              href={
                editablePlatformLinks.find((link) => link.label === "Spotify")
                  ?.href ||
                "https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw"
              }
              target="_blank"
              rel="noreferrer"
            >
              SPOTIFY <PlatformIcon label="Spotify" /> <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="release-grid">
            {catalog.map((release) => (
              <a
                className="release-card"
                key={release.title}
                href={release.href}
                target="_blank"
                rel="noreferrer"
              >
                {release.image && (
                  <div className="release-card-art">
                    <ResilientArtworkImage
                      src={release.image}
                      backupSrc={officialBrand.socialPreview}
                      alt={`Artwork for ${release.title}`}
                    />
                  </div>
                )}
                <PlatformIcon label={release.platform} />
                <p>
                  {release.format} · {release.year}
                </p>
                <h3>{release.title}</h3>
                <span className="release-platform-line">
                  {release.platform} <ArrowUpRight size={13} />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="section visual-section" id="visuals">
          <div className="section-heading">
            <div>
              <p className="eyebrow">VISUAL</p>
              <h2>
                OFFICIAL
                <br />
                VIDEO.
              </h2>
            </div>
          </div>
          <div className="video-grid">
            {activeVideos.map((video, index) => (
              <a
                key={video.title}
                className={`video-card video-${index + 1}`}
                href={video.href}
                target="_blank"
                rel="noreferrer"
              >
                <ResilientArtworkImage
                  src={video.image}
                  backupSrc={officialBrand.socialPreview}
                  alt={`${video.title} — official visual artwork`}
                />
                <div className="video-overlay" />
                <div className="video-content">
                  <span>{video.label}</span>
                  <h3>{video.title}</h3>
                  <div className="round-play">
                    <Play size={15} fill="currentColor" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="section live-section" id="live">
          <div
            className="live-backdrop"
            style={{
              backgroundImage:
                "url(/assets/akbar-night-frequency-hero-optimized.webp)",
            }}
          />
          <div className="live-copy">
            <p className="eyebrow">LIVE</p>
            <h2>
              LIVE
              <br />
              DATES.
            </h2>
            <p>
              {cms.data?.live?.message ||
                "Dates will appear here after they are officially announced."}
            </p>
            <Link
              className="button-primary"
              href={
                featuredEvent?.ticketUrl ||
                featuredEvent?.rsvpUrl ||
                "/en/inquire"
              }
              target={
                featuredEvent?.ticketUrl || featuredEvent?.rsvpUrl
                  ? "_blank"
                  : undefined
              }
              rel={
                featuredEvent?.ticketUrl || featuredEvent?.rsvpUrl
                  ? "noreferrer"
                  : undefined
              }
            >
              <Ticket size={14} />
              <span>
                {featuredEvent?.ticketUrl
                  ? "GET TICKETS"
                  : featuredEvent?.rsvpUrl
                    ? "RSVP SHOW"
                    : "ASK ABOUT BOOKING"}
              </span>
            </Link>
          </div>
          <div className="live-status">
            <span>
              {featuredEvent ? "NEXT CONFIRMED SHOW" : "DATES"}
            </span>
            <strong>
              {featuredEvent?.title || (
                <>
                  NO PUBLIC
                  <br />
                  DATE
                </>
              )}
            </strong>
            <small>
              {featuredEvent
                ? formatEnglishDate(featuredEvent.date)
                : "TO BE ANNOUNCED"}
            </small>
          </div>
          {publicEvents.length ? (
            <div className="home-live-events" aria-label="Confirmed live dates">
              {publicEvents.slice(0, 3).map((event) => {
                const eventHref =
                  event.ticketUrl || event.rsvpUrl || "/en/live";
                const locationLabel =
                  [event.venue, event.city, event.country]
                    .filter(Boolean)
                    .join(", ") || "Venue details to follow";
                return (
                  <article className="home-live-event" key={event._id}>
                    <span>{formatEnglishDate(event.date, event.time)}</span>
                    <strong>{event.title}</strong>
                    <small>
                      {event.mapsUrl ? (
                        <a
                          className="en-event-location-link"
                          href={event.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {locationLabel} <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        locationLabel
                      )}
                    </small>
                    <a
                      className="home-live-event-source"
                      href={eventHref}
                      target={eventHref.startsWith("http") ? "_blank" : undefined}
                      rel={
                        eventHref.startsWith("http") ? "noreferrer" : undefined
                      }
                      aria-label={`${event.title} — open official source`}
                    >
                      {event.ticketUrl
                        ? "TICKETS"
                        : event.rsvpUrl
                          ? "RSVP"
                          : "VIEW DATES"}{" "}
                      <ArrowUpRight size={13} />
                    </a>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>

        <EditorialSection
          id="current-signal"
          title={
            <>
              WHAT IS
              <br />
              RUNNING NOW.
            </>
          }
          lede="Live status from the studio: the release in rotation, the next date on stage, and the official contact route."
          aside={<SignalIndicator label="LIVE FROM THE STUDIO" />}
        >
          <CurrentSignalBoard rows={currentSignalRows} actionFallback="OPEN" />
        </EditorialSection>

        <CtaPanel
          id="booking"
          title={
            <>
              BRING THIS SOUND
              <br />
              TO YOUR STAGE.
            </>
          }
          copy="Shows, custom remixes, music licensing, or release collaborations — send the project context and dates, and the reply comes straight from the studio."
          actions={
            <>
              <Link className="ed-button" href="/en/inquire?source=home">
                START AN INQUIRY <ArrowUpRight size={14} />
              </Link>
              <Link className="ed-button--ghost" href="/en/epk">
                VIEW THE EPK <ArrowUpRight size={14} />
              </Link>
            </>
          }
        />

        <section className="signal-section" id="signal">
          <div>
            <p className="eyebrow">
              <Sparkles size={13} /> LATEST UPDATES
            </p>
            <h2>
              NEW MUSIC
              <br />
              AND NEWS.
            </h2>
            <p>
              Official release, visual, and live updates from Akbar Nawasunda's
              channels.
            </p>
          </div>
          <div className="en-signal-action">
            <strong>FOLLOW THE OFFICIAL LINKS.</strong>
            <p>
              Follow the official platforms for new music and future
              announcements.
            </p>
            <Link className="button-primary" href="/en/inquire">
              CONTACT AKBAR <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
      </main>
    </EnglishFrame>
  );
}

export function EnglishMusic() {
  return (
    <EnglishFrame>
      <MusicView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishVisuals() {
  return (
    <EnglishFrame>
      <VisualsView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishLive() {
  return (
    <EnglishFrame>
      <LiveView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishUniverse() {
  return (
    <EnglishFrame>
      <UniverseView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishAbout() {
  return (
    <EnglishFrame>
      <AboutView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishEpk() {
  return (
    <EnglishFrame>
      <PressView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishInquiry() {
  return (
    <EnglishFrame>
      <InquiryView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishLicensing() {
  return (
    <EnglishFrame>
      <LicensingView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishPrivacy() {
  return (
    <EnglishFrame>
      <PrivacyView locale="en" />
    </EnglishFrame>
  );
}

export function EnglishReleaseDetail() {
  return (
    <EnglishFrame>
      <ReleaseDetailView locale="en" />
    </EnglishFrame>
  );
}
