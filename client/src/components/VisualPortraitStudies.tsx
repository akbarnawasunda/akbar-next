import { ArrowUpRight } from "lucide-react";
import { portraitStudies } from "@/content/artistPlatform";
import "./VisualPortraitStudies.css";

type VisualPortraitStudiesProps = {
  english?: boolean;
};

export default function VisualPortraitStudies({ english = false }: VisualPortraitStudiesProps) {
  return (
    <section className="nf-section an-portrait-studies" aria-labelledby={english ? "portrait-studies-title-en" : "portrait-studies-title-id"}>
      <div className="an-portrait-studies-heading">
        <div>
          <p className="nf-page-eyebrow">{english ? "PORTRAIT STUDIES" : "STUDI POTRET"}</p>
          <h2 id={english ? "portrait-studies-title-en" : "portrait-studies-title-id"}>
            {english ? <>BEHIND<br /><em>THE FRAME.</em></> : <>DI BALIK<br /><em>FRAME.</em></>}
          </h2>
        </div>
        <div className="an-portrait-studies-note">
          <span>{english ? "UNRELEASED VISUAL STUDIES" : "STUDI VISUAL · BELUM DIRILIS"}</span>
          <strong>02 / 02</strong>
        </div>
      </div>
      <div className="an-portrait-studies-grid">
        {portraitStudies.map((study, index) => (
          <figure className={`an-portrait-study an-portrait-study-${index + 1}`} key={study.id}>
            <div className="an-portrait-study-image">
              <img
                src={study.src}
                alt={english ? study.altEn : study.altId}
                loading="lazy"
                decoding="async"
                width={study.width}
                height={study.height}
              />
              <span className="an-portrait-study-index">0{index + 1}</span>
            </div>
            <figcaption>
              <span>{english ? "PORTRAIT STUDY" : "STUDI POTRET"} / 0{index + 1}</span>
              <strong>{english ? study.titleEn : study.titleId}</strong>
              <p>{english ? study.copyEn : study.copyId}</p>
              <a className="nf-text-button" href={study.src} target="_blank" rel="noreferrer">
                {english ? "OPEN IMAGE" : "BUKA FOTO"} <ArrowUpRight size={13} />
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
