import { ArrowUpRight, Menu, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { platformLinks } from "@/content/artistPlatform";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import "./NightFrequencyChrome.css";
import "./OfficialBrand.css";
import "./EcosystemRefinement.css";
import "@/pages/ArtistModules.css";

const navItems = [
  { href: "/music", label: "MUSIC" },
  { href: "/visuals", label: "VISUALS" },
  { href: "/live", label: "LIVE" },
  { href: "/universe", label: "ARCHIVE" },
  { href: "/about", label: "ABOUT" },
];

export function NightHeader({ active }: { active?: string }) {
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
      if (!headerRef.current?.contains(event.target as Node))
        closeAndReturnFocus();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);
  return (
    <header ref={headerRef} className="nf-nav">
      <Link className="nf-wordmark nf-wordmark-official" href="/">
        <ResilientBrandImage className="nf-brand-logo" alt="Akbar Nawasunda" />
        <span>AKBAR NAWASUNDA</span>
      </Link>
      <nav aria-label="Primary navigation">
        {navItems.map(item => (
          <Link
            key={item.href}
            className={active === item.href ? "is-active" : ""}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <a className="nf-signal" href="#signal">
        <Radio size={14} /> FAN SIGNAL
      </a>
      <button
        ref={triggerRef}
        className="nf-menu-toggle"
        type="button"
        onClick={() => setIsOpen(value => !value)}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="night-mobile-menu"
      >
        {isOpen ? <X size={19} /> : <Menu size={20} />}
      </button>
      <div
        id="night-mobile-menu"
        className={`nf-mobile-menu${isOpen ? " is-open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="nf-mobile-menu-inner">
          <span className="nf-mobile-eyebrow">AKBAR NAWASUNDA // EXPLORE</span>
          {navItems.map(item => (
            <Link
              key={item.href}
              className={active === item.href ? "is-active" : ""}
              href={item.href}
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/epk" onClick={close}>
            EPK / BOOKING
          </Link>
          <a href="#signal" onClick={close}>
            <Radio size={14} /> JOIN FAN SIGNAL
          </a>
        </div>
      </div>
    </header>
  );
}

export function NightFooter() {
  return (
    <footer className="nf-footer">
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
          AN Archive <ArrowUpRight size={13} />
        </Link>
        <Link href="/about">
          About <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="nf-footer-column">
        <span>CONNECT</span>
        {platformLinks.map(link => (
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
