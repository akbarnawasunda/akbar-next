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
import { ArtistPhotoStorySection } from "@/components/ArtistEditorialSections";
import {
  publicPhotoStories,
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

export default function Visuals() {
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
    return ["SEMUA", ...labels];
  }, [archive]);
  const [group, setGroup] = useState("SEMUA");
  const visibleArchive =
    group === "SEMUA"
      ? archive
      : archive.filter(
          item => (item.label || "VIDEO").toUpperCase() === group
        );

  const heroPhoto =
    portraitContent[0]?.imageUrl || officialBrand.portrait;

  return (
    <div className="nf-page">
      <NightHeader active="/visuals" />
      <main id="main-content" tabIndex={-1}>
        {/* Dinding galeri: satu foto memegang panggung, tipografi jadi
            keterangannya. */}
        <section className="an-vis-hero" aria-labelledby="visuals-title">
          <div className="an-vis-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              Kanal visual resmi
            </p>
            <h1 id="visuals-title">Video &amp; potret.</h1>
            <p className="an-vis-lede">
              {cms.isLoading
                ? "Memuat arsip visual."
                : "Video musik, visualizer, dan studi potret dari kanal resmi Akbar Nawasunda."}
            </p>
            <div className="an-vis-hero-actions">
              <a
                className="an-btn an-btn--solid"
                href="https://www.youtube.com/@akbarnawasunda"
                target="_blank"
                rel="noreferrer"
              >
                Buka YouTube <ArrowUpRight size={14} />
              </a>
              <Link className="an-btn an-btn--quiet" href="/visuals/portraits">
                Studi potret <ArrowUpRight size={14} />
              </Link>
            </div>
            <dl className="an-vis-facts">
              <div>
                <dt>Video</dt>
                <dd>{archive.length}</dd>
              </div>
              <div>
                <dt>Studi potret</dt>
                <dd>{portraitContent.length}</dd>
              </div>
              <div>
                <dt>Kanal</dt>
                <dd>YouTube</dd>
              </div>
            </dl>
          </div>
          <figure className="an-vis-hero-plate">
            <ResilientArtworkImage
              src={heroPhoto}
              backupSrc={officialBrand.portraitFallback}
              alt="Potret resmi Akbar Nawasunda"
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>
              <span>Studio portrait</span>
              <strong>Bandung Barat</strong>
            </figcaption>
          </figure>
        </section>

        {/* Ruang tayang: dua player resmi, yang pertama lebih besar. */}
        <section className="an-section" aria-labelledby="screening-title">
          <header className="an-head an-head--row">
            <div>
              <h2 id="screening-title" className="an-title">
                Tayangan resmi.
              </h2>
              <p className="an-meta">
                {players.length} video · player dimuat saat ditekan
              </p>
            </div>
            <p className="an-vis-lede">
              Tekan play untuk memuat player, atau buka YouTube langsung.
            </p>
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
                description="Video dari channel resmi Akbar Nawasunda."
              />
            ))}
          </div>
        </section>

        <VisualPortraitStudies studies={portraitContent} />

        <ArtistPhotoStorySection photoStories={publicPhotoStories(cms.data)} />

        {/* Arsip visual: kolom berirama (dense grid), bukan kotak seragam. */}
        <section
          className="an-section dark-panel"
          aria-labelledby="archive-title"
        >
          <header className="an-vis-archive-head">
            <div>
              <h2 id="archive-title" className="an-title">
                Arsip visual.
              </h2>
              <p className="an-meta">
                {cmsVisuals.length
                  ? "Dikelola di CMS"
                  : `${visibleArchive.length} entri dari kanal resmi`}
              </p>
            </div>
            <FilterBar
              options={groups}
              value={group}
              onChange={setGroup}
              label="Saring arsip visual"
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
                openLabel="BUKA VIDEO"
              />
            ))}
          </div>
        </section>

        <CtaPanel
          title={
            <>
              BIKIN VISUAL
              <br />
              BERIKUTNYA BARENG.
            </>
          }
          copy="Video musik, visualizer, dokumentasi panggung, atau artwork rilisan — kirim konsepnya dan kita susun dari awal."
          actions={
            <>
              <Link className="ed-button" href="/inquire?type=visual&source=visuals">
                AJUKAN PROYEK <ArrowUpRight size={14} />
              </Link>
              <Link className="ed-button--ghost" href="/visuals/portraits">
                LIHAT PORTRAIT <ArrowUpRight size={14} />
              </Link>
            </>
          }
        />

        <FanSignalSection
          source={FAN_SIGNAL_SOURCES.visuals}
          title={
            <>
              LIHAT YANG
              <br />
              BERIKUTNYA.
            </>
          }
          description="Video resmi, artwork, dan catatan visual baru langsung ke email kamu."
        />
      </main>
      <NightFooter />
    </div>
  );
}
