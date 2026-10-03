import { ArrowUpRight, Menu, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BirthdayChip, StudioClock } from "./StudioClock";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import {
  publicConfirmedEvents,
  publicPlatformLinks,
  usePublicArtistContent,
} from "@/content/publicContent";
import { MobileNav } from "./MobileNav";
import "./NightFrequencyChrome.css";
import "./OfficialBrand.css";
import "./EnglishLayer.css";

/* Nav EN = cermin nav ID (Phase 3 §2 baris 6 & 15): 6 item permanen, LIVE
   mengisi slot 3 hanya saat ada jadwal terkonfirmasi, dan bug lama
   (link "ARCHIVE" menuju URL ID /universe) diperbaiki jadi /en/universe
   dengan label JOURNEY. */
const baseNavItems = [
  { href: "/en/music", label: "MUSIC", desc: "Official discography & tracks" },
  { href: "/en/visuals", label: "VISUALS", desc: "Music videos & visual art" },
  {
    href: "/en/universe",
    label: "JOURNEY",
    desc: "The two-name story & eras",
  },
  { href: "/en/about", label: "ABOUT", desc: "Artist biography & statement" },
  { href: "/en/epk", label: "EPK", desc: "Official press kit & curations" },
  { href: "/en/inquire", label: "CONTACT", desc: "Direct booking & inquiry" },
];

const liveNavItem = {
  href: "/en/live",
  label: "LIVE",
  desc: "Confirmed show dates",
};

function buildEnNavItems(hasConfirmedEvents: boolean) {
  if (!hasConfirmedEvents) return baseNavItems;
  const items = [...baseNavItems];
  items.splice(2, 0, liveNavItem);
  return items;
}

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
  const cms = usePublicArtistContent();
  const navItems = buildEnNavItems(publicConfirmedEvents(cms.data).length > 0);

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
      <header className="nf-nav en-nav">
        <Link className="nf-wordmark nf-wordmark-official" href="/en">
          <ResilientBrandImage
            className="nf-brand-logo"
            alt="Akbar Nawasunda"
            priority
          />
          <span>AKBAR NAWASUNDA</span>
        </Link>
        <nav aria-label="Primary navigation">
          {navItems.map(item => (
            <Link
              key={item.href}
              className={resolvedActive === item.href ? "is-active" : ""}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <BirthdayChip locale="en" />
        <LanguageSwitcher pathname={pathname} />
        {/* CTA utama = mendengarkan (Phase 3 §7: header mobile mempromosikan
            "Dengarkan/LISTEN" → musik). INQUIRE tetap satu tap di nav CONTACT
            dan footer, jadi tidak hilang. */}
        <Link className="nf-signal" href="/en/music">
          LISTEN <ArrowUpRight size={13} aria-hidden="true" />
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
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <MobileNav
        isOpen={isOpen}
        pathname={pathname}
        active={resolvedActive}
        onClose={closeAndReturnFocus}
        lang="en"
        navItems={baseNavItems}
        hasConfirmedEvents={
          publicConfirmedEvents(cms.data).length > 0
        }
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
        {/* Footer selalu menautkan Live (Phase 3 §7: footer set = Jadwal,
            JEDAG RUN, Privacy, platform, EPK) — kondisional hanya untuk NAV. */}
        {baseNavItems.map(item => (
          <Link key={item.href} href={item.href}>
            {item.label[0] + item.label.slice(1).toLowerCase()}{" "}
            <ArrowUpRight size={13} />
          </Link>
        ))}
        <Link href="/en/live">
          Live <ArrowUpRight size={13} />
        </Link>
        <Link href="/game/jedag-run">
          JEDAG RUN <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="nf-footer-column">
        <span>CONNECT</span>
        {links.map(link => (
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
        <span className="footer-bottom__clock">
          <StudioClock locale="en" />
          <BirthdayChip locale="en" />
        </span>
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
      {links.map(link => (
        <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
          <Radio size={13} /> {link.label} <ArrowUpRight size={13} />
        </a>
      ))}
    </div>
  );
}
