import { particleBudget } from "../capability";
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
 * Anggaran: < 6ms/frame di perangkat mid-range. Bila frame melar, jumlah
 * titik aktif diturunkan otomatis sampai kembali di bawah anggaran.
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

type Point = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Target dalam koordinat panggung (atau viewport bila tanpa panggung). */
  tx: number;
  ty: number;
  seed: number;
  bucket: number;
  /** Jeda masuk 0..0.6 — menyapu dari kiri ke kanan. */
  delay: number;
};

/** Medan aliran prosedural: murah, tanpa tabel noise, tanpa dependensi. */
function flowAngle(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.0042 + t) * 1.7 +
    Math.cos(y * 0.0051 - t * 0.8) * 1.7 +
    Math.sin((x + y) * 0.0023 + t * 0.45) * 1.1
  );
}

const WORDMARK = ["AKBAR", "NAWASUNDA"];

/**
 * Kata yang disusun partikel, berurutan mengikuti scroll.
 * Sama persis dengan `alternateName` di JSON-LD — jadi yang dilihat
 * pengunjung dan yang dibaca mesin pencari menyebut nama yang sama.
 */
const PHRASES: string[][] = [
  ["AKBAR", "NAWASUNDA"],
  ["DJ AKBAR", "REMIX"],
  ["AKBARNAWASUNDA", ".MY.ID"],
];

function phraseFor(progress: number) {
  if (progress < 0.34) return 0;
  if (progress < 0.68) return 1;
  return 2;
}
const WORDMARK_FONT = '"Clash Display", "General Sans", sans-serif';
const TAU = Math.PI * 2;

/** Mode yang menyusun huruf; butuh titik lebih banyak agar terbaca. */
const TEXT_MODES: SignatureFieldMode[] = ["wordmark", "frequency", "transit"];

