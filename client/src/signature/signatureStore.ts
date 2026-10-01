import { serverCapability } from "./capability";
import type {
  SignatureSignals,
  SignatureSnapshot,
  SignatureStore,
} from "./types";

/**
 * Store minimal (tanpa dependency baru) untuk Signature Runtime.
 *
 * Dua lapis sengaja dipisah:
 * - `snapshot`: state diskret yang memang perlu me-render React.
 * - `signals`: angka frekuensi tinggi (pointer, amplitudo, scroll) yang
 *   dibaca canvas tiap frame tanpa menyentuh React sama sekali.
 */

export const INITIAL_SNAPSHOT: SignatureSnapshot = {
  capability: serverCapability(),
  route: { path: "/", lang: "id", label: "BERANDA", mode: "wordmark" },
  transition: { phase: "idle", targetLabel: "", startedAt: 0 },
  audio: { state: "idle", analyzable: false, track: null },
  frequency: { active: false, enabled: true, triggered: false },
  era: { index: 0, total: 0, id: "" },
  fieldReady: false,
};

function createSignals(): SignatureSignals {
  return {
    pointerX: -9999,
    pointerY: -9999,
    pointerActive: false,
    pointerPressed: false,
    interactive: false,
    magnetic: false,
    scrollY: 0,
    heroProgress: 0,
    amplitude: 0,
    beat: 0,
    bursts: [],
    shield: null,
  };
}

export function createSignatureStore(
  initial: SignatureSnapshot = INITIAL_SNAPSHOT
): SignatureStore {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  const signals = createSignals();

  const emit = () => listeners.forEach(listener => listener());

  const patch: SignatureStore["patch"] = next => {
    let changed = false;
    const merged = { ...snapshot };
    (Object.keys(next) as (keyof SignatureSnapshot)[]).forEach(key => {
      const value = next[key];
      if (value === undefined) return;
      if (!Object.is(merged[key], value)) {
        // @ts-expect-error — key sudah dibatasi oleh keyof SignatureSnapshot.
        merged[key] = value;
        changed = true;
      }
    });
    if (!changed) return;
    snapshot = merged;
    emit();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => INITIAL_SNAPSHOT,
    signals,
    patch,
    burst(x, y, strength = 1) {
      signals.bursts.push({ x, y, strength, at: Date.now() });
      // Engine mengonsumsi antrian ini tiap frame; batasi agar tidak tumbuh
      // saat canvas belum dimuat.
      if (signals.bursts.length > 8) signals.bursts.splice(0, signals.bursts.length - 8);
    },
  };
}
