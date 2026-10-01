/**
 * Signature Runtime — tipe bersama.
 *
 * Satu sumber kebenaran untuk seluruh efek signature (particle background,
 * cursor, audio player, route curtain, timeline, easter egg). Tidak ada
 * komponen yang boleh menyimpan state motion sendiri-sendiri.
 */

/** Mode particle field per konteks halaman. */
export type SignatureFieldMode =
  | "wordmark"
  | "signal"
  | "dust"
  | "era"
  | "quiet"
  | "frequency"
  /** Hanya selama perpindahan halaman: partikel menyusun label tujuan. */
  | "transit";

/** Seberapa jauh runtime boleh bekerja di perangkat ini. */
export type SignatureTier = "off" | "lite" | "full";

export type SignatureViewport = "compact" | "medium" | "wide";

export type SignatureCapability = {
  /** `off` mematikan canvas sepenuhnya, `lite` dipakai perangkat sentuh/hemat. */
  tier: SignatureTier;
  reducedMotion: boolean;
  saveData: boolean;
  /** Pointer kasar (sentuh) — cursor kustom tidak boleh muncul. */
  coarsePointer: boolean;
  /** Benar-benar lemah: CPU sedikit DAN memori kecil. */
  lowPower: boolean;
  viewport: SignatureViewport;
  /** Skor kasar 0..1 untuk menentukan kerapatan partikel. */
  deviceScore: number;
  /** Sudah dihitung di browser (false saat SSR / sebelum mount). */
  measured: boolean;
};

export type SignatureLanguage = "id" | "en";

export type SignatureRouteInfo = {
  path: string;
  lang: SignatureLanguage;
  /** Label pendek untuk route curtain: MUSIK / VISUAL / LIVE / ARSIP … */
  label: string;
  mode: SignatureFieldMode;
};

export type RouteTransitionPhase = "idle" | "sweep" | "settle";

export type SignatureTransition = {
  phase: RouteTransitionPhase;
  targetLabel: string;
  startedAt: number;
};

export type AudioPlayerState =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "minimized"
  | "closed";

export type AudioTrack = {
  id: string;
  title: string;
  subtitle?: string;
  /** Halaman resmi (SoundCloud/Spotify/YouTube) untuk tautan keluar. */
  sourceUrl: string;
  /** URL embed iframe pihak ketiga, bila ada. */
  embedUrl?: string;
  /** File audio resmi yang benar-benar bisa dianalisis Web Audio. */
  previewUrl?: string;
  artwork?: string;
};

export type SignatureAudio = {
  state: AudioPlayerState;
  /**
   * true hanya bila amplitudo benar-benar berasal dari AnalyserNode.
   * Iframe pihak ketiga (SoundCloud/Spotify) selalu false.
   */
  analyzable: boolean;
  track: AudioTrack | null;
};

export type SignatureFrequency = {
  /** Mode easter egg sedang menyala. */
  active: boolean;
  /** User boleh mematikan easter egg untuk sesi ini. */
  enabled: boolean;
  /** Sudah pernah dipicu di sesi ini (sekali per session). */
  triggered: boolean;
};

export type SignatureEra = {
  index: number;
  total: number;
  id: string;
};

/** Snapshot ber-React: hanya berubah saat ada perubahan bermakna. */
export type SignatureSnapshot = {
  capability: SignatureCapability;
  route: SignatureRouteInfo;
  transition: SignatureTransition;
  audio: SignatureAudio;
  frequency: SignatureFrequency;
  era: SignatureEra;
  /** Canvas sudah boleh dimuat (hero terlihat / idle terlewati). */
  fieldReady: boolean;
};

/**
 * Sinyal frekuensi tinggi. Dibaca langsung oleh canvas setiap frame dan
 * TIDAK memicu render React.
 */
export type SignatureSignals = {
  pointerX: number;
  pointerY: number;
  pointerActive: boolean;
  /** Kecepatan pointer (px per gerakan) untuk efek seret. */
  pointerVX: number;
  pointerVY: number;
  /** Timestamp gerakan terakhir; dipakai meluruhkan kecepatan. */
  pointerMovedAt: number;
  pointerPressed: boolean;
  /** Elemen interaktif yang sedang di bawah pointer/fokus. */
  interactive: boolean;
  magnetic: boolean;
  scrollY: number;
  /** 0 di puncak hero, 1 setelah hero terlewati. */
  heroProgress: number;
  /** 0..1. Dari AnalyserNode bila analyzable, selain itu deterministik. */
  amplitude: number;
  /** Fase ketukan deterministik 0..1 untuk fallback iframe. */
  beat: number;
  /** Burst dari tap/drag/click yang belum dikonsumsi engine. */
  bursts: { x: number; y: number; strength: number; at: number }[];
  /**
   * Panggung wordmark: kotak kosong tempat partikel menyusun nama.
   * Diukur dari elemen ber-`data-signal-stage`; `visibility` 1 saat panggung
   * berada di tengah layar dan 0 saat sudah lewat.
   */
  stage: {
    x: number;
    y: number;
    w: number;
    h: number;
    visibility: number;
    /** 0..1 sepanjang jalur scroll panggung; dipakai mengganti kata. */
    progress: number;
  } | null;
};

export type SignatureStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => SignatureSnapshot;
  getServerSnapshot: () => SignatureSnapshot;
  /** Objek mutable, stabil sepanjang hidup aplikasi. */
  signals: SignatureSignals;
  patch: (next: Partial<SignatureSnapshot>) => void;
  burst: (x: number, y: number, strength?: number) => void;
};
