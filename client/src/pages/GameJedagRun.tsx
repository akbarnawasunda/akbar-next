import { ArrowLeft, ArrowUpRight, Gamepad2, Radio } from "lucide-react";
import { Link } from "wouter";
import JedagRunCanvas from "@/components/JedagRunCanvas";
import type { PublicGameConfig } from "@/game/jedagRun/types";
import { usePublicArtistContent } from "@/content/publicContent";
import "./GameJedagRun.css";

const fallbackGameConfig: PublicGameConfig = {
  title: "JEDAG RUN — NIGHT FREQUENCY",
  kicker: "PLAYABLE SIGNAL",
  intro: "Run the signal, collect the notes, and chase the drop.",
  isEnabled: true,
  shareLabel: "SHARE SCORE",
};

export default function GameJedagRun({ english = false }: { english?: boolean }) {
  const publicContent = usePublicArtistContent();
  const config = {
    ...fallbackGameConfig,
    ...(publicContent.data?.game ?? {}),
  } satisfies PublicGameConfig;
  const copy = english
    ? {
        back: "Back to archive",
        eyebrow: "PLAYABLE SIGNAL / 01",
        title: "RUN THE SIGNAL.",
        body: "A small playable frequency from the Akbar Nawasunda universe. Collect notes, keep the combo alive, and chase the drop.",
        note: "Tap, click, or press Space to jump. Audio starts only after you choose Start.",
        sideLabel: "NIGHT FREQUENCY",
        sideCopy: "A browser game built around signal, rhythm, and a little bit of controlled noise.",
        music: "Music archive",
        home: "Official website",
      }
    : {
        back: "Kembali ke archive",
        eyebrow: "PLAYABLE SIGNAL / 01",
        title: "KEJAR SIGNAL.",
        body: "Satu frekuensi kecil yang bisa dimainkan dari semesta Akbar Nawasunda. Kumpulkan note, jaga combo, dan kejar drop terakhir.",
        note: "Tap, klik, atau tekan Space untuk lompat. Audio baru aktif setelah kamu menekan Start.",
        sideLabel: "NIGHT FREQUENCY",
        sideCopy: "Game browser yang dibangun dari signal, ritme, dan sedikit noise yang terkontrol.",
        music: "Arsip musik",
        home: "Website resmi",
      };

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
          </div>
        </div>
        <div className="game-page-side-note">
          <span>02 / SIGNAL NOTES</span>
          <p>{copy.sideCopy}</p>
        </div>
      </section>

      <section className="game-page-stage" aria-label={config.title}>
        <JedagRunCanvas config={config} />
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
