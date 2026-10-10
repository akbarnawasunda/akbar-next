import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { verifiedArtistProfile } from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./Inquiry.css";
import "./LicensingStage.css";

type LicenseRoute = [title: string, copy: string];

const copy = {
  id: {
    kicker: "Penggunaan musik",
    title: "Lisensi musik.",
    lede:
      "Untuk konten, kampanye, edit, dan penggunaan lain yang butuh kejelasan hak pakai.",
    lead: verifiedArtistProfile.licensing,
    leadTitle: "Mulai dari permintaan, bukan asumsi.",
    routesTitle: "Jalur penggunaan.",
    routesCopy:
      "Pilih konteks yang paling dekat, lalu kirim detailnya lewat satu inquiry resmi.",
    routes: [
      [
        "Konten & sosial",
        "Gunakan jalur licensing bila karya akan dipakai di konten publik, kanal brand, atau distribusi dengan tujuan tertentu.",
      ],
      [
        "Event & performance",
        "Ajukan kebutuhan penggunaan rekaman, custom arrangement, atau format performance melalui inquiry agar konteks acaranya dapat ditinjau.",
      ],
      [
        "Komersial & brand",
        "Untuk penggunaan komersial, kampanye, atau sinkronisasi, jelaskan platform, wilayah, durasi, dan bentuk pemakaian yang direncanakan.",
      ],
    ] as LicenseRoute[],
    includeTitle: "Yang perlu disertakan.",
    includeCopy:
      "Semakin lengkap konteksnya, semakin cepat penawaran bisa disusun tanpa bolak-balik.",
    include: [
      "Judul karya dan versi yang dipakai.",
      "Nama proyek dan siapa yang menayangkan.",
      "Platform, wilayah, dan durasi pemakaian.",
      "Sifat penggunaan: komersial atau non-komersial.",
      "Perkiraan audiens dan tenggat produksi.",
      "Bentuk deliverable yang diharapkan.",
    ],
    ctaPrimary: "KIRIM DETAIL",
    mailSubject: "Music licensing inquiry",
    mailLabel: "Tanya lewat email",
  },
  en: {
    kicker: "Music usage",
    title: "Music licensing.",
    lede:
      "For content, campaigns, edits, and other uses that need a clear, direct conversation about rights.",
    lead: verifiedArtistProfile.licensing,
    leadTitle: "Start with a request, not an assumption.",
    routesTitle: "Routes of use.",
    routesCopy:
      "Pick the closest context and send the details through the official inquiry route.",
    routes: [
      [
        "Content use",
        "For social, editorial, branded, or platform content that needs a defined track and usage window.",
      ],
      [
        "Commercial use",
        "Commercial permissions, fees, exclusivity, and deliverables are discussed case by case.",
      ],
      [
        "Clearance first",
        "A request is an opening conversation, not automatic permission to use a recording.",
      ],
      [
        "Credit matters",
        "Non-commercial use with clear credit is appreciated, but still needs a confirmed route when rights are involved.",
      ],
    ] as LicenseRoute[],
    includeTitle: "What to include.",
    includeCopy:
      "The fuller the context, the faster a usage offer can be put together.",
    include: [
      "Track title and the version in use.",
      "Project name and who will publish it.",
      "Platform, territory, and usage window.",
      "Whether the use is commercial or non-commercial.",
      "Estimated audience and production deadline.",
      "The deliverables you expect.",
    ],
    ctaPrimary: "SEND DETAILS",
    mailSubject: "Music licensing inquiry",
    mailLabel: "Ask by email",
  },
} as const;

export function LicensingView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
  const cms = usePublicArtistContent();
  const bookingEmail =
    cms.data?.pressKit?.bookingEmail || verifiedArtistProfile.bookingEmail;
  const inquiryHref = (source: string) =>
    locale === "en"
      ? `/en/inquire?type=licensing&source=${source}`
      : `/inquire?type=licensing&source=${source}`;

  return (
    <main id="main-content" tabIndex={-1}>
      {/* Pembuka dokumen: judul, batas penggunaan yang sebenarnya, dan
          langkah pertama — semuanya terbaca sebelum gulir. */}
      <section className="an-page-hero" aria-labelledby="licensing-title">
        <div className="an-page-hero-copy">
          <p className="an-kicker">
            <span className="an-kicker-dot" aria-hidden="true" />
            {t.kicker}
          </p>
          <h1 id="licensing-title">{t.title}</h1>
          <p className="an-lede">{t.lede}</p>
          <div className="an-actions">
            <Link className="an-btn an-btn--solid" href={inquiryHref("licensing")}>
              {t.ctaPrimary} <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <a
              className="an-btn an-btn--quiet"
              href={`mailto:${bookingEmail}?subject=${encodeURIComponent(t.mailSubject)}`}
            >
              <Mail size={14} aria-hidden="true" /> {t.mailLabel}
            </a>
          </div>
        </div>
        <aside className="an-license-hero-plate">
          <p>{t.lead}</p>
          <strong>{t.leadTitle}</strong>
        </aside>
      </section>

      <section
        className="an-section an-license-routes"
        aria-labelledby="licensing-routes-title"
      >
        <div className="an-license-route-head">
          <p className="an-meta">
            {locale === "en" ? "Context" : "Konteks"}
          </p>
          <h2 id="licensing-routes-title" className="an-title">
            {t.routesTitle}
          </h2>
          <p>{t.routesCopy}</p>
        </div>
        <ul className="an-index an-license-route-list">
          {t.routes.map(([title, description], index) => (
            <li key={title}>
              <div className="an-index-row">
                <span className="an-meta">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="an-license-route-copy">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="an-section an-license-include"
        aria-labelledby="licensing-include-title"
      >
        <div className="an-license-include-copy">
          <p className="an-meta">
            {locale === "en" ? "Checklist" : "Daftar periksa"}
          </p>
          <h2 id="licensing-include-title" className="an-title">
            {t.includeTitle}
          </h2>
          <p>{t.includeCopy}</p>
        </div>
        <ul className="an-license-include-list">
          {t.include.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

    </main>
  );
}

export default function Licensing() {
  return (
    <div className="nf-page an-licensing-page">
      <NightHeader />
      <LicensingView locale="id" />
      <NightFooter />
    </div>
  );
}
