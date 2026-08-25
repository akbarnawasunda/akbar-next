import type { GameAudioConfig, GameEvent } from "./types";

type SoundName = "jump" | "collect" | "near-miss" | "hit" | "drop" | "level-up" | "game-over";

function canUseAudio() {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

export class JedagRunAudio {
  private readonly config: GameAudioConfig;
  private context: AudioContext | null = null;
  private bgm: HTMLAudioElement | null = null;
  private muted = false;
  private fallbackBgmTimer: number | null = null;
  private fallbackStep = 0;

  constructor(config: GameAudioConfig = {}) {
    this.config = config;
  }

  get isMuted() {
    return this.muted;
  }

  async unlock() {
    if (!canUseAudio()) return;
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextCtor && !this.context) {
      this.context = new AudioContextCtor();
    }
    if (this.context?.state === "suspended") {
      await this.context.resume().catch(() => undefined);
    }
    if (!this.bgm && this.config.bgmUrl) {
      this.bgm = new Audio(this.config.bgmUrl);
      this.bgm.loop = true;
      this.bgm.preload = "auto";
      this.bgm.volume = 0.23;
      this.bgm.addEventListener("error", () => {
        this.stopBgm();
        this.startFallbackBgm();
      }, { once: true });
    }
  }

  async startBgm() {
    await this.unlock();
    if (this.muted) return;
    if (this.bgm) {
      const result = this.bgm.play();
      if (result) {
        await result.catch(() => {
          this.startFallbackBgm();
        });
      }
      return;
    }
    this.startFallbackBgm();
  }

  stopBgm() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
    if (this.fallbackBgmTimer !== null) {
      window.clearInterval(this.fallbackBgmTimer);
      this.fallbackBgmTimer = null;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.muted) {
      this.stopBgm();
      return;
    }
    void this.startBgm();
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  playEvent(event: GameEvent) {
    if (this.muted) return;
    const name: SoundName | null = event.type === "double-jump" ? "jump" : event.type === "collect" ? "collect" : event.type === "near-miss" ? "near-miss" : event.type === "hit" ? "hit" : event.type === "drop" ? "drop" : event.type === "level-up" ? "level-up" : event.type === "game-over" ? "game-over" : null;
    if (!name) return;
    void this.play(name);
  }

  dispose() {
    this.stopBgm();
    if (this.context) {
      void this.context.close().catch(() => undefined);
      this.context = null;
    }
  }

  private async play(name: SoundName) {
    await this.unlock();
    const url = this.urlFor(name);
    if (url && canUseAudio()) {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.volume = name === "drop" ? 0.46 : 0.32;
      const result = audio.play();
      if (result) {
        await result.catch(() => {
          this.fallbackTone(name);
        });
      }
      return;
    }
    this.fallbackTone(name);
  }

  private urlFor(name: SoundName) {
    if (name === "jump") return this.config.jumpSfxUrl;
    if (name === "collect") return this.config.collectSfxUrl;
    if (name === "hit") return this.config.hitSfxUrl;
    if (name === "drop") return this.config.dropSfxUrl;
    if (name === "game-over") return this.config.gameOverSfxUrl;
    return undefined;
  }

  private startFallbackBgm() {
    if (!this.context || this.muted || this.fallbackBgmTimer !== null) return;
    this.fallbackStep = 0;
    this.fallbackBgmTimer = window.setInterval(() => {
      if (this.muted) return;
      const step = this.fallbackStep++ % 8;
      this.tone(step % 4 === 0 ? 96 : 144, step % 4 === 0 ? 0.1 : 0.055, "triangle", 0.045);
      if (step === 2 || step === 6) this.tone(288, 0.035, "square", 0.018);
    }, 250);
  }

  private fallbackTone(name: SoundName) {
    if (name === "jump") {
      this.tone(320, 0.08, "triangle", 0.11, 620);
    } else if (name === "collect") {
      this.tone(620, 0.07, "sine", 0.1, 920);
    } else if (name === "near-miss") {
      this.tone(430, 0.08, "triangle", 0.08, 760);
      window.setTimeout(() => this.tone(760, 0.06, "sine", 0.06, 980), 38);
    } else if (name === "level-up") {
      this.tone(260, 0.12, "triangle", 0.08, 520);
      window.setTimeout(() => this.tone(520, 0.15, "sine", 0.08, 1040), 70);
    } else if (name === "hit") {
      this.tone(110, 0.16, "sawtooth", 0.12, 55);
    } else if (name === "drop") {
      this.tone(140, 0.26, "sawtooth", 0.08, 360);
      window.setTimeout(() => this.tone(360, 0.3, "triangle", 0.08, 720), 95);
    } else {
      this.tone(220, 0.2, "triangle", 0.09, 82);
    }
  }

  private tone(startFrequency: number, duration: number, type: OscillatorType, volume: number, endFrequency = startFrequency) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endFrequency), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }
}
