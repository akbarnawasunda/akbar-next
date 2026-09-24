import { ArrowUpRight, Menu, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  usePublicArtistContent,
  publicPlatformLinks,
} from "@/content/publicContent";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { MobileNav } from "./MobileNav";
import { MobileSlideMenu } from "./MobileSlideMenu";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import "./NightFrequencyChrome.css";
import "./OfficialBrand.css";
import "@/pages/ArtistModules.css";
import "./PublicMotion.css";

export { MobileNav, MobileSlideMenu, useLockBodyScroll };

const navItems = [
  { href: "/music", label: "MUSIC" },
  { href: "/visuals", label: "VISUALS" },
  { href: "/live", label: "LIVE" },
  { href: "/universe", label: "ARCHIVE" },
  { href: "/about", label: "ABOUT" },
  { href: "/epk", label: "EPK" },
  { href: "/inquire", label: "CONTACT" },
];

function DesktopStageHud() {
  const [wibTime, setWibTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        setWibTime(`${formatter.format(now)} WIB`);
      } catch {
        setWibTime("BANDUNG / STAGE");
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="nf-desktop-hud" aria-hidden="true">
      <div className="nf-hud-left">
        <span className="nf-hud-live-dot" />
        <span className="nf-hud-badge">STAGE ACTIVE</span>
        <span className="nf-hud-sep">·</span>
        <span className="nf-hud-time">{wibTime || "LIVE WIB"}</span>
        <span className="nf-hud-sep">·</span>
        <span>BANDUNG (UTC+7)</span>
      </div>
      <div className="nf-hud-center">
        <span>AKBAR NAWASUNDA // 130 BPM · BREAKBEAT · INDO BASS</span>
      </div>
      <div className="nf-hud-right">
        <span className="nf-hud-kbd-hint">HOTKEYS:</span>
        <kbd>[M] MUSIC</kbd>
        <kbd>[V] VISUALS</kbd>
        <kbd>[E] EPK</kbd>
      </div>
    </div>
  );
}

function LanguageSwitcher({ pathname }: { pathname: string }) {
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const idPath = isEnglish ? pathname.replace(/^\/en/, "") || "/" : pathname;
  const englishPath = isEnglish ? pathname : pathname === "/" ? "/en" : `/en${pathname}`;
  return (
    <div className="an-language-switcher" aria-label="Pilihan bahasa">
      <Link className={!isEnglish ? "is-active" : ""} href={idPath} aria-current={!isEnglish ? "page" : undefined}>
        ID
      </Link>
      <span aria-hidden="true">/</span>
      <Link className={isEnglish ? "is-active" : ""} href={englishPath} aria-current={isEnglish ? "page" : undefined}>
        EN
      </Link>
    </div>
  );
}

export function NightHeader({ active }: { active?: string }) {
  const [pathname, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const activeRoute = active ??
    (pathname.startsWith("/music") ? "/music" :
      pathname.startsWith("/visuals") ? "/visuals" :
        pathname.startsWith("/live") ? "/live" :
          pathname.startsWith("/universe") ? "/universe" :
            pathname.startsWith("/about") ? "/about" :
              pathname.startsWith("/epk") ? "/epk" :
                pathname.startsWith("/inquire") ? "/inquire" : undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <DesktopStageHud />
      <header className="nf-nav">
        <Link className="nf-wordmark nf-wordmark-official" href="/">
          <ResilientBrandImage className="nf-brand-logo" alt="Akbar Nawasunda" />
          <span>AKBAR NAWASUNDA</span>
        </Link>
        <nav aria-label="Navigasi utama">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={activeRoute === item.href ? "is-active" : ""}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher pathname={pathname} />
        <a className="nf-signal" href="#signal">
          <Radio size={14} /> KABAR TERBARU
        </a>
        <button
          ref={triggerRef}
          className="nf-menu-toggle"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={isOpen}
          aria-controls="night-mobile-menu"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
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
        <Link className="nf-footer-mascot" href="/" aria-label="Kembali ke homepage">
          <img src="/assets/akbar-mascot-doodle.webp" alt="Maskot doodle Akbar Nawasunda" width={92} height={92} loading="lazy" decoding="async" />
          <span>BACK TO SIGNAL <ArrowUpRight size={12} /></span>
        </Link>
      </div>
      <div className="nf-footer-column">
        <span>LIHAT-LIHAT</span>
        <Link href="/music">
          Music <ArrowUpRight size={13} />
        </Link>
        <Link href="/visuals">
          Visuals <ArrowUpRight size={13} />
        </Link>
        <Link href="/live">
          Live <ArrowUpRight size={13} />
        </Link>
        <Link href="/universe">
          Archive <ArrowUpRight size={13} />
        </Link>
        <Link href="/about">
          About <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="nf-footer-column">
        <span>HUBUNGI</span>
        {links.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
            {link.label} <ArrowUpRight size={13} />
          </a>
        ))}
        <Link href="/epk">
          EPK / Booking <ArrowUpRight size={13} />
        </Link>
      </div>
      <p className="footer-bottom">
        © {new Date().getFullYear()} AKBAR NAWASUNDA
      </p>
    </footer>
  );
}
