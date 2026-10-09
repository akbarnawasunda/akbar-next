import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useLocation } from "@/lib/navigation";
import { capabilityChanged, detectCapability } from "./capability";
import { createAudioSignal, type AudioSignalController } from "./audioSignal";
import { attachPointerSignal } from "./pointerSignal";
import { routeInfo } from "./routeSignal";
import { createSignatureStore } from "./signatureStore";
import {
  SignatureContext,
  type SignatureActions,
  type SignatureRuntime,
} from "./useSignature";
import type { AudioPlayerState, AudioTrack } from "./types";

const FREQUENCY_KEY = "an-signature-frequency";
const FREQUENCY_OPT_OUT_KEY = "an-signature-frequency-enabled";
const SECRET = "jedag";

/** Transition dibatasi: 900ms total, termasuk nama halaman tujuan. */
const SWEEP_MS = 420;
const SETTLE_MS = 420;

function readSession(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Private mode / embedded browser: state cukup hidup di memori.
  }
}

export function SignatureProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const storeRef = useRef(createSignatureStore());
  const store = storeRef.current;
  const audioRef = useRef<AudioSignalController | null>(null);
  const previousLocation = useRef(location);

  // --- capability -----------------------------------------------------
  useEffect(() => {
    const sync = () => {
      const next = detectCapability();
      if (capabilityChanged(store.getSnapshot().capability, next)) {
        store.patch({ capability: next });
      }
    };
    sync();
    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(hover: hover) and (pointer: fine)"),
    ];
    queries.forEach(query => query.addEventListener("change", sync));
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      queries.forEach(query => query.removeEventListener("change", sync));
      window.removeEventListener("resize", sync);
    };
  }, [store]);

  // --- pointer & scroll ------------------------------------------------
  useEffect(() => attachPointerSignal(store), [store]);

  // --- audio ------------------------------------------------------------
  useEffect(() => {
    audioRef.current = createAudioSignal(store);
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, [store]);

  // --- field readiness (jangan tahan LCP) --------------------------------
  useEffect(() => {
    let cancelled = false;
    const ready = () => {
      if (cancelled) return;
      store.patch({ fieldReady: true });
    };
    const idle = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    const timer = window.setTimeout(ready, 600);
    const idleId = idle ? idle(ready, { timeout: 900 }) : undefined;
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      const cancelIdle = (
        window as Window & { cancelIdleCallback?: (id: number) => void }
      ).cancelIdleCallback;
      if (idleId !== undefined && cancelIdle) cancelIdle(idleId);
    };
  }, [store]);

  // --- route + transition -------------------------------------------------
  useEffect(() => {
    const info = routeInfo(location);
    const isNavigation = previousLocation.current !== location;
    previousLocation.current = location;
    const reduced = store.getSnapshot().capability.reducedMotion;

    store.patch({ route: info, era: { index: 0, total: 0, id: "" } });

    if (!isNavigation || reduced || !info.label) {
      store.patch({ transition: { phase: "idle", targetLabel: "", startedAt: 0 } });
      return;
    }

    store.patch({
      transition: {
        phase: "sweep",
        targetLabel: info.label,
        startedAt: Date.now(),
      },
    });
    const toSettle = window.setTimeout(() => {
      store.patch({
        transition: {
          phase: "settle",
          targetLabel: info.label,
          startedAt: Date.now(),
        },
      });
    }, SWEEP_MS);
    const toIdle = window.setTimeout(() => {
      store.patch({ transition: { phase: "idle", targetLabel: "", startedAt: 0 } });
    }, SWEEP_MS + SETTLE_MS);
    return () => {
      window.clearTimeout(toSettle);
      window.clearTimeout(toIdle);
    };
  }, [location, store]);

  // --- easter egg ----------------------------------------------------------
  useEffect(() => {
    const enabled = readSession(FREQUENCY_OPT_OUT_KEY) !== "off";
    const active = readSession(FREQUENCY_KEY) === "on";
    const snapshot = store.getSnapshot();
    store.patch({
      frequency: {
        active: enabled && active,
        enabled,
        triggered: active || snapshot.frequency.triggered,
      },
    });

    let typed = "";
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1) return;
      typed = (typed + event.key.toLowerCase()).slice(-SECRET.length);
      if (typed !== SECRET) return;
      typed = "";
      const current = store.getSnapshot();
      // Sekali per sesi, bisa dimatikan user, dan tidak memaksa animasi saat
      // user meminta reduced motion.
      if (!current.frequency.enabled || current.frequency.triggered) return;
      if (current.capability.reducedMotion) return;
      store.patch({
        frequency: { active: true, enabled: true, triggered: true },
      });
      writeSession(FREQUENCY_KEY, "on");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store]);

  // --- actions --------------------------------------------------------------
  const setAudioState = useCallback(
    (state: AudioPlayerState) => {
      const audio = store.getSnapshot().audio;
      store.patch({ audio: { ...audio, state } });
      audioRef.current?.setActive(state === "playing" || state === "loading");
      writeSession("an-player-state", state);
    },
    [store]
  );

  const actions = useMemo<SignatureActions>(
    () => ({
      openTrack(track: AudioTrack) {
        const audio = store.getSnapshot().audio;
        store.patch({
          audio: {
            ...audio,
            track,
            // Iframe pihak ketiga tidak pernah dianggap bisa dianalisis.
            analyzable: Boolean(track.previewUrl) && audio.analyzable,
            state: "loading",
          },
        });
        audioRef.current?.setActive(true);
        writeSession("an-player-track", JSON.stringify(track));
        writeSession("an-player-state", "loading");
      },
      setAudioState,
      connectAudioElement(element) {
        return audioRef.current?.connectElement(element) ?? false;
      },
      disconnectAudioElement() {
        audioRef.current?.disconnect();
      },
      setEra(era) {
        store.patch({ era });
      },
      toggleFrequency(next) {
        const current = store.getSnapshot().frequency;
        if (!current.enabled) return;
        const active = next ?? !current.active;
        store.patch({ frequency: { ...current, active, triggered: true } });
        writeSession(FREQUENCY_KEY, active ? "on" : "off");
      },
      setFrequencyEnabled(enabled) {
        const current = store.getSnapshot().frequency;
        store.patch({
          frequency: { ...current, enabled, active: enabled && current.active },
        });
        writeSession(FREQUENCY_OPT_OUT_KEY, enabled ? "on" : "off");
      },
      markFieldReady() {
        store.patch({ fieldReady: true });
      },
    }),
    [setAudioState, store]
  );

  const runtime = useMemo<SignatureRuntime>(
    () => ({ store, actions }),
    [actions, store]
  );

  return (
    <SignatureContext.Provider value={runtime}>
      {children}
    </SignatureContext.Provider>
  );
}
