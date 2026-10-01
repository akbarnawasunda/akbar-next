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
};

type Point = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  seed: number;
  bucket: number;
};

const WORDMARK = ["AKBAR", "NAWASUNDA"];
const WORDMARK_FONT = '"Clash Display", "General Sans", sans-serif';
const TAU = Math.PI * 2;

/** Mode yang menyusun huruf; butuh titik lebih banyak agar terbaca. */
const TEXT_MODES: SignatureFieldMode[] = ["wordmark", "frequency"];

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
  let formation = 0;
  let lastTransition: "idle" | "sweep" | "settle" = "idle";

  // Warna diambil dari token tema (client/src/index.css) supaya palet
  // signature tidak pernah menyimpang dari brand.
  const paper = readToken("--paper", "#eceae5");
  const acid = readToken("--acid", "#8fb2c0");

  // Huruf harus benar-benar terbaca; mode ambient tetap tipis.
  const textColors = [
    rgbaFrom(acid, 0.42, "rgba(143,178,192,0.42)"),
    rgbaFrom(acid, 0.62, "rgba(143,178,192,0.62)"),
    rgbaFrom(paper, 0.6, "rgba(236,234,229,0.6)"),
    rgbaFrom(paper, 0.88, "rgba(236,234,229,0.88)"),
  ];
  const ambientColors = [
    rgbaFrom(acid, 0.2, "rgba(143,178,192,0.2)"),
    rgbaFrom(acid, 0.34, "rgba(143,178,192,0.34)"),
    rgbaFrom(paper, 0.4, "rgba(236,234,229,0.4)"),
    rgbaFrom(paper, 0.6, "rgba(236,234,229,0.6)"),
  ];

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
    wanted: number
  ) {
    const sampleWidth = Math.max(320, Math.min(Math.round(width), 1600));
    const sampleHeight = Math.max(240, Math.min(Math.round(height), 1000));
    const scaleX = width / sampleWidth;
    const scaleY = height / sampleHeight;

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
    const compact = width < 900;
    switch (mode) {
      case "wordmark":
      case "frequency":
        return sampleTextTargets(
          compact ? WORDMARK : [WORDMARK.join(" ")],
          compact ? 0.86 : 0.82,
          compact ? 0.36 : 0.44,
          wanted
        );
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
    const count = countFor(state.mode, state.capability);
    budget = count;
    const targets = targetsFor(
      state.mode,
      state.era.index,
      state.era.total,
      count
    );
    const next: Point[] = [];
    for (let i = 0; i < count; i++) {
      const target = targets.length
        ? targets[Math.floor((i / count) * targets.length) % targets.length]
        : { x: Math.random() * width, y: Math.random() * height };
      const jitter = targets.length ? 2.2 : 0;
      next.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        tx: target.x + (Math.random() - 0.5) * jitter,
        ty: target.y + (Math.random() - 0.5) * jitter,
        seed: Math.random() * TAU,
        bucket: i % 4,
      });
    }
    points = next;
    activeCount = next.length;
    currentMode = state.mode;
    currentEra = state.era.index;
    formation = 1;
  }

  function retarget() {
    const state = readState();
    const desired = countFor(state.mode, state.capability);
    if (Math.abs(desired - points.length) > Math.max(1, desired * 0.2)) {
      buildPoints();
      return;
    }
    const targets = targetsFor(
      state.mode,
      state.era.index,
      state.era.total,
      desired
    );
    points.forEach((point, index) => {
      const target = targets.length
        ? targets[Math.floor((index / points.length) * targets.length) % targets.length]
        : { x: Math.random() * width, y: Math.random() * height };
      point.tx = target.x;
      point.ty = target.y;
    });
    budget = desired;
    currentMode = state.mode;
    currentEra = state.era.index;
    activeCount = Math.min(points.length, desired);
    formation = 0.6;
  }

  /* ------------------------------------------------------------------ frame */

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

    if (state.mode !== currentMode || state.era.index !== currentEra) {
      retarget();
    }

    if (state.transition !== lastTransition) {
      if (state.transition === "sweep") sweepEnergy = 1;
      lastTransition = state.transition;
    }

    const started = performance.now();
    const delta = Math.min(2.2, (time - lastTime) / 16.67 || 1);
    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    const amplitude = signals.amplitude;
    const hero = signals.heroProgress;
    const frequency = state.frequency;
    if (frequency) drawGrid(amplitude);

    const textMode = TEXT_MODES.includes(state.mode);
    const colors = textMode ? textColors : ambientColors;
    const pointerX = signals.pointerActive ? signals.pointerX : -9999;
    const pointerY = signals.pointerActive ? signals.pointerY : -9999;
    const repelRadius = state.capability.tier === "lite" ? 90 : 130;
    // Saat baru terbentuk, tarikan sedikit lebih lembut supaya titik terlihat
    // berkumpul menjadi huruf, bukan muncul begitu saja.
    const spring = (0.055 + amplitude * 0.02) * (1 - formation * 0.55);
    const damping = 0.82;
    const disperse = state.mode === "wordmark" ? hero : hero * 0.4;
    const sweep = sweepEnergy;

    // Burst dari tap/drag/klik: satu kali impuls radial.
    const bursts = signals.bursts.splice(0, signals.bursts.length);

    const base = state.capability.tier === "lite" ? 1.9 : 1.7;
    const size = textMode ? base : base * 0.85;
    let bucket = -1;
    const limit = Math.min(activeCount, points.length);
    const visible = Math.max(
      Math.round(limit * 0.25),
      Math.round(limit * (1 - disperse * 0.55))
    );

    for (let b = 0; b < colors.length; b++) {
      ctx.fillStyle = colors[b];
      bucket = b;
      for (let i = 0; i < visible; i++) {
        const point = points[i];
        if (point.bucket !== bucket) continue;

        const wobble = frequency ? 2.4 + amplitude * 9 : 1.6 + amplitude * 3.4;
        let targetX =
          point.tx + Math.cos(time * 0.0006 + point.seed) * wobble;
        let targetY =
          point.ty + Math.sin(time * 0.0007 + point.seed) * wobble;

        if (disperse > 0.01) {
          const spreadX = (point.seed / TAU - 0.5) * width * 0.9;
          const spreadY = (Math.sin(point.seed * 3.1) * 0.5) * height * 0.8;
          targetX += spreadX * disperse;
          targetY += spreadY * disperse + disperse * height * 0.15;
        }

        if (sweep > 0.01) {
          targetX += Math.sin(point.seed) * width * 0.35 * sweep;
        }

        if (state.mode === "signal") {
          targetY += Math.sin(time * 0.002 + point.tx * 0.01) * amplitude * 48;
        }

        point.vx += (targetX - point.x) * spring;
        point.vy += (targetY - point.y) * spring;

        const dx = point.x - pointerX;
        const dy = point.y - pointerY;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < repelRadius * repelRadius) {
          const distance = Math.sqrt(distanceSquared) || 1;
          const force = (1 - distance / repelRadius) * 2.6;
          point.vx += (dx / distance) * force;
          point.vy += (dy / distance) * force;
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

        ctx.fillRect(point.x, point.y, size, size);
      }
    }

    if (formation > 0.001) formation *= 0.965;
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
