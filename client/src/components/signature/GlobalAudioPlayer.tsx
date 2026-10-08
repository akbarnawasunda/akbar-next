import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Pause,
  Play,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "wouter";
import { soundcloudEmbedUrl } from "@/components/MusicEmbed";
import { currentRelease } from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import {
  useSignatureRuntime,
  useSignatureState,
} from "@/signature/useSignature";
import type { AudioTrack } from "@/signature/types";
import "./GlobalAudioPlayer.css";

/**
 * Pemutar global: satu permukaan dengar untuk seluruh situs.
 *
 * Model interaksinya (lihat DESIGN.md §12 dan Section 15 di docs/design-reference/martin-garrix-reference-analysis.md):
 * - Tidak tampil saat pengunjung baru tiba. Bilah muncul hanya setelah ada
 *   sesuatu yang diputar, supaya tidak menjadi widget yang menutupi katalog.
 * - Dimulai dari tombol "Putar di sini" di dokumen rilisan beranda lewat
 *   `requestLatestReleasePlayback()`, jadi hanya ada satu pemutar, bukan
 *   embed sebaris ditambah bilah melayang.
 * - Bilah berada di tepi bawah dan selebar layar. Rak embed terbuka ke atas,
 *   jadi tombol kontrol tidak pernah pindah dari tepi bawah.
 * - Di rute JEDAG RUN bilah disembunyikan dan pemutaran dijeda: game punya
 *   ruangnya sendiri dan tidak boleh berebut dengan audio lain.
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
const PLAY_LATEST_EVENT = "an-player:play-latest";
/** Dua arah eksklusi antara bilah dok dan pemutar sematan di kartu. */
export const DOCK_STOP_EVENT = "an-player:dock-stop";
export const INLINE_STOP_EVENT = "an-player:inline-stop";

/** Dipanggil dari dokumen rilisan: buka dan putar rilisan terbaru. */
export function requestLatestReleasePlayback() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PLAY_LATEST_EVENT));
}

/** Rute JEDAG RUN (ID dan EN). */
export function isGameRoute(path: string) {
  return /^(\/en)?\/game(\/|$)/.test(path);
}

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
  const [location] = useLocation();
  const onGame = isGameRoute(location);

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

  const playing = state === "playing" || state === "loading";
  const expanded =
    state === "loading" || state === "playing" || state === "paused";

  const togglePlayback = useCallback(() => {
    if (playing) {
      setAutoPlay(false);
      actions.setAudioState("paused");
      return;
    }
    // Satu aliran pada satu waktu: pemutar sematan di kartu musik ditutup dulu.
    window.dispatchEvent(new Event(INLINE_STOP_EVENT));
    setHasOpened(true);
    setAutoPlay(true);
    actions.openTrack(track);
  }, [actions, playing, track]);

  // Pemutar sematan kartu dibuka: bilah ini berhenti (rak embed ikut lepas).
  useEffect(() => {
    const onInlineOpen = () => {
      if (state === "loading" || state === "playing" || state === "paused") {
        setAutoPlay(false);
        actions.setAudioState("minimized");
      }
    };
    window.addEventListener(DOCK_STOP_EVENT, onInlineOpen);
    return () => window.removeEventListener(DOCK_STOP_EVENT, onInlineOpen);
  }, [actions, state]);

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

  // Satu sumber kebenaran untuk "putar rilisan terbaru" dari halaman mana pun.
  useEffect(() => {
    const onPlayLatest = () => togglePlayback();
    window.addEventListener(PLAY_LATEST_EVENT, onPlayLatest);
    return () => window.removeEventListener(PLAY_LATEST_EVENT, onPlayLatest);
  }, [togglePlayback]);

  // Rak embed dibuka begitu ada track (termasuk yang dimulai dari luar bilah).
  useEffect(() => {
    if (state === "loading" || state === "playing" || state === "paused") {
      setHasOpened(true);
    }
    if (state === "loading") setAutoPlay(true);
    if (state === "paused") setAutoPlay(false);
  }, [state]);

  // Masuk ke JEDAG RUN: jeda, dan rak embed ikut lepas (iframe unmount).
  useEffect(() => {
    if (!mounted || !onGame) return;
    if (state === "loading" || state === "playing") {
      actions.setAudioState("paused");
    }
  }, [actions, mounted, onGame, state]);

  // Penanda di root: dipakai CSS untuk menyisakan ruang di bawah halaman,
  // supaya bilah tidak pernah menimbun footer atau baris terakhir katalog.
  const visible = mounted && !onGame && state !== "closed" && state !== "idle";

  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      delete root.dataset.anPlayer;
      delete root.dataset.anPlayerShelf;
      return;
    }
    root.dataset.anPlayer = "visible";
    root.dataset.anPlayerShelf = expanded ? "open" : "closed";
    return () => {
      delete root.dataset.anPlayer;
      delete root.dataset.anPlayerShelf;
    };
  }, [visible, expanded]);

  // Amplitudo → CSS var, dibaca waveform tanpa render React.
  useEffect(() => {
    if (!visible) return;
    if (state !== "playing" && state !== "loading") return;
    const node = rootRef.current;
    if (!node) return;
    let frame = 0;
    const loop = () => {
      node.style.setProperty("--an-amp", store.signals.amplitude.toFixed(3));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [visible, state, store]);

  if (!visible) return null;

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
          idle: "Rilisan terbaru",
        };

  return (
    <aside
      ref={rootRef}
      className="an-global-player"
      data-player-state={state}
      data-analyzable={analyzable ? "true" : "false"}
      data-cursor="music"
      aria-label={
        lang === "en" ? "Global audio player" : "Pemutar audio global"
      }
    >
      <div className="an-global-player-bar">
        <button
          type="button"
          className="an-global-player-toggle"
          onClick={togglePlayback}
          aria-label={playing ? copy.pause : copy.play}
          data-signal-interactive
        >
          {playing ? (
            <Pause size={14} />
          ) : (
            <Play size={14} fill="currentColor" />
          )}
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
        </div>
      </div>
    </aside>
  );
}
