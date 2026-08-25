import { ArrowLeft, ArrowUpRight, Gamepad2, Loader2, Radio, ShieldCheck, Trophy } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import JedagRunCanvas from "@/components/JedagRunCanvas";
import type { PublicGameConfig } from "@/game/jedagRun/types";
import { usePublicArtistContent } from "@/content/publicContent";
import { trpc } from "@/lib/trpc";
import { normalizeLeaderboardUsername } from "@shared/gameLeaderboard";
import "./GameJedagRun.css";

const GAME_USERNAME_STORAGE_KEY = "an_jedag_run_username";

function readSavedUsername() {
  if (typeof window === "undefined") return "";
  try {
    const saved = window.localStorage.getItem(GAME_USERNAME_STORAGE_KEY) || "";
    return normalizeLeaderboardUsername(saved).value;
  } catch {
    return "";
  }
}

function saveUsername(username: string) {
  try {
    window.localStorage.setItem(GAME_USERNAME_STORAGE_KEY, username);
  } catch {
    // Private browsing or blocked storage should not prevent playing.
  }
}

function clearSavedUsername() {
  try {
    window.localStorage.removeItem(GAME_USERNAME_STORAGE_KEY);
  } catch {
    // Private browsing or blocked storage should not prevent playing.
  }
}

const fallbackGameConfig: PublicGameConfig = {
  title: "JEDAG RUN — NIGHT FREQUENCY",
  kicker: "PLAYABLE SIGNAL",
  intro: "Run the signal, collect the notes, and chase the drop.",
  isEnabled: true,
  shareLabel: "SHARE SCORE",
};

