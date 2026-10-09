import { ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "@/lib/navigation";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { OptimizedEditorialImage } from "@/components/OptimizedEditorialImage";
import { officialBrand } from "@/content/artistPlatform";
import "./NotFoundStage.css";

type Props = {
  /** Rute 404 berbahasa Inggris memakai chrome dan salinan EN. */
  locale?: "id" | "en";
};

/**
 * Halaman 404 resmi.
 *
 * Sebelumnya rute tak dikenal memuat `/legacy/404.html` lewat fetch di client:
 * HTML SSR-nya kosong, stylesheet legacy ikut menyuntik `body{cursor:none}`,
 * `overflow:hidden`, dan palet ungu yang tidak dipakai situs ini. Komposisi di
 * bawah memakai scene kit yang sama dengan halaman publik lain — satu kolom
 * salinan + satu plate potret resmi — sehingga 404 tetap terasa bagian situs.
 */
export default function NotFound({ locale = "id" }: Props) {
  const [location] = useLocation();
  const english = locale === "en";
  const home = english ? "/en" : "/";
  const music = english ? "/en/music" : "/music";
  const requested =
    (location.split(/[?#]/, 1)[0] || "/").replace(/\/+$/, "") || "/";

  const copy = english
    ? {
        kicker: "ERROR 404 · SIGNAL LOST",
        title: "This page is not on the frequency.",
        lede:
          "The address you requested is not part of this site. It may be mistyped, or the page has moved. Every official route stays open from the header and footer.",
        primary: "Back to home",
        secondary: "Listen to music",
        routeLabel: "Requested route",
        statusLabel: "Status",
        caption: "Akbar Nawasunda · Bandung Barat, Indonesia",
      }
    : {
        kicker: "ERROR 404 · SINYAL HILANG",
        title: "Halaman ini tidak ada di frekuensi.",
        lede:
          "Alamat yang diminta bukan bagian dari situs ini. Mungkin salah ketik, atau halaman sudah dipindahkan. Semua jalur resmi tetap terbuka dari header dan footer.",
        primary: "Kembali ke beranda",
        secondary: "Lihat musik",
        routeLabel: "Rute diminta",
        statusLabel: "Status",
        caption: "Akbar Nawasunda · Bandung Barat, Indonesia",
      };

  return (
    <div className={`nf-page an-notfound-page${english ? " en-page" : ""}`}>
      <NightHeader lang={locale} />
      <main id="main-content" tabIndex={-1}>
        <section className="an-page-hero">
          <div className="an-page-hero-copy">
            <p className="an-kicker">{copy.kicker}</p>
            <h1>{copy.title}</h1>
            <p className="an-lede">{copy.lede}</p>
            <div className="an-actions">
              <Link className="an-btn an-btn--solid" href={home}>
                {copy.primary} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <Link className="an-btn an-btn--quiet" href={music}>
                {copy.secondary}
              </Link>
            </div>
            <dl className="an-facts">
              <div>
                <dt>{copy.routeLabel}</dt>
                <dd>{requested}</dd>
              </div>
              <div>
                <dt>{copy.statusLabel}</dt>
                <dd>404</dd>
              </div>
            </dl>
          </div>
          <figure className="an-notfound-plate">
            <OptimizedEditorialImage
              src={officialBrand.portrait}
              backupSrc={officialBrand.portraitFallback}
              alt={
                english
                  ? "Official portrait of Akbar Nawasunda"
                  : "Potret resmi Akbar Nawasunda"
              }
              width={1122}
              height={1402}
              sizes="(max-width: 1023.98px) 100vw, 46vw"
              objectFit="cover"
            />
              <figcaption>{copy.caption}</figcaption>
              <img
                className="an-notfound-mascot"
                src="/assets/akbar-mascot-doodle.webp"
                alt=""
                aria-hidden="true"
                width={72}
                height={72}
                loading="lazy"
                decoding="async"
              />
            </figure>
        </section>
      </main>
      <NightFooter lang={locale} />
    </div>
  );
}
