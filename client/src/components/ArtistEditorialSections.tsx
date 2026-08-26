import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { officialBrand, verifiedArtistProfile } from "@/content/artistPlatform";
import type { CmsJourney, CmsPhotoStory } from "@/content/publicContent";
import { publicJourney, publicPhotoStories } from "@/content/publicContent";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { SectionIndex } from "@/components/PlatformMarquee";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import "./ArtistEditorialSections.css";

type Locale = "id" | "en";

type ArtistEditorialSectionsProps = {
  journey?: CmsJourney;
  photoStories?: CmsPhotoStory[];
  locale?: Locale;
  showPhotoStory?: boolean;
  showJourney?: boolean;
};

function copyFor(locale: Locale, id: string, en?: string) {
  return locale === "en" ? en || id : id;
}

function journeyFallback(locale: Locale) {
  const journey = publicJourney(null);
  return {
    ...journey,
    title: locale === "en" ? journey.titleEn || "MUSIC JOURNEY." : journey.title || "PERJALANAN MUSIK.",
    intro: copyFor(locale, journey.intro || "", journey.introEn),
    milestones: journey.milestones.map(item => ({
      ...item,
      title: copyFor(locale, item.title, item.titleEn),
      body: copyFor(locale, item.body, item.bodyEn),
    })),
  };
}

