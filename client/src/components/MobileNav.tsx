import { ArrowUpRight, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import "./NightFrequencyChrome.css";

export interface MobileNavItem {
  href: string;
  label: string;
  desc?: string;
}

/* Drawer mobile = 6 item datar (Phase 3 §7), tanpa nesting:
   Musik · Visual · Perjalanan · Tentang · EPK · Kontak. "Jadwal" tidak
   permanen: ia menjadi baris ke-7 (ditambahkan di ujung) hanya saat CMS
   punya jadwal terkonfirmasi. Label "Arsip" pensiun — itu Perjalanan. */
export const defaultIdNavItems: MobileNavItem[] = [
  { href: "/music", label: "Musik", desc: "Diskografi & rilisan resmi" },
  { href: "/visuals", label: "Visual", desc: "Video musik & galeri artwork" },
  { href: "/universe", label: "Perjalanan", desc: "Dua nama, satu cerita" },
  { href: "/about", label: "Tentang", desc: "Profil & cerita di balik nama" },
  { href: "/epk", label: "EPK", desc: "Press kit resmi" },
  { href: "/inquire", label: "Kontak", desc: "Booking & kerja sama" },
];

export const defaultEnNavItems: MobileNavItem[] = [
  { href: "/en/music", label: "Music", desc: "Official discography & tracks" },
  {
    href: "/en/visuals",
    label: "Visuals",
    desc: "Music videos & visual artwork",
  },
  {
    href: "/en/universe",
    label: "Journey",
    desc: "The two-name story & eras",
  },
  { href: "/en/about", label: "About", desc: "Artist biography & statement" },
  { href: "/en/epk", label: "EPK", desc: "Official press kit & curations" },
  { href: "/en/inquire", label: "Contact", desc: "Direct booking & inquiry" },
];

const scheduleIdNavItem: MobileNavItem = {
  href: "/live",
  label: "Jadwal",
  desc: "Jadwal panggung yang terkonfirmasi",
};

const scheduleEnNavItem: MobileNavItem = {
  href: "/en/live",
  label: "Live",
  desc: "Confirmed show dates",
};

/** Tambahkan baris jadwal (baris 7, di ujung) hanya jika ada jadwal
    terkonfirmasi — aturan yang sama dengan nav desktop. */
export function withScheduleItem(
  items: MobileNavItem[],
  lang: "id" | "en",
  hasConfirmedEvents: boolean,
): MobileNavItem[] {
  if (!hasConfirmedEvents) return items;
  return [...items, lang === "en" ? scheduleEnNavItem : scheduleIdNavItem];
}

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  pathname?: string;
  active?: string;
  lang?: "id" | "en";
  navItems?: MobileNavItem[];
  /** Kalau true, baris "Jadwal/Live" ditambahkan di ujung drawer (baris 7). */
  hasConfirmedEvents?: boolean;
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
  const englishPath = isEnglish
    ? pathname
    : pathname === "/"
      ? "/en"
      : `/en${pathname}`;

  return (
    <div
      className="nf-mobile-drawer-lang-toggle"
      aria-label="Language selection / Pilihan bahasa"
    >
      <Link
        className={`nf-mobile-lang-btn ${!isEnglish ? "is-active" : ""}`}
        href={idPath}
        onClick={onClose}
        aria-current={!isEnglish ? "page" : undefined}
      >
        ID
      </Link>
      <span className="nf-mobile-lang-divider" aria-hidden="true">
        /
      </span>
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
 * Responsive mobile navigation drawer.
 * Triggered by the site header and animated with CSS.
 * Locks body scrolling while active, handles keyboard focus,
 * and auto-closes if the viewport expands beyond the 1080px menu breakpoint.
 */
export function MobileNav({
  isOpen,
  onClose,
  pathname: customPathname,
  active,
  lang = "id",
  navItems,
  hasConfirmedEvents = false,
}: MobileNavProps) {
  const baseItems = navItems ?? (lang === "en" ? defaultEnNavItems : defaultIdNavItems);
  // Baris jadwal hanya muncul (di ujung) kalau ada jadwal terkonfirmasi.
  const items = withScheduleItem(baseItems, lang, hasConfirmedEvents);
  const currentLocation = usePathname() || "/";
  const pathname = customPathname ?? currentLocation;
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isEntered, setIsEntered] = useState(isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  // CSS owns the drawer transition. Keep it mounted briefly on close so the
  // panel can slide away without shipping a JavaScript animation runtime.
  useEffect(() => {
    let frame = 0;
    let timeout = 0;
    if (isOpen) {
      setShouldRender(true);
      frame = window.requestAnimationFrame(() => setIsEntered(true));
    } else {
      setIsEntered(false);
      timeout = window.setTimeout(() => setShouldRender(false), 280);
    }
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [isOpen]);

  // Lock body scroll when mobile navigation drawer is open
  useLockBodyScroll(isOpen);

  // Auto-close only once the responsive header returns to its desktop layout.
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      if (window.innerWidth > 1080) {
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

  if (!mounted || typeof document === "undefined" || (!shouldRender && !isOpen))
    return null;

  /* Tujuan "Kabar Terbaru" = papan signal di beranda. Pakai path absolut
     supaya tautan ini hidup dari halaman mana pun (Home.tsx men-scroll ke
     target hash-nya setelah rute berganti). */
  const signalHref = lang === "en" ? "/en#signal" : "/#signal";
  const drawerOpen = isOpen && isEntered;

  return createPortal(
    <div
      id={lang === "en" ? "english-mobile-menu" : "night-mobile-menu"}
      className={`nf-mobile-drawer-root${drawerOpen ? " is-open" : ""}`}
      data-open={drawerOpen ? "true" : "false"}
      role="dialog"
      aria-hidden={!isOpen}
      aria-modal={isOpen || undefined}
      inert={!isOpen}
      aria-label={
        lang === "en" ? "Mobile Navigation Menu" : "Menu Navigasi Mobile"
      }
    >
      {/* Backdrop Scrim */}
      <div
        className="nf-mobile-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <aside ref={panelRef} className="nf-mobile-drawer-panel">
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
        <div className="nf-mobile-drawer-body" data-lenis-prevent>
          <div className="nf-mobile-drawer-eyebrow">
            <span>
              {lang === "en"
                ? "NAVIGATION · DIRECT ROUTES"
                : "NAVIGASI · JALUR UTAMA"}
            </span>
          </div>

          {/* Navigation Links */}
          <nav
            className="nf-mobile-drawer-nav"
            aria-label={
              lang === "en" ? "Primary mobile navigation" : "Navigasi mobile"
            }
          >
            {items.map((item, index) => {
              const isActive = active === item.href || pathname === item.href;
              const label =
                item.label === "EPK"
                  ? item.label
                  : `${item.label.charAt(0)}${item.label.slice(1).toLowerCase()}`;
              return (
                <Link
                  key={item.href}
                  className={`nf-mobile-drawer-link ${isActive ? "is-active" : ""}`}
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="nf-mobile-drawer-link-main">
                    <span
                      className="nf-mobile-drawer-link-index"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="nf-mobile-drawer-link-info">
                      <span className="nf-mobile-drawer-link-title">
                        {label}
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
                  <strong>
                    {lang === "en" ? "FAN SIGNAL" : "KABAR TERBARU"}
                  </strong>
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
            <span className="nf-mobile-drawer-meta-sub">
              PRODUCER / INDONESIA
            </span>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
