import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { CtaPanel, FilterBar } from "@/components/editorial/EditorialKit";
import { OfficialMediaFrame } from "@/components/OfficialMediaFrame";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import FanSignalSection from "@/components/FanSignalSection";
import { FAN_SIGNAL_SOURCES } from "@shared/types";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { officialBrand, videos } from "@/content/artistPlatform";
import { InteractiveArtworkCard } from "@/components/signature/InteractiveArtworkCard";
import { SignalHeading } from "@/components/signature/SignalType";
import VisualPortraitStudies from "@/components/VisualPortraitStudies";
import {
  publicPortraitStudies,
  usePublicArtistContent,
} from "@/content/publicContent";
import "./EcosystemPages.css";
import "./ShowcaseStage.css";

const officialVideos = [
  { id: "rv4DK8nVWd0", title: "Garam dan Madu × Backpacker" },
  { id: "BOTdDcx31Zc", title: "Akbar Nawasunda — Visual Resmi" },
];

const thumbnailFor = (id: string) =>
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/**
 * Salinan galeri visual dua bahasa. `VisualsView` dipakai `/visuals` dan
 * `/en/visuals`, jadi dinding galeri, ruang tayang, arsip, CTA, dan Fan
 * Signal selalu satu komposisi di kedua bahasa.
 */
const copy = {
  id: {
    kicker: "Kanal visual resmi",
    title: (
      <>
        Video &amp; potret.
      </>
    ),
    loading: "Memuat arsip visual.",
    lede: "Video musik, visualizer, dan studi potret dari kanal resmi Akbar Nawasunda.",
    youtubeCta: "Buka YouTube",
    portraitsCta: "Studi potret",
    facts: { videos: "Video", portraits: "Studi potret", channel: "Kanal" },
    portraitAlt: "Potret resmi Akbar Nawasunda",
    plateNote: "Studio portrait",
    screeningTitle: "Tayangan resmi.",
    screeningMeta: (count: number) =>
      `${count} video · player dimuat saat ditekan`,
    screeningCopy: "Tekan play untuk memuat player, atau buka YouTube langsung.",
    screeningDescription: "Video dari channel resmi Akbar Nawasunda.",
    archiveTitle: "Arsip visual.",
    archiveManaged: "Dikelola di CMS",
    archiveFromChannel: (count: number) =>
      `${count} entri dari kanal resmi`,
    archiveFilter: "Saring arsip visual",
    archiveAll: "SEMUA",
    openVideo: "BUKA VIDEO",
    ctaTitle: (
      <>
        BIKIN VISUAL
        <br />
        BERIKUTNYA BARENG.
      </>
    ),
    ctaCopy:
      "Video musik, visualizer, dokumentasi panggung, atau artwork rilisan — kirim konsepnya dan kita susun dari awal.",
    ctaPrimary: "AJUKAN PROYEK",
    ctaSecondary: "LIHAT PORTRAIT",
    ctaHref: "/inquire?type=visual&source=visuals",
    portraitsHref: "/visuals/portraits",
    signalTitle: (
      <>
        LIHAT YANG
        <br />
        BERIKUTNYA.
      </>
    ),
    signalCopy:
      "Video resmi, artwork, dan catatan visual baru langsung ke email kamu.",
  },
  en: {
    kicker: "Official visual channel",
    title: (
      <>
        Video &amp; portraits.
      </>
    ),
    loading: "Loading the visual archive.",
    lede: "Music videos, visualizers, and portrait studies from the official Akbar Nawasunda channel.",
    youtubeCta: "Open YouTube",
    portraitsCta: "Portrait studies",
    facts: { videos: "Videos", portraits: "Portrait studies", channel: "Channel" },
    portraitAlt: "Official portrait of Akbar Nawasunda",
    plateNote: "Studio portrait",
    screeningTitle: "Official screenings.",
    screeningMeta: (count: number) =>
      `${count} videos · player loads on demand`,
    screeningCopy: "Press play to load the player, or open YouTube directly.",
    screeningDescription: "Video from the official Akbar Nawasunda channel.",
    archiveTitle: "Visual archive.",
    archiveManaged: "Managed in the CMS",
    archiveFromChannel: (count: number) => `${count} entries from the official channel`,
    archiveFilter: "Filter the visual archive",
    archiveAll: "ALL",
    openVideo: "OPEN VIDEO",
    ctaTitle: (
      <>
        MAKE THE NEXT
        <br />
        VISUAL TOGETHER.
      </>
    ),
    ctaCopy:
      "A music video, visualizer, stage documentation, or release artwork — send the concept and we build it from the start.",
    ctaPrimary: "PITCH A PROJECT",
    ctaSecondary: "VIEW PORTRAITS",
    ctaHref: "/en/inquire?type=visual&source=visuals",
    portraitsHref: "/en/visuals/portraits",
    signalTitle: (
      <>
        SEE WHAT
        <br />
        COMES NEXT.
      </>
    ),
    signalCopy:
      "Official videos, artwork, and new visual notes straight to your email.",
  },
} as const;

