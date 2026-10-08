import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  usePublicArtistContent,
  publicConfirmedEvents,
  publicPlatformLinks,
} from "@/content/publicContent";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { BirthdayChip, StudioClock } from "./StudioClock";
import { MobileNav } from "./MobileNav";
import { MobileSlideMenu } from "./MobileSlideMenu";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import "./NightFrequencyChrome.css";
import "./OfficialBrand.css";
import "@/pages/ArtistModules.css";
import "./PublicMotion.css";

export { MobileNav, MobileSlideMenu, useLockBodyScroll };

/* Nav desktop = 6 item permanen (Phase 3 §2 baris 6 + §10). JADWAL/LIVE tidak
   permanen: ia mengisi slot 3 HANYA saat CMS mempublikasikan jadwal yang
   terkonfirmasi (lihat `buildNavItems` di bawah). Label "ARSIP" pensiun —
   halaman itu kini PERJALANAN/JOURNEY; URL-nya tetap /universe.
   Satu komponen dipakai ID dan EN (bukan dua chrome paralel yang bisa
   menyimpang) — lihat `NightHeader`/`NightFooter` di bawah. */
type Lang = "id" | "en";

const idNavItems = [
  { href: "/music", label: "MUSIK" },
  { href: "/visuals", label: "VISUAL" },
  { href: "/universe", label: "PERJALANAN" },
  { href: "/about", label: "TENTANG" },
  { href: "/epk", label: "EPK" },
  { href: "/inquire", label: "KONTAK" },
];

const enNavItems = [
  { href: "/en/music", label: "MUSIC" },
  { href: "/en/visuals", label: "VISUALS" },
  { href: "/en/universe", label: "JOURNEY" },
  { href: "/en/about", label: "ABOUT" },
  { href: "/en/epk", label: "EPK" },
  { href: "/en/inquire", label: "CONTACT" },
];

const scheduleNavItem: Record<Lang, { href: string; label: string }> = {
  id: { href: "/live", label: "JADWAL" },
  en: { href: "/en/live", label: "LIVE" },
};

function buildNavItems(lang: Lang, hasConfirmedEvents: boolean) {
  const base = lang === "en" ? enNavItems : idNavItems;
  if (!hasConfirmedEvents) return base;
  const items = [...base];
  items.splice(2, 0, scheduleNavItem[lang]);
  return items;
}

function LanguageSwitcher({
  pathname,
  lang = "id",
}: {
  pathname: string;
  lang?: Lang;
}) {
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const idPath = isEnglish ? pathname.replace(/^\/en/, "") || "/" : pathname;
  const englishPath = isEnglish
    ? pathname
    : pathname === "/"
      ? "/en"
      : `/en${pathname}`;
  return (
    <div
      className="an-language-switcher"
      aria-label={lang === "en" ? "Language selection" : "Pilihan bahasa"}
    >
      <Link
        className={!isEnglish ? "is-active" : ""}
        href={idPath}
        aria-current={!isEnglish ? "page" : undefined}
      >
        ID
      </Link>
      <span aria-hidden="true">/</span>
      <Link
        className={isEnglish ? "is-active" : ""}
        href={englishPath}
        aria-current={isEnglish ? "page" : undefined}
      >
        EN
      </Link>
    </div>
  );
}