export function ArtistJourneySection({
  journey,
  locale = "id",
}: Pick<ArtistEditorialSectionsProps, "journey" | "locale">) {
  const ref = useScrollReveal<HTMLElement>();
  const source = journey?.milestones?.length ? journey : journeyFallback(locale);
  const title = locale === "en" ? source.titleEn || "MUSIC JOURNEY." : source.title || "PERJALANAN MUSIK.";
  const intro = copyFor(locale, source.intro || "", source.introEn);
  return (
    <section ref={ref} className="artist-editorial-section artist-journey-section reveal-target" data-artist-story-panel="journey" id={locale === "en" ? "artist-journey" : "perjalanan"}>
      <span className="artist-editorial-atmosphere" aria-hidden="true" />
      <SectionIndex number="03" label={locale === "en" ? "ARTIST JOURNEY" : "PERJALANAN ARTIS"} />
      <div className="artist-editorial-heading">
        <div>
          <p className="nf-page-eyebrow">{locale === "en" ? "ORIGIN / THROUGH-LINE" : "ASAL / GARIS BESAR"}</p>
          <h2>{title}</h2>
        </div>
        <p className="artist-editorial-intro">{intro}</p>
      </div>
      <div className="artist-journey-grid">
        <div className="artist-journey-aside">
          {source.imageUrl ? <div className="artist-journey-image"><ResilientArtworkImage src={source.imageUrl} backupSrc={officialBrand.socialPreview} alt={locale === "en" ? "Artist journey visual" : "Visual perjalanan artistik"} /></div> : <div className="artist-journey-signal" aria-hidden="true"><span /><span /><span /></div>}
          <p>{locale === "en" ? "A living archive of the sound behind the name." : "Arsip hidup tentang suara di balik nama."}</p>
          <span><MapPin size={13} /> {verifiedArtistProfile.location}</span>
        </div>
        <div className="artist-journey-timeline">
          {source.milestones.map((item, index) => (
            <article key={`${item.year}-${item.title}`} style={{ "--editorial-delay": `${index * 90}ms` } as CSSProperties}>
              <span className="artist-journey-year">{item.year}</span>
              <div>
                <h3>{copyFor(locale, item.title, item.titleEn)}</h3>
                <p>{copyFor(locale, item.body, item.bodyEn)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ArtistPhotoStorySection({
  photoStories,
  locale = "id",
}: Pick<ArtistEditorialSectionsProps, "photoStories" | "locale">) {
  const ref = useScrollReveal<HTMLElement>();
  const stories = (photoStories?.length ? photoStories : publicPhotoStories(null)).slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(stories.length - 1, 0));
  const activeStory = stories[safeIndex];
  const moveStory = (direction: number) => {
    if (stories.length < 2) return;
    setActiveIndex(index => (index + direction + stories.length) % stories.length);
  };
  const storyTitle = activeStory
    ? locale === "en"
      ? activeStory.titleEn || activeStory.title
      : activeStory.title
    : "";
  const storyCopy = activeStory ? copyFor(locale, activeStory.copyId || "", activeStory.copyEn) : "";
  const storyAlt = activeStory
    ? copyFor(locale, activeStory.altId || storyTitle, activeStory.altEn)
    : "";
  return (
    <section ref={ref} className="artist-editorial-section artist-photo-story-section reveal-target" data-artist-story-panel="photo" id={locale === "en" ? "visual-story" : "cerita-visual"}>
      <span className="artist-editorial-atmosphere" aria-hidden="true" />
      <SectionIndex number="04" label={locale === "en" ? "PORTRAIT ARCHIVE" : "ARSIP POTRET"} />
      <div className="artist-editorial-heading artist-photo-story-heading">
        <div>
          <p className="nf-page-eyebrow">{locale === "en" ? "VISUAL STUDIES" : "STUDI VISUAL"}</p>
          <h2>
            {locale === "en" ? (
              <>
                PORTRAIT
                <br />
                <em>STUDIES.</em>
              </>
            ) : (
              <>
                STUDI
                <br />
                <em>POTRET.</em>
              </>
            )}
          </h2>
        </div>
        <p className="artist-editorial-intro">{locale === "en" ? "Portrait studies and visual notes from the world of Akbar Nawasunda." : "Studi potret dan catatan visual dari dunia Akbar Nawasunda."}</p>
      </div>
      {activeStory ? (
        <div
          className="artist-photo-story-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label={locale === "en" ? "Portrait studies" : "Studi potret"}
        >
          <div
            className="artist-photo-story-stage"
            tabIndex={0}
            onKeyDown={event => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveStory(-1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                moveStory(1);
              }
            }}
          >
            <div className="artist-photo-story-image">
              <ResilientArtworkImage src={activeStory.imageUrl} backupSrc={officialBrand.socialPreview} alt={storyAlt} />
              <span className="artist-photo-story-index">{String(safeIndex + 1).padStart(2, "0")}</span>
              <span className="artist-photo-story-scan" aria-hidden="true" />
            </div>
            <div className="artist-photo-story-copy" aria-live="polite">
              <span>{activeStory.label || (locale === "en" ? "PHOTO STUDY" : "STUDI FOTO")}</span>
              <h3>{storyTitle}</h3>
              {storyCopy ? <p>{storyCopy}</p> : null}
              {activeStory.href ? (
                <a href={activeStory.href} target="_blank" rel="noreferrer">
                  {locale === "en" ? "OPEN STORY" : "BUKA CERITA"} <ArrowUpRight size={14} />
                </a>
              ) : null}
            </div>
          </div>
          <div className="artist-photo-story-controls">
            <div className="artist-photo-story-counter" aria-live="polite">
              <span>{String(safeIndex + 1).padStart(2, "0")}</span>
              <i aria-hidden="true" />
              <span>{String(stories.length).padStart(2, "0")}</span>
            </div>
            <div className="artist-photo-story-arrows">
              <button type="button" onClick={() => moveStory(-1)} disabled={stories.length < 2} aria-label={locale === "en" ? "Previous portrait study" : "Studi potret sebelumnya"}>
                <ArrowLeft size={16} />
              </button>
              <button type="button" onClick={() => moveStory(1)} disabled={stories.length < 2} aria-label={locale === "en" ? "Next portrait study" : "Studi potret berikutnya"}>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="artist-photo-story-rail" role="tablist" aria-label={locale === "en" ? "Choose portrait study" : "Pilih studi potret"}>
            {stories.map((story, index) => {
              const title = locale === "en" ? story.titleEn || story.title : story.title;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={index === safeIndex}
                  aria-label={`${String(index + 1).padStart(2, "0")} — ${title}`}
                  className={index === safeIndex ? "is-active" : undefined}
                  onClick={() => setActiveIndex(index)}
                  key={story._id}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>{title}</b>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="artist-photo-story-footer">
        <Link className="nf-text-button" href={locale === "en" ? "/en/visuals" : "/visuals"}>{locale === "en" ? "VIEW FULL VISUAL ARCHIVE" : "LIHAT ARSIP VISUAL"} <ArrowUpRight size={15} /></Link>
      </div>
    </section>
  );
}

export function ArtistEditorialSections({
  journey,
  photoStories,
  locale = "id",
  showPhotoStory = true,
  showJourney = true,
}: ArtistEditorialSectionsProps) {
  return <>{showJourney ? <ArtistJourneySection journey={journey} locale={locale} /> : null}{showPhotoStory ? <ArtistPhotoStorySection photoStories={photoStories} locale={locale} /> : null}</>;
}