/** Lama titik berkumpul menjadi huruf (ms). */
const FORMATION_MS = 2100;
/** Versi cepat saat berpindah halaman — harus selesai dalam satu sapuan. */
const TRANSIT_FORMATION_MS = 420;
const TRANSIT_SETTLE_MS = 420;

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
  let budget = 0;
  let currentMode: SignatureFieldMode | null = null;
  let currentEra = -1;
  let frame = 0;
  let running = false;
  let destroyed = false;
  let lastTime = 0;
  let frameCost = 4;
  let sweepEnergy = 0;
  let formationStart = -1;
  let stageOffsetX = 0;
  let stageOffsetY = 0;
  let stageWidth = 0;
  let stageHeight = 0;
  let phraseIndex = 0;
  let transitLabel = "";
  let settleStart = -1;
  let lastTransition: "idle" | "sweep" | "settle" = "idle";

  // Warna diambil dari token tema (client/src/index.css) supaya palet
  // signature tidak pernah menyimpang dari brand.
  const paper = readToken("--paper", "#eceae5");
  const acid = readToken("--acid", "#8fb2c0");

  // Huruf harus benar-benar terbaca; mode ambient tetap tipis.
  const textColors = [
    rgbaFrom(acid, 0.68, "rgba(143,178,192,0.68)"),
    rgbaFrom(acid, 0.9, "rgba(143,178,192,0.9)"),
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
  function resolveMode(state: ReturnType<FieldStateReader>): SignatureFieldMode {
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
    boxHeight = height
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
      sample.font = `700 ${size}px ${WORDMARK_FONT}`;
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
    const collect = (step: number) => {
      const targets: { x: number; y: number }[] = [];
      for (let y = 0; y < sampleHeight; y += step) {
        for (let x = 0; x < sampleWidth; x += step) {
          if (pixels[(y * sampleWidth + x) * 4 + 3] > 110) {
            targets.push({ x: x * scaleX, y: y * scaleY });
          }
        }
      }
      return targets;
    };

    let step = 2;
    let targets = collect(step);
    while (targets.length > wanted * 2.4 && step < 7) {
      step += 1;
      targets = collect(step);
    }
    return targets;
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
        const phrase = stage ? PHRASES[phraseIndex] || WORDMARK : WORDMARK;
        return sampleTextTargets(
          compact ? phrase : [phrase.join(" ").replace(" .", ".")],
          compact ? 0.92 : 0.9,
          stage ? 0.5 : compact ? 0.36 : 0.44,
          wanted,
          boxWidth,
          boxHeight
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
              y: y + (Math.random() - 0.5) * laneHeight * (lane === index ? 0.5 : 0.22),
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
    // Wordmark di layar kecil tetap harus terbaca: fillRect sangat murah,
    // jadi lantai kerapatannya dinaikkan ketimbang mematikan efeknya.
    const ceiling = capability.tier === "lite" ? 1100 : 2600;
    const density = capability.tier === "lite" ? 330 : 420;
    return Math.max(base, Math.min(ceiling, Math.round((width * height) / density)));
  }

  function buildPoints() {
    const state = readState();
    const mode = resolveMode(state);
    transitLabel = state.transitLabel;
    const count = countFor(mode, state.capability);
    budget = count;
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
      next.push({
        x: textMode ? originX + Math.cos(angle) * distance : Math.random() * width,
        y: textMode ? originY + Math.sin(angle) * distance : Math.random() * height,
        vx: 0,
        vy: 0,
        tx: target.x + (Math.random() - 0.5) * jitter,
        ty: target.y + (Math.random() - 0.5) * jitter,
        seed: Math.random() * TAU,
        bucket: i % 4,
        // Sapuan kiri→kanan: huruf terbentuk seperti ditulis, bukan muncul
        // acak sekaligus.
        delay: textMode
          ? Math.min(
              0.62,
              (target.x / Math.max(1, anchored ? stageWidth : width)) * 0.5 +
                Math.random() * 0.12
            )
          : 0,
      });
    }
    points = next;
    activeCount = next.length;
    currentMode = mode;
    currentEra = state.era.index;
    formationStart = -1;
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
        ? targets[Math.floor((index / points.length) * targets.length) % targets.length]
        : { x: Math.random() * width, y: Math.random() * height };
      point.tx = target.x;
      point.ty = target.y;
    });
    const stage = signals.stage;
    stageWidth = stage ? stage.w : 0;
    stageHeight = stage ? stage.h : 0;
    budget = desired;
    currentMode = mode;
    currentEra = state.era.index;
    activeCount = Math.min(points.length, desired);
    formationStart = -1;
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
    const boxWidth = stageWidth || width;
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const target =
        targets[Math.floor((i / points.length) * targets.length) % targets.length];
      point.tx = target.x + (Math.random() - 0.5) * 2.2;
      point.ty = target.y + (Math.random() - 0.5) * 2.2;
      point.delay = Math.min(
        0.62,
        (target.x / Math.max(1, boxWidth)) * 0.5 + Math.random() * 0.12
      );
      const angle = Math.random() * TAU;
      const kick = 4 + Math.random() * 7;
      point.vx += Math.cos(angle) * kick;
      point.vy += Math.sin(angle) * kick;
    }
    formationStart = -1;
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
    ctx.strokeStyle = rgbaFrom(acid, 0.06 + amplitude * 0.1, "rgba(143,178,192,0.1)");
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

    if (anchored && stage) {
      // Panggung berubah ukuran (resize / layout) → susun ulang hurufnya.
      if (
        Math.abs(stage.w - stageWidth) > 24 ||
        Math.abs(stage.h - stageHeight) > 24
      ) {
        buildPoints();
      }
      const nextX = stage.x - stage.w / 2;
      const nextY = stage.y - stage.h / 2;
      const shiftX = nextX - stageOffsetX;
      const shiftY = nextY - stageOffsetY;
      // Titik ikut bergerak bersama panggung saat halaman digulir, jadi
      // wordmark terkunci di sectionnya, bukan tertinggal di belakang.
      if (shiftX || shiftY) {
        for (let i = 0; i < points.length; i++) {
          points[i].x += shiftX;
          points[i].y += shiftY;
        }
        stageOffsetX = nextX;
        stageOffsetY = nextY;
      }
      // Kata berganti mengikuti posisi scroll di jalur panggung.
      const nextPhrase = phraseFor(stage.progress);
      if (nextPhrase !== phraseIndex) morphTo(nextPhrase);

      // Panggung sudah jauh dari layar: tidak ada gunanya menggambar.
      if (stage.visibility <= 0.02) {
        frame = requestAnimationFrame(step);
        return;
      }
    } else {
      stageOffsetX = 0;
      stageOffsetY = 0;
    }

    if (formationStart < 0) formationStart = time;
    const formation = Math.max(
      0,
      Math.min(
        1,
        (time - formationStart) /
          (mode === "transit" ? TRANSIT_FORMATION_MS : FORMATION_MS)
      )
    );
    const pointerX = signals.pointerActive ? signals.pointerX : -9999;
    const pointerY = signals.pointerActive ? signals.pointerY : -9999;
    const repelRadius = state.capability.tier === "lite" ? 90 : 130;
    const spring = 0.055 + amplitude * 0.02;
    const damping = 0.82;
    // Dengan panggung, "buyar" mengikuti posisi panggung di layar; tanpa
    // panggung tetap mengikuti progres hero seperti sebelumnya.
    const exitRamp =
      anchored && stage && stage.progress > 0.9
        ? (stage.progress - 0.9) / 0.1
        : 0;
    const settleRamp =
      settleStart >= 0
        ? Math.max(0, Math.min(1, (time - settleStart) / TRANSIT_SETTLE_MS))
        : 0;
    const disperse =
      mode === "transit"
        ? settleRamp
        : anchored && stage
          ? Math.max((1 - stage.visibility) * 0.85, exitRamp)
          : mode === "wordmark"
            ? hero
            : hero * 0.4;
    const sweep = sweepEnergy;

    // Jejak gerak. Selama titik masih terbang masuk, buyar, atau disapu
    // transisi, frame sebelumnya tidak dihapus total sehingga tiap titik
    // meninggalkan ekor halus. Begitu wordmark mengunci, penghapusan kembali
    // penuh supaya hurufnya tetap tajam.
    const motion = Math.max(1 - formation, disperse, sweep);
    const clearStrength = motion > 0.02 ? 0.26 + (1 - motion) * 0.6 : 1;
    if (clearStrength >= 1) {
      ctx.clearRect(0, 0, width, height);
    } else {
      // Jejak hanya perlu dipelihara di sekitar panggung; sisanya dihapus
      // biasa supaya tidak ada sisa gambar yang menggantung.
      const fadeTop =
        anchored && stage ? Math.max(0, stageOffsetY - stage.h * 0.9) : 0;
      const fadeHeight =
        anchored && stage
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
      1 + Math.sin(time * 0.0009) * 0.004 + amplitude * 0.03 * (textMode ? 1 : 0.4);
    const centerX = anchored && stage ? stage.w / 2 : width / 2;
    const centerY = anchored && stage ? stage.h / 2 : height / 2;

    // Seret: gerakan pointer ikut membawa partikel di sekitarnya, lalu
    // kecepatannya meluruh sendiri.
    const pointerAge = signals.pointerMovedAt
      ? Math.max(0, Date.now() - signals.pointerMovedAt)
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

    const base = state.capability.tier === "lite" ? 2.6 : 2.5;
    const size = textMode ? base : base * 0.56;
    let bucket = -1;
    const limit = Math.min(activeCount, points.length);
    const visible = Math.max(
      Math.round(limit * 0.25),
      Math.round(limit * (1 - disperse * 0.55))
    );

    // Saat hero ditinggalkan, wordmark tidak cuma menyebar tapi juga meredup.
    ctx.globalAlpha = Math.max(0.12, 1 - disperse * 0.7);

    for (let b = 0; b < colors.length; b++) {
      ctx.fillStyle = colors[b];
      // Satu dari empat kelompok sedikit lebih besar supaya huruf punya
      // "inti" yang terbaca, bukan kabut rata.
      const dotSize = b === colors.length - 1 ? size + 0.9 : size;
      const sparkleBucket = textMode && b === colors.length - 1;
      bucket = b;
      for (let i = 0; i < visible; i++) {
        const point = points[i];
        if (point.bucket !== bucket) continue;

        const wobble = frequency ? 2.4 + amplitude * 9 : 1.6 + amplitude * 3.4;
        let targetX =
          centerX +
          (point.tx - centerX) * pulse +
          stageOffsetX +
          Math.cos(time * 0.0006 + point.seed) * wobble;
        let targetY =
          centerY +
          (point.ty - centerY) * pulse +
          stageOffsetY +
          Math.sin(time * 0.0007 + point.seed) * wobble;

        if (disperse > 0.01) {
          // Buyar seperti debu tertiup: jatuh bergelombang mengikuti posisi
          // horizontal, bukan meledak acak ke segala arah.
          const wave = Math.sin(point.tx * 0.012 + point.seed * 0.4);
          targetX += (wave * 0.55 + (point.seed / TAU - 0.5) * 0.7) * width * 0.4 * disperse;
          targetY +=
            disperse * height * (0.22 + 0.3 * (0.5 + 0.5 * wave)) +
            Math.sin(point.seed * 3.1) * height * 0.12 * disperse;
        }

        if (sweep > 0.01) {
          targetX += Math.sin(point.seed) * width * 0.35 * sweep;
        }

        if (glitchAmount > 0) {
          const column = Math.floor((point.tx + stageOffsetX) / 34);
          const hash = (column * 7919 + glitchTick * 104729) % 17;
          targetX += (hash - 8) * 0.14 * glitchAmount;
          if (hash > 14) targetY += (hash - 15) * 2.4;
        }

        if (mode === "signal") {
          targetY += Math.sin(time * 0.002 + point.tx * 0.01) * amplitude * 48;
        }

        // Koreografi masuk: tiap titik punya jeda sendiri, lalu tarikannya
        // menguat mulus (smoothstep) sampai mengunci di posisi hurufnya.
        // Tiap titik punya jendela rakit sendiri (0,3 dari total durasi),
        // jadi huruf kiri benar-benar selesai lebih dulu daripada kanan.
        const local = Math.max(
          0,
          Math.min(1, (formation - point.delay) / 0.3)
        );
        const ramp = textMode ? local * local * (3 - 2 * local) : 1;
        const pull = spring * (0.12 + 0.88 * ramp);

        point.vx += (targetX - point.x) * pull;
        point.vy += (targetY - point.y) * pull;

        // Sebelum mengunci, titik menyusuri medan aliran — jalurnya
        // melengkung dan tiap titik mengambil rute berbeda.
        if (textMode && ramp < 0.995) {
          const drift = (1 - ramp) * (1 - ramp) * 0.5;
          const angle = flowAngle(point.x, point.y, time * 0.00022 + point.seed * 0.08);
          point.vx += Math.cos(angle) * drift;
          point.vy += Math.sin(angle) * drift;
        }

        const dx = point.x - pointerX;
        const dy = point.y - pointerY;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < repelRadius * repelRadius) {
          const distance = Math.sqrt(distanceSquared) || 1;
          const falloff = 1 - distance / repelRadius;
          const force = falloff * 2.6;
          point.vx += (dx / distance) * force;
          point.vy += (dy / distance) * force;
          // Nama ikut terseret ke arah gerakan kursor, lalu pulih sendiri.
          point.vx += dragX * falloff * 0.16;
          point.vy += dragY * falloff * 0.16;
        }

        for (let k = 0; k < bursts.length; k++) {
          const burst = bursts[k];
          const bx = point.x - burst.x;
          const by = point.y - burst.y;
          const burstDistance = Math.hypot(bx, by) || 1;
          if (burstDistance > 320) continue;
          const force = (1 - burstDistance / 320) * 16 * burst.strength;
          point.vx += (bx / burstDistance) * force;
          point.vy += (by / burstDistance) * force;
        }

        point.vx *= damping;
        point.vy *= damping;
        point.x += point.vx * delta;
        point.y += point.vy * delta;

        // Kilau: sesekali satu titik membesar sesaat, seperti partikel yang
        // menangkap cahaya.
        const sparkle =
          sparkleBucket && Math.sin(time * 0.0031 + point.seed * 9.7) > 0.985
            ? 1.7
            : 0;
        ctx.fillRect(point.x, point.y, dotSize + sparkle, dotSize + sparkle);
      }
    }

    ctx.globalAlpha = 1;

    if (sweepEnergy > 0.001) sweepEnergy *= 0.9;

    const cost = performance.now() - started;
    frameCost = frameCost * 0.9 + cost * 0.1;
    // Adaptasi: turunkan jumlah titik kalau frame melar, naikkan lagi saat
    // kembali lega. Anggaran 6ms.
    if (frameCost > 6 && activeCount > points.length * 0.3) {
      activeCount = Math.max(
        Math.round(points.length * 0.3),
        Math.round(activeCount * 0.92)
      );
    } else if (frameCost < 3.2 && activeCount < points.length) {
      activeCount = Math.min(points.length, Math.round(activeCount * 1.04) + 1);
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
      buildPoints();
    };
    void fonts
      .load(`700 120px ${WORDMARK_FONT}`)
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
