import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { EnglishFooter, EnglishHeader } from "@/components/EnglishChrome";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand } from "@/content/artistPlatform";
import { trpc } from "@/lib/trpc";
import { publicPortraitStudies, usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./VisualPortraitGallery.css";

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
  return (
    <main className={english ? "en-content" : undefined}>
      <section className="nf-page-hero portrait-gallery-hero">
        <div>
          <p className="nf-page-eyebrow">{english ? "VISUALS / PORTRAIT STUDIES" : "VISUAL / STUDI POTRET"}</p>
          <h1>{english ? <>PHOTO<br /><em>STUDIES.</em></> : <>STUDI<br /><em>POTRET.</em></>}</h1>
          <p>{english ? "A still-image archive from the Akbar Nawasunda visual language." : "Arsip foto dari bahasa visual Akbar Nawasunda."}</p>
        </div>
        <div className="nf-hero-note">
          <span>{cms.isLoading ? (english ? "LOADING STUDIES" : "MEMUAT STUDI") : (english ? "SELECTED FRAMES" : "FRAME TERPILIH")}</span>
          <strong>{String(studies.length).padStart(2, "0")} PORTRAITS</strong>
          <Link className="nf-text-button" href={english ? "/en/visuals" : "/visuals"}>
            <ArrowLeft size={13} /> {english ? "BACK TO VISUALS" : "KEMBALI KE VISUALS"}
          </Link>
        </div>
      </section>
      <section className="nf-section portrait-gallery-intro">
        <div className="nf-section-title">
          <div>
            <p className="nf-page-eyebrow">{english ? "THE STILL FRAME" : "FRAME YANG DITAHAN"}</p>
            <h2>{english ? <>SEE THE<br /><em>DETAIL.</em></> : <>LIHAT<br /><em>DETAILNYA.</em></>}</h2>
          </div>
          <p>{english ? "Each frame is presented as a study, not a product gallery. The image stays inside the site while the story remains close to the work." : "Setiap frame ditampilkan sebagai studi, bukan etalase produk. Fotonya tetap berada di dalam pengalaman website, sementara ceritanya tetap dekat dengan karya."}</p>
        </div>
        <div className="portrait-gallery-grid">
          {studies.map((study, index) => {
            const title = english ? study.titleEn || study.title : study.title;
            const copy = english ? study.copyEn || study.copyId : study.copyId || study.copyEn;
            const alt = english ? study.altEn || study.altId || title : study.altId || study.altEn || title;
            return (
              <article className={`portrait-gallery-card ${index === 0 ? "portrait-gallery-card-featured" : ""}`} id={study._id} key={study._id}>
                <div className="portrait-gallery-image-wrap">
                  <img src={study.imageUrl || officialBrand.socialPreview} alt={alt} loading={index < 2 ? "eager" : "lazy"} decoding="async" />
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
      <section className="nf-section dark-panel portrait-gallery-close">
        <div>
          <p className="nf-page-eyebrow">{english ? "KEEP EXPLORING" : "LANJUT MENJELAJAH"}</p>
          <h2>{english ? <>MOVE THROUGH<br /><em>THE ARCHIVE.</em></> : <>LANJUT KE<br /><em>ARSIPNYA.</em></>}</h2>
        </div>
        <div className="portrait-gallery-close-actions">
          <Link className="nf-button" href={english ? "/en/visuals" : "/visuals"}>{english ? "VIEW VIDEOS" : "LIHAT VIDEO"} <ArrowUpRight size={15} /></Link>
          <Link className="nf-text-button" href={english ? "/en" : "/"}>{english ? "RETURN HOME" : "KEMBALI KE HOME"}</Link>
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
