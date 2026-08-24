import { ArrowUpRight } from "lucide-react";
import { portraitStudies } from "@/content/artistPlatform";
import "./VisualPortraitStudies.css";

type VisualPortraitStudiesProps = {
  english?: boolean;
};

export default function VisualPortraitStudies({ english = false }: VisualPortraitStudiesProps) {
  const study = portraitStudies[1];

  return (
    <section
      className="nf-section an-portrait-studies"
      aria-labelledby={english ? "portrait-studies-title-en" : "portrait-studies-title-id"}
      style={{ "--portrait-study-image": `url(${study.src})` } as React.CSSProperties}
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
          <strong>{english ? study.titleEn : study.titleId}</strong>
          <p>{english ? study.copyEn : study.copyId}</p>
          <a className="nf-text-button" href={study.src} target="_blank" rel="noreferrer">
            {english ? "OPEN IMAGE" : "BUKA FOTO"} <ArrowUpRight size={13} />
          </a>
        </div>
        <span className="an-portrait-study-index" aria-hidden="true">02</span>
      </div>
      <div className="an-portrait-study-indexes" aria-label={english ? "Portrait study images" : "Daftar foto studi potret"}>
        {portraitStudies.map((item, index) => (
          <a className="an-portrait-study-index-link" href={item.src} target="_blank" rel="noreferrer" key={item.id}>
            <span>0{index + 1}</span>
            <div>
              <small>{english ? "PORTRAIT STUDY" : "STUDI POTRET"}</small>
              <strong>{english ? item.titleEn : item.titleId}</strong>
            </div>
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
    </section>
  );
}
