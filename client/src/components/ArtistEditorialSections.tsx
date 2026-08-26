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

function journeyForLocale(journey: CmsJourney | undefined, locale: Locale) {
  const source = journey?.milestones?.length ? journey : publicJourney(null);
  return {
    ...source,
    title: locale === "en" ? source.titleEn || "MUSIC JOURNEY." : source.title || "PERJALANAN MUSIK.",
    intro: copyFor(locale, source.intro || "", source.introEn),
    milestones: source.milestones.map(item => ({
      ...item,
      title: copyFor(locale, item.title, item.titleEn),
      body: copyFor(locale, item.body, item.bodyEn),
    })),
  };
}

function storyForLocale(story: CmsPhotoStory, locale: Locale) {
  return {
    ...story,
    title: locale === "en" ? story.titleEn || story.title : story.title,
    copy: copyFor(locale, story.copyId || "", story.copyEn),
    alt: copyFor(locale, story.altId || story.title, story.altEn),
  };
}

export function ArtistJourneySection({
  journey,
  locale = "id",
}: Pick<ArtistEditorialSectionsProps, "journey" | "locale">) {
  const ref = useScrollReveal<HTMLElement>();
  const source = journeyForLocale(journey, locale);
  const title = source.title;
  return (
    <section ref={ref} className="artist-editorial-section artist-journey-section reveal-target" id={locale === "en" ? "artist-journey" : "perjalanan"}>
      <SectionIndex number="03" label={locale === "en" ? "ARTIST JOURNEY" : "PERJALANAN ARTIS"} />
      <div className="artist-editorial-heading">
        <div>
          <p className="nf-page-eyebrow">{locale === "en" ? "ORIGIN / THROUGH-LINE" : "ASAL / GARIS BESAR"}</p>
          <h2>{title}</h2>
        </div>
        <p className="artist-editorial-intro">{source.intro}</p>
      </div>
      <div className="artist-journey-grid">
        <div className="artist-journey-aside">
          {source.imageUrl ? <div className="artist-journey-image"><ResilientArtworkImage src={source.imageUrl} backupSrc={officialBrand.portrait} alt={locale === "en" ? "Artist journey visual" : "Visual perjalanan artistik"} /></div> : <div className="artist-journey-signal" aria-hidden="true"><span /><span /><span /></div>}
          <p>{locale === "en" ? "A living archive of the sound behind the name." : "Arsip hidup tentang suara di balik nama."}</p>
          <span><MapPin size={13} /> {verifiedArtistProfile.location}</span>
        </div>
        <div className="artist-journey-timeline">
          {source.milestones.map((item, index) => (
            <article key={`${item.year}-${item.title}`} style={{ "--editorial-delay": `${index * 90}ms` } as CSSProperties}>
              <span className="artist-journey-year">{item.year}</span>
              <div><h3>{item.title}</h3><p>{item.body}</p></div>
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
  const stories = (photoStories?.length ? photoStories : publicPhotoStories(null)).map(story => storyForLocale(story, locale));
  return (
    <section ref={ref} className="artist-editorial-section artist-photo-story-section reveal-target" id={locale === "en" ? "visual-story" : "cerita-visual"}>
      <SectionIndex number="04" label={locale === "en" ? "PHOTO STORY" : "CERITA VISUAL"} />
      <div className="artist-editorial-heading artist-photo-story-heading">
        <div>
          <p className="nf-page-eyebrow">{locale === "en" ? "VISUAL ARCHIVE / PHOTO STORY" : "ARSIP VISUAL / CERITA FOTO"}</p>
          <h2>{locale === "en" ? <>NOTES<br /><em>BEHIND THE SIGNAL.</em></> : <>CATATAN<br /><em>DI BALIK SIGNAL.</em></>}</h2>
        </div>
        <p className="artist-editorial-intro">{locale === "en" ? "Portrait studies and visual notes from the world of Akbar Nawasunda." : "Studi potret dan catatan visual dari dunia Akbar Nawasunda."}</p>
      </div>
      <div className="artist-photo-story-grid">
        {stories.slice(0, 6).map((story, index) => {
          const content = <><div className="artist-photo-story-image"><ResilientArtworkImage src={story.imageUrl} backupSrc={officialBrand.socialPreview} alt={story.alt} /><span className="artist-photo-story-index">{String(index + 1).padStart(2, "0")}</span></div><div className="artist-photo-story-copy"><span>{story.label || (locale === "en" ? "PHOTO STUDY" : "STUDI FOTO")}</span><h3>{story.title}</h3>{story.copy ? <p>{story.copy}</p> : null}{story.href ? <b>{locale === "en" ? "OPEN STORY" : "BUKA CERITA"} <ArrowUpRight size={14} /></b> : null}</div></>;
          return story.href ? <a className="artist-photo-story-card" href={story.href} target="_blank" rel="noreferrer" key={story._id}>{content}</a> : <article className="artist-photo-story-card" key={story._id}>{content}</article>;
        })}
      </div>
      <div className="artist-photo-story-footer"><Link className="nf-text-button" href={locale === "en" ? "/en/visuals" : "/visuals"}>{locale === "en" ? "VIEW FULL VISUAL ARCHIVE" : "LIHAT ARSIP VISUAL"} <ArrowUpRight size={15} /></Link></div>
    </section>
  );
}

export function ArtistCombinedStorySection({
  journey,
  photoStories,
  locale = "id",
}: Pick<ArtistEditorialSectionsProps, "journey" | "photoStories" | "locale">) {
  const ref = useScrollReveal<HTMLElement>();
  const source = journeyForLocale(journey, locale);
  const stories = (photoStories?.length ? photoStories : publicPhotoStories(null)).map(story => storyForLocale(story, locale));
  const portrait = source.imageUrl || officialBrand.portrait;
  const portraitAlt = source.imageUrl ? (locale === "en" ? "Artist journey portrait" : "Potret perjalanan artistik") : (locale === "en" ? "Portrait of Akbar Nawasunda" : "Potret Akbar Nawasunda");
  const stripStories = stories.length > 1 ? stories.slice(1, 3) : stories.slice(0, 1);
  return (
    <section ref={ref} className="artist-editorial-section artist-combined-story-section reveal-target" id={locale === "en" ? "artist-story" : "cerita-artis"}>
      <SectionIndex number="03" label={locale === "en" ? "ARTIST STORY" : "CERITA ARTIS"} />
      <div className="artist-combined-story-heading">
        <div><p className="nf-page-eyebrow">{locale === "en" ? "ORIGIN / VISUAL SIGNAL" : "ASAL / SIGNAL VISUAL"}</p><h2>{locale === "en" ? <>THE SOUND<br /><em>BEHIND THE NAME.</em></> : <>SUARA DI BALIK<br /><em>NAMA.</em></>}</h2></div>
        <p>{source.intro}</p>
      </div>
      <div className="artist-combined-story-layout">
        <figure className="artist-combined-story-portrait"><ResilientArtworkImage src={portrait} backupSrc={officialBrand.portrait} alt={portraitAlt} /><figcaption><span>{locale === "en" ? "PORTRAIT / AKBAR NAWASUNDA" : "POTRET / AKBAR NAWASUNDA"}</span><strong>{verifiedArtistProfile.location}</strong></figcaption></figure>
        <div className="artist-combined-story-timeline"><div className="artist-combined-story-copy"><p className="nf-page-eyebrow">{locale === "en" ? "A LIVING ARCHIVE" : "ARSIP YANG BERGERAK"}</p><p>{source.intro}</p></div>{source.milestones.map((item, index) => <article key={`${item.year}-${item.title}`} style={{ "--editorial-delay": `${index * 90}ms` } as CSSProperties}><span>{item.year}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div>
      </div>
      <div className="artist-combined-story-photo-strip" aria-label={locale === "en" ? "Selected photo story" : "Cerita foto pilihan"}>
        {stripStories.map((story, index) => <article key={story._id} className="artist-combined-story-photo-card"><div><ResilientArtworkImage src={story.imageUrl} backupSrc={officialBrand.socialPreview} alt={story.alt} /><span>{String(index + 1).padStart(2, "0")} / {story.label || (locale === "en" ? "PHOTO STUDY" : "STUDI FOTO")}</span></div><h3>{story.title}</h3>{story.copy ? <p>{story.copy}</p> : null}</article>)}
      </div>
      <div className="artist-combined-story-footer"><Link className="nf-text-button" href={locale === "en" ? "/en/visuals" : "/visuals"}>{locale === "en" ? "FOLLOW THE VISUAL ARCHIVE" : "LANJUT KE ARSIP VISUAL"} <ArrowUpRight size={15} /></Link></div>
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
  if (showJourney && showPhotoStory) return <ArtistCombinedStorySection journey={journey} photoStories={photoStories} locale={locale} />;
  return <>{showJourney ? <ArtistJourneySection journey={journey} locale={locale} /> : null}{showPhotoStory ? <ArtistPhotoStorySection photoStories={photoStories} locale={locale} /> : null}</>;
}
