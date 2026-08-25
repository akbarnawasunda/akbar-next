import { Pause, Play, RotateCcw, Share2, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GameMode, GameSnapshot, PublicGameConfig } from "@/game/jedagRun/types";
import { JedagRunAudio } from "@/game/jedagRun/JedagRunAudio";
import { JedagRunRenderer } from "@/game/jedagRun/JedagRunRenderer";
import { JedagRunWorld } from "@/game/jedagRun/JedagRunWorld";
import "./JedagRunCanvas.css";

type JedagRunCanvasProps = {
  config: PublicGameConfig;
  onGameOver?: (score: number) => void;
  onRestart?: () => void;
};

const initialSnapshot: GameSnapshot = {
  mode: "idle",
  score: 0,
  best: 0,
  lives: 3,
  combo: 0,
  multiplier: 1,
  level: 0,
  dropMeter: 0,
  dropActive: false,
};

function modeLabel(mode: GameMode) {
  if (mode === "paused") return "PAUSED";
  if (mode === "game-over") return "SIGNAL ENDED";
  if (mode === "running") return "LIVE SIGNAL";
  return "READY TO RUN";
}

export default function JedagRunCanvas({ config, onGameOver, onRestart }: JedagRunCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<JedagRunWorld | null>(null);
  const audioRef = useRef<JedagRunAudio | null>(null);
  const rendererRef = useRef<JedagRunRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [muted, setMuted] = useState(false);
  const reducedMotion = useMemo(() => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage || !config.isEnabled) return;

    const query = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const world = new JedagRunWorld({
      demo: query?.get("demo") === "1" || query?.has("demo"),
      onEvent: event => {
        if (event.type === "game-over") {
          audioRef.current?.stopBgm();
          onGameOver?.(event.value ?? 0);
        }
        audioRef.current?.playEvent(event);
      },
    });
    const audio = new JedagRunAudio(config);
    const renderer = new JedagRunRenderer(canvas, world.width, world.height);
    worldRef.current = world;
    audioRef.current = audio;
    rendererRef.current = renderer;
    setSnapshot(world.snapshot);

    let last = performance.now();
    let disposed = false;
    const tick = (now: number) => {
      if (disposed) return;
      const delta = Math.min(0.034, Math.max(0, (now - last) / 1000));
      last = now;
      world.update(delta);
      renderer.draw(world.getRenderState(), reducedMotion);
      if (world.snapshot.mode !== snapshot.mode || world.frameNumber % 3 === 0) setSnapshot(world.snapshot);
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(() => renderer.resize());
    resizeObserver.observe(stage);
    const intersectionObserver = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting) {
        world.pause();
        audio.stopBgm();
      }
    }, { threshold: 0.05 });
    intersectionObserver.observe(stage);

    const onVisibilityChange = () => {
      if (document.hidden) {
        world.pause();
        audio.stopBgm();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        void audio.unlock();
        world.input("jump");
        if (world.currentMode === "running") void audio.startBgm();
      }
      if (event.code === "Escape" || event.code === "KeyP") {
        event.preventDefault();
        world.input("pause");
        if (world.currentMode === "paused") audio.stopBgm();
        else if (world.currentMode === "running") void audio.startBgm();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement | null)?.closest("button")) return;
      event.preventDefault();
      void audio.unlock();
      world.input("jump");
      if (world.currentMode === "running") void audio.startBgm();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });

    return () => {
      disposed = true;
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
      audio.dispose();
      worldRef.current = null;
      audioRef.current = null;
      rendererRef.current = null;
    };
  }, [config, reducedMotion]);

  const startOrResume = () => {
    const world = worldRef.current;
    const audio = audioRef.current;
    if (!world || !audio) return;
    if (world.currentMode === "game-over" && onRestart) {
      onRestart();
      return;
    }
    void audio.unlock();
    if (world.currentMode === "paused") world.resume();
    else world.start();
    void audio.startBgm();
    setSnapshot(world.snapshot);
  };

  const togglePause = () => {
    const world = worldRef.current;
    if (!world) return;
    world.togglePause();
    if (world.currentMode === "paused") audioRef.current?.stopBgm();
    else if (world.currentMode === "running") void audioRef.current?.startBgm();
    setSnapshot(world.snapshot);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setMuted(audio.toggleMute());
  };

  const shareScore = async () => {
    const text = `Aku mencetak ${snapshot.score} di JEDAG RUN: NIGHT FREQUENCY. Coba kalahkan signal ini!`;
    const url = typeof window !== "undefined" ? `${window.location.origin}/game/jedag-run` : "https://akbarnawasunda.my.id/game/jedag-run";
    if (navigator.share) {
      await navigator.share({ title: "JEDAG RUN — NIGHT FREQUENCY", text, url }).catch(() => undefined);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`).catch(() => undefined);
    }
  };

  if (!config.isEnabled) {
    return (
      <div className="jedag-run-disabled">
        <span className="jedag-run-kicker">SIGNAL OFFLINE</span>
        <p>Game sedang disembunyikan dari publik. Aktifkan kembali dari Studio saat siap.</p>
      </div>
    );
  }

  const isIdle = snapshot.mode === "idle";
  const isPaused = snapshot.mode === "paused";
  const isGameOver = snapshot.mode === "game-over";
  const lives = "●".repeat(Math.max(0, snapshot.lives));

  return (
    <div ref={stageRef} className={`jedag-run-stage${isGameOver ? " is-game-over" : ""}`}>
      <canvas ref={canvasRef} className="jedag-run-canvas" aria-label="JEDAG RUN Night Frequency game canvas" />
      <div className="jedag-run-hud" aria-live="polite">
        <div className="jedag-run-hud-left">
          <span className="jedag-run-hud-label">SCORE</span>
          <strong>{String(snapshot.score).padStart(5, "0")}</strong>
          <span className="jedag-run-hud-label">CHAIN <b>{snapshot.combo > 0 ? snapshot.combo : "—"}</b></span>
          <span className="jedag-run-hud-label">MULTI <b>{snapshot.multiplier > 1 ? `×${snapshot.multiplier}` : "—"}</b></span>
          <span className="jedag-run-hud-label">LV <b>{String(snapshot.level + 1).padStart(2, "0")}</b></span>
          <span className="jedag-run-lives" aria-label={`${snapshot.lives} lives remaining`}>{lives || "×"}</span>
        </div>
        <div className="jedag-run-drop" aria-label={`${Math.round(snapshot.dropMeter * 100)} percent drop meter`}>
          <span>DROP METER</span>
          <div><i style={{ width: `${snapshot.dropMeter * 100}%` }} /></div>
        </div>
        <div className="jedag-run-hud-right">
          <span className="jedag-run-mode">{modeLabel(snapshot.mode)}</span>
          <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute game audio" : "Mute game audio"} className="jedag-run-icon-button">
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button type="button" onClick={togglePause} disabled={isIdle || isGameOver} aria-label="Pause game" className="jedag-run-icon-button">
            <Pause size={14} />
          </button>
        </div>
      </div>

      {(isIdle || isPaused || isGameOver) ? (
        <div className="jedag-run-overlay">
          <span className="jedag-run-overlay-kicker">{config.kicker}</span>
          <h2>{isGameOver ? `SIGNAL ENDED / ${snapshot.score}` : isPaused ? "SIGNAL PAUSED" : config.title}</h2>
          <p>{isGameOver ? `Best score: ${snapshot.best}. Run again and chase a cleaner drop.` : isPaused ? "Tekan continue untuk kembali ke signal." : config.intro}</p>
          <div className="jedag-run-overlay-actions">
            <button type="button" className="jedag-run-primary-button" onClick={startOrResume}>
              {isPaused ? <Play size={15} fill="currentColor" /> : isGameOver ? <RotateCcw size={15} /> : <Play size={15} fill="currentColor" />}
              {isPaused ? "CONTINUE" : isGameOver ? "RUN AGAIN" : "START RUN"}
            </button>
            {isGameOver ? (
              <button type="button" className="jedag-run-secondary-button" onClick={() => void shareScore()}>
                <Share2 size={14} /> {config.shareLabel}
              </button>
            ) : null}
          </div>
          <span className="jedag-run-hint">TAP / SPACE / ARROW UP TO JUMP</span>
        </div>
      ) : null}

      <div className="jedag-run-footer">
        <span>JEDAG RUN // NIGHT FREQUENCY</span>
        <span>BEST {String(snapshot.best).padStart(5, "0")}</span>
      </div>
    </div>
  );
}