export default function GameJedagRun({ english = false }: { english?: boolean }) {
  const publicContent = usePublicArtistContent();
  const config = useMemo(() => ({
    ...fallbackGameConfig,
    ...(publicContent.data?.game ?? {}),
  } satisfies PublicGameConfig), [publicContent.data?.game]);
  const topScores = trpc.leaderboard.top.useQuery(undefined, { staleTime: 30_000 });
  const startRun = trpc.leaderboard.start.useMutation();
  const submitScore = trpc.leaderboard.submit.useMutation();
  const initialUsername = readSavedUsername();
  const [username, setUsername] = useState(initialUsername);
  const [savedUsername, setSavedUsername] = useState(initialUsername);
  const [activeUsername, setActiveUsername] = useState("");
  const [runToken, setRunToken] = useState("");
  const [gateMessage, setGateMessage] = useState("");
  const [showUsernameGate, setShowUsernameGate] = useState(!initialUsername);
  const [runKey, setRunKey] = useState(0);
  const autoStartAttempted = useRef(false);
  const [lastSubmittedScore, setLastSubmittedScore] = useState<number | null>(null);

  const copy = english
    ? {
        back: "Back to archive",
        eyebrow: "PLAYABLE SIGNAL / 01",
        title: "RUN THE SIGNAL.",
        body: "A small playable frequency from the Akbar Nawasunda universe. Collect notes, keep the combo alive, and chase the drop.",
        note: "Enter a public username before starting. It will appear only if your score reaches the Top 10.",
        sideLabel: "NIGHT FREQUENCY",
        sideCopy: "A browser game built around signal, rhythm, and a little bit of controlled noise.",
        music: "Music archive",
        home: "Official website",
        gateTitle: "NAME YOUR SIGNAL.",
        gateCopy: "Choose a public display name before you run. Do not use an email address or personal information.",
        gatePrivacy: "Your username and score are public when they appear on the board.",
        begin: "ENTER THE RUN",
        boardKicker: "GLOBAL BOARD",
        boardTitle: "TOP TEN.",
        boardCopy: "The ten highest signals from this game. Open slots begin at score 00000.",
        openSlot: "OPEN SIGNAL",
        refresh: "REFRESH",
        submitted: "Score submitted to the global board.",
        unavailable: "Score saved locally, but the global board is temporarily unavailable.",
        changeUsername: "CHANGE USERNAME",
      }
    : {
        back: "Kembali ke archive",
        eyebrow: "PLAYABLE SIGNAL / 01",
        title: "KEJAR SIGNAL.",
        body: "Satu frekuensi kecil yang bisa dimainkan dari semesta Akbar Nawasunda. Kumpulkan note, jaga combo, dan kejar drop terakhir.",
        note: "Masukkan username publik sebelum mulai. Username hanya tampil jika skor masuk Top 10.",
        sideLabel: "NIGHT FREQUENCY",
        sideCopy: "Game browser yang dibangun dari signal, ritme, dan sedikit noise yang terkontrol.",
        music: "Arsip musik",
        home: "Website resmi",
        gateTitle: "TULIS NAMA SIGNAL.",
        gateCopy: "Pilih nama publik sebelum bermain. Jangan masukkan email atau informasi pribadi.",
        gatePrivacy: "Username dan skor bersifat publik jika masuk ke papan peringkat.",
        begin: "MASUK KE RUN",
        boardKicker: "PAPAN GLOBAL",
        boardTitle: "TOP SEPULUH.",
        boardCopy: "Sepuluh signal dengan skor tertinggi. Slot kosong dimulai dari skor 00000.",
        openSlot: "OPEN SIGNAL",
        refresh: "SEGARKAN",
        submitted: "Skor berhasil masuk ke papan global.",
        unavailable: "Skor tersimpan lokal, tetapi papan global sedang tidak tersedia.",
        changeUsername: "GANTI USERNAME",
      };

  const activateRun = (result: { username: string; runToken: string }) => {
    saveUsername(result.username);
    setSavedUsername(result.username);
    setActiveUsername(result.username);
    setUsername(result.username);
    setRunToken(result.runToken);
    setLastSubmittedScore(null);
    setRunKey(value => value + 1);
    setShowUsernameGate(false);
  };

  useEffect(() => {
    if (!config.isEnabled || !savedUsername || autoStartAttempted.current) return;
    autoStartAttempted.current = true;
    startRun.mutate({ username: savedUsername }, {
      onSuccess: activateRun,
      onError: error => setGateMessage(error.message || "Username belum bisa dipakai. Coba nama lain."),
    });
  }, [config.isEnabled, savedUsername]);

  const beginRun = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeLeaderboardUsername(username);
    if (!normalized.value) {
      setGateMessage(normalized.error);
      return;
    }
    setGateMessage("");
    autoStartAttempted.current = true;
    startRun.mutate({ username: normalized.value }, {
      onSuccess: activateRun,
      onError: error => setGateMessage(error.message || "Username belum bisa dipakai. Coba nama lain."),
    });
  };

  const handleGameOver = (score: number) => {
    if (!runToken || !activeUsername || lastSubmittedScore !== null) return;
    setLastSubmittedScore(score);
    submitScore.mutate({ username: activeUsername, score, runToken }, {
      onSuccess: result => {
        setGateMessage(result.submitted ? copy.submitted : copy.unavailable);
        void topScores.refetch();
      },
      onError: () => setGateMessage(copy.unavailable),
    });
  };

  const handleRestart = () => {
    setGateMessage("");
    setShowUsernameGate(true);
    setUsername(savedUsername || activeUsername);
  };

  const handleChangeUsername = () => {
    clearSavedUsername();
    setSavedUsername("");
    setUsername("");
    setActiveUsername("");
    setRunToken("");
    setGateMessage("");
    setShowUsernameGate(true);
  };

  const slots = Array.from({ length: 10 }, (_, index) => {
    const row = topScores.data?.[index];
    return row ? { ...row, isEmpty: false } : {
      rank: index + 1,
      username: copy.openSlot,
      score: 0,
      isEmpty: true,
    };
  });

  return (
    <main className="game-page">
      <header className="game-page-header">
        <Link href={english ? "/en" : "/"} className="game-page-brand">
          <span className="game-page-brand-mark">AN</span>
          <span>AKBAR NAWASUNDA</span>
        </Link>
        <div className="game-page-header-links">
          <Link href={english ? "/en/universe" : "/universe"}>{copy.back} <ArrowLeft size={14} /></Link>
          <span className="game-page-status"><Radio size={13} /> {copy.sideLabel}</span>
        </div>
      </header>

      <section className="game-page-intro" aria-labelledby="game-page-title">
        <div className="game-page-copy">
          <p className="game-page-eyebrow"><Gamepad2 size={14} /> {copy.eyebrow}</p>
          <h1 id="game-page-title">{copy.title}</h1>
          <p className="game-page-body">{copy.body}</p>
          <p className="game-page-note">{copy.note}</p>
          <div className="game-page-links">
            <Link href={english ? "/en/music" : "/music"}>{copy.music} <ArrowUpRight size={14} /></Link>
            <Link href={english ? "/en" : "/"}>{copy.home} <ArrowUpRight size={14} /></Link>
            {activeUsername ? <button type="button" className="game-change-username" onClick={handleChangeUsername}>{copy.changeUsername}</button> : null}
          </div>
        </div>
        <div className="game-page-side-note">
          <span>02 / SIGNAL NOTES</span>
          <p>{copy.sideCopy}</p>
        </div>
      </section>

      <section className="game-page-stage" aria-label={config.title}>
        {showUsernameGate && config.isEnabled ? (
          <div className="game-username-gate">
            <div className="game-username-gate-copy">
              <span className="game-page-eyebrow"><ShieldCheck size={14} /> PRIVATE HANDLE / PUBLIC SCORE</span>
              <h2>{copy.gateTitle}</h2>
              <p>{copy.gateCopy}</p>
              <small>{copy.gatePrivacy}</small>
            </div>
            <form className="game-username-form" onSubmit={beginRun}>
              <label htmlFor={english ? "game-username-en" : "game-username-id"}>USERNAME</label>
              <input
                id={english ? "game-username-en" : "game-username-id"}
                value={username}
                onChange={event => {
                  setUsername(event.target.value);
                  if (gateMessage) setGateMessage("");
                }}
                minLength={2}
                maxLength={20}
                autoComplete="nickname"
                placeholder="AN_SIGNAL"
                aria-describedby="game-username-help"
                required
              />
              <button type="submit" disabled={startRun.isPending}>
                {startRun.isPending ? <Loader2 size={15} className="animate-spin" /> : <Gamepad2 size={15} />}
                {copy.begin}
              </button>
              <small id="game-username-help">2–20 karakter · huruf, angka, spasi, `_`, atau `-`</small>
              {savedUsername ? <small className="game-username-saved">Tersimpan di browser ini. Edit nama di atas bila ingin menggantinya.</small> : null}
              {gateMessage ? <p className="game-leaderboard-message" role="status">{gateMessage}</p> : null}
            </form>
          </div>
        ) : (
          <JedagRunCanvas key={runKey} config={config} onGameOver={handleGameOver} onRestart={handleRestart} />
        )}
      </section>

      <section className="game-leaderboard" aria-labelledby="global-board-title">
        <div className="game-leaderboard-intro">
          <p className="game-page-eyebrow"><Trophy size={14} /> {copy.boardKicker}</p>
          <h2 id="global-board-title">{copy.boardTitle}</h2>
          <p>{copy.boardCopy}</p>
          <button type="button" className="game-leaderboard-refresh" onClick={() => void topScores.refetch()} disabled={topScores.isFetching}>
            {topScores.isFetching ? <Loader2 size={13} className="animate-spin" /> : null} {copy.refresh}
          </button>
        </div>
        <div className="game-leaderboard-table" role="table" aria-label={copy.boardTitle}>
          {slots.map(row => (
            <div className={`game-leaderboard-row${row.isEmpty ? " is-empty" : ""}`} role="row" key={row.rank}>
              <span className="game-leaderboard-rank">{String(row.rank).padStart(2, "0")}</span>
              <strong>{row.username}</strong>
              <span className="game-leaderboard-score">{String(row.score).padStart(5, "0")}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="game-page-footer">
        <span>JEDAG RUN // {english ? "ENGLISH ROUTE" : "INDONESIAN ROUTE"}</span>
        <span>AKBAR NAWASUNDA / 2026</span>
      </footer>
    </main>
  );
}

export function EnglishGameJedagRun() {
  return <GameJedagRun english />;
}
