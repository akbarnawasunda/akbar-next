import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "@/lib/navigation";
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

const LOADING_WORD = "MEMUAT";

export function PageLoading() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    pendingCount += 1;
    emit();
    return () => {
      pendingCount -= 1;
      emit();
    };
  }, []);

  // Durasi nyata: berapa lama halaman ini benar-benar ditunggu.
  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 100);
    return () => window.clearInterval(timer);
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
      <span className="an-page-loading-elapsed" aria-hidden="true">
        {(elapsed / 1000).toFixed(1)}s
      </span>
    </div>
  );
}
