import {
  ArrowUpRight,
  CheckCircle2,
  Cookie,
  Database,
  Mail,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { formatPublicIndex, verifiedArtistProfile } from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./PrivacyPolicy.css";

/* ============================================================
   PRIVACY — /privacy dan /en/privacy
   ------------------------------------------------------------
   Satu komposisi untuk dua bahasa: `PrivacyView({ locale })` dipakai
   halaman ID (default export) dan EnglishPrivacy lewat EnglishFrame.
   Sebelumnya versi EN hidup terpisah dengan struktur lama, jadi setiap
   perubahan desain di ID selalu tertinggal di EN.
   ============================================================ */

export type PrivacyLocale = "id" | "en";

const copy = {
  id: {
    heroTitle: (
      <>
        PRIVACY
        <br />
        POLICY.
      </>
    ),
    heroLede:
      "Penjelasan singkat dan terbuka tentang data yang diproses saat kamu memakai situs resmi Akbar Nawasunda.",
    postureLabel: "DATA POSTURE",
    postureStrong: (
      <>
        LIGHT
        <br />
        BY DEFAULT.
      </>
    ),
    postureCopy:
      "Tidak ada iklan, tracking cookies, atau penjualan data. Gallery foto hanya mencatat hitungan agregat anonim.",
    indexHeading: "ON THIS PAGE",
    navLabel: "Privacy Policy sections",
    contactLabel: "ASK ABOUT YOUR DATA",
    sections: [
      ["short-version", "Short version"],
      ["collection", "What we collect"],
      ["cookies", "Cookies & storage"],
      ["services", "Third-party services"],
      ["rights", "Your rights"],
    ],
    shortLabel: "01 / THE SHORT VERSION",
    shortTitle: (
      <>
        LIGHT ON
        <br />
        YOUR DATA.
      </>
    ),
    shortQuote: "No advertising, no tracking cookies, no selling data — ever.",
    shortCopy:
      "Situs ini dibuat seringan mungkin terhadap data kamu. Bagian di bawah adalah daftar lengkap dan jujur tentang apa yang terjadi saat kamu menggunakan situs ini.",
    collectionLabel: "02 / WHAT WE COLLECT",
    collectionTitle: (
      <>
        WHAT ENTERS
        <br />
        THE SYSTEM.
      </>
    ),
    collectionPoints: [
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
        title: "JEDAG RUN leaderboard",
        copy: "Saat bermain JEDAG RUN, kamu dapat memasukkan username publik. Jika skor dikirim, username dan skor dapat tampil di Top 10. Sistem tidak meminta login dan tidak menyimpan email, IP, user-agent, atau identifier perangkat untuk leaderboard.",
        icon: Trophy,
      },
      {
        title: "Browser storage",
        copy: "Situs dapat menyimpan preferensi interface terbatas, data pendukung autentikasi, username JEDAG RUN agar tidak perlu diisi berulang, atau penanda anonim untuk menghitung akses gallery foto secara agregat. Username game dapat dihapus melalui tombol Ganti Username; data ini tidak digunakan untuk iklan.",
        icon: ShieldCheck,
      },
    ],
    cookiesLabel: "03 / COOKIES & LOCAL STORAGE",
    cookiesTitle: (
      <>
        NO HIDDEN
        <br />
        TRACKING.
      </>
    ),
    cookiesCopy:
      "Kami tidak mengatur advertising atau tracking cookies. localStorage terbatas dapat digunakan untuk preferensi interface, data pendukung autentikasi, atau penanda anonim gallery foto. Sistem analytics tidak menyimpan IP, email, atau user-agent. Leaderboard JEDAG RUN hanya menyimpan username publik dan skor yang dikirim pemain.",
    cookiesEmbedCopy:
      "Music player Spotify, YouTube, dan SoundCloud bersifat click-to-load: tidak ada data yang dimuat dari platform tersebut sampai kamu menekan play. Setelah itu, privacy policy masing-masing platform berlaku.",
    servicesLabel: "04 / THIRD-PARTY SERVICES",
    servicesTitle: (
      <>
        WHO HELPS
        <br />
        RUN THE SITE.
      </>
    ),
    thirdParties: [
      ["Vercel", "hosting & pengiriman"],
      ["Fontshare", "file font di-host di domain ini"],
      ["Penghitung galeri (first-party)", "akses agregat anonim"],
      ["Backend & database situs", "penyimpanan subscriber dan inquiry"],
      ["Spotify / YouTube / SoundCloud", "player tertanam setelah klik"],
      ["Apple iTunes Search", "cover art dan preview 30 detik"],
    ],
    mutedNote: "Setiap service memiliki privacy policy-nya sendiri.",
    rightsLabel: "05 / YOUR RIGHTS",
    rightsTitle: (
      <>
        YOUR DATA.
        <br />
        YOUR CALL.
      </>
    ),
    rightsCopy:
      "Kamu dapat meminta akses, koreksi, atau penghapusan data pribadi yang kami simpan, seperti email Fan Signal, inquiry, atau username leaderboard, kapan saja melalui kontak resmi.",
    rightsLegal:
      "Permintaan ini mencakup hak berdasarkan Undang-Undang Pelindungan Data Pribadi Indonesia (UU No. 27/2022) dan, untuk pengunjung di EU/EEA, GDPR.",
    ctaLabel: "CONTACT ABOUT YOUR DATA",
    mailSubject: "Privacy request",
  },
  en: {
    heroTitle: (
      <>
        PRIVACY
        <br />
        POLICY.
      </>
    ),
    heroLede:
      "A short, direct explanation of the data processed while you use the official Akbar Nawasunda site.",
    postureLabel: "DATA POSTURE",
    postureStrong: (
      <>
        LIGHT
        <br />
        BY DEFAULT.
      </>
    ),
    postureCopy:
      "No advertising, no tracking cookies, no selling data. The photo gallery only records anonymous aggregate counts.",
    indexHeading: "ON THIS PAGE",
    navLabel: "Privacy Policy sections",
    contactLabel: "ASK ABOUT YOUR DATA",
    sections: [
      ["short-version", "Short version"],
      ["collection", "What we collect"],
      ["cookies", "Cookies & storage"],
      ["services", "Third-party services"],
      ["rights", "Your rights"],
    ],
    shortLabel: "01 / THE SHORT VERSION",
    shortTitle: (
      <>
        LIGHT ON
        <br />
        YOUR DATA.
      </>
    ),
    shortQuote: "No advertising, no tracking cookies, no selling data.",
    shortCopy:
      "The site is designed to keep data collection limited to what is needed for contact, site operation, and clearly described services.",
    collectionLabel: "02 / WHAT WE COLLECT",
    collectionTitle: (
      <>
        WHAT ENTERS
        <br />
        THE SYSTEM.
      </>
    ),
    collectionPoints: [
      {
        title: "Fan Signal",
        copy: "If you subscribe, your email address is stored in the site subscriber database and used only for official release, visual, and live updates. You can request deletion at any time by email.",
        icon: Mail,
      },
      {
        title: "Contact / collab form",
        copy: "Contact details and project context are stored in the inquiry database so the artist can review and respond to that request.",
        icon: Database,
      },
      {
        title: "Analytics",
        copy: "The photo gallery counts visits in aggregate with an anonymous browser marker. No IP, email, or user-agent is stored, and no advertising cookies are used.",
        icon: CheckCircle2,
      },
      {
        title: "JEDAG RUN leaderboard",
        copy: "In JEDAG RUN you may enter a public username. If a score is submitted, that username and score can appear in the Top 10. No login is required and no email, IP, user-agent, or device identifier is stored for the leaderboard.",
        icon: Trophy,
      },
      {
        title: "Browser storage",
        copy: "The site may store limited interface preferences, authentication support data, your JEDAG RUN username so it does not need to be retyped, or an anonymous marker used to count gallery access in aggregate. The game username can be cleared with the Change Username button; none of it is used for advertising.",
        icon: ShieldCheck,
      },
    ],
    cookiesLabel: "03 / COOKIES & LOCAL STORAGE",
    cookiesTitle: (
      <>
        NO HIDDEN
        <br />
        TRACKING.
      </>
    ),
    cookiesCopy:
      "The site does not set advertising or tracking cookies. Limited local storage may support interface preferences, authentication, or an anonymous gallery visitor marker. The gallery counter does not store IP, email, or user-agent. The JEDAG RUN leaderboard stores only the public username and score a player chooses to submit.",
    cookiesEmbedCopy:
      "Spotify, YouTube, and SoundCloud players use a click-to-load pattern: their services receive requests only after you choose to open or play them, and their own privacy policies then apply.",
    servicesLabel: "04 / THIRD-PARTY SERVICES",
    servicesTitle: (
      <>
        WHO HELPS
        <br />
        RUN THE SITE.
      </>
    ),
    thirdParties: [
      ["Vercel", "hosting and delivery"],
      ["Fontshare", "self-hosted typefaces on this domain"],
      ["First-party gallery counter", "anonymous aggregate access"],
      ["Site backend and database", "subscriber and inquiry storage"],
      ["Spotify / YouTube / SoundCloud", "optional media players"],
      ["Apple Music / iTunes Search", "official release routes and artwork"],
    ],
    mutedNote: "Each service has its own privacy policy.",
    rightsLabel: "05 / YOUR RIGHTS",
    rightsTitle: (
      <>
        YOUR DATA.
        <br />
        YOUR CALL.
      </>
    ),
    rightsCopy:
      "You may ask about access, correction, or deletion of personal data held through an inquiry or site service, at any time, through the official contact address.",
    rightsLegal:
      "This covers rights under Indonesia's Personal Data Protection Law (UU No. 27/2022) and, for visitors in the EU/EEA, the GDPR.",
    ctaLabel: "CONTACT ABOUT YOUR DATA",
    mailSubject: "Privacy request",
  },
} as const;

