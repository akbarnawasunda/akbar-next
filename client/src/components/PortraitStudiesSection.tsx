import { useEffect } from "react";
import { officialBrand } from "@/content/artistPlatform";
import { OptimizedEditorialImage } from "@/components/OptimizedEditorialImage";
import { useLightbox, type LightboxItem } from "@/components/signature/LightboxProvider";
import {
  publicPortraitStudies,
  usePublicArtistContent,
} from "@/content/publicContent";
import { trpc } from "@/lib/trpc";
import "./PortraitStudiesSection.css";

type PortraitStudiesSectionProps = {
  english?: boolean;
};

/**
 * Seksi studi potret di dalam /visuals (anchor #portraits).
 *
 * Rute galeri lama (portraits) dihapus (Phase 3 §2 baris 5): pengalamannya —
 * lead frame, grid "frame demi frame", dan lightbox in-site — kini menjadi
 * seksi halaman dengan anchor #portraits. Registrasi warna memakai register
 * "darkroom" dari docs/phase4-design-system.md §3 (token --sepia-*), khusus
 * studi potret.
 *
 * Konten hanya dari data yang ada: judul, copy, dan alt teks studio potret
 * (CMS atau fallback resmi). Tidak ada tanggal, kredit, atau klaim rilis
 * yang ditambahkan — data tidak menyimpannya.
 */
const copy = {
  id: {
    eyebrow: "Frame demi frame",
    title: "Studi potret.",
    note:
      "Setiap frame ditampilkan sebagai studi, bukan etalase produk. Fotonya tetap berada di dalam situs, sementara ceritanya tetap dekat dengan karya.",
    label: "STUDI POTRET",
    fallbackTitle: "Studi potret",
    fallbackCopy: "Satu frame terpilih dari arsip visual.",
    leadAlt: "Potret resmi Akbar Nawasunda",
    openLabel: (title: string) => `Buka ${title} di penampil gambar`,
  },
  en: {
    eyebrow: "Frame by frame",
    title: "Portrait studies.",
    note:
      "Each frame is presented as a study, not a product gallery. The image stays inside the site while the story remains close to the work.",
    label: "PORTRAIT STUDY",
    fallbackTitle: "Portrait study",
    fallbackCopy: "A selected still from the visual archive.",
    leadAlt: "Official portrait of Akbar Nawasunda",
    openLabel: (title: string) => `Open ${title} in the image viewer`,
  },
} as const;

/**
 * Penanda pengunjung anonim pihak pertama (bukan pelacakan): kunci acak di
 * localStorage, dikirim sebagai hash — pola yang sama dengan galeri lama
 * (dijaga oleh server/galleryAnalytics.test.ts).
 */
function galleryVisitorKey(): string | null {
  if (typeof window === "undefined") return null;
  const storageKey = "an_portrait_gallery_visitor";
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) return existing;
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    const visitorKey = generated.slice(0, 96);
    window.localStorage.setItem(storageKey, visitorKey);
    return visitorKey;
  } catch {
    return null;
  }
}

export default function PortraitStudiesSection({
  english = false,
}: PortraitStudiesSectionProps) {
  const t = english ? copy.en : copy.id;
  const cms = usePublicArtistContent();
  const studies = publicPortraitStudies(cms.data);
  const lightbox = useLightbox();
  const recordVisit = trpc.analytics.recordGalleryVisit.useMutation();

  // Hook analitik galeri bertahan (Phase 3 §2 baris 4): sekali per kunjungan,
  // hanya ketika seksi benar-benar tampil (ada studi).
  useEffect(() => {
    if (!studies.length) return;
    const visitorKey = galleryVisitorKey();
    if (visitorKey) recordVisit.mutate({ gallery: "portrait-gallery", visitorKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Seksi kosong tidak dirender (Phase 3 §3 /visuals: MUST NOT empty state). */
  if (!studies.length) return null;

  const titleOf = (study: (typeof studies)[number]) =>
    (english ? study.titleEn || study.title : study.title || study.titleEn) ??
    t.fallbackTitle;
  const altOf = (study: (typeof studies)[number]) =>
    (english
      ? study.altEn || study.altId || titleOf(study)
      : study.altId || study.altEn || titleOf(study));
  const copyOf = (study: (typeof studies)[number]) =>
    (english
      ? study.copyEn || study.copyId
      : study.copyId || study.copyEn) ?? t.fallbackCopy;

  /* Lightbox memakai urutan studi utuh; lead = frame pertama. */
  const lightboxItems: LightboxItem[] = studies.map(study => ({
    id: study._id,
    src: study.imageUrl || officialBrand.socialPreview,
    alt: altOf(study),
    caption: titleOf(study),
    meta: study.label || t.label,
  }));

  const lead = studies[0];
  /* Foto lead tidak diulang di grid: satu potret cukup sekali per halaman.
     Kalau CMS hanya punya satu studi, grid tetap menampilkannya supaya
     seksi tidak kosong. */
  const deduped = studies.filter(study => study.imageUrl !== lead.imageUrl);
  const gridStudies = deduped.length ? deduped : studies;

  return (
    <section className="an-pg-section" id="portraits" aria-labelledby="portraits-title">
      <header className="an-pg-section-head">
        <p className="an-meta">{t.eyebrow}</p>
        <h2 id="portraits-title" className="an-title">
          {t.title}
        </h2>
        <p className="an-pg-note">{t.note}</p>
      </header>

      <div className="an-pg-layout">
        {/* Lead frame: satu potret memegang seksi, tipografinya jadi
            keterangan — indeksnya mengikuti posisi di lightbox. */}
        <figure className="an-pg-lead" id={lead._id}>
          <button
            type="button"
            className="an-pg-trigger"
            onClick={() => lightbox.open(lightboxItems, 0)}
            aria-label={t.openLabel(titleOf(lead))}
            data-signal-interactive
          >
            <OptimizedEditorialImage
              src={lead.imageUrl || officialBrand.socialPreview}
              backupSrc={officialBrand.socialPreview}
              alt={lead ? altOf(lead) : t.leadAlt}
              sizes="(max-width: 1024px) 100vw, 52vw"
            />
          </button>
          <figcaption>
            <span aria-hidden="true">01</span>
            <strong>{titleOf(lead)}</strong>
          </figcaption>
        </figure>

        {/* Grid studi: kartu asimetris, tiap frame = tombol lightbox. */}
        {gridStudies.length > 0 ? (
          <div className="an-pg-grid">
            {gridStudies.map(study => {
              const index = studies.findIndex(s => s._id === study._id);
              return (
                <article
                  className="an-pg-card"
                  id={study._id}
                  key={study._id}
                >
                  <div className="an-pg-card-frame">
                    <button
                      type="button"
                      className="an-pg-trigger"
                      onClick={() => lightbox.open(lightboxItems, index)}
                      aria-label={t.openLabel(titleOf(study))}
                      data-signal-interactive
                    >
                      <OptimizedEditorialImage
                        src={study.imageUrl || officialBrand.socialPreview}
                        backupSrc={officialBrand.socialPreview}
                        alt={altOf(study)}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
                      />
                    </button>
                    <span className="an-pg-card-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="an-pg-card-copy">
                    <p className="nf-page-eyebrow">{study.label || t.label}</p>
                    <h3>{titleOf(study)}</h3>
                    <p>{copyOf(study)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
