import React, { useState, useEffect } from "react";
import { ExternalLink, Play, Radio, Volume2 } from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import "./MusicEmbed.css";

export type EmbedPlatform = "spotify" | "soundcloud" | "youtube";

export interface MusicEmbedProps {
  url: string;
  title: string;
  variant?: EmbedPlatform;
  compact?: boolean;
  className?: string;
  onLoaded?: () => void;
  allowAutoplay?: boolean;
}

export function detectEmbedPlatform(url: string): EmbedPlatform {
  if (/spotify\.com/i.test(url)) return "spotify";
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  return "soundcloud";
}

/**
 * Format embed URL safely per platform
 */
export function formatEmbedUrl(url: string, platform: EmbedPlatform): string {
  if (platform === "youtube") {
    // Check if it's already an embed URL
    if (url.includes("/embed/")) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const id = match ? match[1] : url;
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
  }

  if (platform === "spotify") {
    if (url.includes("open.spotify.com/embed")) return url;
    // Transform open.spotify.com/track/XYZ -> open.spotify.com/embed/track/XYZ
    return url.replace("open.spotify.com/", "open.spotify.com/embed/");
  }

  if (platform === "soundcloud") {
    if (url.includes("w.soundcloud.com/player")) return url;
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
      url
    )}&color=%2300d4ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  }

  return url;
}

/**
 * Unified, responsive, platform-aware MusicEmbed component
 */
export function MusicEmbed({
  url,
  title,
  variant,
  compact = false,
  className = "",
  onLoaded,
}: MusicEmbedProps) {
  const platform = variant || detectEmbedPlatform(url);
  const embedSrc = formatEmbedUrl(url, platform);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setIsSlow(false);
    const timer = window.setTimeout(() => {
      setIsSlow(true);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [embedSrc]);

  const handleIframeLoad = () => {
    setIsLoaded(true);
    setIsSlow(false);
    onLoaded?.();
  };

  return (
    <div
      className={`an-music-embed an-embed-${platform} ${compact ? "is-compact" : ""} ${
        isLoaded ? "is-loaded" : "is-loading"
      } ${className}`}
      data-platform={platform}
    >
      <div className="an-embed-frame-wrap">
        <iframe
          title={`${platform} player: ${title}`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleIframeLoad}
        />

        {!isLoaded && (
          <div className="an-embed-placeholder" aria-hidden="true">
            <div className="an-embed-pulse">
              <div className="an-embed-equalizer">
                <span className="an-eq-bar an-eq-1" />
                <span className="an-eq-bar an-eq-2" />
                <span className="an-eq-bar an-eq-3" />
                <span className="an-eq-bar an-eq-4" />
                <span className="an-eq-bar an-eq-5" />
              </div>
              <p className="an-embed-loading-text">
                <Radio size={13} className="text-[var(--acid)]" /> MEMUAT PLAYER {platform.toUpperCase()}…
              </p>
            </div>
          </div>
        )}
      </div>

      {isSlow && !isLoaded && (
        <div className="an-embed-fallback-bar">
          <span>Koneksi player lambat atau diblokir browser.</span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="an-embed-fallback-btn"
          >
            BUKA DI {platform.toUpperCase()} <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * MusicEmbedContainer: Provides standardized spacing, header, and description wrapper
 */
export function MusicEmbedContainer({
  title,
  subtitle,
  children,
  badge = "STREAMING RESMI",
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  badge?: string;
  className?: string;
}) {
  return (
    <div className={`an-music-embed-container ${className}`}>
      {(title || subtitle) && (
        <div className="an-embed-container-header">
          {badge && <span className="an-embed-badge">{badge}</span>}
          {title && <h3 className="an-embed-container-title">{title}</h3>}
          {subtitle && <p className="an-embed-container-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="an-embed-container-body">{children}</div>
    </div>
  );
}

/**
 * MusicEmbedCard: Rich presentation card pairing artwork/meta with a stable player
 */
export interface MusicEmbedCardProps {
  title: string;
  platform: EmbedPlatform | string;
  embedUrl: string;
  sourceUrl: string;
  artwork: string;
  backupArtwork?: string;
  meta?: string;
  badge?: string;
  description?: string;
  initialOpen?: boolean;
}

export function MusicEmbedCard({
  title,
  platform,
  embedUrl,
  sourceUrl,
  artwork,
  backupArtwork,
  meta,
  badge,
  description,
  initialOpen = false,
}: MusicEmbedCardProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const validPlatform = (["spotify", "soundcloud", "youtube"].includes(platform.toLowerCase())
    ? platform.toLowerCase()
    : detectEmbedPlatform(embedUrl || sourceUrl)) as EmbedPlatform;

  return (
    <article className={`an-music-embed-card an-embed-card-${validPlatform} ${isOpen ? "is-active" : ""}`}>
      <div className="an-embed-card-header">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="an-embed-card-art-wrap"
          aria-label={`Buka ${title} di ${validPlatform}`}
        >
          <ResilientArtworkImage
            src={artwork}
            backupSrc={backupArtwork}
            alt={`Artwork ${title}`}
            className="an-embed-card-art"
          />
          <span className="an-embed-card-art-play">
            <Play size={18} fill="currentColor" />
          </span>
        </a>

        <div className="an-embed-card-info">
          <div className="an-embed-card-tags">
            <span className="an-embed-card-platform-tag">
              <PlatformIcon label={validPlatform} /> {validPlatform.toUpperCase()}
            </span>
            {badge && <span className="an-embed-card-extra-tag">{badge}</span>}
            {meta && <span className="an-embed-card-meta-tag">{meta}</span>}
          </div>

          <h3 className="an-embed-card-title">{title}</h3>
          {description && <p className="an-embed-card-desc">{description}</p>}

          <div className="an-embed-card-actions">
            <button
              type="button"
              className={`an-embed-btn-play ${isOpen ? "is-playing" : ""}`}
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <>
                  <Volume2 size={13} className="text-[var(--acid)]" /> TUTUP PLAYER
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" /> PUTAR DI SINI
                </>
              )}
            </button>

            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="an-embed-btn-external"
            >
              BUKA {validPlatform.toUpperCase()} <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="an-embed-card-player-shelf">
          <MusicEmbed
            url={embedUrl || sourceUrl}
            title={title}
            variant={validPlatform}
          />
        </div>
      )}
    </article>
  );
}
