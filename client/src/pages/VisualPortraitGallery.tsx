import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { EnglishFooter, EnglishHeader } from "@/components/EnglishChrome";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand } from "@/content/artistPlatform";
import { trpc } from "@/lib/trpc";
import { publicPortraitStudies, usePublicArtistContent } from "@/content/publicContent";
import { OptimizedEditorialImage } from "@/components/OptimizedEditorialImage";
import { useLightbox, type LightboxItem } from "@/components/signature/LightboxProvider";
import "./EcosystemPages.css";
import "./VisualPortraitGallery.css";
import "./PortraitStage.css";

type VisualPortraitGalleryProps = {
  english?: boolean;
};

function galleryVisitorKey() {
  if (typeof window === "undefined") return null;
  const storageKey = "an_portrait_gallery_visitor";
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) return existing;
    const generated = typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID().replace(/-/g, "")
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    const visitorKey = generated.slice(0, 96);
    window.localStorage.setItem(storageKey, visitorKey);
    return visitorKey;
  } catch {
    return null;
  }
}

function GalleryContent({ english = false }: VisualPortraitGalleryProps) {
  const cms = usePublicArtistContent();
  const recordVisit = trpc.analytics.recordGalleryVisit.useMutation();
  useEffect(() => {
    const visitorKey = galleryVisitorKey();
    if (!visitorKey) return;
    recordVisit.mutate({ gallery: "portrait-gallery", visitorKey });
  }, []);
  const studies = publicPortraitStudies(cms.data);
  const lightbox = useLightbox();

  /** Susun item lightbox untuk satu daftar studi. */
  const lightboxFor = (items: typeof studies): LightboxItem[] =>
    items.map(study => {
      const title = english ? study.titleEn || study.title : study.title;
      return {
        id: study._id,
        src: study.imageUrl || officialBrand.socialPreview,
        alt: english
          ? study.altEn || study.altId || title
          : study.altId || study.altEn || title,
        caption: title,
        meta: study.label || (english ? "PORTRAIT STUDY" : "STUDI POTRET"),
      };
    });

  /* Foto yang sudah tampil besar di hero tidak diulang di grid: satu potret
     cukup sekali per halaman. Kalau CMS hanya punya satu studi, grid tetap
     menampilkannya supaya halaman tidak kosong. */
  const duplicateOfLead: string | undefined = studies[0]?.imageUrl;
  const deduped = studies.filter(study => study.imageUrl !== duplicateOfLead);
  const gridStudies = deduped.length ? deduped : studies;
  const gridLightboxItems: LightboxItem[] = lightboxFor(gridStudies);
  const lead = studies[0];
  const leadTitle: string = lead
    ? ((english ? lead.titleEn || lead.title : lead.title || lead.titleEn) ??
      (english ? "Portrait study" : "Studi potret"))
    : english
      ? "Official portrait"
      : "Potret resmi";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={english ? "en-content" : undefined}
    >
      {/* Pembuka studio potret: satu frame memegang halaman, tipografinya
          jadi keterangan — bukan judul besar di atas latar berpola. */}
      <section className="an-pg-hero" aria-labelledby="portrait-title">
        <div className="an-pg-hero-copy">
          <p className="an-kicker">
            <span className="an-kicker-dot" aria-hidden="true" />
            {english ? "PHOTO STUDIES" : "STUDI POTRET"}
          </p>
          <h1 id="portrait-title">
            {english ? "Portraits." : "Potret."}
          </h1>
          <p className="an-pg-lede">
            {english
              ? "A still-image archive from the Akbar Nawasunda visual language."
              : "Arsip foto dari bahasa visual Akbar Nawasunda."}
          </p>
          <dl className="an-facts">
            <div>
              <dt>{english ? "Studies" : "Studi"}</dt>
              <dd>
                {cms.isLoading
                  ? "—"
                  : String(studies.length).padStart(2, "0")}
              </dd>
            </div>
            <div>
              <dt>{english ? "Source" : "Sumber"}</dt>
              <dd>{english ? "Official archive" : "Arsip resmi"}</dd>
            </div>
            <div>
              <dt>{english ? "Viewer" : "Penampil"}</dt>
              <dd>{english ? "In-site lightbox" : "Lightbox di situs"}</dd>
            </div>
          </dl>
          <div className="an-pg-hero-actions">
            <Link
              className="an-btn an-btn--quiet"
              href={english ? "/en/visuals" : "/visuals"}
            >
              <ArrowLeft size={13} aria-hidden="true" />{" "}
              {english ? "Back to visuals" : "Kembali ke visual"}
            </Link>
          </div>
        </div>
        <figure className="an-pg-hero-plate">
          <OptimizedEditorialImage
            src={lead?.imageUrl || officialBrand.socialPreview}
            backupSrc={officialBrand.socialPreview}
            alt={
              lead
                ? (english
                    ? lead.altEn || lead.altId
                    : lead.altId || lead.altEn) ?? leadTitle
                : english
                  ? "Official portrait of Akbar Nawasunda"
                  : "Potret resmi Akbar Nawasunda"
            }
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
          <figcaption>
            <span>01</span>
            <strong>{leadTitle}</strong>
          </figcaption>
        </figure>
      </section>

      <section className="an-section an-pg-index" aria-labelledby="portrait-index-title">
        <header className="an-head an-head--row">
          <div>
            <p className="an-meta">
              {english ? "Frame by frame" : "Frame demi frame"}
            </p>
            <h2 id="portrait-index-title" className="an-title">
              {english ? "See the detail." : "Lihat detailnya."}
            </h2>
          </div>
          <p className="an-pg-note">
            {english
              ? "Each frame is presented as a study, not a product gallery. The image stays inside the site while the story remains close to the work."
              : "Setiap frame ditampilkan sebagai studi, bukan etalase produk. Fotonya tetap berada di dalam pengalaman website, sementara ceritanya tetap dekat dengan karya."}
          </p>
        </header>
        <div className="portrait-gallery-grid an-pg-grid">
          {gridStudies.map((study, index) => {
            const title =
              (english ? study.titleEn || study.title : study.title || study.titleEn) ??
              (english ? "Portrait study" : "Studi potret");
            const copy = english ? study.copyEn || study.copyId : study.copyId || study.copyEn;
            const alt = english ? study.altEn || study.altId || title : study.altId || study.altEn || title;
            return (
              <article className={`portrait-gallery-card ${index === 0 ? "portrait-gallery-card-featured" : ""}`} id={study._id} key={study._id}>
                <div className="portrait-gallery-image-wrap">
                  <button
                    type="button"
                    className="portrait-gallery-trigger"
                    onClick={() => lightbox.open(gridLightboxItems, index)}
                    aria-label={english ? `Open ${title} in the image viewer` : `Buka ${title} di penampil gambar`}
                    data-signal-interactive
                  >
                    <OptimizedEditorialImage
                      src={study.imageUrl || officialBrand.socialPreview}
                      backupSrc={officialBrand.socialPreview}
                      alt={alt}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                    />
                  </button>
                  <span className="portrait-gallery-index">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="portrait-gallery-card-copy">
                  <div>
                    <p className="nf-page-eyebrow">{study.label || (english ? "PORTRAIT STUDY" : "STUDI POTRET")}</p>
                    <h3>{title}</h3>
                  </div>
                  <p>{copy || (english ? "A selected still from the visual archive." : "Satu frame terpilih dari arsip visual.")}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="an-section an-pg-close" aria-labelledby="portrait-close-title">
        <div>
          <p className="an-meta">{english ? "Next" : "Lanjut"}</p>
          <h2 id="portrait-close-title" className="an-title">
            {english ? "Move through the archive." : "Lanjut ke arsipnya."}
          </h2>
        </div>
        <div className="an-pg-close-actions">
          <Link className="an-btn an-btn--solid" href={english ? "/en/visuals" : "/visuals"}>
            {english ? "View videos" : "Lihat video"}{" "}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <Link className="an-btn an-btn--quiet" href={english ? "/en" : "/"}>
            {english ? "Return home" : "Kembali ke home"}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function VisualPortraitGallery() {
  return <div className="nf-page"><NightHeader active="/visuals" /><GalleryContent /><NightFooter /></div>;
}

export function EnglishVisualPortraitGallery() {
  return <div className="nf-page en-page an-site"><EnglishHeader /><GalleryContent english /><EnglishFooter /></div>;
}
