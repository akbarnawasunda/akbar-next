import { ArrowUpRight, Mail, Menu, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { publicPlatformLinks, usePublicArtistContent } from "@/content/publicContent";
import { MobileSlideMenu } from "./MobileSlideMenu";
import "./NightFrequencyChrome.css";
import "./OfficialBrand.css";
import "./EnglishLayer.css";

const navItems = [
  { href: "/en/music", label: "MUSIC", desc: "Official discography & tracks" },
  { href: "/en/visuals", label: "VISUALS", desc: "Music videos & visual art" },
  { href: "/en/live", label: "LIVE", desc: "Tour dates & stage archive" },
  { href: "/universe", label: "ARCHIVE", desc: "Complete ecosystem catalog" },
  { href: "/en/about", label: "ABOUT", desc: "Artist biography & statement" },
  { href: "/en/epk", label: "EPK", desc: "Official press kit & curations" },
  { href: "/en/inquire", label: "CONTACT", desc: "Direct booking & inquiry" },
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

export function EnglishHeader({ active }: { active?: string }) {
  const [pathname] = useLocation();
  const resolvedActive =
    active || (pathname.startsWith("/en/music/") ? "/en/music" : pathname);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeAndReturnFocus = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

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

      <MobileSlideMenu
        open={isOpen}
        pathname={pathname}
        active={resolvedActive}
        onClose={closeAndReturnFocus}
        lang="en"
        navItems={navItems}
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