export function PrivacyView({ locale = "id" }: { locale?: PrivacyLocale }) {
  const t = copy[locale];
  const cms = usePublicArtistContent();
  const bookingEmail =
    cms.data?.pressKit?.bookingEmail || verifiedArtistProfile.bookingEmail;
  const reviewed = locale === "id" ? cms.data?.legal : undefined;
  const reviewedSection = (key: string) =>
    reviewed?.sections?.find(section => section.key === key)?.body?.trim();
  const reviewedIntro = reviewed?.intro?.trim();
  const reviewedShortVersion = reviewedSection("short-version");
  const reviewedCollection = reviewedSection("collection");
  const reviewedCookies = reviewedSection("cookies");
  const reviewedServices = reviewedSection("services");
  const reviewedRights = reviewedSection("rights");
  const updatedLabel = reviewed?.effectiveDate
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
        .format(new Date(reviewed.effectiveDate))
        .toUpperCase()
    : locale === "id"
      ? "25 AUG 2026"
      : "25 AUG 2026";

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="an-privacy-hero">
        <div className="an-privacy-hero-copy">
          <h1>{t.heroTitle}</h1>
          <p>{reviewedIntro || t.heroLede}</p>
        </div>
        <aside className="an-privacy-posture">
          <span className="an-privacy-posture-icon">
            <ShieldCheck size={19} />
          </span>
          <span className="an-privacy-posture-label">{t.postureLabel}</span>
          <strong>{t.postureStrong}</strong>
          <p>{t.postureCopy}</p>
          <span className="an-privacy-updated">
            {locale === "id" ? "TERAKHIR DIPERBARUI" : "LAST UPDATED"} ·{" "}
            {updatedLabel}
          </span>
        </aside>
      </section>

      <section className="nf-section an-privacy-reading">
        <aside className="an-privacy-index">
          <p className="nf-page-eyebrow">{t.indexHeading}</p>
          <nav aria-label={t.navLabel}>
            {t.sections.map(([id, label], index) => (
              <a href={`#${id}`} key={id}>
                <span>{formatPublicIndex(index)}</span>
                {label}
              </a>
            ))}
          </nav>
          <a className="an-privacy-contact" href={`mailto:${bookingEmail}`}>
            <Mail size={14} />
            {t.contactLabel}
          </a>
        </aside>

        <div className="an-privacy-content">
          <article
            className="an-privacy-block an-privacy-short"
            id="short-version"
          >
            <p className="an-privacy-block-label">{t.shortLabel}</p>
            <h2>{t.shortTitle}</h2>
            <blockquote>{reviewedShortVersion || t.shortQuote}</blockquote>
            <p>
              {reviewedShortVersion
                ? locale === "id"
                  ? "Bagian ini mencerminkan teks kebijakan yang sudah ditinjau dan dipublish dari Legal Document."
                  : "This section reflects the reviewed policy text published from the Legal Document."
                : t.shortCopy}
            </p>
          </article>

          <article className="an-privacy-block" id="collection">
            <p className="an-privacy-block-label">{t.collectionLabel}</p>
            <h2>{t.collectionTitle}</h2>
            {reviewedCollection && <p>{reviewedCollection}</p>}
            <div className="an-privacy-collection-grid">
              {t.collectionPoints.map(({ title, copy: body, icon: Icon }, index) => (
                <div className="an-privacy-collection-card" key={title}>
                  <div className="an-privacy-card-top">
                    <span>{formatPublicIndex(index)}</span>
                    <Icon size={17} />
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="an-privacy-block" id="cookies">
            <p className="an-privacy-block-label">{t.cookiesLabel}</p>
            <div className="an-privacy-split-heading">
              <Cookie size={24} />
              <h2>{t.cookiesTitle}</h2>
            </div>
            <p>{reviewedCookies || t.cookiesCopy}</p>
            <p>{t.cookiesEmbedCopy}</p>
          </article>

          <article className="an-privacy-block" id="services">
            <p className="an-privacy-block-label">{t.servicesLabel}</p>
            <h2>{t.servicesTitle}</h2>
            {reviewedServices && <p>{reviewedServices}</p>}
            <div className="an-privacy-service-list">
              {t.thirdParties.map(([name, purpose]) => (
                <div className="an-privacy-service" key={name}>
                  <strong>{name}</strong>
                  <span>{purpose}</span>
                </div>
              ))}
            </div>
            <p className="an-privacy-muted">{t.mutedNote}</p>
          </article>

          <article className="an-privacy-block an-privacy-rights" id="rights">
            <p className="an-privacy-block-label">{t.rightsLabel}</p>
            <h2>{t.rightsTitle}</h2>
            <p>{reviewedRights || t.rightsCopy}</p>
            <p>{t.rightsLegal}</p>
            <a
              className="nf-button"
              href={`mailto:${bookingEmail}?subject=${encodeURIComponent(t.mailSubject)}`}
            >
              <Mail size={15} /> {t.ctaLabel} <ArrowUpRight size={15} />
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="nf-page an-privacy-page">
      <NightHeader />
      <PrivacyView locale="id" />
      <NightFooter />
    </div>
  );
}
