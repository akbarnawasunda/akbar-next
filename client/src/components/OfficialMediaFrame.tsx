import { useEffect, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import "./OfficialMediaFrame.css";

type OfficialMediaFrameProps = {
  title: string;
  provider: "SoundCloud" | "YouTube";
  sourceUrl: string;
  embedUrl: string;
  artwork: string;
  backupArtwork?: string;
  description?: string;
};

export function OfficialMediaFrame({ title, provider, sourceUrl, embedUrl, artwork, backupArtwork, description }: OfficialMediaFrameProps) {
  const [playerRequested, setPlayerRequested] = useState(false);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [slowPlayer, setSlowPlayer] = useState(false);

  useEffect(() => {
    if (!playerRequested || playerLoaded) return;
    const timer = window.setTimeout(() => setSlowPlayer(true), 4500);
    return () => window.clearTimeout(timer);
  }, [playerLoaded, playerRequested]);

  const openPlayer = () => {
    setSlowPlayer(false);
    setPlayerLoaded(false);
    setPlayerRequested(true);
  };

  const providerClass = provider.toLowerCase().replace(/\s+/g, "-");

  return <article className={`an-official-media an-official-media-provider-${providerClass}${playerRequested ? " is-player-open" : ""}`} data-provider={provider.toLowerCase()}>
    <a className="an-official-media-art" href={sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open official ${provider} source for ${title}`}>
      <ResilientArtworkImage src={artwork} backupSrc={backupArtwork} alt={`Artwork resmi untuk ${title}`} />
      <span>OFFICIAL {provider.toUpperCase()}</span>
      <i><Play size={18} fill="currentColor" /></i>
      <b className="an-official-media-signal" aria-hidden="true"><i /><i /><i /><i /><i /></b>
    </a>
    <div className="an-official-media-copy"><p><span>{provider}</span><i aria-hidden="true" /> OFFICIAL LINK</p><h3>{title}</h3>{description && <small>{description}</small>}</div>
    <div className="an-official-media-actions"><a href={sourceUrl} target="_blank" rel="noreferrer">OPEN {provider.toUpperCase()} <ArrowUpRight size={14} /></a><button type="button" aria-expanded={playerRequested} onClick={openPlayer}>{playerRequested ? "RELOAD PLAYER" : "PLAY HERE"} <Play size={13} fill="currentColor" /></button></div>
    {playerRequested && <div className={`an-official-player${playerLoaded ? " is-loaded" : ""}`}><iframe title={`${provider} player: ${title}`} src={embedUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen onLoad={() => setPlayerLoaded(true)} />{!playerLoaded && <span>CONNECTING TO {provider.toUpperCase()}…</span>}{slowPlayer && <p>Player belum merespons di browser ini. Gunakan tombol <strong>OPEN {provider.toUpperCase()}</strong> di atas untuk membuka sumber resminya.</p>}</div>}
  </article>;
}
