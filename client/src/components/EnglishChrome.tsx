import { ArrowUpRight, Mail, Menu, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { publicPlatformLinks, usePublicArtistContent } from "@/content/publicContent";
import "./NightFrequencyChrome.css";
import "./OfficialBrand.css";
import "./EcosystemRefinement.css";
import "./EnglishLayer.css";

const navItems = [
  { href: "/en/music", label: "MUSIC" },
  { href: "/en/visuals", label: "VISUALS" },
  { href: "/en/live", label: "LIVE" },
  { href: "/en/universe", label: "ARCHIVE" },
  { href: "/en/about", label: "ABOUT" },
];

function indonesianPath(pathname: string) {
  if (pathname === "/en") return "/";
  return pathname.replace(/^\/en(?=\/|$)/, "") || "/";
}

function LanguageSwitcher({ pathname }: { pathname: string }) {
  return (
    <div className="an-language-switcher" aria-label="Language selection">
      <Link href={indonesianPath(pathname)}>ID</Link>
      <span aria-hidden="true">/</span>
      <Link className="is-active" href={pathname} aria-current="page">
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
      id="english-mobile-menu"
      className="nf-mobile-menu is-open"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <button
        className="nf-mobile-menu-close"
        type="button"
        onClick={onClose}
        aria-label="Close navigation"
      >
        <span aria-hidden="true">×</span>
        <span aria-hidden="true">CLOSE</span>
      </button>

      <div className="nf-mobile-menu-inner">
        <span className="nf-mobile-eyebrow">AKBAR NAWASUNDA // EXPLORE</span>

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

        <Link href="/en/epk" onClick={onClose}>
          <span className="nf-mobile-menu-link-title">EPK / BOOKING</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>

        <Link href="/en/inquire" onClick={onClose}>
          <span className="nf-mobile-menu-link-title">INQUIRE</span>
          <Mail size={14} aria-hidden="true" />
        </Link>

        <div className="en-mobile-language">
          <span>LANGUAGE</span>
          <LanguageSwitcher pathname={pathname} />
        </div>
      </div>
    </div>,
    document.body
  );
}

export function EnglishHeader({ active }: { active?: string }) {
  const [pathname] = useLocation();
  const resolvedActive =
    active || (pathname.startsWith("/en/music/") ? "/en/music" : pathname);
  const [isOpen, setIsOpen] = useState(false);
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
      <header className="nf-nav en-nav">
        <Link className="nf-wordmark nf-wordmark-official" href="/en">
          <ResilientBrandImage className="nf-brand-logo" alt="Akbar Nawasunda" />
          <span>AKBAR NAWASUNDA</span>
        </Link>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={resolvedActive === item.href ? "is-active" : ""}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher pathname={pathname} />
        <Link className="nf-signal" href="/en/inquire">
          <Mail size={14} /> INQUIRE
        </Link>
        <button
          ref={triggerRef}
          className="nf-menu-toggle"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          aria-controls="english-mobile-menu"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <MobileMenuOverlay
        open={isOpen}
        pathname={pathname}
        active={resolvedActive}
        onClose={closeAndReturnFocus}
      />
    </>
  );
}

export function EnglishFooter() {
  const cms = usePublicArtistContent();
  const links = publicPlatformLinks(cms.data);
  return (
    <footer className="nf-footer en-footer">
      <div className="nf-footer-brand">
        <ResilientBrandImage
          className="nf-footer-logo"
          alt="Akbar Nawasunda logo"
        />
        <strong>AKBAR NAWASUNDA</strong>
        <p>PRODUCER / REMIXER / INDONESIA</p>
      </div>
      <div className="nf-footer-column">
        <span>DISCOVER</span>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label[0] + item.label.slice(1).toLowerCase()}{" "}
            <ArrowUpRight size={13} />
          </Link>
        ))}
      </div>
      <div className="nf-footer-column">
        <span>CONNECT</span>
        {links.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
            {link.label} <ArrowUpRight size={13} />
          </a>
        ))}
        <Link href="/en/epk">
          EPK / Booking <ArrowUpRight size={13} />
        </Link>
        <Link href="/en/privacy">
          Privacy <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="en-footer-bottom">
        <span>© {new Date().getFullYear()} AKBAR NAWASUNDA</span>
        <LanguageSwitcher pathname="/en" />
      </div>
    </footer>
  );
}

export function EnglishLink({
  href,
  children,
  className = "nf-text-button",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

export function EnglishChannelLinks() {
  const cms = usePublicArtistContent();
  const links = publicPlatformLinks(cms.data);
  return (
    <div className="en-channel-links">
      {links.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
          <Radio size={13} /> {link.label} <ArrowUpRight size={13} />
        </a>
      ))}
    </div>
  );
}
