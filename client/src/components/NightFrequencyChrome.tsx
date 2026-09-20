import { ArrowUpRight, Menu, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import {
  usePublicArtistContent,
  publicPlatformLinks,
} from "@/content/publicContent";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import "./NightFrequencyChrome.css";
import "./OfficialBrand.css";
import "@/pages/ArtistModules.css";
import "./PublicMotion.css";

const navItems = [
  { href: "/music", label: "MUSIC" },
  { href: "/visuals", label: "VISUALS" },
  { href: "/live", label: "LIVE" },
  { href: "/universe", label: "ARCHIVE" },
  { href: "/about", label: "ABOUT" },
  { href: "/epk", label: "EPK" },
  { href: "/inquire", label: "CONTACT" },
];

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

function MobileMenuOverlay({
  open,
  pathname,
  active,
  onClose,
}: {
  open: boolean;
  pathname: string;
  active?: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const focusFrame = window.requestAnimationFrame(() => getFocusable()[0]?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus && document.contains(previousFocus)) {
        window.requestAnimationFrame(() => previousFocus.focus());
      }
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={dialogRef}
      id="night-mobile-menu"
      className="nf-mobile-menu is-open"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi"
    >
      <button
        className="nf-mobile-menu-close"
        type="button"
        onClick={onClose}
        aria-label="Tutup navigasi"
      >
        <span aria-hidden="true">×</span>
        <span aria-hidden="true">TUTUP</span>
      </button>

      <div className="nf-mobile-menu-inner">
        <span className="nf-mobile-eyebrow">AKBAR NAWASUNDA / MENU</span>

        {navItems.map((item) => (
          <Link
            key={item.href}
            className={active === item.href ? "is-active" : ""}
            href={item.href}
            onClick={onClose}
          >
            <span className="nf-mobile-menu-link-title">{item.label}</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        ))}

        <a href="#signal" onClick={onClose}>
          <span className="nf-mobile-menu-link-title">KABAR TERBARU</span>
          <Radio size={14} aria-hidden="true" />
        </a>

        <div className="en-mobile-language">
          <span>LANGUAGE</span>
          <LanguageSwitcher pathname={pathname} />
        </div>
      </div>
    </div>,
    document.body
  );
}

export function NightHeader({ active }: { active?: string }) {
  const [pathname] = useLocation();
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

  const close = () => setIsOpen(false);
  const closeAndReturnFocus = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [isOpen]);

  return (
    <>
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

      <MobileMenuOverlay
        open={isOpen}
        pathname={pathname}
        active={activeRoute}
        onClose={closeAndReturnFocus}
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
