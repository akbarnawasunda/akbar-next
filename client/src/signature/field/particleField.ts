import { particleBudget } from "../capability";
import { STAGE_PHRASES, phraseFor, releaseRampFor } from "../stagePhrases";
import type {
  SignatureCapability,
  SignatureFieldMode,
  SignatureSignals,
} from "../types";

/**
 * Particle field — Canvas 2D murni, tanpa WebGL dan tanpa library animasi.
 *
 * Satu engine dipakai seluruh situs; mode ditentukan Signature Runtime
 * (wordmark di beranda, signal di musik, dust di visual, era di arsip,
 * frequency saat easter egg). Engine ini tidak tahu apa pun tentang React.
 *
 * Anggaran: < 6ms/frame di perangkat mid-range. Biaya nyatanya ada di LOOP
 * per titik, bukan di luas piksel — jadi isi loop dijaga tetap murah
 * (tabel sinus, jarak kuadrat, konstanta di-hoist) dan jumlah titik aktif
 * dinaikkan/diturunkan sendiri oleh pengukur frame di bawah.
 *
 * Titik di panggung beranda punya tiga status:
 * - `ATTACHED` ditarik pegas ke posisi hurufnya;
 * - `FREE` dilepas saat panggung terlewat — tanpa pegas, meluncur dengan
 *   dorongan radial + kecepatan gulir, melintasi seluruh viewport;
 * - `PARKED` sudah keluar >10% dari viewport, berhenti digambar dan kembali
 *   ke pool. Begitu panggung terlihat lagi mereka terbang masuk dan menyusun
 *   nama kembali — gerakannya dua arah.
 */

export type FieldStateReader = () => {
  mode: SignatureFieldMode;
  capability: SignatureCapability;
  frequency: boolean;
  era: { index: number; total: number };
  transition: "idle" | "sweep" | "settle";
  /** Label tujuan saat berpindah halaman (MUSIK/VISUAL/ARSIP/…). */
  transitLabel: string;
};

/** Status titik di panggung. */
const ATTACHED = 0;
const FREE = 1;
const PARKED = 2;

type Point = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Target dalam koordinat panggung (atau viewport bila tanpa panggung). */
  tx: number;
  ty: number;
  seed: number;
  /** Jeda masuk 0..0.6 — menyapu dari kiri ke kanan. */
  delay: number;
  /** Urutan lepas 0..1: gelombang pelepasan, bukan ledakan serentak. */
  release: number;
  /** Arah satuan tetap milik titik ini (sebar, hanyut, dan lahir ulang). */
  sx: number;
  sy: number;
  /** Variasi kekuatan impuls 0,6..1,4 supaya sebarannya tidak seragam. */
  kick: number;
  /** Debu ambient: tetap melayang pelan di section berikutnya. */
  ambient: boolean;
  /** ATTACHED | FREE | PARKED. */
  state: number;
};

/**
 * Tabel sinus 2048 entri.
 *
 * Isi loop dipanggil ribuan kali per frame; `Math.sin` di dalamnya adalah
 * biaya terbesar setelah jumlah titik itu sendiri. Satu pencarian tabel
 * (indeks dibungkus bitwise AND, jadi argumen negatif pun aman) menggantikan
 * trigonometri penuh dengan galat < 0,002 — tidak terlihat mata pada titik
 * selebar 1,6px.
 */
const TAU = Math.PI * 2;
const TRIG_SIZE = 2048;
const TRIG_MASK = TRIG_SIZE - 1;
const TRIG_SCALE = TRIG_SIZE / TAU;
const TRIG_QUARTER = TRIG_SIZE >> 2;
const SIN_TABLE = new Float32Array(TRIG_SIZE);
for (let i = 0; i < TRIG_SIZE; i++) {
  SIN_TABLE[i] = Math.sin((i / TRIG_SIZE) * TAU);
}
function fastSin(x: number) {
  return SIN_TABLE[(x * TRIG_SCALE) & TRIG_MASK];
}
function fastCos(x: number) {
  return SIN_TABLE[(x * TRIG_SCALE + TRIG_QUARTER) & TRIG_MASK];
}

/** Medan aliran prosedural: murah, tanpa tabel noise, tanpa dependensi. */
function flowAngle(x: number, y: number, t: number) {
  return (
    fastSin(x * 0.0042 + t) * 1.7 +
    fastCos(y * 0.0051 - t * 0.8) * 1.7 +
    fastSin((x + y) * 0.0023 + t * 0.45) * 1.1
  );
}

const WORDMARK = STAGE_PHRASES[0];

/**
 * Font panggung = font JUDUL situs (Syne 800), lalu fallback.
 *
 * Panggung hanya menyusun teks Latin. Aksara Sunda sengaja TIDAK pernah
 * disusun partikel: tanda tempelnya (rarangkén) terlalu halus untuk
 * kerapatan titik berapa pun, dan hasilnya gumpalan, bukan tulisan. Aksara
 * dirender sebagai teks sungguhan di `SundaScript.tsx`.
 */
const WORDMARK_FONT =
  '"Big Shoulders Display", "Schibsted Grotesk", sans-serif';

/** Mode yang menyusun huruf; butuh titik lebih banyak agar terbaca. */
const TEXT_MODES: SignatureFieldMode[] = ["wordmark", "frequency", "transit"];

/** Lama titik berkumpul menjadi huruf (ms). */
const FORMATION_MS = 2100;
/** Ganti kata / masuk lagi setelah dilepas: harus terasa cepat, bukan ulang. */
const MORPH_FORMATION_MS = 900;
/** Versi cepat saat berpindah halaman — harus selesai dalam satu sapuan. */
const TRANSIT_FORMATION_MS = 420;
const TRANSIT_SETTLE_MS = 420;

/**
 * Ukuran titik (px, sebelum dpr).
 *
 * Desktop sengaja kecil dan rapat: 1,6px dengan ~4.300 titik terbaca lebih
 * tegas daripada 2,5px dengan 2.600 titik, karena tepi hurufnya tidak lagi
 * bergerigi. Layar kecil tetap butuh titik sedikit lebih tebal — di 1,6px
 * dengan dpr dibatasi 1,5 wordmark-nya mulai memudar.
 */
const DOT_SIZE_FULL = 1.6;
const DOT_SIZE_LITE = 1.9;
/** Satu dari empat kelompok sedikit lebih besar: inti huruf. */
const CORE_BOOST = 0.4;

