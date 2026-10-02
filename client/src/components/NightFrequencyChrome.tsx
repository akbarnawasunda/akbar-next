import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  usePublicArtistContent,
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

const navItems = [
  { href: "/music", label: "MUSIK" },
  { href: "/visuals", label: "VISUAL" },
  { href: "/live", label: "JADWAL" },
  { href: "/universe", label: "ARSIP" },
  { href: "/about", label: "TENTANG" },
  { href: "/epk", label: "EPK" },
  { href: "/inquire", label: "KONTAK" },
];

function LanguageSwitcher({ pathname }: { pathname: string }) {
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const idPath = isEnglish ? pathname.replace(/^\/en/, "") || "/" : pathname;
  const englishPath = isEnglish
    ? pathname
    : pathname === "/"
      ? "/en"
      : `/en${pathname}`;
  return (
    <div className="an-language-switcher" aria-label="Pilihan bahasa">
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

export function NightHeader({ active }: { active?: string }) {
  const [pathname, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeRoute =
    active ??
    (pathname.startsWith("/music")
      ? "/music"
      : pathname.startsWith("/visuals")
        ? "/visuals"
        : pathname.startsWith("/live")
          ? "/live"
          : pathname.startsWith("/universe")
            ? "/universe"
            : pathname.startsWith("/about")
              ? "/about"
              : pathname.startsWith("/epk")
                ? "/epk"
                : pathname.startsWith("/inquire")
                  ? "/inquire"
                  : undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Header jadi solid setelah pengunjung mulai menggulir. Di beranda, header
  // transparan di posisi paling atas supaya foto hero terbaca sebagai satu
  // adegan penuh; setelah lewat ambang itu bar-nya menutup diri jadi tipis.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        navigate("/music");
      } else if (key === "v") {
        navigate("/visuals");
      } else if (key === "e") {
        navigate("/epk");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

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
        <Link className="nf-wordmark" href="/">
          <ResilientBrandImage
            className="nf-brand-logo"
            alt="Akbar Nawasunda"
            priority
          />
          <span className="nf-wordmark-text">
            <strong>Akbar Nawasunda</strong>
            <small>Producer · Remixer · Bandung Barat</small>
          </span>
        </Link>
        <nav className="nf-nav-links" aria-label="Navigasi utama">
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
          <BirthdayChip />
          <LanguageSwitcher pathname={pathname} />
          {/* CTA utama header: membuka halaman musik, bukan anchor #signal yang
              hanya ada di beranda (dulu jadi tautan mati di halaman lain). */}
          <Link className="nf-signal" href="/music">
            Dengarkan <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
          <button
            ref={triggerRef}
            className="nf-menu-toggle"
            type="button"
            onClick={() => setIsOpen(value => !value)}
            aria-label={isOpen ? "Tutup navigasi" : "Buka navigasi"}
            aria-expanded={isOpen}
            aria-controls="night-mobile-menu"
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
        lang="id"
      />
    </>
  );
}

export function NightFooter() {
  const cms = usePublicArtistContent();
  const links = publicPlatformLinks(cms.data);
  return (
    <footer className="nf-footer">
      <div className="nf-footer-brand">
        <ResilientBrandImage
          className="nf-footer-logo"
          alt="Akbar Nawasunda logo"
        />
        <strong>AKBAR NAWASUNDA</strong>
        <p>PRODUCER / REMIXER / INDONESIA</p>
        <Link
          className="nf-footer-mascot"
          href="/"
          aria-label="Kembali ke homepage"
        >
          <img
            src="/assets/akbar-mascot-doodle.webp"
            alt="Maskot doodle Akbar Nawasunda"
            width={92}
            height={92}
            loading="lazy"
            decoding="async"
          />
          <span>
            KEMBALI KE BERANDA <ArrowUpRight size={12} />
          </span>
        </Link>
      </div>
      <div className="nf-footer-column">
        <span>JELAJAHI</span>
        <Link href="/music">Musik</Link>
        <Link href="/visuals">Visual</Link>
        <Link href="/live">Jadwal</Link>
        <Link href="/universe">Arsip</Link>
        <Link href="/about">Tentang</Link>
      </div>
      <div className="nf-footer-column">
        <span>HUBUNGI</span>
        {links.map(link => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
            {link.label} <ArrowUpRight size={13} />
          </a>
        ))}
        <Link href="/epk">EPK / Booking</Link>
      </div>
      <p className="footer-bottom">
        <span>© {new Date().getFullYear()} AKBAR NAWASUNDA</span>
        <span className="footer-bottom__clock">
          <StudioClock />
          <BirthdayChip />
        </span>
      </p>
    </footer>
  );
}
