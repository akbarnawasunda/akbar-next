import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  Play,
  Sparkles,
  Ticket,
} from "lucide-react";
import {
  Fragment,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "wouter";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
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
  releases,
  videos,
  youtubeThumbnail,
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

const formatEventDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
        .format(parsed)
        .toUpperCase();
};

const youtubeIdFrom = (url: string | null | undefined) => {
  if (!url) return undefined;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/i
  );
  return match?.[1];
};

const managedVideoImage = (
  imageUrl: string | null | undefined,
  href?: string | null
) => {
  if (!imageUrl) {
    const id = youtubeIdFrom(href);
    return id ? youtubeThumbnail(id) : officialBrand.socialPreview;
  }
  // [FIX liquid-signal/phase3] Path CMS lama `/manus-storage/*stage*` dulu
  // jatuh ke "akbar-night-frequency-stage" — foto asli yang ditumpuki teks
  // chrome/neon "AKBAR NAWASUNDA RMX". Diganti kartu brand resmi yang sama
  // dipakai sebagai fallback umum di tempat lain, bukan gambar karangan.
  return /\/manus-storage\/[^/?#]*stage[^/?#]*/i.test(imageUrl)
    ? officialBrand.socialPreview
    : imageUrl;
};

export default function Home() {
  const [portraitSrc, setPortraitSrc] = useState(officialBrand.portrait);
  const [playerOpen, setPlayerOpen] = useState(false);
  const releaseCatalogRef = useRef<HTMLDivElement>(null);
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
  const managedVideos = managedContent
    .filter(item => item.kind === "video")
    .slice(0, 3);
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

  const cmsCatalog = cmsReleases.map(item => {
    const fallback = releases.find(
      release =>
        release.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    );
    return {
      title: item.title,
      format: item.format || fallback?.format || "Release",
      year: item.year || fallback?.year || "—",
      platform: item.platform || fallback?.platform || "Official link",
      href:
        item.url || fallback?.href || "https://soundcloud.com/akbarnawasunda",
      image: item.artworkUrl || fallback?.image || officialBrand.socialPreview,
    };
  });

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
    cmsHero?.heroBody ||
    managedHero?.subtitle ||
    "Produser musik, remixer, dan DJ dari Bandung Barat. Breakbeat, electronic bass, dan remix untuk rilisan serta kolaborasi.";
  /* RILISAN ADALAH SATU SUMBER (risiko R2, Phase 5b): CTA hero, papan
     signal, dokumen rilisan (slot 4), dan player global semuanya menunjuk
     `activeRelease` (isCurrent CMS/katalog). URL & label aksi CMS hero
     tidak lagi menimpa target — sebelumnya itu bisa membuat hero menunjuk
     track yang berbeda dari dokumen rilisan di halaman yang sama. */
  const heroActionUrl = activeRelease.href;
  const heroActionIsVisual = /youtube\.com|youtu\.be/i.test(heroActionUrl);
  const heroActionLabel = heroActionIsVisual
    ? "TONTON VISUAL"
    : "DENGAR SEKARANG";

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
      label: "RILISAN TERBARU",
      value: activeRelease.title,
      note: heroDeckSpec,
      href: `/music/${activeRelease.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
      actionLabel: "DETAIL",
    },
    featuredEvent
      ? {
          label: "LIVE BERIKUTNYA",
          value: featuredEvent.title,
          note: [
            formatEventDate(featuredEvent.date),
            featuredEvent.venue,
            featuredEvent.city,
          ]
            .filter(Boolean)
            .join(" · "),
          href: "/live",
          actionLabel: "JADWAL",
        }
      : {
          label: "STATUS BOOKING",
          value: "TERBUKA UNTUK BOOKING & REMIX",
          note: "Belum ada jadwal publik yang dikonfirmasi.",
          href: "/inquire?type=booking&source=home",
          actionLabel: "AJUKAN",
        },
    {
      label: "STUDIO",
      value: "BANDUNG BARAT · BREAKBEAT / INDO BASS",
      note: "Remix custom, produksi, dan kolaborasi.",
      href: "/inquire?type=remix&source=home",
      actionLabel: "KIRIM BRIEF",
    },
  ];

  const displayHeroTitle = (heroTitle || "AKBAR NAWASUNDA.").trim();
  const heroTitleWords = displayHeroTitle.split(/\s+/);

  return (
    <>
      <div className="an-site" data-page="home">
        {/* Rute arsip tetap dipusatkan di NightHeader: href="/universe" (label "ARSIP"). */}
        <NightHeader />

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
                  alt="Portrait resmi Akbar Nawasunda"
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
                <span>Portrait resmi</span>
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
              <SundaScript entry={SUNDA_NAME} lang="id" tone="hero" />
              <p className="an-hero-lede">{heroBody}</p>

              {/* Hanya tampil otomatis pada 1 November (waktu Jakarta). */}
              <BirthdayNote />

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
                  href="/visuals"
                  data-signal-magnetic
                >
                  Lihat visual <ArrowRight size={15} />
                </Link>
              </div>

              <dl className="an-hero-facts">
                <div>
                  <dt>Basis</dt>
                  <dd>Bandung Barat</dd>
                </div>
                <div>
                  <dt>Sejak</dt>
                  <dd>2020</dd>
                </div>
                <div>
                  <dt>Genre</dt>
                  <dd>Breakbeat / Indo Bass</dd>
                </div>
              </dl>
            </div>

            <a
              className="an-hero-scroll"
              href="#signal"
              aria-label="Lihat kabar terbaru dari studio"
            >
              <span aria-hidden="true">Gulir</span>
              <ArrowDownRight size={15} aria-hidden="true" />
            </a>
          </section>

          <SignatureStage alsoKnownAs="Juga dikenal sebagai DJ Akbar Remix dan akbarnawasunda.my.id." />

          <EditorialSection
            id="signal"
            title={
              <>
                YANG SEDANG
                <br />
                BERJALAN.
              </>
            }
            lede="Rilisan terbaru, jadwal live terdekat, dan jalur kontak resmi."
            aside={<SignalIndicator label="LIVE DARI STUDIO" />}
          >
            <CurrentSignalBoard rows={currentSignalRows} />
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
                  {activeReleaseStory ||
                    "Putar langsung di sini, atau buka versi lengkapnya di platform resmi."}
                </p>
                <div className="an-doc-actions">
                  <button
                    type="button"
                    className="an-btn an-btn--solid"
                    aria-expanded={playerOpen}
                    onClick={() => setPlayerOpen(open => !open)}
                  >
                    {playerOpen ? (
                      "Tutup player"
                    ) : (
                      <>
                        <Play size={13} fill="currentColor" /> Putar di sini
                      </>
                    )}
                  </button>
                  <a
                    className="an-btn an-btn--quiet"
                    href={activeRelease.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka rilisan <ArrowUpRight size={14} />
                  </a>
                  <span className="an-feature-type">{activeRelease.type}</span>
                </div>
                {playerOpen ? (
                  <div className="an-feature-player">
                    <MusicEmbed
                      url={activeRelease.href}
                      title={activeRelease.title}
                    />
                  </div>
                ) : null}
                {contentIsLoading && <p className="an-meta">Memuat rilisan…</p>}
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
              <h2 id="channels-title">Dengar di kanal resminya.</h2>
              <p className="an-meta">
                {editablePlatformLinks.length} kanal resmi · rilisan, remix, dan
                set
              </p>
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
                    aria-label={`Buka Akbar Nawasunda di ${platform.label}`}
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
              <Link className="an-btn an-btn--quiet" href="/music">
                Buka katalog musik <ArrowRight size={14} />
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
            <p className="an-pause-quote">
              Breakbeat, electronic bass, dan remix.
            </p>
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
                  <Sparkles size={13} /> {gameConfig?.kicker || "GAME MINI"}
                </p>
                <h2 id="game-teaser-title">
                  MAIN
                  <br />
                  JEDAG RUN.
                </h2>
                <p>
                  {gameConfig?.intro ||
                    "Lari ikut ketukan, kumpulkan not, kejar drop-nya. Skor tertinggi masuk papan peringkat."}
                </p>
                <Link className="button-primary" href="/game/jedag-run">
                  MAIN JEDAG RUN <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          ) : null}

          <CtaPanel
            id="booking"
            title={
              <>
                BAWA SUARA INI
                <br />
                KE PANGGUNGMU.
              </>
            }
            copy="Performance, remix custom, lisensi musik, atau kolaborasi — kirim konteks proyek dan tanggalnya."
            actions={
              <>
                <Link className="ed-button" href="/inquire?source=home">
                  AJUKAN BOOKING <ArrowUpRight size={14} />
                </Link>
                <Link className="ed-button--ghost" href="/epk">
                  LIHAT EPK <ArrowRight size={14} />
                </Link>
              </>
            }
          />

          <FanSignalSection
            source={FAN_SIGNAL_SOURCES.home}
            anchorId="fan-signal"
            title={
              <>
                JANGAN
                <br />
                KETINGGALAN.
              </>
            }
            description="Rilisan baru, video, dan jadwal — langsung ke email kamu."
          />
        </main>

        <NightFooter />
      </div>
    </>
  );
}