/**
 * Batas atas jumlah titik mode teks (bukan beban tetap — lihat pengukur).
 *
 * Dikalibrasi lewat `scripts/bench-particle-field.ts`: dengan loop yang sudah
 * dibersihkan, 5.200 titik di desktop masih ±0,2ms/frame, jauh di bawah
 * anggaran 6ms. Angkanya dinaikkan dari usulan awal (4.500/300) karena titik
 * 1,6px menutup lebih sedikit tinta daripada 2,5px: kerapatanlah yang menjaga
 * wordmark tetap tegas, bukan ukuran titiknya.
 */
const TEXT_CEILING_FULL = 5200;
const TEXT_CEILING_LITE = 1800;
/** Satu titik per sekian px² viewport. */
const TEXT_DENSITY_FULL = 280;
const TEXT_DENSITY_LITE = 250;

/**
 * Pengaman adaptif. Rata-rata bergulir 60 frame; di atas 9ms jumlah titik
 * dipangkas 10% bertahap, dan baru dinaikkan lagi setelah 2 detik stabil di
 * bawah 5ms. Dengan ini ceiling di atas adalah batas atas yang aman, bukan
 * beban tetap: perangkat lemah menurunkan sendiri tanpa kita mematikan efek.
 */
const COST_WINDOW = 60;
const COST_CUT_MS = 9;
const COST_GROW_MS = 5;
const COST_GROW_HOLD_MS = 2000;
/** Lantai: di bawah ini wordmark mulai tidak terbaca. */
const COST_FLOOR_RATIO = 0.3;

