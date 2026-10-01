import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "wouter";
import "./RouteTransition.css";

/**
 * Umpan balik perpindahan halaman.
 *
 * Dua bagian yang memakai bahasa visual yang sama dengan splash pembuka:
 * - `RouteProgress`: garis tipis di tepi atas yang jalan setiap kali rute
 *   berganti, jadi klik langsung terasa direspons.
 * - `PageLoading`: layar tunggu untuk chunk rute yang belum selesai diunduh.
 *
 * Tidak ada persentase palsu: garisnya berhenti di 82% selama benar-benar
 * menunggu, lalu ditutup ke 100% saat halaman siap.
 */

let pendingCount = 0;
const subscribers = new Set<() => void>();

function emit() {
  subscribers.forEach(notify => notify());
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
}

function getPending() {
  return pendingCount > 0;
}

/** Di server tidak pernah ada rute yang menggantung. */
function getServerPending() {
  return false;
}

function useRoutePending() {
  return useSyncExternalStore(subscribe, getPending, getServerPending);
}

const MIN_VISIBLE_MS = 420;
const EXIT_MS = 320;

export function RouteProgress() {
  const [location] = useLocation();
  const pending = useRoutePending();
  const [phase, setPhase] = useState<"idle" | "running" | "closing">("idle");
  const firstRender = useRef(true);
  const floorReached = useRef(true);

  // Rute berganti: mulai garisnya.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    floorReached.current = false;
    setPhase("running");

    const floor = window.setTimeout(() => {
      floorReached.current = true;
      if (!getPending()) setPhase("closing");
    }, MIN_VISIBLE_MS);

    return () => window.clearTimeout(floor);
  }, [location]);

  // Chunk selesai diunduh setelah durasi minimum terlewati.
  useEffect(() => {
    if (!pending && floorReached.current && phase === "running") {
      setPhase("closing");
    }
  }, [pending, phase]);

  useEffect(() => {
    if (phase !== "closing") return;
    const done = window.setTimeout(() => setPhase("idle"), EXIT_MS);
    return () => window.clearTimeout(done);
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <div className="an-route-progress" aria-hidden="true">
      <span className={`an-route-progress-bar is-${phase}`} />
    </div>
  );
}

/**
 * Tirai perpindahan halaman.
 *
 * Memakai bahasa visual yang sama dengan splash pembuka (wordmark naik +
 * signal line menyapu), hanya lebih pendek supaya navigasi tetap terasa
 * cepat. Hanya hidup di client: HTML hasil SSR tidak pernah membawanya,
 * jadi crawler tetap menerima halaman penuh.
 */
const CURTAIN_HOLD_MS = 560;
const CURTAIN_LIFT_MS = 460;

export function RouteCurtain() {
  const [location] = useLocation();
  const firstRender = useRef(true);
  const [phase, setPhase] = useState<"idle" | "hold" | "lift">("idle");

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    setPhase("hold");
    const toLift = window.setTimeout(() => setPhase("lift"), CURTAIN_HOLD_MS);
    const toIdle = window.setTimeout(
      () => setPhase("idle"),
      CURTAIN_HOLD_MS + CURTAIN_LIFT_MS
    );
    return () => {
      window.clearTimeout(toLift);
      window.clearTimeout(toIdle);
    };
  }, [location]);

  if (phase === "idle") return null;

  return (
    <div
      className={`an-route-curtain is-${phase}`}
      role="status"
      aria-live="polite"
      aria-label="Memuat halaman"
    >
      <div className="an-route-curtain-inner" aria-hidden="true">
        <span className="an-route-curtain-line">
          <span className="an-route-curtain-word">AKBAR</span>
        </span>
        <span className="an-route-curtain-line">
          <span className="an-route-curtain-word">NAWASUNDA</span>
        </span>
        <span className="an-route-curtain-rule" />
        <span className="an-route-curtain-signal" />
      </div>
    </div>
  );
}

const LOADING_WORD = "MEMUAT";

export function PageLoading() {
  useEffect(() => {
    pendingCount += 1;
    emit();
    return () => {
      pendingCount -= 1;
      emit();
    };
  }, []);

  return (
    <div className="an-page-loading" role="status" aria-label="Memuat halaman">
      <p className="an-page-loading-word" aria-hidden="true">
        {LOADING_WORD.split("").map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            {letter}
          </span>
        ))}
      </p>
      <span className="an-page-loading-rule" aria-hidden="true" />
    </div>
  );
}
