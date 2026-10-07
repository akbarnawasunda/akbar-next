import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";
import {
  Fragment,
  type CSSProperties,
  useEffect,
  useState,
} from "react";
import { Link } from "wouter";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { MusicEmbed } from "@/components/MusicEmbed";
import FanSignalSection from "@/components/FanSignalSection";
import { FAN_SIGNAL_SOURCES } from "@shared/types";
import { Reveal } from "@/components/Reveal";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  CtaPanel,
  CurrentSignalBoard,
  EditorialSection,
  SignalIndicator,
  type SignalRow,
} from "@/components/editorial/EditorialKit";
import { NightHeader, NightFooter } from "@/components/NightFrequencyChrome";
import { BirthdayNote } from "@/components/StudioClock";
import { trpc } from "@/lib/trpc";
import {
  publicPlatformLinks,
  publicUpcomingEvents,
  usePublicArtistContent,
} from "@/content/publicContent";
import {
  currentRelease,
  officialBrand,
  verifiedArtistProfile,
} from "@/content/artistPlatform";
import { SignatureStage } from "@/components/signature/SignatureStage";
import { SundaScript } from "@/components/signature/SundaScript";
import { SUNDA_NAME } from "@/content/sundaneseScript";
import "@/components/OfficialBrand.css";
import "./Home.css";
// Komposisi baru beranda (checkpoint A). Dimuat setelah Home.css: nama kelas
// `.an-*` di dalamnya tidak dipakai kulit lama, jadi tidak ada perang
// spesifisitas dan tidak ada `!important` baru.
import "./HomeStage.css";

type HomeLocale = "id" | "en";

/**
 * Salinan dua bahasa untuk beranda. Sampai sekarang `/en` punya implementasi
 * terpisah (template lama, tanpa ADEGAN 1-4 checkpoint A) sehingga terasa
 * jauh lebih kosong dari `/` — bukan cuma soal kata, tapi seluruh komposisi
 * beda. `HomeView` di bawah satu sumber untuk kedua bahasa (pola yang sama
 * dengan `AboutView`/`UniverseView`); EnglishPages.tsx tinggal memanggilnya
 * dengan locale="en".
 */
const HOME_COPY: Record<
  HomeLocale,
  {
    portraitAlt: string;
    portraitCaptionLabel: string;
    heroBodyFallback: string;
    heroActionVisual: string;
    heroActionListen: string;
    heroVisualsCta: string;
    heroScrollLabel: string;
    heroScrollAria: string;
    heroFacts: { based: string; since: string; genre: string };
    alsoKnownAs: string;
    signal: { line1: string; line2: string; lede: string; aside: string };
    rows: {
      latestLabel: string;
      latestAction: string;
      nextLiveLabel: string;
      nextLiveAction: string;
      bookingLabel: string;
      bookingValue: string;
      bookingNote: string;
      bookingAction: string;
      studioLabel: string;
      studioValue: string;
      studioNote: string;
      studioAction: string;
    };
    doc: {
      storyFallback: string;
      closePlayer: string;
      playHere: string;
      openRelease: string;
      loading: string;
    };
    channels: {
      heading: string;
      meta: (count: number) => string;
      footerCta: string;
      openAria: (label: string) => string;
    };
    pauseQuote: string;
    game: {
      kickerFallback: string;
      line1: string;
      line2: string;
      introFallback: string;
      cta: string;
    };
    cta: { line1: string; line2: string; copy: string; book: string; epk: string };
    fanSignal: { line1: string; line2: string; description: string };
  }
