import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Radio, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import "./NightFrequencyChrome.css";

export interface MobileNavItem {
  href: string;
  label: string;
  desc?: string;
}

export const defaultIdNavItems: MobileNavItem[] = [
  { href: "/music", label: "MUSIC", desc: "Diskografi & rilisan resmi" },
  { href: "/visuals", label: "VISUALS", desc: "Video musik & galeri artwork" },
  { href: "/live", label: "LIVE", desc: "Jadwal panggung & arsip" },
  { href: "/universe", label: "ARCHIVE", desc: "Ekosistem & arsip komplit" },
  { href: "/about", label: "ABOUT", desc: "Profil & perjalanan musisi" },
  { href: "/epk", label: "EPK", desc: "Press kit resmi & kurasi" },
  { href: "/inquire", label: "CONTACT", desc: "Booking & inquiry langsung" },
];

export const defaultEnNavItems: MobileNavItem[] = [
  { href: "/en/music", label: "MUSIC", desc: "Official discography & tracks" },
  { href: "/en/visuals", label: "VISUALS", desc: "Music videos & visual artwork" },
  { href: "/en/live", label: "LIVE", desc: "Stage tour dates & archive" },
  { href: "/universe", label: "ARCHIVE", desc: "Complete ecosystem catalog" },
  { href: "/en/about", label: "ABOUT", desc: "Artist biography & statement" },
  { href: "/en/epk", label: "EPK", desc: "Official press kit & curations" },
  { href: "/en/inquire", label: "CONTACT", desc: "Direct booking & inquiry" },
];

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  pathname?: string;
  active?: string;
  lang?: "id" | "en";
  navItems?: MobileNavItem[];
}

function MobileLanguageToggle({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const idPath = isEnglish ? pathname.replace(/^\/en/, "") || "/" : pathname;
  const englishPath = isEnglish ? pathname : pathname === "/" ? "/en" : `/en${pathname}`;

  return (
    <div className="nf-mobile-drawer-lang-toggle" aria-label="Language selection / Pilihan bahasa">
      <Link
        className={`nf-mobile-lang-btn ${!isEnglish ? "is-active" : ""}`}
        href={idPath}
        onClick={onClose}
        aria-current={!isEnglish ? "page" : undefined}
      >
        ID
      </Link>
      <span className="nf-mobile-lang-divider" aria-hidden="true">/</span>
      <Link
        className={`nf-mobile-lang-btn ${isEnglish ? "is-active" : ""}`}
        href={englishPath}
        onClick={onClose}
        aria-current={isEnglish ? "page" : undefined}
      >
        EN
      </Link>
    </div>
  );
}

/**
 * Slide-out Mobile Navigation Drawer powered by Framer Motion.
 * Triggered by hamburger button on mobile screens (< 768px).
 * Locks body scrolling while active, handles keyboard trap,
 * and auto-closes if viewport expands past 768px.
 */
export function MobileNav({
  isOpen,
  onClose,
  pathname: customPathname,
  active,
  lang = "id",
  navItems = lang === "en" ? defaultEnNavItems : defaultIdNavItems,
}: MobileNavProps) {
  const [currentLocation] = useLocation();
  const pathname = customPathname ?? currentLocation;
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile navigation drawer is open
  useLockBodyScroll(isOpen);

  // Auto-close if screen resizes to desktop breakpoint (>= 768px)
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        onClose();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onClose]);

  // Keyboard accessibility: Escape to close & Tab navigation focus trap
  useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  const signalHref = lang === "en" ? "/en#signal" : "#signal";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          id={lang === "en" ? "english-mobile-menu" : "night-mobile-menu"}
          className="nf-mobile-drawer-root is-open"
          role="dialog"
          aria-modal="true"
          aria-label={lang === "en" ? "Mobile Navigation Menu" : "Menu Navigasi Mobile"}
        >
          {/* Backdrop Scrim */}
          <motion.div
            key="mobile-nav-backdrop"
            className="nf-mobile-drawer-backdrop"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          />

          {/* Slide-out Drawer Panel */}
          <motion.aside
            key="mobile-nav-panel"
            ref={panelRef}
            className="nf-mobile-drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="nf-mobile-drawer-header">
              <div className="nf-mobile-drawer-brand">
                <ResilientBrandImage
                  className="nf-mobile-drawer-logo"
                  alt="Akbar Nawasunda"
                />
                <div className="nf-mobile-drawer-brand-text">
                  <strong>AKBAR NAWASUNDA</strong>
                  <span>{lang === "en" ? "OFFICIAL PORTAL" : "SITUS RESMI"}</span>
                </div>
              </div>

              <button
                ref={closeBtnRef}
                className="nf-mobile-drawer-close"
                type="button"
                onClick={onClose}
                aria-label={lang === "en" ? "Close navigation" : "Tutup navigasi"}
              >
                <X size={16} aria-hidden="true" />
                <span>{lang === "en" ? "CLOSE" : "TUTUP"}</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="nf-mobile-drawer-body">
              <div className="nf-mobile-drawer-eyebrow">
                <span>{lang === "en" ? "NAVIGATION // ROUTES" : "NAVIGASI // JALUR UTAMA"}</span>
              </div>

              {/* Navigation Links */}
              <nav
                className="nf-mobile-drawer-nav"
                aria-label={lang === "en" ? "Primary mobile navigation" : "Navigasi mobile"}
              >
                {navItems.map((item, index) => {
                  const isActive = active === item.href || pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      className={`nf-mobile-drawer-link ${isActive ? "is-active" : ""}`}
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="nf-mobile-drawer-link-main">
                        <span className="nf-mobile-drawer-link-index" aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="nf-mobile-drawer-link-info">
                          <span className="nf-mobile-drawer-link-title">
                            {item.label}
                          </span>
                          {item.desc && (
                            <span className="nf-mobile-drawer-link-desc">
                              {item.desc}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight
                        className="nf-mobile-drawer-link-arrow"
                        size={16}
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* Fan Signal Callout */}
              <div className="nf-mobile-drawer-signal-block">
                <a
                  className="nf-mobile-drawer-signal-btn"
                  href={signalHref}
                  onClick={onClose}
                >
                  <div className="nf-mobile-drawer-signal-left">
                    <span className="nf-signal-live-beacon" aria-hidden="true" />
                    <Radio size={15} aria-hidden="true" />
                    <div className="nf-mobile-drawer-signal-copy">
                      <strong>{lang === "en" ? "FAN SIGNAL" : "KABAR TERBARU"}</strong>
                      <small>
                        {lang === "en"
                          ? "Direct drops, tour dates & secret audio"
                          : "Akses rilis awal, tiket, & audio eksklusif"}
                      </small>
                    </div>
                  </div>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="nf-mobile-drawer-footer">
              <div className="nf-mobile-drawer-footer-row">
                <span className="nf-mobile-drawer-meta-tag">
                  {lang === "en" ? "LANGUAGE" : "PILIH BAHASA"}
                </span>
                <MobileLanguageToggle pathname={pathname} onClose={onClose} />
              </div>

              <div className="nf-mobile-drawer-footer-bottom">
                <span className="nf-mobile-drawer-meta-sub">PRODUCER / INDONESIA</span>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
