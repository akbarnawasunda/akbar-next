import { ArrowUpRight, Mail, Menu, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
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
      <Link className="is-active" href={pathname} aria-current="page">EN</Link>
    </div>
  );
}

export function EnglishHeader({ active }: { active?: string }) {
  const [pathname] = useLocation();
  const resolvedActive = active || (pathname.startsWith("/en/music/") ? "/en/music" : pathname);
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => setIsOpen(false);
  const closeAndReturnFocus = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAndReturnFocus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeAndReturnFocus();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  return (
    <header ref={headerRef} className="nf-nav en-nav">
      <Link className="nf-wordmark nf-wordmark-official" href="/en">
        <ResilientBrandImage className="nf-brand-logo" alt="Akbar Nawasunda" />
        <span>AKBAR NAWASUNDA</span>
      </Link>
      <nav aria-label="Primary navigation">
        {navItems.map(item => (
          <Link key={item.href} className={resolvedActive === item.href ? "is-active" : ""} href={item.href}>
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
        onClick={() => setIsOpen(value => !value)}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="english-mobile-menu"
      >
        {isOpen ? <X size={19} /> : <Menu size={20} />}
      </button>
      <div id="english-mobile-menu" className={`nf-mobile-menu${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen}>
        <div className="nf-mobile-menu-inner">
          <span className="nf-mobile-eyebrow">AKBAR NAWASUNDA // EXPLORE</span>
          {navItems.map(item => (
            <Link key={item.href} className={resolvedActive === item.href ? "is-active" : ""} href={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
          <Link href="/en/epk" onClick={close}>EPK / BOOKING</Link>
          <Link href="/en/inquire" onClick={close}><Mail size={14} /> INQUIRE</Link>
          <div className="en-mobile-language"><span>LANGUAGE</span><LanguageSwitcher pathname={pathname} /></div>
        </div>
      </div>
    </header>
  );
}

export function EnglishFooter() {
  const cms = usePublicArtistContent();
  const links = publicPlatformLinks(cms.data);
  return (
    <footer className="nf-footer en-footer">
      <div className="nf-footer-brand">
        <ResilientBrandImage className="nf-footer-logo" alt="Akbar Nawasunda logo" />
        <strong>AKBAR NAWASUNDA</strong>
        <p>PRODUCER / REMIXER / INDONESIA</p>
      </div>
      <div className="nf-footer-column">
        <span>DISCOVER</span>
        {navItems.map(item => (
          <Link key={item.href} href={item.href}>{item.label[0] + item.label.slice(1).toLowerCase()} <ArrowUpRight size={13} /></Link>
        ))}
      </div>
      <div className="nf-footer-column">
        <span>CONNECT</span>
        {links.map(link => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label} <ArrowUpRight size={13} /></a>
        ))}
        <Link href="/en/epk">EPK / Booking <ArrowUpRight size={13} /></Link>
        <Link href="/en/privacy">Privacy <ArrowUpRight size={13} /></Link>
      </div>
      <div className="en-footer-bottom">
        <span>© {new Date().getFullYear()} AKBAR NAWASUNDA</span>
        <LanguageSwitcher pathname="/en" />
      </div>
    </footer>
  );
}

export function EnglishLink({ href, children, className = "nf-text-button" }: { href: string; children: ReactNode; className?: string }) {
  return <Link className={className} href={href}>{children}</Link>;
}

export function EnglishChannelLinks() {
  const cms = usePublicArtistContent();
  const links = publicPlatformLinks(cms.data);
  return (
    <div className="en-channel-links">
      {links.map(link => (
        <a key={link.label} href={link.href} target="_blank" rel="noreferrer"><Radio size={13} /> {link.label} <ArrowUpRight size={13} /></a>
      ))}
    </div>
  );
}
