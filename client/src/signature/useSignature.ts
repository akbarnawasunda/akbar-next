import { createContext, useContext, useSyncExternalStore } from "react";
import { createSignatureStore, INITIAL_SNAPSHOT } from "./signatureStore";
import type {
  AudioPlayerState,
  AudioTrack,
  SignatureSnapshot,
  SignatureStore,
} from "./types";

export type SignatureActions = {
  openTrack: (track: AudioTrack) => void;
  setAudioState: (state: AudioPlayerState) => void;
  connectAudioElement: (element: HTMLMediaElement) => boolean;
  disconnectAudioElement: () => void;
  setEra: (era: { index: number; total: number; id: string }) => void;
  toggleFrequency: (next?: boolean) => void;
  setFrequencyEnabled: (enabled: boolean) => void;
  markFieldReady: () => void;
};

export type SignatureRuntime = {
  store: SignatureStore;
  actions: SignatureActions;
};

/**
 * Fallback runtime supaya komponen yang dipakai di luar PublicShell (mis.
 * halaman studio) tidak pernah crash. Tidak ada efek yang berjalan di sini.
 */
let fallbackRuntime: SignatureRuntime | null = null;
function getFallbackRuntime(): SignatureRuntime {
  if (!fallbackRuntime) {
    const store = createSignatureStore();
    fallbackRuntime = {
      store,
      actions: {
        openTrack: () => undefined,
        setAudioState: () => undefined,
        connectAudioElement: () => false,
        disconnectAudioElement: () => undefined,
        setEra: () => undefined,
        toggleFrequency: () => undefined,
        setFrequencyEnabled: () => undefined,
        markFieldReady: () => undefined,
      },
    };
  }
  return fallbackRuntime;
}

export const SignatureContext = createContext<SignatureRuntime | null>(null);

export function useSignatureRuntime(): SignatureRuntime {
  return useContext(SignatureContext) ?? getFallbackRuntime();
}

/** Baca satu irisan state. Angka frekuensi tinggi TIDAK lewat sini. */
export function useSignatureState<T>(
  selector: (snapshot: SignatureSnapshot) => T
): T {
  const { store } = useSignatureRuntime();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getSnapshot()),
    () => selector(INITIAL_SNAPSHOT)
  );
}

/** Akses imperatif untuk canvas / rAF: tidak memicu render. */
export function useSignatureSignals() {
  return useSignatureRuntime().store.signals;
}
