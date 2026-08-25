import { ArrowUpRight } from "lucide-react";
import type { CmsPortraitStudy } from "@/content/publicContent";
import { publicPortraitStudies } from "@/content/publicContent";
import "./VisualPortraitStudies.css";

type VisualPortraitStudiesProps = {
  english?: boolean;
  studies?: CmsPortraitStudy[];
};

export default function VisualPortraitStudies({ english = false, studies = publicPortraitStudies(null) }: VisualPortraitStudiesProps) {
  const study = studies[1] || studies[0];
  const galleryRoute = english ? "/en/visuals/portraits" : "/visuals/portraits";
  if (!study) return null;
  const localizedTitle = english ? study.titleEn || study.title : study.title;

  return (
    <section
      className="nf-section an-portrait-studies"
      aria-labelledby={english ? "portrait-studies-title-en" : "portrait-studies-title-id"}
      style={{ "--portrait-study-image": `url(${study.imageUrl})` } as React.CSSProperties}
    >
      <div className="an-portrait-studies-art" aria-hidden="true" />
      <div className="an-portrait-studies-heading">
        <div>
          <p className="nf-page-eyebrow">{english ? "PORTRAIT STUDIES" : "STUDI POTRET"}</p>
          <h2 id={english ? "portrait-studies-title-en" : "portrait-studies-title-id"}>
            {english ? <>BEHIND<br /><em>THE FRAME.</em></> : <>DI BALIK<br /><em>FRAME.</em></>}
          </h2>
        </div>
        <div className="an-portrait-studies-note">
          <span>{english ? "UNRELEASED VISUAL STUDY" : "STUDI VISUAL · BELUM DIRILIS"}</span>
          <strong>01 / 02</strong>
        </div>
      </div>
      <div className="an-portrait-studies-surface">
        <div className="an-portrait-studies-copy">
          <span className="an-portrait-study-kicker">{english ? "PORTRAIT STUDY / KX-07" : "STUDI POTRET / KX-07"}</span>
          <strong>{localizedTitle}</strong>
          <p>{english ? study.copyEn || study.copyId : study.copyId || study.copyEn}</p>
          <a className="nf-text-button" href={`${galleryRoute}#${study._id}`}>
            {english ? "VIEW PHOTO STUDY" : "LIHAT STUDI FOTO"} <ArrowUpRight size={13} />
          </a>
        </div>
        <span className="an-portrait-study-index" aria-hidden="true">02</span>
      </div>
      <div className="an-portrait-study-indexes" aria-label={english ? "Portrait study images" : "Daftar foto studi potret"}>
        {studies.map((item, index) => (
          <a className="an-portrait-study-index-link" href={`${galleryRoute}#${item._id}`} key={item._id}>
            <span>0{index + 1}</span>
            <div>
              <small>{item.label || (english ? "PORTRAIT STUDY" : "STUDI POTRET")}</small>
              <strong>{english ? item.titleEn || item.title : item.title}</strong>
            </div>
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
    </section>
  );
}
