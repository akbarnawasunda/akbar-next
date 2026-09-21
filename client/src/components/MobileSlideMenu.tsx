import { ArrowUpRight, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import "./NightFrequencyChrome.css";

export interface NavItemConfig {
  href: string;
  label: string;
  desc?: string;
}

export const defaultIdNavItems: NavItemConfig[] = [
  { href: "/music", label: "MUSIC", desc: "Diskografi & rilisan resmi" },
  { href: "/visuals", label: "VISUALS", desc: "Video musik & galeri artwork" },
  { href: "/live", label: "LIVE", desc: "Jadwal panggung & arsip" },
  { href: "/universe", label: "ARCHIVE", desc: "Ekosistem & arsip komplit" },
  { href: "/about", label: "ABOUT", desc: "Profil & perjalanan musisi" },
  { href: "/epk", label: "EPK", desc: "Press kit resmi & kurasi" },
  { href: "/inquire", label: "CONTACT", desc: "Booking & inquiry langsung" },
];

export const defaultEnNavItems: NavItemConfig[] = [
  { href: "/en/music", label: "MUSIC", desc: "Official discography & tracks" },
  { href: "/en/visuals", label: "VISUALS", desc: "Music videos & visual artwork" },
  { href: "/en/live", label: "LIVE", desc: "Stage tour dates & archive" },
  { href: "/universe", label: "ARCHIVE", desc: "Complete ecosystem catalog" },
  { href: "/en/about", label: "ABOUT", desc: "Artist biography & statement" },
  { href: "/en/epk", label: "EPK", desc: "Official press kit & curations" },
  { href: "/en/inquire", label: "CONTACT", desc: "Direct booking & inquiry" },
];

function LanguageToggle({ pathname }: { pathname: string }) {
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const idPath = isEnglish ? pathname.replace(/^\/en/, "") || "/" : pathname;
  const englishPath = isEnglish ? pathname : pathname === "/" ? "/en" : `/en${pathname}`;

  return (
    <div className="nf-mobile-drawer-lang-toggle" aria-label="Pilihan bahasa">
      <Link
        className={`nf-mobile-lang-btn ${!isEnglish ? "is-active" : ""}`}
        href={idPath}
        aria-current={!isEnglish ? "page" : undefined}
      >
        ID
      </Link>
      <span className="nf-mobile-lang-divider" aria-hidden="true">/</span>
      <Link
        className={`nf-mobile-lang-btn ${isEnglish ? "is-active" : ""}`}
        href={englishPath}
        aria-current={isEnglish ? "page" : undefined}
      >
        EN
      </Link>
    </div>
  );
}

export interface MobileSlideMenuProps {
  open: boolean;
  pathname: string;
  active?: string;
  onClose: () => void;
  lang?: "id" | "en";
  navItems?: NavItemConfig[];
}

export function MobileSlideMenu({
  open,
  pathname,
  active,
  onClose,
  lang = "id",
  navItems = lang === "en" ? defaultEnNavItems : defaultIdNavItems,
}: MobileSlideMenuProps) {
  const [mounted, setMounted] = useState(open);
  const [animating, setAnimating] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Mount/unmount lifecycle for smooth slide-in and slide-out CSS transitions
  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame1 = window.requestAnimationFrame(() => {
        const frame2 = window.requestAnimationFrame(() => {
          setAnimating(true);
        });
        return () => window.cancelAnimationFrame(frame2);
      });
      return () => window.cancelAnimationFrame(frame1);
    } else {
      setAnimating(false);
      const timer = window.setTimeout(() => {
        setMounted(false);
      }, 320);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  // Lock background scroll when open
  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
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
  }, [mounted]);

  // Keyboard navigation & accessibility focus trap
  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;

    const getFocusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const focusTimer = window.setTimeout(() => {
      getFocusable()[0]?.focus();
    }, 60);

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
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onClose]);

  // Touch gesture: swipe right on drawer panel to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

    // If swiped to the right by at least 45px and predominantly horizontal
    if (deltaX > 45 && deltaX > deltaY * 1.3) {
      onClose();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!mounted || typeof document === "undefined") return null;

  const signalHref = lang === "en" ? "/en#signal" : "#signal";

  return createPortal(
    <div
      ref={dialogRef}
      id={lang === "en" ? "english-mobile-menu" : "night-mobile-menu"}
      className={`nf-mobile-drawer-root ${animating ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={lang === "en" ? "Mobile navigation menu" : "Menu navigasi mobile"}
    >
      {/* Dimmed backdrop blur scrim */}
      <div
        className="nf-mobile-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out drawer panel */}
      <aside
        ref={panelRef}
        className="nf-mobile-drawer-panel"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drawer Header */}
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
            className="nf-mobile-drawer-close"
            type="button"
            onClick={onClose}
            aria-label={lang === "en" ? "Close navigation" : "Tutup navigasi"}
          >
            <X size={16} aria-hidden="true" />
            <span>{lang === "en" ? "CLOSE" : "TUTUP"}</span>
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="nf-mobile-drawer-body">
          <div className="nf-mobile-drawer-eyebrow">
            <span>{lang === "en" ? "NAVIGATION // ROUTES" : "NAVIGASI // JALUR UTAMA"}</span>
          </div>

          <nav
            className="nf-mobile-drawer-nav"
            aria-label={lang === "en" ? "Navigation links" : "Daftar navigasi"}
          >
            {navItems.map((item, index) => {
              const isActive = active === item.href;
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

          {/* Dedicated Signal Action */}
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

        {/* Drawer Footer */}
        <div className="nf-mobile-drawer-footer">
          <div className="nf-mobile-drawer-footer-row">
            <span className="nf-mobile-drawer-meta-tag">
              {lang === "en" ? "LANGUAGE" : "PILIH BAHASA"}
            </span>
            <LanguageToggle pathname={pathname} />
          </div>

          <div className="nf-mobile-drawer-footer-bottom">
            <span className="nf-mobile-drawer-meta-sub">PRODUCER / INDONESIA</span>
            <span className="nf-mobile-drawer-swipe-hint" aria-hidden="true">
              {lang === "en" ? "Slide right to dismiss →" : "Geser ke kanan untuk tutup →"}
            </span>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
