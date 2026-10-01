import { useState } from "react";
import { ArrowUpRight, Play, Volume2 } from "lucide-react";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { MusicEmbed, EmbedPlatform } from "@/components/MusicEmbed";
import "./OfficialMediaFrame.css";

type OfficialMediaFrameProps = {
  title: string;
  provider: "SoundCloud" | "YouTube" | "Spotify" | string;
  sourceUrl: string;
  embedUrl: string;
  artwork: string;
  backupArtwork?: string;
  description?: string;
  locale?: "id" | "en";
};

export function OfficialMediaFrame({
  title,
  provider,
  sourceUrl,
  embedUrl,
  artwork,
  backupArtwork,
  description,
  locale = "id",
}: OfficialMediaFrameProps) {
  const t =
    locale === "en"
      ? {
          artLabel: (p: string) => `Open ${title} on ${p}`,
          official: (p: string) => `${p} · OFFICIAL LINK`,
          open: (p: string) => `OPEN ${p}`,
          close: "CLOSE PLAYER",
          play: "PLAY HERE",
          hint: "Player not responding in this browser? Use the official link above.",
        }
      : {
          artLabel: (p: string) => `Buka ${title} di ${p}`,
          official: (p: string) => `${p} · TAUTAN RESMI`,
          open: (p: string) => `BUKA ${p}`,
          close: "TUTUP PLAYER",
          play: "PUTAR DI SINI",
          hint: "Player belum merespons di browser ini? Gunakan tautan resmi di atas.",
        };
  const [playerRequested, setPlayerRequested] = useState(false);

  const togglePlayer = () => {
    setPlayerRequested(prev => !prev);
  };

  const providerClass = provider.toLowerCase().replace(/\s+/g, "-");
  const platformVariant: EmbedPlatform = provider
    .toLowerCase()
    .includes("youtube")
    ? "youtube"
    : provider.toLowerCase().includes("spotify")
      ? "spotify"
      : "soundcloud";

  return (
    <article
      className={`an-official-media an-official-media-provider-${providerClass}${
        playerRequested ? " is-player-open" : ""
      }`}
    >
      <a
        className="an-official-media-art"
        href={sourceUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={t.artLabel(provider)}
      >
        <ResilientArtworkImage
          src={artwork}
          backupSrc={backupArtwork}
          alt={`Artwork resmi untuk ${title}`}
        />
        <span>{provider.toUpperCase()}</span>
        <i>
          <Play size={18} fill="currentColor" />
        </i>
      </a>

      <div className="an-official-media-copy">
        <p>{t.official(provider.toUpperCase())}</p>
        <h3>{title}</h3>
        {description && <small>{description}</small>}
      </div>

      <div className="an-official-media-actions">
        <a href={sourceUrl} target="_blank" rel="noreferrer">
          {t.open(provider.toUpperCase())} <ArrowUpRight size={14} />
        </a>
        <button
          type="button"
          aria-expanded={playerRequested}
          onClick={togglePlayer}
        >
          {playerRequested ? (
            <>
              <Volume2 size={13} className="text-[var(--acid)]" /> {t.close}
            </>
          ) : (
            <>
              {t.play} <Play size={13} fill="currentColor" />
            </>
          )}
        </button>
      </div>

      {playerRequested && (
        <div className="an-official-player-wrap">
          <MusicEmbed
            url={embedUrl || sourceUrl}
            title={title}
            variant={platformVariant}
          />
          <p className="an-official-player-hint">{t.hint}</p>
        </div>
      )}
    </article>
  );
}
