import { ArrowUpRight, MapPin } from "lucide-react";
import type { CSSProperties } from "react";
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
  const stories = photoStories?.length ? photoStories : publicPhotoStories(null);
  return (
    <section ref={ref} className="artist-editorial-section artist-photo-story-section reveal-target" data-artist-story-panel="photo" id={locale === "en" ? "visual-story" : "cerita-visual"}>
      <SectionIndex number="04" label={locale === "en" ? "PHOTO STORY" : "CERITA VISUAL"} />
      <div className="artist-editorial-heading artist-photo-story-heading">
        <div>
          <p className="nf-page-eyebrow">{locale === "en" ? "VISUAL ARCHIVE / PHOTO STORY" : "ARSIP VISUAL / CERITA FOTO"}</p>
          <h2>{locale === "en" ? "THE NAME<br /><em>IN PORTRAIT.</em>" : "NAMA<br /><em>DALAM POTRET.</em>"}</h2>
        </div>
        <p className="artist-editorial-intro">{locale === "en" ? "Portrait studies and visual notes from the world of Akbar Nawasunda." : "Studi potret dan catatan visual dari dunia Akbar Nawasunda."}</p>
      </div>
      <div className="artist-photo-story-grid">
        {stories.slice(0, 6).map((story, index) => {
          const title = locale === "en" ? story.titleEn || story.title : story.title;
          const copy = copyFor(locale, story.copyId || "", story.copyEn);
          const alt = copyFor(locale, story.altId || title, story.altEn);
          const content = (
            <>
              <div className="artist-photo-story-image">
                <ResilientArtworkImage src={story.imageUrl} backupSrc={officialBrand.socialPreview} alt={alt} />
                <span className="artist-photo-story-index">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="artist-photo-story-copy">
                <span>{story.label || (locale === "en" ? "PHOTO STUDY" : "STUDI FOTO")}</span>
                <h3>{title}</h3>
                {copy ? <p>{copy}</p> : null}
                {story.href ? <b>{locale === "en" ? "OPEN STORY" : "BUKA CERITA"} <ArrowUpRight size={14} /></b> : null}
              </div>
            </>
          );
          return story.href ? <a className="artist-photo-story-card" href={story.href} target="_blank" rel="noreferrer" key={story._id}>{content}</a> : <article className="artist-photo-story-card" key={story._id}>{content}</article>;
        })}
      </div>
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
