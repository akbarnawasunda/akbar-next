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
};

export function OfficialMediaFrame({
  title,
  provider,
  sourceUrl,
  embedUrl,
  artwork,
  backupArtwork,
  description,
}: OfficialMediaFrameProps) {
  const [playerRequested, setPlayerRequested] = useState(false);

  const togglePlayer = () => {
    setPlayerRequested((prev) => !prev);
  };

  const providerClass = provider.toLowerCase().replace(/\s+/g, "-");
  const platformVariant: EmbedPlatform =
    provider.toLowerCase().includes("youtube") ? "youtube" :
    provider.toLowerCase().includes("spotify") ? "spotify" : "soundcloud";

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
        aria-label={`Lihat karya ${title} di ${provider}`}
      >
        <ResilientArtworkImage
          src={artwork}
          backupSrc={backupArtwork}
          alt={`Artwork resmi untuk ${title}`}
        />
        <span>OFFICIAL {provider.toUpperCase()}</span>
        <i>
          <Play size={18} fill="currentColor" />
        </i>
      </a>

      <div className="an-official-media-copy">
        <p>{provider.toUpperCase()} · OFFICIAL LINK</p>
        <h3>{title}</h3>
        {description && <small>{description}</small>}
      </div>

      <div className="an-official-media-actions">
        <a href={sourceUrl} target="_blank" rel="noreferrer">
          OPEN {provider.toUpperCase()} <ArrowUpRight size={14} />
        </a>
        <button
          type="button"
          aria-expanded={playerRequested}
          onClick={togglePlayer}
        >
          {playerRequested ? (
            <>
              <Volume2 size={13} className="text-[var(--acid)]" /> TUTUP PLAYER
            </>
          ) : (
            <>
              PLAY HERE <Play size={13} fill="currentColor" />
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
        </div>
      )}
    </article>
  );
}