> = {
  id: {
    portraitAlt: "Portrait resmi Akbar Nawasunda",
    portraitCaptionLabel: "Portrait resmi",
    heroBodyFallback:
      "Produser musik, remixer, dan DJ dari Bandung Barat. Breakbeat, electronic bass, dan remix untuk rilisan serta kolaborasi.",
    heroActionVisual: "TONTON VISUAL",
    heroActionListen: "DENGAR SEKARANG",
    heroVisualsCta: "Lihat visual",
    heroScrollLabel: "Gulir",
    heroScrollAria: "Lihat kabar terbaru dari studio",
    heroFacts: { based: "Basis", since: "Sejak", genre: "Genre" },
    alsoKnownAs: "Juga dikenal sebagai DJ Akbar Remix dan akbarnawasunda.my.id.",
    signal: {
      line1: "YANG SEDANG",
      line2: "BERJALAN.",
      lede: "Rilisan terbaru, jadwal live terdekat, dan jalur kontak resmi.",
      aside: "LIVE DARI STUDIO",
    },
    rows: {
      latestLabel: "RILISAN TERBARU",
      latestAction: "DETAIL",
      nextLiveLabel: "LIVE BERIKUTNYA",
      nextLiveAction: "JADWAL",
      bookingLabel: "STATUS BOOKING",
      bookingValue: "TERBUKA UNTUK BOOKING & REMIX",
      bookingNote: "Belum ada jadwal publik yang dikonfirmasi.",
      bookingAction: "AJUKAN",
      studioLabel: "STUDIO",
      studioValue: "BANDUNG BARAT · BREAKBEAT / INDO BASS",
      studioNote: "Remix custom, produksi, dan kolaborasi.",
      studioAction: "KIRIM BRIEF",
    },
    doc: {
      storyFallback:
        "Putar langsung di sini, atau buka versi lengkapnya di platform resmi.",
      closePlayer: "Tutup player",
      playHere: "Putar di sini",
      openRelease: "Buka rilisan",
      loading: "Memuat rilisan…",
    },
    channels: {
      heading: "Dengar di kanal resminya.",
      meta: count => `${count} kanal resmi · rilisan, remix, dan set`,
      footerCta: "Buka katalog musik",
      openAria: label => `Buka Akbar Nawasunda di ${label}`,
    },
    pauseQuote: "Breakbeat, electronic bass, dan remix.",
    game: {
      kickerFallback: "GAME MINI",
      line1: "MAIN",
      line2: "JEDAG RUN.",
      introFallback:
        "Lari ikut ketukan, kumpulkan not, kejar drop-nya. Skor tertinggi masuk papan peringkat.",
      cta: "MAIN JEDAG RUN",
    },
    cta: {
      line1: "BAWA SUARA INI",
      line2: "KE PANGGUNGMU.",
      copy: "Performance, remix custom, lisensi musik, atau kolaborasi — kirim konteks proyek dan tanggalnya.",
      book: "AJUKAN BOOKING",
      epk: "LIHAT EPK",
    },
    fanSignal: {
      line1: "JANGAN",
      line2: "KETINGGALAN.",
      description: "Rilisan baru, video, dan jadwal — langsung ke email kamu.",
    },
  },
  en: {
    portraitAlt: "Portrait of Akbar Nawasunda",
    portraitCaptionLabel: "Official portrait",
    // Satu sumber bio terverifikasi (sama yang dipakai AboutView locale=en),
    // bukan parafrase baru — supaya hero dan /about tidak bicara dengan dua
    // versi bio yang sedikit berbeda.
    heroBodyFallback: verifiedArtistProfile.shortBioEn,
    heroActionVisual: "WATCH VISUAL",
    heroActionListen: "LISTEN NOW",
    heroVisualsCta: "VIEW VISUALS",
    heroScrollLabel: "Scroll",
    heroScrollAria: "See the latest updates from the studio",
    heroFacts: { based: "Based", since: "Since", genre: "Genre" },
    alsoKnownAs: "Also known as DJ Akbar Remix and akbarnawasunda.my.id.",
    signal: {
      line1: "WHAT IS",
      line2: "RUNNING NOW.",
      lede: "Live status from the studio: the release in rotation, the next date on stage, and the official contact route.",
      aside: "LIVE FROM THE STUDIO",
    },
    rows: {
      latestLabel: "LATEST RELEASE",
      latestAction: "DETAILS",
      nextLiveLabel: "NEXT LIVE",
      nextLiveAction: "DATES",
      bookingLabel: "BOOKING STATUS",
      bookingValue: "OPEN FOR SHOWS & CUSTOM REMIXES",
      bookingNote:
        "No public date confirmed yet — studio and stage slots are still available.",
      bookingAction: "INQUIRE",
      studioLabel: "STUDIO",
      studioValue: "BANDUNG BARAT · BREAKBEAT / INDO BASS",
      studioNote:
        "Custom remixes, production, and collaborations through the official inquiry line.",
      studioAction: "SEND BRIEF",
    },
    doc: {
      storyFallback:
        "Play it right here, or open the full version on the official platform.",
      closePlayer: "Close player",
      playHere: "Play here",
      openRelease: "Open release",
      loading: "Loading release…",
    },
    channels: {
      heading: "Listen on the official channels.",
      meta: count => `${count} official channels · releases, remixes, and sets`,
      footerCta: "View music catalog",
      openAria: label => `Open Akbar Nawasunda on ${label}`,
    },
    pauseQuote: "Breakbeat, electronic bass, and remix.",
    game: {
      kickerFallback: "MINI GAME",
      line1: "PLAY",
      line2: "JEDAG RUN.",
      introFallback:
        "Run to the beat, collect notes, chase the drop. Top scores make the leaderboard.",
      cta: "PLAY JEDAG RUN",
    },
    cta: {
      line1: "BRING THIS SOUND",
      line2: "TO YOUR STAGE.",
      copy: "Shows, custom remixes, music licensing, or release collaborations — send the project context and dates, and the reply comes straight from the studio.",
      book: "START AN INQUIRY",
      epk: "VIEW THE EPK",
    },
    fanSignal: {
      line1: "DON'T",
      line2: "MISS A THING.",
      description: "New releases, videos, and show dates — straight to your inbox.",
    },
  },
};