function readToken(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function rgbaFrom(hex: string, alpha: number, fallback: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return fallback;
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export type ParticleField = {
  resize: () => void;
  destroy: () => void;
};

export function createParticleField(
  canvas: HTMLCanvasElement,
  signals: SignatureSignals,
  readState: FieldStateReader
): ParticleField {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return { resize: () => undefined, destroy: () => undefined };
  }
  const ctx = context;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let points: Point[] = [];
  let activeCount = 0;
  let currentMode: SignatureFieldMode | null = null;
  let currentEra = -1;
  let frame = 0;
  let running = false;
  let destroyed = false;
  let lastTime = 0;
  let sweepEnergy = 0;
  let formationStart = -1;
  let formationMs = FORMATION_MS;
  let stageOffsetX = 0;
  let stageOffsetY = 0;
  let stageWidth = 0;
  let stageHeight = 0;
  let phraseIndex = 0;
  let transitLabel = "";
  let settleStart = -1;
  let lastTransition: "idle" | "sweep" | "settle" = "idle";
  /** Masih ada titik yang terbang bebas → frame berikutnya tetap digambar. */
  let flying = 0;
  /** Masih ada titik yang menempel → masih ada yang perlu dilepas. */
  let attached = 1;
  let wasReleasing = false;
  let idleCleared = false;

  // Pengukur frame: rata-rata bergulir, bukan EMA — satu frame buruk tidak
  // boleh memangkas titik, dan satu frame baik tidak boleh menaikkannya.
  const costSamples = new Float32Array(COST_WINDOW);
  let costIndex = 0;
  let costFilled = 0;
  let costSum = 0;
  let steadySince = -1;

  function resetCostWindow() {
    costSamples.fill(0);
    costIndex = 0;
    costFilled = 0;
    costSum = 0;
    steadySince = -1;
  }

  // Warna diambil dari token tema (client/src/index.css) supaya palet
  // signature tidak pernah menyimpang dari brand.
  const paper = readToken("--paper", "#eceae5");
  const acid = readToken("--acid", "#8fb2c0");

  // Huruf harus benar-benar terbaca; mode ambient tetap tipis.
  const textColors = [
    rgbaFrom(acid, 0.76, "rgba(143,178,192,0.76)"),
    rgbaFrom(acid, 0.95, "rgba(143,178,192,0.95)"),
    rgbaFrom(paper, 0.86, "rgba(236,234,229,0.86)"),
    rgbaFrom(paper, 1, "rgba(236,234,229,1)"),
  ];
  const ambientColors = [
    rgbaFrom(acid, 0.2, "rgba(143,178,192,0.2)"),
    rgbaFrom(acid, 0.34, "rgba(143,178,192,0.34)"),
    rgbaFrom(paper, 0.4, "rgba(236,234,229,0.4)"),
    rgbaFrom(paper, 0.6, "rgba(236,234,229,0.6)"),
  ];

  /** Saat berpindah halaman, label tujuan mengambil alih mode rute. */
  function resolveMode(
    state: ReturnType<FieldStateReader>
  ): SignatureFieldMode {
    return state.transition !== "idle" && state.transitLabel
      ? "transit"
      : state.mode;
  }

  /* ---------------------------------------------------------------- targets */

  /**
   * Raster wordmark lalu ambil piksel yang terisi sebagai target titik.
   *
   * Dua hal yang dulu salah dan diperbaiki di sini:
   * 1. Koordinat Y ikut dibagi rasio lebar, jadi teks melayang keluar posisi
   *    di layar yang rasionya tidak sama dengan kanvas sampel.
   * 2. Ukuran font ditebak dari jumlah karakter, jadi di layar lebar teksnya
   *    lebih lebar dari kanvas sampel dan huruf pinggirnya terpotong.
   *    Sekarang font dipaskan dengan `measureText`.
   */
  function sampleTextTargets(
    lines: string[],
    widthRatio: number,
    centerY: number,
    wanted: number,
    boxWidth = width,
    boxHeight = height,
    /**
     * `true` = ambil TEPI huruf saja (piksel terisi yang bersebelahan dengan
     * piksel kosong pada jarak 1-2px), bukan seluruh isinya. Dipakai frasa
     * nama: dengan jumlah titik yang sama huruf jadi terbaca sebagai tulisan
     * bergaris, bukan gundukan kerikil — dan saat titik dilepas yang
     * menguap adalah garis hurufnya.
     */
    edgeOnly = false
  ) {
    const sampleWidth = Math.max(320, Math.min(Math.round(boxWidth), 1600));
    const sampleHeight = Math.max(200, Math.min(Math.round(boxHeight), 1000));
    const scaleX = boxWidth / sampleWidth;
    const scaleY = boxHeight / sampleHeight;

    const offscreen = document.createElement("canvas");
    offscreen.width = sampleWidth;
    offscreen.height = sampleHeight;
    const sample = offscreen.getContext("2d", { willReadFrequently: true });
    if (!sample) return [];

    const setFont = (size: number) => {
      sample.font = `800 ${size}px ${WORDMARK_FONT}`;
    };
    const spaced = sample as CanvasRenderingContext2D & {
      letterSpacing?: string;
    };
    if ("letterSpacing" in spaced) spaced.letterSpacing = "0.02em";

    const maxTextWidth = sampleWidth * widthRatio;
    let fontSize = Math.min(
      (sampleHeight / lines.length) * 0.78,
      sampleWidth * 0.26
    );
    setFont(fontSize);
    const widest = Math.max(
      1,
      ...lines.map(line => sample.measureText(line).width)
    );
    if (widest > maxTextWidth) {
      fontSize = Math.max(18, fontSize * (maxTextWidth / widest));
      setFont(fontSize);
    }

    sample.fillStyle = "#fff";
    sample.textAlign = "center";
    sample.textBaseline = "middle";
    const lineHeight = fontSize * 1.04;
    const top = sampleHeight * centerY - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      sample.fillText(line, sampleWidth / 2, top + index * lineHeight);
    });

    const pixels = sample.getImageData(0, 0, sampleWidth, sampleHeight).data;

    // Langkah sampling disesuaikan agar jumlah target kira-kira sebanyak
    // titik yang tersedia: terlalu rapat boros, terlalu renggang tidak
    // terbaca.
    const ALPHA = 110;
    const filled = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= sampleWidth || y >= sampleHeight) return false;
      return pixels[(y * sampleWidth + x) * 4 + 3] > ALPHA;
    };

    /**
     * Piksel tepi: terisi, dan ada piksel kosong di jarak 1-2px pada salah
     * satu dari delapan arah. Radius 2 (bukan 1) dipilih supaya garisnya
     * tetap punya badan satu-dua titik di sisi dalam — radius 1 membuat
     * huruf terlihat seperti garis rambut yang putus-putus pada layar
     * kerapatan rendah.
     */
    const isEdge = (x: number, y: number) => {
      for (let d = 1; d <= 2; d++) {
        if (
          !filled(x + d, y) ||
          !filled(x - d, y) ||
          !filled(x, y + d) ||
          !filled(x, y - d) ||
          !filled(x + d, y + d) ||
          !filled(x - d, y - d) ||
          !filled(x + d, y - d) ||
          !filled(x - d, y + d)
        ) {
          return true;
        }
      }
      return false;
    };

    const collect = (step: number) => {
      const targets: { x: number; y: number }[] = [];
      for (let y = 0; y < sampleHeight; y += step) {
        for (let x = 0; x < sampleWidth; x += step) {
          if (!filled(x, y)) continue;
          if (edgeOnly && !isEdge(x, y)) continue;
          targets.push({ x: x * scaleX, y: y * scaleY });
        }
      }
      return targets;
    };

    // Tepi huruf jauh lebih sedikit daripada isinya, jadi langkah awalnya
    // 1px; mode isi penuh tetap mulai dari 2px seperti sebelumnya.
    let step = edgeOnly ? 1 : 2;
    let targets = collect(step);
    while (targets.length > wanted * 2.4 && step < 7) {
      step += 1;
      targets = collect(step);
    }
    return targets;
  }

  /**
   * Memo sampel teks.
   *
   * Pengambilan target tepi membaca piksel satu per satu (ribuan kali),
   * dan `morphTo` memanggilnya tepat saat pengguna sedang menggulir —
   * waktu paling buruk untuk kerja sinkron. Kuncinya frasa + ukuran kotak +
   * jumlah titik, jadi dua frasa panggung cukup disampling sekali masing-
   * masing; cache dikosongkan saat kanvas berubah ukuran.
   */
  const targetCache = new Map<string, { x: number; y: number }[]>();

  function cachedTextTargets(
    key: string,
    build: () => { x: number; y: number }[]
  ) {
    const hit = targetCache.get(key);
    if (hit) return hit;
    const built = build();
    if (targetCache.size > 6) targetCache.clear();
    targetCache.set(key, built);
    return built;
  }

  function targetsFor(
    mode: SignatureFieldMode,
    index: number,
    total: number,
    wanted: number
  ) {
    const stage = signals.stage;
    switch (mode) {
      case "wordmark":
      case "frequency": {
        // Ada panggung khusus → wordmark disusun di dalam kotak itu, dalam
        // koordinat lokal panggung, jadi tidak pernah menimpa judul hero.
        const boxWidth = stage ? stage.w : width;
        const boxHeight = stage ? stage.h : height;
        const compact = boxWidth < 900;
        const phrase = stage
          ? STAGE_PHRASES[phraseIndex] || WORDMARK
          : WORDMARK;
        const lines = compact ? phrase : [phrase.join(" ").replace(" .", ".")];
        return cachedTextTargets(
          `${mode}|${lines.join("/")}|${Math.round(boxWidth)}x${Math.round(
            boxHeight
          )}|${wanted}`,
          () =>
            sampleTextTargets(
              lines,
              compact ? 0.92 : 0.9,
              stage ? 0.5 : compact ? 0.36 : 0.44,
              wanted,
              boxWidth,
              boxHeight,
              // Hanya frasa NAMA yang diambil dari tepi huruf. Mode lain
              // (signal, dust, era, frequency) tujuannya massa, jadi isinya
              // tetap penuh.
              mode === "wordmark"
            )
        );
      }
      case "transit": {
        // Label tujuan selalu di tengah viewport, bukan di panggung.
        return sampleTextTargets([transitLabel], 0.74, 0.5, wanted);
      }
      case "signal": {
        const list: { x: number; y: number }[] = [];
        const baseline = height * 0.46;
        const steps = Math.max(240, Math.floor(width / 2));
        for (let i = 0; i < steps; i++) {
          const x = (i / steps) * width;
          const wave =
            Math.sin((i / steps) * TAU * 3) * height * 0.08 +
            Math.sin((i / steps) * TAU * 7.5) * height * 0.03;
          list.push({ x, y: baseline + wave });
        }
        return list;
      }
      case "era": {
        const list: { x: number; y: number }[] = [];
        const lanes = Math.max(1, total || 1);
        const laneHeight = height / (lanes + 1);
        for (let lane = 0; lane < lanes; lane++) {
          const y = laneHeight * (lane + 1);
          const density = lane === index ? 220 : 90;
          for (let i = 0; i < density; i++) {
            list.push({
              x: width * (0.08 + Math.random() * 0.84),
              y:
                y +
                (Math.random() - 0.5) *
                  laneHeight *
                  (lane === index ? 0.5 : 0.22),
            });
          }
        }
        return list;
      }
      case "dust":
      case "quiet":
      default:
        return [];
    }
  }

  /** Jumlah titik untuk mode ini. Huruf butuh massa, ambient tidak. */
  function countFor(mode: SignatureFieldMode, capability: SignatureCapability) {
    const base = particleBudget(capability, width * height);
    if (mode === "quiet") return Math.round(base * 0.35);
    if (!TEXT_MODES.includes(mode)) return base;
    // Titik lebih kecil hanya terbaca kalau lebih rapat: kerapatan naik
    // bersama pengecilan ukuran titik, dan ceiling-nya dijaga pengukur frame.
    const lite = capability.tier === "lite";
    const ceiling = lite ? TEXT_CEILING_LITE : TEXT_CEILING_FULL;
    const density = lite ? TEXT_DENSITY_LITE : TEXT_DENSITY_FULL;
    return Math.max(
      base,
      Math.min(ceiling, Math.round((width * height) / density))
    );
  }

  function buildPoints() {
    const state = readState();
    const mode = resolveMode(state);
    transitLabel = state.transitLabel;
    const count = countFor(mode, state.capability);
    const targets = targetsFor(mode, state.era.index, state.era.total, count);
    const textMode = TEXT_MODES.includes(mode);
    const stage = signals.stage;
    const anchored = textMode && mode !== "transit" && Boolean(stage);
    stageWidth = stage ? stage.w : 0;
    stageHeight = stage ? stage.h : 0;
    stageOffsetX = stage ? stage.x - stage.w / 2 : 0;
    stageOffsetY = stage ? stage.y - stage.h / 2 : 0;
    const next: Point[] = [];
    const radius = Math.max(width, height);
    const boxWidth = Math.max(1, anchored ? stageWidth : width);
    for (let i = 0; i < count; i++) {
      const target = targets.length
        ? targets[Math.floor((i / count) * targets.length) % targets.length]
        : { x: Math.random() * width, y: Math.random() * height };
      const jitter = targets.length ? 2.2 : 0;
      // Mode teks: titik lahir di luar layar lalu terbang masuk membentuk
      // nama. Mode ambient tetap lahir di tempatnya agar tidak ada "sapuan"
      // besar di halaman dalam.
      const angle = Math.random() * TAU;
      const distance = radius * (0.62 + Math.random() * 0.5);
      const originX = anchored ? stageOffsetX + stageWidth / 2 : width / 2;
      const originY = anchored ? stageOffsetY + stageHeight / 2 : height / 2;
      const sx = Math.cos(angle);
      const sy = Math.sin(angle);
      next.push({
        x: textMode ? originX + sx * distance : Math.random() * width,
        y: textMode ? originY + sy * distance : Math.random() * height,
        vx: 0,
        vy: 0,
        tx: target.x + (Math.random() - 0.5) * jitter,
        ty: target.y + (Math.random() - 0.5) * jitter,
        seed: Math.random() * TAU,
        // Sapuan kiri→kanan: huruf terbentuk seperti ditulis, bukan muncul
        // acak sekaligus.
        delay: textMode
          ? Math.min(0.62, (target.x / boxWidth) * 0.5 + Math.random() * 0.12)
          : 0,
        // Lepasnya juga menyapu, dengan jitter supaya tidak serentak.
        release: Math.min(
          1,
          (target.x / boxWidth) * 0.5 + Math.random() * 0.52
        ),
        sx,
        sy,
        kick: 0.6 + Math.random() * 0.8,
        // Sepertiga titik ditahan sebagai debu: setelah panggung lewat
        // mereka melayang pelan di section berikutnya, tidak hilang total.
        ambient: i % 3 === 0,
        state: ATTACHED,
      });
    }
    points = next;
    activeCount = next.length;
    currentMode = mode;
    currentEra = state.era.index;
    formationStart = -1;
    formationMs = mode === "transit" ? TRANSIT_FORMATION_MS : FORMATION_MS;
    flying = 0;
    attached = next.length;
    wasReleasing = false;
    resetCostWindow();
  }

  function retarget() {
    const state = readState();
    const mode = resolveMode(state);
    const desired = countFor(mode, state.capability);
    if (Math.abs(desired - points.length) > Math.max(1, desired * 0.2)) {
      buildPoints();
      return;
    }
    const targets = targetsFor(mode, state.era.index, state.era.total, desired);
    points.forEach((point, index) => {
      const target = targets.length
        ? targets[
            Math.floor((index / points.length) * targets.length) %
              targets.length
          ]
        : { x: Math.random() * width, y: Math.random() * height };
      point.tx = target.x;
      point.ty = target.y;
    });
    const stage = signals.stage;
    stageWidth = stage ? stage.w : 0;
    stageHeight = stage ? stage.h : 0;
    currentMode = mode;
    currentEra = state.era.index;
    activeCount = Math.min(points.length, desired);
    formationStart = -1;
    formationMs = mode === "transit" ? TRANSIT_FORMATION_MS : FORMATION_MS;
    // Ganti mode = kontrak ulang: titik yang sedang terbang ikut dipanggil.
    for (let i = 0; i < points.length; i++) points[i].state = ATTACHED;
    flying = 0;
    attached = points.length;
    wasReleasing = false;
  }

  /**
   * Ganti kata yang sedang disusun: huruf lama pecah dulu (tiap titik dapat
   * dorongan acak), lalu sapuan kiri→kanan diputar ulang untuk kata baru.
   */
  function morphTo(next: number) {
    phraseIndex = next;
    const state = readState();
    const mode = resolveMode(state);
    const desired = countFor(mode, state.capability);
    const targets = targetsFor(mode, state.era.index, state.era.total, desired);
    if (!targets.length) return;
    const boxWidth = Math.max(1, stageWidth || width);
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const target =
        targets[
          Math.floor((i / points.length) * targets.length) % targets.length
        ];
      point.tx = target.x + (Math.random() - 0.5) * 2.2;
      point.ty = target.y + (Math.random() - 0.5) * 2.2;
      point.delay = Math.min(
        0.62,
        (target.x / boxWidth) * 0.5 + Math.random() * 0.12
      );
      point.release = Math.min(
        1,
        (target.x / boxWidth) * 0.5 + Math.random() * 0.52
      );
      const angle = Math.random() * TAU;
      const kick = 4 + Math.random() * 7;
      point.vx += Math.cos(angle) * kick;
      point.vy += Math.sin(angle) * kick;
    }
    formationStart = -1;
    // Jalur panggung sekarang pendek: pergantian kata harus selesai jauh
    // sebelum frasa berikutnya, jadi morph dirakit lebih cepat daripada
    // kemunculan pertama.
    formationMs = MORPH_FORMATION_MS;
  }

  /* ------------------------------------------------------------------ frame */

  /** Scanline tipis yang menyapu turun — hanya di mode frequency. */
  function drawScanline(time: number, amplitude: number) {
    const span = height * 0.14;
    const y = ((time * 0.00022) % 1) * (height + span) - span;
    const band = ctx.createLinearGradient(0, y, 0, y + span);
    band.addColorStop(0, rgbaFrom(acid, 0, "rgba(143,178,192,0)"));
    band.addColorStop(
      0.5,
      rgbaFrom(acid, 0.1 + amplitude * 0.16, "rgba(143,178,192,0.16)")
    );
    band.addColorStop(1, rgbaFrom(acid, 0, "rgba(143,178,192,0)"));
    ctx.fillStyle = band;
    ctx.fillRect(0, y, width, span);
  }

  function drawGrid(amplitude: number) {
    ctx.strokeStyle = rgbaFrom(
      acid,
      0.06 + amplitude * 0.1,
      "rgba(143,178,192,0.1)"
    );
    ctx.lineWidth = 1;
    const gap = Math.max(48, width / 18);
    ctx.beginPath();
    for (let x = 0; x <= width; x += gap) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gap) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  function step(time: number) {
    if (!running) return;
    const state = readState();

    if (state.capability.tier === "off") {
      ctx.clearRect(0, 0, width, height);
      running = false;
      frame = 0;
      return;
    }

    const mode = resolveMode(state);
    if (mode === "transit" && state.transitLabel !== transitLabel) {
      // Tujuan baru → huruf lama pecah, huruf tujuan dirakit.
      transitLabel = state.transitLabel;
      currentMode = null;
    }
    if (mode !== currentMode || state.era.index !== currentEra) {
      retarget();
    }

    if (state.transition === "settle") {
      if (settleStart < 0) settleStart = time;
    } else {
      settleStart = -1;
    }

    if (state.transition !== lastTransition) {
      if (state.transition === "sweep") sweepEnergy = 1;
      lastTransition = state.transition;
    }

    const started = performance.now();
    const delta = Math.min(2.2, (time - lastTime) / 16.67 || 1);
    lastTime = time;

    const amplitude = signals.amplitude;
    const hero = signals.heroProgress;
    const frequency = state.frequency;

    const textMode = TEXT_MODES.includes(mode);
    const colors = textMode ? textColors : ambientColors;
    const stage = signals.stage;
    const anchored = textMode && mode !== "transit" && Boolean(stage);

    // Panggung: posisi, pergantian kata, dan gelombang pelepasan.
    let releaseRamp = 0;
    let stageVisible = 1;
    if (anchored && stage) {
      // Panggung berubah ukuran (resize / layout) → susun ulang hurufnya.
      if (
        Math.abs(stage.w - stageWidth) > 24 ||
        Math.abs(stage.h - stageHeight) > 24
      ) {
        buildPoints();
      }
      stageVisible = stage.visibility;
      releaseRamp = releaseRampFor(stage.progress, stage.visibility);

      const nextX = stage.x - stage.w / 2;
      const nextY = stage.y - stage.h / 2;
      const shiftX = nextX - stageOffsetX;
      const shiftY = nextY - stageOffsetY;
      // Titik ikut bergerak bersama panggung saat halaman digulir, jadi
      // wordmark terkunci di sectionnya, bukan tertinggal di belakang.
      // Titik yang sudah lepas TIDAK ikut: mereka hidup di koordinat layar,
      // itulah yang membuat mereka menyeberangi viewport alih-alih
      // tersangkut di panggung yang sedang pergi.
      if (shiftX || shiftY) {
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          if (point.state !== ATTACHED) continue;
          point.x += shiftX;
          point.y += shiftY;
        }
        stageOffsetX = nextX;
        stageOffsetY = nextY;
      }
      // Kata berganti mengikuti posisi scroll di jalur panggung — tapi tidak
      // saat titik sudah dilepas; mengganti target di udara terlihat seperti
      // kedutan, bukan pergantian kata.
      if (releaseRamp < 0.02) {
        const nextPhrase = phraseFor(stage.progress);
        if (nextPhrase !== phraseIndex) morphTo(nextPhrase);
      }

      // Panggung jauh di luar layar, tidak ada titik yang masih terbang, dan
      // tidak ada lagi yang menunggu dilepas: tidak ada gunanya menggambar.
      if (stage.visibility <= 0.02 && flying === 0 && attached === 0) {
        if (!idleCleared) {
          ctx.clearRect(0, 0, width, height);
          idleCleared = true;
        }
        frame = requestAnimationFrame(step);
        return;
      }
    } else {
      stageOffsetX = 0;
      stageOffsetY = 0;
    }
    idleCleared = false;

    const releasing = releaseRamp > 0.001;
    if (!releasing && wasReleasing) {
      // Gulir balik ke atas: koreografi masuk diputar ulang (versi cepat)
      // supaya titik benar-benar terbang masuk dan menyusun nama lagi.
      formationStart = -1;
      formationMs = MORPH_FORMATION_MS;
    }
    wasReleasing = releasing;

    if (formationStart < 0) formationStart = time;
    const formation = Math.max(
      0,
      Math.min(1, (time - formationStart) / formationMs)
    );
    const pointerX = signals.pointerActive ? signals.pointerX : -9999;
    const pointerY = signals.pointerActive ? signals.pointerY : -9999;
    const repelRadius = state.capability.tier === "lite" ? 90 : 130;
    const repelRadiusSquared = repelRadius * repelRadius;
    const spring = 0.055 + amplitude * 0.02;
    const damping = 0.82;
    /** Titik bebas nyaris tidak direm: itu yang membuatnya meluncur jauh. */
    const freeDamping = 0.985;
    const ambientDamping = 0.992;
    const settleRamp =
      settleStart >= 0
        ? Math.max(0, Math.min(1, (time - settleStart) / TRANSIT_SETTLE_MS))
        : 0;
    // "Buyar" versi lama (menggeser target + meredup) hanya dipakai di luar
    // panggung: tirai perpindahan halaman dan fallback tanpa panggung. Di
    // panggung, buyar sekarang berarti titik benar-benar dilepas.
    const disperse = anchored
      ? 0
      : mode === "transit"
        ? settleRamp
        : mode === "wordmark"
          ? hero
          : hero * 0.4;
    const sweep = sweepEnergy;

    // Kecepatan gulir (px/ms) → dorongan. Gulir pelan menggeser titik
    // sedikit; gulir kencang melemparkannya melintasi layar.
    const scrollVelocity = Math.max(-6, Math.min(6, signals.scrollVelocity));
    // Layar bergerak ke atas saat menggulir turun; titik ikut tersapu ke
    // arah yang sama supaya terasa didorong oleh scroll, bukan oleh waktu.
    const scrollPushY = -scrollVelocity * 0.075;
    const scrollSpread = Math.abs(scrollVelocity) * 0.05;
    const scrollNudgeY = -scrollVelocity * 0.5;

    // Jejak gerak. Selama titik masih terbang masuk, buyar, atau disapu
    // transisi, frame sebelumnya tidak dihapus total sehingga tiap titik
    // meninggalkan ekor halus. Begitu wordmark mengunci, penghapusan kembali
    // penuh supaya hurufnya tetap tajam.
    const motion = Math.max(1 - formation, disperse, sweep);
    let clearStrength = motion > 0.02 ? 0.26 + (1 - motion) * 0.6 : 1;
    // Titik yang terbang bebas mendapat ekor pendek — ekor panjang di
    // seluruh layar berubah jadi noda, bukan gerak.
    if (releasing && stageVisible > 0.05 && clearStrength > 0.52) {
      clearStrength = 0.52;
    }
    if (clearStrength >= 1) {
      ctx.clearRect(0, 0, width, height);
    } else {
      // Jejak hanya perlu dipelihara di sekitar panggung; sisanya dihapus
      // biasa supaya tidak ada sisa gambar yang menggantung. Saat titik
      // dilepas, panggungnya tidak lagi membatasi: mereka ke mana-mana.
      const fadeTop =
        anchored && stage && !releasing
          ? Math.max(0, stageOffsetY - stage.h * 0.9)
          : 0;
      const fadeHeight =
        anchored && stage && !releasing
          ? Math.min(height - fadeTop, stage.h * 3.2)
          : height;
      if (fadeTop > 0) ctx.clearRect(0, 0, width, fadeTop);
      const fadeBottom = fadeTop + fadeHeight;
      if (fadeBottom < height) {
        ctx.clearRect(0, fadeBottom, width, height - fadeBottom);
      }
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${clearStrength.toFixed(3)})`;
      ctx.fillRect(0, fadeTop, width, fadeHeight);
      ctx.restore();
    }

    if (frequency) {
      drawGrid(amplitude);
      drawScanline(time, amplitude);
    }

    // Denyut halus: bernapas pelan saat senyap, mengikuti amplitudo saat ada
    // audio yang benar-benar bisa dianalisis.
    const pulse =
      1 +
      fastSin(time * 0.0009) * 0.004 +
      amplitude * 0.03 * (textMode ? 1 : 0.4);
    const centerX = anchored && stage ? stage.w / 2 : width / 2;
    const centerY = anchored && stage ? stage.h / 2 : height / 2;
    // Pusat panggung dalam koordinat layar: titik dilempar menjauh dari sini.
    const originX = anchored && stage ? stageOffsetX + stage.w / 2 : width / 2;
    const originY = anchored && stage ? stageOffsetY + stage.h / 2 : height / 2;

    // Seret: gerakan pointer ikut membawa partikel di sekitarnya, lalu
    // kecepatannya meluruh sendiri.
    const pointerAge = signals.pointerMovedAt
      ? Math.max(0, time - signals.pointerMovedAt)
      : 9999;
    const dragFade = Math.max(0, 1 - pointerAge / 160);
    const dragX = Math.max(-26, Math.min(26, signals.pointerVX)) * dragFade;
    const dragY = Math.max(-26, Math.min(26, signals.pointerVY)) * dragFade;

    // Glitch per kolom untuk mode frequency: kolom-kolom huruf tergeser
    // sesaat dan berganti tiap ~140ms, seperti sinyal yang pecah.
    const glitchTick = Math.floor(time / 140);
    const glitchAmount = frequency ? 7 + amplitude * 26 : 0;

    // Burst dari tap/drag/klik: satu kali impuls radial.
    const bursts = signals.bursts.splice(0, signals.bursts.length);
    const burstCount = bursts.length;

    // --- konstanta loop (dihitung sekali, bukan per titik) ----------------
    const base =
      state.capability.tier === "lite" ? DOT_SIZE_LITE : DOT_SIZE_FULL;
    const size = textMode ? base : base * 0.62;
    const wobble = frequency ? 2.4 + amplitude * 9 : 1.6 + amplitude * 3.4;
    const wobbleTimeX = time * 0.0006;
    const wobbleTimeY = time * 0.0007;
    const flowTime = time * 0.00022;
    const sparkleTime = time * 0.0031;
    const driftSway = fastSin(time * 0.00042) * 0.012;
    const driftSwayY = fastCos(time * 0.00031) * 0.012;
    const marginX = width * 0.1;
    const marginY = height * 0.1;
    const returnRadius = Math.max(width, height) * 0.72;
    const limit = Math.min(activeCount, points.length);
    // Tirai perpindahan halaman memang harus meluruh; panggung TIDAK —
    // di sana setiap titik tetap digambar, yang hilang hanya yang benar-benar
    // terbang keluar layar.
    const drawLimit =
      mode === "transit"
        ? Math.max(
            Math.round(limit * 0.25),
            Math.round(limit * (1 - settleRamp * 0.55))
          )
        : limit;

    // Saat dilepas titik meredup secukupnya — tidak sampai menghilang.
    // Kurvanya menerus: 1 saat menyusun nama, ~0,45 saat baru terlepas
    // (panggung masih terlihat), lalu ~0,2 saat yang tersisa tinggal debu di
    // atas section berikutnya — di sana yang harus terbaca adalah teksnya,
    // bukan debunya.
    const visibleFade = Math.max(0, Math.min(1, stageVisible / 0.3));
    ctx.globalAlpha =
      mode === "transit"
        ? Math.max(0.12, 1 - settleRamp * 0.7)
        : releasing
          ? Math.max(0.2, 1 - releaseRamp * 0.55 - (1 - visibleFade) * 0.25)
          : Math.max(0.3, 1 - disperse * 0.6);

    const buckets = colors.length;
    let airborne = 0;
    let holding = 0;
    for (let b = 0; b < buckets; b++) {
      ctx.fillStyle = colors[b];
      // Satu dari empat kelompok sedikit lebih besar supaya huruf punya
      // "inti" yang terbaca, bukan kabut rata.
      const dotSize = b === buckets - 1 ? size + CORE_BOOST : size;
      const sparkleBucket = textMode && b === buckets - 1;
      // Titik dikelompokkan dengan langkah 4 (bucket = indeks % 4): tiap
      // warna hanya menyentuh titiknya sendiri, jadi satu frame = satu
      // lintasan penuh array, bukan empat.
      for (let i = b; i < drawLimit; i += buckets) {
        const point = points[i];

        // --- status: lepas, pulang, atau tetap ---------------------------
        if (releasing) {
          if (point.state === ATTACHED && point.release <= releaseRamp) {
            const rx = point.x - originX;
            const ry = point.y - originY;
            const distanceSquared = rx * rx + ry * ry;
            const ambient = point.ambient;
            const power = (ambient ? 1.15 : 6.4) * point.kick;
            if (distanceSquared > 1) {
              // Satu akar kuadrat per titik SEKALI SEUMUR PELEPASAN —
              // bukan tiap frame.
              const inverse = 1 / Math.sqrt(distanceSquared);
              point.vx += rx * inverse * power;
              point.vy += ry * inverse * power;
            } else {
              point.vx += point.sx * power;
              point.vy += point.sy * power;
            }
            // Dorongan searah gulir, dikali kecepatan gulir.
            point.vx += point.sx * scrollSpread * (ambient ? 2 : 9);
            point.vy += scrollNudgeY * (ambient ? 0.35 : 1.6) * point.kick;
            point.state = FREE;
          }
        } else if (point.state !== ATTACHED) {
          if (point.state === PARKED) {
            // Kembali dari pool: lahir lagi di luar layar, lalu terbang
            // masuk menyusun nama.
            point.x = originX + point.sx * returnRadius;
            point.y = originY + point.sy * returnRadius;
            point.vx = 0;
            point.vy = 0;
          }
          point.state = ATTACHED;
        }

        if (point.state === PARKED) continue;

        // --- gaya yang berlaku untuk semua titik --------------------------
        const dx = point.x - pointerX;
        const dy = point.y - pointerY;
        const pointerDistanceSquared = dx * dx + dy * dy;
        if (pointerDistanceSquared < repelRadiusSquared) {
          const distance = Math.sqrt(pointerDistanceSquared) || 1;
          const falloff = 1 - distance / repelRadius;
          const force = falloff * 2.6;
          point.vx += (dx / distance) * force;
          point.vy += (dy / distance) * force;
          // Nama ikut terseret ke arah gerakan kursor, lalu pulih sendiri.
          point.vx += dragX * falloff * 0.16;
          point.vy += dragY * falloff * 0.16;
        }

        for (let k = 0; k < burstCount; k++) {
          const burst = bursts[k];
          const bx = point.x - burst.x;
          const by = point.y - burst.y;
          const burstSquared = bx * bx + by * by;
          if (burstSquared > 102400) continue; // 320px, dibandingkan kuadrat
          const burstDistance = Math.sqrt(burstSquared) || 1;
          const force = (1 - burstDistance / 320) * 16 * burst.strength;
          point.vx += (bx / burstDistance) * force;
          point.vy += (by / burstDistance) * force;
        }

        if (point.state === FREE) {
          // --- terbang bebas: tanpa pegas, tanpa target --------------------
          const ambient = point.ambient;
          point.vx += point.sx * scrollSpread * (ambient ? 0.25 : 1);
          point.vy += scrollPushY * (ambient ? 0.25 : 1);
          point.vx += driftSway * point.sx;
          point.vy += driftSwayY * point.sy;
          if (!ambient) {
            // Angin keluar yang pelan tapi tidak pernah berhenti: tanpa ini
            // titik melambat lalu menggantung di tengah layar — "membeku",
            // persis yang tidak kita mau. Dengan ini mereka terus melayang
            // keluar meski gulirnya sudah berhenti.
            point.vx += point.sx * 0.05;
            point.vy += point.sy * 0.05;
          }
          if (ambient) {
            point.vx *= ambientDamping;
            point.vy *= ambientDamping;
            // Debu tetap debu: pelan, meski gulirnya brutal.
            if (point.vx > 1.6) point.vx = 1.6;
            else if (point.vx < -1.6) point.vx = -1.6;
            if (point.vy > 1.6) point.vy = 1.6;
            else if (point.vy < -1.6) point.vy = -1.6;
          } else {
            point.vx *= freeDamping;
            point.vy *= freeDamping;
          }
          point.x += point.vx * delta;
          point.y += point.vy * delta;
          if (
            point.x < -marginX ||
            point.x > width + marginX ||
            point.y < -marginY ||
            point.y > height + marginY
          ) {
            if (ambient) {
              // Debu tidak pernah habis: yang hanyut keluar masuk lagi dari
              // sisi seberang, jadi section berikutnya tetap berdebu —
              // terutama di layar kecil yang tepinya dekat.
              if (point.x < -marginX) point.x = width + marginX;
              else if (point.x > width + marginX) point.x = -marginX;
              if (point.y < -marginY) point.y = height + marginY;
              else if (point.y > height + marginY) point.y = -marginY;
            } else {
              // Keluar >10% dari viewport → kembali ke pool.
              point.state = PARKED;
              continue;
            }
          }
          airborne++;
          ctx.fillRect(point.x, point.y, dotSize, dotSize);
          continue;
        }

        holding++;

        // --- menyusun huruf: pegas ke target ------------------------------
        let targetX =
          centerX +
          (point.tx - centerX) * pulse +
          stageOffsetX +
          fastCos(wobbleTimeX + point.seed) * wobble;
        let targetY =
          centerY +
          (point.ty - centerY) * pulse +
          stageOffsetY +
          fastSin(wobbleTimeY + point.seed) * wobble;

        if (disperse > 0.01) {
          // Buyar seperti debu tertiup: jatuh bergelombang mengikuti posisi
          // horizontal, bukan meledak acak ke segala arah.
          const wave = fastSin(point.tx * 0.012 + point.seed * 0.4);
          targetX +=
            (wave * 0.55 + (point.seed / TAU - 0.5) * 0.7) *
            width *
            0.4 *
            disperse;
          targetY +=
            disperse * height * (0.22 + 0.3 * (0.5 + 0.5 * wave)) +
            fastSin(point.seed * 3.1) * height * 0.12 * disperse;
        }

        if (sweep > 0.01) {
          targetX += fastSin(point.seed) * width * 0.35 * sweep;
        }

        if (glitchAmount > 0) {
          const column = Math.floor((point.tx + stageOffsetX) / 34);
          const hash = (column * 7919 + glitchTick * 104729) % 17;
          targetX += (hash - 8) * 0.14 * glitchAmount;
          if (hash > 14) targetY += (hash - 15) * 2.4;
        }

        if (mode === "signal") {
          targetY += fastSin(time * 0.002 + point.tx * 0.01) * amplitude * 48;
        }

        // Koreografi masuk: tiap titik punya jeda sendiri, lalu tarikannya
        // menguat mulus (smoothstep) sampai mengunci di posisi hurufnya.
        // Tiap titik punya jendela rakit sendiri (0,3 dari total durasi),
        // jadi huruf kiri benar-benar selesai lebih dulu daripada kanan.
        const local = Math.max(0, Math.min(1, (formation - point.delay) / 0.3));
        const ramp = textMode ? local * local * (3 - 2 * local) : 1;
        const pull = spring * (0.12 + 0.88 * ramp);

        point.vx += (targetX - point.x) * pull;
        point.vy += (targetY - point.y) * pull;

        // Gulir ikut mengaduk huruf yang sudah jadi: makin cepat digulir,
        // makin jauh titik tersentak sebelum pegas menariknya balik.
        if (scrollNudgeY !== 0) {
          point.vx += point.sx * scrollSpread * 0.6;
          point.vy += scrollNudgeY * 0.22;
        }

        // Sebelum mengunci, titik menyusuri medan aliran — jalurnya
        // melengkung dan tiap titik mengambil rute berbeda.
        if (textMode && ramp < 0.995) {
          const drift = (1 - ramp) * (1 - ramp) * 0.5;
          const angle = flowAngle(
            point.x,
            point.y,
            flowTime + point.seed * 0.08
          );
          point.vx += fastCos(angle) * drift;
          point.vy += fastSin(angle) * drift;
        }

        point.vx *= damping;
        point.vy *= damping;
        point.x += point.vx * delta;
        point.y += point.vy * delta;

        // Kilau: sesekali satu titik membesar sesaat, seperti partikel yang
        // menangkap cahaya.
        const sparkle =
          sparkleBucket && fastSin(sparkleTime + point.seed * 9.7) > 0.985
            ? 1.7
            : 0;
        ctx.fillRect(point.x, point.y, dotSize + sparkle, dotSize + sparkle);
      }
    }

    ctx.globalAlpha = 1;
    flying = airborne;
    attached = holding;

    if (sweepEnergy > 0.001) sweepEnergy *= 0.9;

    // --- pengaman adaptif -------------------------------------------------
    const cost = performance.now() - started;
    costSum += cost - costSamples[costIndex];
    costSamples[costIndex] = cost;
    costIndex = (costIndex + 1) % COST_WINDOW;
    if (costFilled < COST_WINDOW) costFilled++;
    if (costFilled >= COST_WINDOW) {
      const average = costSum / COST_WINDOW;
      const floor = Math.max(1, Math.round(points.length * COST_FLOOR_RATIO));
      if (average > COST_CUT_MS && activeCount > floor) {
        activeCount = Math.max(floor, Math.round(activeCount * 0.9));
        resetCostWindow();
      } else if (average < COST_GROW_MS) {
        if (steadySince < 0) {
          steadySince = time;
        } else if (
          time - steadySince > COST_GROW_HOLD_MS &&
          activeCount < points.length
        ) {
          activeCount = Math.min(
            points.length,
            Math.round(activeCount * 1.1) + 8
          );
          resetCostWindow();
        }
      } else {
        steadySince = -1;
      }
    }

    frame = requestAnimationFrame(step);
  }

  /* --------------------------------------------------------------- lifecycle */

  function start() {
    if (running) return;
    const state = readState();
    if (state.capability.tier === "off") return;
    running = true;
    lastTime = performance.now();
    frame = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, rect.width || window.innerWidth);
    height = Math.max(1, rect.height || window.innerHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Ukuran kotak berubah → sampel lama tidak berlaku lagi.
    targetCache.clear();
    buildPoints();
    if (readState().capability.tier === "off") {
      stop();
      ctx.clearRect(0, 0, width, height);
      return;
    }
    start();
  }

  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };

  let resizeFrame = 0;
  const onResize = () => {
    if (resizeFrame) return;
    resizeFrame = window.setTimeout(() => {
      resizeFrame = 0;
      resize();
    }, 180) as unknown as number;
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
  resize();

  // Wordmark disampling dari font brand. Kalau font-nya belum selesai dimuat,
  // sampel pertama memakai fallback sistem — susun ulang begitu font siap.
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts) {
    const resample = () => {
      if (destroyed) return;
      if (!TEXT_MODES.includes(readState().mode)) return;
      // Sampel pertama mungkin memakai font fallback — buang, lalu susun
      // ulang dengan bentuk huruf yang sebenarnya.
      targetCache.clear();
      buildPoints();
    };
    void fonts
      .load(`800 120px ${WORDMARK_FONT}`)
      .then(resample)
      .catch(() => undefined);
    void fonts.ready.then(resample).catch(() => undefined);
  }

  return {
    resize,
    destroy() {
      destroyed = true;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (resizeFrame) window.clearTimeout(resizeFrame);
      ctx.clearRect(0, 0, width, height);
      points = [];
    },
  };
}