export function VisualsView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
  const cms = usePublicArtistContent();
  const cmsVisuals = cms.data?.visuals ?? [];

  const embedded = cmsVisuals
    .filter(item => item.youtubeId)
    .slice(0, 2)
    .map(item => ({ id: item.youtubeId!, title: item.title }));
  const players = embedded.length ? embedded : officialVideos;

  const portraitContent = publicPortraitStudies(cms.data);

  const archive = cmsVisuals.length
    ? cmsVisuals.map(item => ({
        title: item.title,
        label: item.label || "VIDEO RESMI",
        href:
          item.url ||
          (item.youtubeId
            ? `https://youtu.be/${item.youtubeId}`
            : "https://www.youtube.com/@akbarnawasunda"),
        image:
          item.imageUrl ||
          (item.youtubeId ? thumbnailFor(item.youtubeId) : undefined),
        backupImage: item.youtubeId
          ? thumbnailFor(item.youtubeId)
          : officialBrand.socialPreview,
      }))
    : videos.map(video => ({
        ...video,
        backupImage: officialBrand.socialPreview,
      }));

  const groups = useMemo(() => {
    const labels = Array.from(
      new Set(archive.map(item => (item.label || "VIDEO").toUpperCase()))
    );
    return [t.archiveAll, ...labels];
  }, [archive, t.archiveAll]);
  const [group, setGroup] = useState<string>(t.archiveAll);
  const visibleArchive =
    group === t.archiveAll
      ? archive
      : archive.filter(
          item => (item.label || "VIDEO").toUpperCase() === group
        );

  const heroPhoto =
    portraitContent[0]?.imageUrl || officialBrand.portrait;

  return (
    <main id="main-content" tabIndex={-1}>
        {/* Dinding galeri: satu foto memegang panggung, tipografi jadi
            keterangannya. */}
        <section className="an-vis-hero" aria-labelledby="visuals-title">
          <div className="an-vis-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              {t.kicker}
            </p>
            <h1 id="visuals-title">{t.title}</h1>
            <p className="an-vis-lede">
              {cms.isLoading ? t.loading : t.lede}
            </p>
            <div className="an-vis-hero-actions">
              <a
                className="an-btn an-btn--solid"
                href="https://www.youtube.com/@akbarnawasunda"
                target="_blank"
                rel="noreferrer"
              >
                {t.youtubeCta} <ArrowUpRight size={14} />
              </a>
              <Link className="an-btn an-btn--quiet" href={t.portraitsHref}>
                {t.portraitsCta} <ArrowUpRight size={14} />
              </Link>
            </div>
            <dl className="an-vis-facts">
              <div>
                <dt>{t.facts.videos}</dt>
                <dd>{archive.length}</dd>
              </div>
              <div>
                <dt>{t.facts.portraits}</dt>
                <dd>{portraitContent.length}</dd>
              </div>
              <div>
                <dt>{t.facts.channel}</dt>
                <dd>YouTube</dd>
              </div>
            </dl>
          </div>
          <figure className="an-vis-hero-plate">
            <ResilientArtworkImage
              src={heroPhoto}
              backupSrc={officialBrand.portraitFallback}
              alt={t.portraitAlt}
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>
              <span>{t.plateNote}</span>
              <strong>Bandung Barat</strong>
            </figcaption>
          </figure>
        </section>

        {/* Ruang tayang: dua player resmi, yang pertama lebih besar. */}
        <section className="an-section" aria-labelledby="screening-title">
          <header className="an-head an-head--row">
            <div>
              <h2 id="screening-title" className="an-title">
                {t.screeningTitle}
              </h2>
              <p className="an-meta">{t.screeningMeta(players.length)}</p>
            </div>
            <p className="an-vis-lede">{t.screeningCopy}</p>
          </header>
          <div className="an-vis-screening-grid">
            {players.map(video => (
              <OfficialMediaFrame
                key={video.id}
                title={video.title}
                provider="YouTube"
                sourceUrl={`https://youtu.be/${video.id}`}
                embedUrl={`https://www.youtube-nocookie.com/embed/${video.id}`}
                artwork={thumbnailFor(video.id)}
                backupArtwork={officialBrand.socialPreview}
                description={t.screeningDescription}
              />
            ))}
          </div>
        </section>

        <VisualPortraitStudies
          english={locale === "en"}
          studies={portraitContent}
        />

        {/* Arsip visual: kolom berirama (dense grid), bukan kotak seragam. */}
        <section
          className="an-section dark-panel"
          aria-labelledby="archive-title"
        >
          <header className="an-vis-archive-head">
            <div>
              <h2 id="archive-title" className="an-title">
                {t.archiveTitle}
              </h2>
              <p className="an-meta">
                {cmsVisuals.length
                  ? t.archiveManaged
                  : t.archiveFromChannel(visibleArchive.length)}
              </p>
            </div>
            <FilterBar
              options={groups}
              value={group}
              onChange={setGroup}
              label={t.archiveFilter}
            />
          </header>
          <div className="an-vis-archive">
            {visibleArchive.map(video => (
              <InteractiveArtworkCard
                key={video.title}
                title={video.title}
                badge={video.label}
                image={video.image || officialBrand.socialPreview}
                backupImage={video.backupImage}
                href={video.href}
                openLabel={t.openVideo}
              />
            ))}
          </div>
        </section>

        <CtaPanel
          title={t.ctaTitle}
          copy={t.ctaCopy}
          actions={
            <>
              <Link className="ed-button" href={t.ctaHref}>
                {t.ctaPrimary} <ArrowUpRight size={14} />
              </Link>
              <Link className="ed-button--ghost" href={t.portraitsHref}>
                {t.ctaSecondary} <ArrowUpRight size={14} />
              </Link>
            </>
          }
        />

        {/* Formulir FanSignal masih berbahasa Indonesia: hanya rute ID. */}
        {locale === "id" ? (
          <FanSignalSection
            source={FAN_SIGNAL_SOURCES.visuals}
            title={t.signalTitle}
            description={t.signalCopy}
          />
        ) : null}
    </main>
  );
}

export default function Visuals() {
  return (
    <div className="nf-page">
      <NightHeader active="/visuals" />
      <VisualsView locale="id" />
      <NightFooter />
    </div>
  );
}
