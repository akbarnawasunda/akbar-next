import {
  ArrowUpRight,
  CheckCircle2,
  Cookie,
  Database,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { verifiedArtistProfile } from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./PrivacyPolicy.css";

const collectionPoints = [
  {
    title: "Fan Signal",
    copy: "Jika kamu berlangganan, alamat email disimpan di database subscriber situs dan hanya digunakan untuk update rilisan, visual, dan live resmi. Kamu dapat meminta penghapusan kapan saja melalui email.",
    icon: Mail,
  },
  {
    title: "Contact / collab form",
    copy: "Nama, email, konteks project, dan pesan disimpan di database inquiry agar artis dapat meninjau serta merespons permintaan tersebut.",
    icon: Database,
  },
  {
    title: "Analytics",
    copy: "Gallery foto mencatat kunjungan secara agregat dengan penanda anonim browser. Sistem tidak menyimpan IP, email, atau user-agent dan tidak memakai cookie iklan.",
    icon: CheckCircle2,
  },
  {
    title: "Browser storage",
    copy: "Situs dapat menyimpan preferensi interface terbatas, data pendukung autentikasi, atau penanda anonim untuk menghitung akses gallery foto secara agregat. Data ini tidak digunakan untuk iklan.",
    icon: ShieldCheck,
  },
];

const thirdParties = [
  ["Vercel", "hosting & delivery"],
  ["Google Fonts", "typefaces"],
  ["First-party gallery counter", "anonymous aggregate access"],
  ["Site backend and database", "subscriber dan inquiry storage"],
  ["Spotify / YouTube / SoundCloud", "embedded players setelah klik"],
  ["Apple iTunes Search", "cover art dan 30s previews"],
];

const sections = [
  ["short-version", "Short version"],
  ["collection", "What we collect"],
  ["cookies", "Cookies & storage"],
  ["services", "Third-party services"],
  ["rights", "Your rights"],
];

export default function PrivacyPolicy() {
  const contactEmail = verifiedArtistProfile.bookingEmail;
  const cms = usePublicArtistContent();
  const legal = cms.data?.legal;
  const legalSection = (key: string) => legal?.sections?.find(section => section.key === key);
  const reviewedIntro = legal?.intro?.trim();
  const reviewedShortVersion = legalSection("short-version")?.body?.trim();
  const reviewedCollection = legalSection("collection")?.body?.trim();
  const reviewedCookies = legalSection("cookies")?.body?.trim();
  const reviewedServices = legalSection("services")?.body?.trim();
  const reviewedRights = legalSection("rights")?.body?.trim();

  return (
    <div className="nf-page an-privacy-page">
      <NightHeader />
      <main>
        <section className="an-privacy-hero">
          <div className="an-privacy-hero-copy">
            <p className="nf-page-eyebrow">AKBAR NAWASUNDA / DATA NOTE</p>
            <h1>PRIVACY<br />POLICY.</h1>
            <p>
              {reviewedIntro || "Penjelasan singkat dan terbuka tentang data yang diproses saat kamu memakai situs resmi Akbar Nawasunda."}
            </p>
          </div>
          <aside className="an-privacy-posture">
            <span className="an-privacy-posture-icon"><ShieldCheck size={19} /></span>
            <span className="an-privacy-posture-label">DATA POSTURE</span>
            <strong>LIGHT<br />BY DEFAULT.</strong>
            <p>Tidak ada iklan, tracking cookies, atau penjualan data. Gallery foto hanya mencatat hitungan agregat anonim.</p>
            <span className="an-privacy-updated">LAST UPDATED · {legal?.effectiveDate ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(legal.effectiveDate)).toUpperCase() : "14 AUG 2026"}</span>
          </aside>
        </section>

        <section className="nf-section an-privacy-reading">
          <aside className="an-privacy-index">
            <p className="nf-page-eyebrow">ON THIS PAGE</p>
            <nav aria-label="Privacy Policy sections">
              {sections.map(([id, label], index) => (
                <a href={`#${id}`} key={id}>
                  <span>0{index + 1}</span>{label}
                </a>
              ))}
            </nav>
            <a className="an-privacy-contact" href={`mailto:${contactEmail}`}>
              <Mail size={14} />
              ASK ABOUT YOUR DATA
            </a>
          </aside>

          <div className="an-privacy-content">
            <article className="an-privacy-block an-privacy-short" id="short-version">
              <p className="an-privacy-block-label">01 / THE SHORT VERSION</p>
              <h2>LIGHT ON<br />YOUR DATA.</h2>
              <blockquote>
                {reviewedShortVersion || "No advertising, no tracking cookies, no selling data — ever."}
              </blockquote>
              <p>
                {reviewedShortVersion ? "Bagian ini mencerminkan teks kebijakan yang sudah ditinjau dan dipublish dari Legal Document." : "Situs ini dibuat seringan mungkin terhadap data kamu. Bagian di bawah adalah daftar lengkap dan jujur tentang apa yang terjadi saat kamu menggunakan situs ini."}
              </p>
            </article>

            <article className="an-privacy-block" id="collection">
              <p className="an-privacy-block-label">02 / WHAT WE COLLECT</p>
              <h2>WHAT ENTERS<br />THE SYSTEM.</h2>
              {reviewedCollection && <p>{reviewedCollection}</p>}
              <div className="an-privacy-collection-grid">
                {collectionPoints.map(({ title, copy, icon: Icon }, index) => (
                  <div className="an-privacy-collection-card" key={title}>
                    <div className="an-privacy-card-top">
                      <span>0{index + 1}</span>
                      <Icon size={17} />
                    </div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="an-privacy-block" id="cookies">
              <p className="an-privacy-block-label">03 / COOKIES & LOCAL STORAGE</p>
              <div className="an-privacy-split-heading">
                <Cookie size={24} />
                <h2>NO HIDDEN<br />TRACKING.</h2>
              </div>
              <p>
                {reviewedCookies || "Kami tidak mengatur advertising atau tracking cookies. localStorage terbatas dapat digunakan untuk preferensi interface, data pendukung autentikasi, atau penanda anonim gallery foto. Sistem analytics tidak menyimpan IP, email, atau user-agent."}
              </p>
              <p>
                Music player Spotify, YouTube, dan SoundCloud bersifat
                <strong> click-to-load</strong>: tidak ada data yang dimuat dari
                platform tersebut sampai kamu menekan play. Setelah itu, privacy
                policy masing-masing platform berlaku.
              </p>
            </article>

            <article className="an-privacy-block" id="services">
              <p className="an-privacy-block-label">04 / THIRD-PARTY SERVICES</p>
              <h2>WHO HELPS<br />RUN THE SITE.</h2>
              {reviewedServices && <p>{reviewedServices}</p>}
              <div className="an-privacy-service-list">
                {thirdParties.map(([name, purpose]) => (
                  <div className="an-privacy-service" key={name}>
                    <strong>{name}</strong>
                    <span>{purpose}</span>
                  </div>
                ))}
              </div>
              <p className="an-privacy-muted">Setiap service memiliki privacy policy-nya sendiri.</p>
            </article>

            <article className="an-privacy-block an-privacy-rights" id="rights">
              <p className="an-privacy-block-label">05 / YOUR RIGHTS</p>
              <h2>YOUR DATA.<br />YOUR CALL.</h2>
              <p>
                {reviewedRights || "Kamu dapat meminta akses, koreksi, atau penghapusan data pribadi yang kami simpan, seperti email Fan Signal atau inquiry, kapan saja melalui kontak resmi."}
              </p>
              <p>
                Permintaan ini mencakup hak berdasarkan Undang-Undang Pelindungan
                Data Pribadi Indonesia (UU No. 27/2022) dan, untuk pengunjung di
                EU/EEA, GDPR.
              </p>
              <a className="nf-button" href={`mailto:${contactEmail}?subject=Privacy%20request`}>
                <Mail size={15} /> CONTACT ABOUT YOUR DATA <ArrowUpRight size={15} />
              </a>
            </article>
          </div>
        </section>
      </main>
      <NightFooter />
    </div>
  );
}