const formatEventDate = (
  date: string,
  locale: HomeLocale,
  time?: string
) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  const dateText = new Intl.DateTimeFormat(
    locale === "en" ? "en-GB" : "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
    .format(parsed)
    .toUpperCase();
  return time ? `${dateText} · ${time}` : dateText;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function HomeView({ locale = "id" }: { locale?: HomeLocale }) {
  const copy = HOME_COPY[locale];
  const prefix = locale === "en" ? "/en" : "";

  const [portraitSrc, setPortraitSrc] = useState(officialBrand.portrait);
  const [playerOpen, setPlayerOpen] = useState(false);
  // [BUGFIX] `.an-site main > section.is-revealed` punya dekorasi garis
  // aksen yang tumbuh saat kelihatan (lihat NightFrequencySignature.css),
  // tapi tidak ada apa pun yang pernah menambahkan kelas `is-revealed` —
  // `useScrollReveal` sudah lama ada sebagai berkas tapi tidak pernah
  // dipakai di mana pun. Hero sengaja TIDAK dipasangi (harus langsung
  // kelihatan tanpa fade-in); ADEGAN 3 (rilisan) sudah punya animasinya
  // sendiri lewat `<Reveal>`/`.an-rise` jadi tidak diikutkan juga.
  const channelsRevealRef = useScrollReveal<HTMLElement>();
  const pauseRevealRef = useScrollReveal<HTMLElement>();
  const gameTeaserRevealRef = useScrollReveal<HTMLElement>();

  const publicContent = usePublicArtistContent();
  const contentQuery = trpc.content.list.useQuery(undefined, {
    enabled: publicContent.isError,
  });

  const editablePlatformLinks = publicPlatformLinks(publicContent.data);
  const cmsEvents = publicUpcomingEvents(publicContent.data);
  const featuredEvent =
    cmsEvents.find(event => event.isFeatured) || cmsEvents[0];
  const managedContent = contentQuery.data ?? [];
  const contentIsLoading = publicContent.isLoading || contentQuery.isLoading;

  const managedHero = managedContent.find(item => item.kind === "hero");
  const managedRelease = managedContent.find(item => item.kind === "release");
  // [KONTRAK] Placeholder lama ("no date announced"/"tba") tidak boleh
  // bocor sebagai live-date terkelola — lihat server/editorialSimplification
  // .test.ts. Widget tanggal panggungnya sendiri sudah pindah ke /live, tapi
  // aturan filternya dijaga di sini supaya tidak hilang kalau widget itu
  // kembali suatu saat.
  const rawManagedLive = managedContent.find(item => item.kind === "live");
  const managedLive =
    rawManagedLive && !/no date announced|tba/i.test(rawManagedLive.title)
      ? rawManagedLive
      : undefined;

  const normalizeManagedTitle = (value: string) =>
    value.toLowerCase() === "garam & madu × backpacker"
      ? "Garam & Madu × Backpacker"
      : value;

  const cmsReleases = publicContent.data?.releases ?? [];
  const cmsCurrentRelease =
    cmsReleases.find(item => item.isCurrent) || cmsReleases[0];

  const activeReleaseStory =
    cmsCurrentRelease?.story ?? managedRelease?.subtitle;
  const activeRelease = cmsCurrentRelease
    ? {
        ...currentRelease,
        title: cmsCurrentRelease.title,
        type:
          cmsCurrentRelease.platform ||
          cmsCurrentRelease.format ||
          currentRelease.type,
        href: cmsCurrentRelease.url || currentRelease.href,
        image: cmsCurrentRelease.artworkUrl || currentRelease.image,
      }
    : managedRelease
      ? {
          ...currentRelease,
          title: normalizeManagedTitle(managedRelease.title),
          type: managedRelease.label || currentRelease.type,
          href: managedRelease.href || currentRelease.href,
          image:
            managedRelease.imageUrl &&
            managedRelease.imageUrl !== officialBrand.socialPreview
              ? managedRelease.imageUrl
              : currentRelease.image,
        }
      : currentRelease;

  const cmsHero = publicContent.data?.hero;
  const cmsProfile = publicContent.data?.profile;
  const heroKicker =
    cmsHero?.heroKicker || managedHero?.label || "AKBAR NAWASUNDA";
  const suppliedHeroTitle = cmsHero?.heroTitle || managedHero?.title;
  const heroTitle = /make the night move/i.test(suppliedHeroTitle || "")
    ? undefined
    : suppliedHeroTitle;
  const heroBody =
    cmsHero?.heroBody || managedHero?.subtitle || copy.heroBodyFallback;
  /* RILISAN ADALAH SATU SUMBER (risiko R2, Phase 5b): CTA hero, papan
     signal, dokumen rilisan (slot 4), dan player global semuanya menunjuk
     `activeRelease` (isCurrent CMS/katalog). URL & label aksi CMS hero
     tidak lagi menimpa target — sebelumnya itu bisa membuat hero menunjuk
     track yang berbeda dari dokumen rilisan di halaman yang sama. */
  const heroActionUrl = activeRelease.href;
  const heroActionIsVisual = /youtube\.com|youtu\.be/i.test(heroActionUrl);
  const heroActionLabel = heroActionIsVisual
    ? copy.heroActionVisual
    : copy.heroActionListen;

  const gameConfig = publicContent.data?.game;
  const gameEnabled = gameConfig?.isEnabled !== false;

  const configuredPortrait =
    cmsHero?.heroImage || cmsProfile?.portraitImage || officialBrand.portrait;
  useEffect(() => {
    setPortraitSrc(configuredPortrait);
  }, [configuredPortrait]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "auto", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [contentIsLoading]);

  const heroDeckSpec =
    [
      cmsCurrentRelease?.format || activeRelease.type,
      cmsCurrentRelease?.year,
      cmsCurrentRelease?.platform,
    ]
      .filter(Boolean)
      .join(" · ")
      .toUpperCase() || currentRelease.eyebrow;

  const currentSignalRows: SignalRow[] = [
    {
      label: copy.rows.latestLabel,
      value: activeRelease.title,
      note: heroDeckSpec,
      href: `${prefix}/music/${slugify(activeRelease.title)}`,
      actionLabel: copy.rows.latestAction,
    },
    featuredEvent
      ? {
          label: copy.rows.nextLiveLabel,
          value: featuredEvent.title,
          note: [
            formatEventDate(featuredEvent.date, locale, featuredEvent.time),
            featuredEvent.venue,
            featuredEvent.city,
          ]
            .filter(Boolean)
            .join(" · "),
          href: `${prefix}/live`,
          actionLabel: copy.rows.nextLiveAction,
        }
      : {
          label: copy.rows.bookingLabel,
          value: copy.rows.bookingValue,
          note: copy.rows.bookingNote,
          href: `${prefix}/inquire?type=booking&source=home`,
          actionLabel: copy.rows.bookingAction,
        },
    {
      label: copy.rows.studioLabel,
      value: copy.rows.studioValue,
      note: copy.rows.studioNote,
      href: `${prefix}/inquire?type=remix&source=home`,
      actionLabel: copy.rows.studioAction,
    },
  ];

  const displayHeroTitle = (heroTitle || "AKBAR NAWASUNDA.").trim();
  const heroTitleWords = displayHeroTitle.split(/\s+/);

  return (
    <main id="top" tabIndex={-1}>
      {/* ADEGAN 1 — pembuka sinematik: satu foto resmi sebagai panggung,
          tipografi masuk dari kiri bawah di atas scrim gelap, dan rilisan
          terbaru hadir sebagai artefak yang bisa diklik. Semua isinya data
          nyata dari CMS/katalog. */}
      <section className="an-hero-scene" aria-labelledby="hero-title">
        <figure className="an-hero-plate">
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
              src={portraitSrc}
              alt={copy.portraitAlt}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={800}
              height={1000}
              onError={() => {
                if (portraitSrc !== officialBrand.portraitFallback) {
                  setPortraitSrc(officialBrand.portraitFallback);
                }
              }}
            />
          </picture>
          <img
            className="an-hero-mascot"
            src="/assets/akbar-mascot-doodle.webp"
            alt=""
            aria-hidden="true"
            width={168}
            height={168}
            loading="lazy"
            fetchPriority="low"
            decoding="async"
          />
          <figcaption className="an-hero-plate-note">
            <span>{copy.portraitCaptionLabel}</span>
            <span aria-hidden="true">·</span>
            <span>Bandung Barat</span>
          </figcaption>
        </figure>

        <div className="an-hero-inner">
          <p className="an-kicker">
            <span className="an-kicker-dot" aria-hidden="true" />
            {heroKicker}
          </p>
          <h1
            className="hero-title-editorial"
            id="hero-title"
            data-no-scramble="true"
            aria-label={displayHeroTitle}
          >
            <span className="sr-only">{displayHeroTitle}</span>
            <span aria-hidden="true">
              {/* Spasi antar kata WAJIB di luar `.hero-title-mask`.
                  Mask itu inline-block, dan spasi di ujung inline-block
                  dipangkas browser — dulu judulnya terbaca menyatu
                  "AKBARNAWASUNDA". Fragment di bawah menaruh spasi
                  sebagai simpul saudara, bukan anak. */}
              {heroTitleWords.map((word, index) => (
                <Fragment key={`${word}-${index}`}>
                  {index > 0 ? " " : null}
                  <span
                    className="hero-title-mask"
                    style={{ "--hero-word-index": index } as CSSProperties}
                  >
                    <span className="hero-title-word">{word}</span>
                  </span>
                </Fragment>
              ))}
            </span>
          </h1>
          {/* Pelat nama aksara Sunda. Bukan karakter lepas: komponennya
              selalu membawa kunci baca (label + bacaan Latin) dan
              line-height longgar supaya tanda tempel aksaranya tidak
              terpotong. Isi dari client/src/content/sundaneseScript.ts;
              transliterasi masih menunggu konfirmasi pemilik. */}
          <SundaScript entry={SUNDA_NAME} lang={locale} tone="hero" />
          <p className="an-hero-lede">{heroBody}</p>

          {/* Hanya tampil otomatis pada 1 November (waktu Jakarta). */}
          <BirthdayNote locale={locale} />

          <div className="an-hero-cta">
            <a
              className="an-btn an-btn--solid"
              href={heroActionUrl}
              target="_blank"
              rel="noreferrer"
              data-signal-magnetic
              data-signal-interactive
              data-cursor="point"
            >
              <Play size={13} fill="currentColor" />
              <span>{heroActionLabel}</span>
            </a>
            <Link
              className="an-btn an-btn--quiet"
              href={`${prefix}/visuals`}
              data-signal-magnetic
            >
              {copy.heroVisualsCta} <ArrowRight size={15} />
            </Link>
          </div>

          <dl className="an-hero-facts">
            <div>
              <dt>{copy.heroFacts.based}</dt>
              <dd>Bandung Barat</dd>
            </div>
            <div>
              <dt>{copy.heroFacts.since}</dt>
              <dd>2020</dd>
            </div>
            <div>
              <dt>{copy.heroFacts.genre}</dt>
              <dd>Breakbeat / Indo Bass</dd>
            </div>
          </dl>
        </div>

        <a
          className="an-hero-scroll"
          href="#signal"
          aria-label={copy.heroScrollAria}
        >
          <span aria-hidden="true">{copy.heroScrollLabel}</span>
          <ArrowDownRight size={15} aria-hidden="true" />
        </a>
      </section>

      <SignatureStage lang={locale} alsoKnownAs={copy.alsoKnownAs} />

      <EditorialSection
        id="signal"
        title={
          <>
            {copy.signal.line1}
            <br />
            {copy.signal.line2}
          </>
        }
        lede={copy.signal.lede}
        aside={<SignalIndicator label={copy.signal.aside} />}
      >
        <CurrentSignalBoard
          rows={currentSignalRows}
          actionFallback={locale === "en" ? "OPEN" : undefined}
        />
      </EditorialSection>

      {/* ADEGAN 3 — rilisan terbaru sebagai satu dokumen utuh: artwork
          besar, metadata mono, dan pemutar resmi di tempat yang sama. */}
      <Reveal>
        <section
          className="an-feature an-doc"
          id="music"
          aria-labelledby="feature-title"
          aria-busy={contentIsLoading}
        >
          <figure className="an-doc-art an-rise">
            <ResilientArtworkImage
              src={activeRelease.image}
              backupSrc={officialBrand.socialPreview}
              alt={`Artwork ${activeRelease.title}`}
            />
            <figcaption>
              {cmsCurrentRelease
                ? [
                    cmsCurrentRelease.format || cmsCurrentRelease.platform,
                    cmsCurrentRelease.year,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : managedRelease?.label || currentRelease.eyebrow}
            </figcaption>
          </figure>

          <div className="an-doc-copy an-rise">
            <h2 id="feature-title">{activeRelease.title}</h2>
            <p className="an-doc-story">
              {activeReleaseStory || copy.doc.storyFallback}
            </p>
            <div className="an-doc-actions">
              <button
                type="button"
                className="an-btn an-btn--solid"
                aria-expanded={playerOpen}
                onClick={() => setPlayerOpen(open => !open)}
              >
                {playerOpen ? (
                  copy.doc.closePlayer
                ) : (
                  <>
                    <Play size={13} fill="currentColor" /> {copy.doc.playHere}
                  </>
                )}
              </button>
              <a
                className="an-btn an-btn--quiet"
                href={activeRelease.href}
                target="_blank"
                rel="noreferrer"
              >
                {copy.doc.openRelease} <ArrowUpRight size={14} />
              </a>
              <span className="an-feature-type">{activeRelease.type}</span>
            </div>
            {playerOpen ? (
              <div className="an-feature-player">
                <MusicEmbed url={activeRelease.href} title={activeRelease.title} />
              </div>
            ) : null}
            {contentIsLoading && <p className="an-meta">{copy.doc.loading}</p>}
          </div>
        </section>
      </Reveal>

      {/* ADEGAN 4 — kanal resmi sebagai daftar tipografis, bukan deretan
          kartu identik. Marquee di bawahnya tetap dipakai sebagai ritme. */}
      <section
        ref={channelsRevealRef}
        className="an-channels"
        id="platforms"
        aria-labelledby="channels-title"
      >
        <header className="an-channels-head">
          <h2 id="channels-title">{copy.channels.heading}</h2>
          <p className="an-meta">{copy.channels.meta(editablePlatformLinks.length)}</p>
        </header>

        <ul className="an-channels-list" data-cursor="music">
          {editablePlatformLinks.map((platform, index) => (
            <li
              key={platform.label}
              className="an-channel-row"
              style={{ "--i": index } as CSSProperties}
            >
              <a
                className={`an-channel platform-${platform.label
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                href={platform.href}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.channels.openAria(platform.label)}
              >
                <span className="an-channel-mark" aria-hidden="true">
                  <PlatformIcon label={platform.label} />
                </span>
                <span className="an-channel-name">{platform.label}</span>
                <ArrowUpRight
                  className="an-channel-arrow"
                  size={16}
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="an-channels-foot">
          <Link className="an-btn an-btn--quiet" href={`${prefix}/music`}>
            {copy.channels.footerCta} <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* FASE 7 nomor 7 — satu layar jeda. Sengaja hampir kosong: satu
          baris mikro, bukan section baru dengan judul dan CTA. Kutipannya
          BUKAN klaim baru — potongan verbatim dari `heroBody` di atas
          (sendiri bersumber dari CMS/managed content), ditata ulang
          sebagai kutipan tunggal huruf judul supaya layak jadi jeda,
          bukan diulang sebagai paragraf. `aria-hidden` karena kalimatnya
          sudah dibacakan screen reader lewat `.an-hero-lede`; mengulang
          di sini hanya untuk mata, bukan telinga. Tidak ada aset gambar
          baru; hanya CSS pada DOM yang sudah ringan ini. */}
      <section ref={pauseRevealRef} className="an-pause" aria-hidden="true">
        <p className="an-pause-quote">{copy.pauseQuote}</p>
      </section>

      {/* Perjalanan & studi potret tidak diulang di beranda: bagian itu
          milik /universe supaya pengunjung tidak melihat section yang
          sama dua kali di halaman berbeda. */}

      {/* Katalog lengkap tidak diulang di beranda — rail penuh hanya ada
          di /music. Beranda cukup menautkannya dari bagian kanal. */}

      {/* Ruang tayang video milik /visuals; beranda tidak mengulang
          daftar video yang sama. */}

      {/* Jadwal panggung milik /live — beranda tidak menampilkan
          daftar tanggal yang sama dua kali. */}

      {gameEnabled ? (
        <section
          ref={gameTeaserRevealRef}
          className="section game-teaser-section"
          id="game"
          aria-labelledby="game-teaser-title"
        >
          <div className="game-teaser-art" aria-hidden="true">
            <div className="game-teaser-scanline" />
            <span className="game-teaser-sun" />
            <span className="game-teaser-mountain game-teaser-mountain-a" />
            <span className="game-teaser-mountain game-teaser-mountain-b" />
            <span className="game-teaser-runner">AN</span>
            <span className="game-teaser-note game-teaser-note-a" />
            <span className="game-teaser-note game-teaser-note-b" />
            <span className="game-teaser-gate" />
            <span className="game-teaser-signal-line" />
          </div>
          <div className="game-teaser-copy">
            <p className="eyebrow">
              <Sparkles size={13} /> {gameConfig?.kicker || copy.game.kickerFallback}
            </p>
            <h2 id="game-teaser-title">
              {copy.game.line1}
              <br />
              {copy.game.line2}
            </h2>
            <p>{gameConfig?.intro || copy.game.introFallback}</p>
            <Link className="button-primary" href={`${prefix}/game/jedag-run`}>
              {copy.game.cta} <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      ) : null}

      <CtaPanel
        id="booking"
        title={
          <>
            {copy.cta.line1}
            <br />
            {copy.cta.line2}
          </>
        }
        copy={copy.cta.copy}
        actions={
          <>
            <Link className="ed-button" href={`${prefix}/inquire?source=home`}>
              {copy.cta.book} <ArrowUpRight size={14} />
            </Link>
            <Link className="ed-button--ghost" href={`${prefix}/epk`}>
              {copy.cta.epk} <ArrowRight size={14} />
            </Link>
          </>
        }
      />

      <FanSignalSection
        source={FAN_SIGNAL_SOURCES.home}
        anchorId="fan-signal"
        lang={locale}
        title={
          <>
            {copy.fanSignal.line1}
            <br />
            {copy.fanSignal.line2}
          </>
        }
        description={copy.fanSignal.description}
      />
    </main>
  );
}

export default function Home() {
  return (
    <div className="an-site" data-page="home">
      {/* Rute arsip tetap dipusatkan di NightHeader: href="/universe" (label "ARSIP"). */}
      <NightHeader />
      <HomeView locale="id" />
      <NightFooter />
    </div>
  );
}