export function NightHeader({
  active,
  lang = "id",
}: {
  active?: string;
  lang?: Lang;
}) {
  const [pathname, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cms = usePublicArtistContent();
  const hasConfirmedEvents = publicConfirmedEvents(cms.data).length > 0;
  const navItems = buildNavItems(lang, hasConfirmedEvents);
  const prefix = lang === "en" ? "/en" : "";
  const activeRoute =
    active ??
    (pathname.startsWith(`${prefix}/music`)
      ? `${prefix}/music`
      : pathname.startsWith(`${prefix}/visuals`)
        ? `${prefix}/visuals`
        : pathname.startsWith(`${prefix}/live`)
          ? `${prefix}/live`
          : pathname.startsWith(`${prefix}/universe`)
            ? `${prefix}/universe`
            : pathname.startsWith(`${prefix}/about`)
              ? `${prefix}/about`
              : pathname.startsWith(`${prefix}/epk`)
                ? `${prefix}/epk`
                : pathname.startsWith(`${prefix}/inquire`)
                  ? `${prefix}/inquire`
                  : undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t =
    lang === "en"
      ? {
          navLabel: "Primary navigation",
          listen: "LISTEN",
          openNav: "Open navigation",
          closeNav: "Close navigation",
          menuId: "english-mobile-menu",
        }
      : {
          navLabel: "Navigasi utama",
          listen: "Dengarkan",
          openNav: "Buka navigasi",
          closeNav: "Tutup navigasi",
          menuId: "night-mobile-menu",
        };

  // Header jadi solid setelah pengunjung mulai menggulir. Di beranda, header
  // transparan di posisi paling atas supaya foto hero terbaca sebagai satu
  // adegan penuh; setelah lewat ambang itu bar-nya menutup diri jadi tipis.
  // Di-throttle ke satu setState per frame — bukan per event scroll.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 32);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Desktop keyboard hotkeys for instant navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === "m") {
        navigate(`${prefix}/music`);
      } else if (key === "v") {
        navigate(`${prefix}/visuals`);
      } else if (key === "e") {
        navigate(`${prefix}/epk`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, prefix]);

  const closeAndReturnFocus = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      if (window.innerWidth <= 1080) {
        trigger.focus();
        return;
      }
      trigger
        .closest(".nf-nav")
        ?.querySelector<HTMLAnchorElement>("nav a")
        ?.focus();
    });
  };

  return (
    <>
      <header className="nf-nav" data-scrolled={scrolled ? "true" : "false"}>
        {/* Identitas di bar = logo + nama. Deskriptor ("Producer · Remixer ·
            Bandung Barat") sengaja tidak lagi di bar: di masthead ia hanya
            bisa tampil 8px — tidak terbaca dan memakan ~146px yang membuat
            nav bertabrakan dengan identitas. Rumah tetapnya: blok brand
            footer, copy hero beranda, dan splash (docs/desktop-visual-qa-
            cursor-pass.md §1). */}
        <Link className="nf-wordmark" href={prefix || "/"}>
          <ResilientBrandImage
            className="nf-brand-logo"
            alt="Akbar Nawasunda"
            priority
          />
          <span className="nf-wordmark-text">
            <strong>Akbar Nawasunda</strong>
          </span>
        </Link>
        <nav className="nf-nav-links" aria-label={t.navLabel}>
          {navItems.map(item => (
            <Link
              key={item.href}
              className={activeRoute === item.href ? "is-active" : ""}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nf-nav-tools">
          {/* Jam studio hidup (Bandung Barat/WIB) di dekat tombol bahasa —
              satu detail nyata yang tidak bisa dipunyai templat generik:
              ini bukan jam dekoratif, ini memang waktu lokasi studionya.
              Di bar hanya versi ringkas (detik + pulse); tanggal penuh tetap
              menempel di footer — jam lengkap di masthead terlalu lebar untuk
              satu baris (docs/desktop-visual-qa-cursor-pass.md §1). */}
          <span className="nf-nav-clock">
            <StudioClock locale={lang} compact />
          </span>
          {/* Lencana ulang tahun sengaja tidak lagi di masthead: ~242px,
              tidak muat di baris terukur pada lebar mana pun. Perayaannya
              tetap ada di catatan hero, garis aksen header/footer, dan
              splash — serta tetap di footer (lihat nf-footer-live). */}
          <LanguageSwitcher pathname={pathname} lang={lang} />
          {/* CTA utama header: membuka halaman musik, bukan anchor #signal yang
              hanya ada di beranda (dulu jadi tautan mati di halaman lain). */}
          <Link className="nf-signal" href={`${prefix}/music`} data-cursor="point">
            {t.listen} <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
          <button
            ref={triggerRef}
            className="nf-menu-toggle"
            type="button"
            onClick={() => setIsOpen(value => !value)}
            aria-label={isOpen ? t.closeNav : t.openNav}
            aria-expanded={isOpen}
            aria-controls={t.menuId}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <MobileNav
        isOpen={isOpen}
        pathname={pathname}
        active={activeRoute}
        onClose={closeAndReturnFocus}
        lang={lang}
        hasConfirmedEvents={hasConfirmedEvents}
      />
    </>
  );
}

export function NightFooter({ lang = "id" }: { lang?: Lang } = {}) {
  const cms = usePublicArtistContent();
  const links = publicPlatformLinks(cms.data);
  const [pathname] = useLocation();
  const prefix = lang === "en" ? "/en" : "";
  const copy =
    lang === "en"
      ? {
          discover: "DISCOVER",
          connect: "CONNECT",
          music: "Music",
          visuals: "Visuals",
          live: "Live",
          journey: "Journey",
          about: "About",
          epk: "EPK / Booking",
          privacy: "Privacy",
        }
      : {
          discover: "JELAJAHI",
          connect: "HUBUNGI",
          music: "Musik",
          visuals: "Visual",
          live: "Jadwal",
          journey: "Perjalanan",
          about: "Tentang",
          epk: "EPK / Booking",
          privacy: "Privasi",
        };
  return (
    <footer className="nf-footer">
      {/* Kolofon, bukan kartu-kartu seragam: nama artis memegang satu baris
          penuh di atas (seperti baris penutup majalah), jam studio hidup
          menempel di sana juga — bukti bahwa situs ini bukan templat, lalu
          dua kolom tautan disusun tidak simetris di bawahnya. */}
      <div className="nf-footer-brand">
        <ResilientBrandImage
          className="nf-footer-logo"
          alt="Akbar Nawasunda logo"
        />
        <strong>AKBAR NAWASUNDA</strong>
        <p>PRODUCER / REMIXER / INDONESIA</p>
        <div className="nf-footer-live">
          <StudioClock locale={lang} />
          <BirthdayChip locale={lang} />
        </div>
      </div>
      {/* Kaki halaman = himpunan rute yang tidak ada di nav (Phase 3 §7):
          Jadwal tetap di sini (nav-nya kondisional), JEDAG RUN masuk sebagai
          baris footer, dan Privasi kini setara di kedua bahasa. */}
      <div className="nf-footer-column">
        <span>{copy.discover}</span>
        <Link href={`${prefix}/music`}>{copy.music}</Link>
        <Link href={`${prefix}/visuals`}>{copy.visuals}</Link>
        <Link href={`${prefix}/live`}>{copy.live}</Link>
        <Link href={`${prefix}/universe`}>{copy.journey}</Link>
        <Link href={`${prefix}/about`}>{copy.about}</Link>
        <Link href={`${prefix}/game/jedag-run`}>JEDAG RUN</Link>
      </div>
      <div className="nf-footer-column">
        <span>{copy.connect}</span>
        {links.map(link => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
            {link.label} <ArrowUpRight size={13} />
          </a>
        ))}
        <Link href={`${prefix}/epk`}>{copy.epk}</Link>
        <Link href={`${prefix}/privacy`}>{copy.privacy}</Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AKBAR NAWASUNDA</span>
        <LanguageSwitcher pathname={pathname || prefix || "/"} lang={lang} />
      </div>
    </footer>
  );
}
