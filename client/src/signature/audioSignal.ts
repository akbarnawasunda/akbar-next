import type { SignatureStore } from "./types";

/**
 * Audio signal.
 *
 * Dua jalur, dan keduanya jujur:
 *
 * 1. Sumber yang benar-benar bisa dianalisis (file audio resmi milik sendiri)
 *    disambungkan ke `AnalyserNode`; `analyzable` = true dan amplitudo memang
 *    berasal dari sinyal audio.
 * 2. Iframe pihak ketiga (SoundCloud/Spotify/YouTube) TIDAK bisa dianalisis
 *    dari halaman kita. Untuk kasus ini runtime memakai ketukan deterministik
 *    dan menandai `analyzable` = false, sehingga UI tidak boleh mengklaim
 *    gerakannya berasal dari audio nyata.
 */

const FALLBACK_BPM = 124;
const BEAT_MS = (60 / FALLBACK_BPM) * 1000;

export type AudioSignalController = {
  /** Sambungkan elemen audio milik sendiri → analisis nyata. */
  connectElement: (element: HTMLMediaElement) => boolean;
  /** Lepas analyser dan kembali ke fallback deterministik. */
  disconnect: () => void;
  /** Hidup/matikan loop amplitudo. */
  setActive: (active: boolean) => void;
  dispose: () => void;
};

export function createAudioSignal(store: SignatureStore): AudioSignalController {
  const signals = store.signals;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let buffer: Uint8Array<ArrayBuffer> | null = null;
  let source: MediaElementAudioSourceNode | null = null;
  let frame = 0;
  let active = false;

  const readAnalyser = () => {
    if (!analyser || !buffer) return 0;
    analyser.getByteTimeDomainData(buffer);
    let peak = 0;
    for (let i = 0; i < buffer.length; i += 2) {
      const value = Math.abs(buffer[i] - 128) / 128;
      if (value > peak) peak = value;
    }
    return Math.min(1, peak * 1.6);
  };

  const loop = () => {
    if (!active) {
      frame = 0;
      return;
    }
    const now = performance.now();
    const phase = (now % BEAT_MS) / BEAT_MS;
    signals.beat = phase;
    const target = analyser
      ? readAnalyser()
      : // Ketukan deterministik: pukulan utama + aksen di ketukan kedua.
        0.18 +
        0.6 * Math.pow(1 - phase, 2.4) +
        0.12 * Math.max(0, Math.sin(now * 0.004));
    signals.amplitude += (Math.min(1, target) - signals.amplitude) * 0.22;
    frame = requestAnimationFrame(loop);
  };

  const decay = () => {
    signals.amplitude *= 0.86;
    if (signals.amplitude < 0.002) {
      signals.amplitude = 0;
      return;
    }
    frame = requestAnimationFrame(decay);
  };

  return {
    connectElement(element) {
      if (typeof window === "undefined") return false;
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextCtor) return false;
      try {
        audioContext = audioContext || new AudioContextCtor();
        if (audioContext.state === "suspended") void audioContext.resume();
        source = audioContext.createMediaElementSource(element);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.72;
        buffer = new Uint8Array(new ArrayBuffer(analyser.fftSize));
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        store.patch({ audio: { ...store.getSnapshot().audio, analyzable: true } });
        return true;
      } catch {
        analyser = null;
        buffer = null;
        source = null;
        return false;
      }
    },
    disconnect() {
      try {
        source?.disconnect();
        analyser?.disconnect();
      } catch {
        // Node bisa saja sudah dilepas oleh browser.
      }
      source = null;
      analyser = null;
      buffer = null;
      store.patch({ audio: { ...store.getSnapshot().audio, analyzable: false } });
    },
    setActive(next) {
      if (active === next) return;
      active = next;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (typeof window === "undefined") return;
      if (active) frame = requestAnimationFrame(loop);
      else frame = requestAnimationFrame(decay);
    },
    dispose() {
      active = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      this.disconnect();
      void audioContext?.close().catch(() => undefined);
      audioContext = null;
    },
  };
}
