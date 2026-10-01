import { ChevronDown, ChevronUp, ExternalLink, Pause, Play, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { soundcloudEmbedUrl } from "@/components/MusicEmbed";
import { currentRelease } from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import { useSignatureRuntime, useSignatureState } from "@/signature/useSignature";
import type { AudioTrack } from "@/signature/types";
import "./GlobalAudioPlayer.css";

/**
 * Player audio global yang persisten lintas route.
 *
 * Hidup di PublicShell, bukan di halaman, jadi navigasi tidak me-restart
 * pemutaran. State disimpan di sessionStorage, tetapi pemutaran TIDAK pernah
 * dilanjutkan otomatis tanpa interaksi baru: tidak ada autoplay.
 *
 * Sumbernya iframe SoundCloud resmi (visual=false). Audio dari iframe pihak
 * ketiga tidak bisa dianalisis dari halaman ini, jadi runtime menandai
 * `analyzable=false` dan waveform memakai ketukan deterministik — bukan
 * klaim data audio nyata.
 */

const STATE_KEY = "an-player-state";

function readStoredState() {
  try {
    return sessionStorage.getItem(STATE_KEY);
  } catch {
    return null;
  }
}

export function GlobalAudioPlayer() {
  const { store, actions } = useSignatureRuntime();
  const cms = usePublicArtistContent();
  const shelfId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const state = useSignatureState(snapshot => snapshot.audio.state);
  const analyzable = useSignatureState(snapshot => snapshot.audio.analyzable);
  const lang = useSignatureState(snapshot => snapshot.route.lang);

  const cmsRelease = useMemo(() => {
    const releases = cms.data?.releases ?? [];
    return releases.find(item => item.isCurrent) || releases[0];
  }, [cms.data]);

  const track: AudioTrack = useMemo(
    () => ({
      id: cmsRelease?._id || "current-release",
      title: cmsRelease?.title || currentRelease.title,
      subtitle:
        cmsRelease?.platform || cmsRelease?.format || currentRelease.type,
      sourceUrl: cmsRelease?.url || currentRelease.href,
      embedUrl: soundcloudEmbedUrl(cmsRelease?.url || currentRelease.href),
      artwork: cmsRelease?.artworkUrl || currentRelease.image,
    }),
    [cmsRelease]
  );

  // Client-only: tidak pernah ikut ke HTML SSR.
  useEffect(() => {
    setMounted(true);
    const stored = readStoredState();
    if (stored === "closed") {
      actions.setAudioState("closed");
    } else if (stored === "minimized") {
      actions.setAudioState("minimized");
    }
  }, [actions]);

  // Penanda di root: layar kecil memakai ini untuk menyisakan ruang bawah,
  // supaya bilah player yang melayang tidak menimbun footer.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (state === "closed") {
      delete root.dataset.anPlayer;
      delete root.dataset.anPlayerShelf;
      return;
    }
    root.dataset.anPlayer = "visible";
    root.dataset.anPlayerShelf =
      state === "loading" || state === "playing" || state === "paused"
        ? "open"
        : "closed";
    return () => {
      delete root.dataset.anPlayer;
      delete root.dataset.anPlayerShelf;
    };
  }, [mounted, state]);

  // Amplitudo → CSS var, dibaca waveform tanpa render React.
  useEffect(() => {
    if (!mounted) return;
    if (state !== "playing" && state !== "loading") return;
    const node = rootRef.current;
    if (!node) return;
    let frame = 0;
    const loop = () => {
      node.style.setProperty(
        "--an-amp",
        store.signals.amplitude.toFixed(3)
      );
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [mounted, state, store]);

  if (!mounted || state === "closed") return null;

  const copy =
    lang === "en"
      ? {
          label: "NOW PLAYING",
          play: "Play latest release",
          pause: "Stop playback",
          expand: "Open player shelf",
          collapse: "Minimise player",
          close: "Close player",
          open: "Open on SoundCloud",
          note: "Waveform follows a deterministic beat — third-party embeds cannot be analysed.",
          idle: "Latest release",
        }
      : {
          label: "SEDANG DIPUTAR",
          play: "Putar rilisan terbaru",
          pause: "Hentikan pemutaran",
          expand: "Buka rak player",
          collapse: "Kecilkan player",
          close: "Tutup player",
          open: "Buka di SoundCloud",
          note: "Waveform memakai ketukan deterministik — embed pihak ketiga tidak bisa dianalisis.",
          idle: "Rilisan terbaru",
        };

  const expanded = state === "loading" || state === "playing" || state === "paused";
  const playing = state === "playing" || state === "loading";

  const togglePlayback = () => {
    if (playing) {
      setAutoPlay(false);
      actions.setAudioState("paused");
      return;
    }
    setHasOpened(true);
    setAutoPlay(true);
    actions.openTrack(track);
  };

  return (
    <aside
      ref={rootRef}
      className="an-global-player"
      data-player-state={state}
      data-analyzable={analyzable ? "true" : "false"}
      aria-label={lang === "en" ? "Global audio player" : "Pemutar audio global"}
    >
      <div className="an-global-player-bar">
        <button
          type="button"
          className="an-global-player-toggle"
          onClick={togglePlayback}
          aria-label={playing ? copy.pause : copy.play}
          data-signal-interactive
        >
          {playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
        </button>

        <span className="an-global-player-wave" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, index) => (
            <i key={index} style={{ animationDelay: `${index * 70}ms` }} />
          ))}
        </span>

        <span className="an-global-player-meta">
          <span className="an-global-player-label">
            {playing ? copy.label : copy.idle}
          </span>
          <strong>{track.title}</strong>
        </span>

        <a
          className="an-global-player-link"
          href={track.sourceUrl}
          target="_blank"
          rel="noreferrer"
          data-signal-interactive
        >
          {copy.open} <ExternalLink size={12} aria-hidden="true" />
        </a>

        <button
          type="button"
          className="an-global-player-icon"
          aria-expanded={expanded}
          aria-controls={shelfId}
          aria-label={expanded ? copy.collapse : copy.expand}
          onClick={() =>
            actions.setAudioState(expanded ? "minimized" : "paused")
          }
          data-signal-interactive
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        <button
          type="button"
          className="an-global-player-icon"
          aria-label={copy.close}
          onClick={() => {
            setAutoPlay(false);
            actions.setAudioState("closed");
          }}
          data-signal-interactive
        >
          <X size={14} />
        </button>
      </div>

      <div className="an-global-player-shelf" id={shelfId} data-open={expanded}>
        <div className="an-global-player-shelf-inner">
          {hasOpened && expanded ? (
            <iframe
              title={`SoundCloud player: ${track.title}`}
              src={`${track.embedUrl}${autoPlay ? "&auto_play=true" : ""}`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="autoplay; encrypted-media"
              onLoad={() => {
                if (autoPlay) actions.setAudioState("playing");
              }}
            />
          ) : null}
          <p className="an-global-player-note">{copy.note}</p>
        </div>
      </div>
    </aside>
  );
}
