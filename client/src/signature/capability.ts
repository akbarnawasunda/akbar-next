import type { SignatureCapability, SignatureViewport } from "./types";

/**
 * Capability detection.
 *
 * Aturan main (hasil audit versi lama yang menyembunyikan efek di semua
 * mobile): layar sempit BUKAN alasan mematikan signature. Yang mematikan
 * hanyalah preferensi user (reduced motion), mode hemat data, atau perangkat
 * yang benar-benar lemah (CPU sedikit DAN memori kecil). Perangkat sentuh
 * modern tetap mendapat versi `lite`.
 */

const SERVER_CAPABILITY: SignatureCapability = {
  tier: "off",
  reducedMotion: false,
  saveData: false,
  coarsePointer: false,
  lowPower: false,
  viewport: "wide",
  deviceScore: 0,
  measured: false,
};

export function serverCapability(): SignatureCapability {
  return SERVER_CAPABILITY;
}

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

function viewportOf(width: number): SignatureViewport {
  if (width < 768) return "compact";
  if (width < 1180) return "medium";
  return "wide";
}

export function detectCapability(): SignatureCapability {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return SERVER_CAPABILITY;
  }

  const media = (query: string) => {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  };

  const reducedMotion = media("(prefers-reduced-motion: reduce)");
  const coarsePointer = !media("(hover: hover) and (pointer: fine)");
  const connection = (
    navigator as Navigator & { connection?: NetworkInformationLike }
  ).connection;
  const saveData = Boolean(connection?.saveData);
  const slowNetwork = /(^|-)2g$/.test(connection?.effectiveType || "");
  const cores = navigator.hardwareConcurrency || 4;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  const width = window.innerWidth || 1280;

  // Perangkat lemah sungguhan: inti sedikit DAN memori kecil. Ponsel modern
  // yang melaporkan 4 inti / 4 GB tetap mendapat signature versi lite.
  const lowPower = (cores <= 2 && memory <= 2) || (cores <= 1 && memory <= 4);

  const deviceScore = Math.max(
    0,
    Math.min(1, (Math.min(cores, 12) / 12) * 0.6 + (Math.min(memory, 8) / 8) * 0.4)
  );

  const tier: SignatureCapability["tier"] = reducedMotion
    ? "off"
    : saveData || slowNetwork || lowPower
      ? "off"
      : coarsePointer || width < 768 || deviceScore < 0.42
        ? "lite"
        : "full";

  return {
    tier,
    reducedMotion,
    saveData: saveData || slowNetwork,
    coarsePointer,
    lowPower,
    viewport: viewportOf(width),
    deviceScore,
    measured: true,
  };
}

export function capabilityChanged(
  a: SignatureCapability,
  b: SignatureCapability
) {
  return (
    a.tier !== b.tier ||
    a.reducedMotion !== b.reducedMotion ||
    a.saveData !== b.saveData ||
    a.coarsePointer !== b.coarsePointer ||
    a.lowPower !== b.lowPower ||
    a.viewport !== b.viewport ||
    a.measured !== b.measured
  );
}

/** Jumlah partikel maksimum yang masih aman untuk tier ini. */
export function particleBudget(capability: SignatureCapability, area: number) {
  if (capability.tier === "off") return 0;
  if (capability.tier === "lite") {
    return Math.max(120, Math.min(480, Math.floor(area / 3400)));
  }
  const scaled = Math.floor(area / 620);
  const ceiling = 900 + Math.round(capability.deviceScore * 2600);
  return Math.max(900, Math.min(ceiling, scaled));
}
