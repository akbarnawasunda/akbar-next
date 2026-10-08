/**
 * Pengukur biaya frame particle field.
 *
 * Dipakai untuk mengkalibrasi jumlah/ukuran titik tanpa browser: yang diukur
 * adalah biaya LOOP per titik (bagian yang benar-benar menentukan anggaran
 * 6ms), bukan rasterisasi kanvas. `fillRect` di sini hanya mencatat panggilan,
 * jadi angka di bawah adalah biaya JavaScript murni — GPU/raster nyata harus
 * dinilai di perangkat sungguhan.
 *
 *   corepack pnpm exec tsx scripts/bench-particle-field.ts
 */
import { createParticleField } from "../client/src/signature/field/particleField";
import type {
  SignatureCapability,
  SignatureSignals,
} from "../client/src/signature/types";

type Stage = NonNullable<SignatureSignals["stage"]>;

function fakeSampleContext(canvas: { width: number; height: number }) {
  let fontSize = 10;
  return {
    set font(value: string) {
      fontSize = Number(/([\d.]+)px/.exec(value)?.[1] || 10);
    },
    get font() {
      return `700 ${fontSize}px bench`;
    },
    letterSpacing: "0px",
    fillStyle: "",
    textAlign: "",
    textBaseline: "",
    measureText: (text: string) => ({ width: text.length * fontSize * 0.58 }),
    fillText: () => undefined,
    getImageData: () => {
      const { width, height } = canvas;
      const data = new Uint8ClampedArray(width * height * 4);
      // Pita teks tiruan: 18%–82% lebar, 38%–56% tinggi.
      for (let y = Math.floor(height * 0.38); y < height * 0.56; y++) {
        for (let x = Math.floor(width * 0.18); x < width * 0.82; x++) {
          data[(y * width + x) * 4 + 3] = 255;
        }
      }
      return { data };
    },
  };
}

function setupDom(viewportWidth: number, viewportHeight: number) {
  const frames: ((time: number) => void)[] = [];
  let drawn = 0;
  let sink = 0;

  const stack: string[] = [];
  const mainContext: Record<string, unknown> = {
    setTransform: () => undefined,
    clearRect: () => undefined,
    beginPath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    stroke: () => undefined,
    fillRect(x: number, y: number) {
      if (mainContext.globalCompositeOperation === "source-over") {
        drawn++;
        sink += x + y;
      }
    },
    save() {
      stack.push(mainContext.globalCompositeOperation as string);
    },
    restore() {
      const previous = stack.pop();
      if (previous) mainContext.globalCompositeOperation = previous;
    },
    createLinearGradient: () => ({ addColorStop: () => undefined }),
    createRadialGradient: () => ({ addColorStop: () => undefined }),
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
  };

  const canvas = {
    width: 0,
    height: 0,
    getBoundingClientRect: () => ({
      width: viewportWidth,
      height: viewportHeight,
      left: 0,
      top: 0,
    }),
    getContext: () => mainContext,
  };

  const globals = globalThis as unknown as Record<string, unknown>;
  const timeouts: (() => void)[] = [];
  globals.window = {
    innerWidth: viewportWidth,
    innerHeight: viewportHeight,
    devicePixelRatio: 2,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    setTimeout: (callback: () => void) => {
      timeouts.push(callback);
      return timeouts.length;
    },
    clearTimeout: (id: number) => {
      timeouts[id - 1] = () => undefined;
    },
  };
  globals.document = {
    hidden: false,
    documentElement: {},
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    createElement: () => {
      const offscreen = { width: 0, height: 0 } as {
        width: number;
        height: number;
        getContext?: unknown;
      };
      offscreen.getContext = () => fakeSampleContext(offscreen);
      return offscreen;
    },
  };
  globals.getComputedStyle = () => ({ getPropertyValue: () => "#eceae5" });
  globals.requestAnimationFrame = (callback: (time: number) => void) => {
    frames.push(callback);
    return frames.length;
  };
  globals.cancelAnimationFrame = () => undefined;

  return {
    canvas,
    frames,
    timeouts,
    stats: () => ({ drawn, sink }),
    resetDrawn: () => {
      drawn = 0;
    },
  };
}

function capability(tier: "full" | "lite"): SignatureCapability {
  return {
    tier,
    reducedMotion: false,
    saveData: false,
    coarsePointer: tier === "lite",
    lowPower: false,
    viewport: tier === "lite" ? "compact" : "wide",
    deviceScore: tier === "lite" ? 0.35 : 0.8,
    measured: true,
  };
}

function signalsStub(stage: Stage): SignatureSignals {
  return {
    pointerX: -9999,
    pointerY: -9999,
    pointerActive: false,
    pointerVX: 0,
    pointerVY: 0,
    pointerMovedAt: 0,
    pointerPressed: false,
    scrollY: 0,
    scrollVelocity: 0,
    heroProgress: 0,
    amplitude: 0,
    beat: 0,
    bursts: [],
    stage,
  };
}

function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

function fmt(value: number) {
  return value.toFixed(3).padStart(7);
}

function run(
  label: string,
  tier: "full" | "lite",
  w: number,
  h: number,
  quiet = false
) {
  const stage: Stage = {
    x: w / 2,
    y: h * 0.5,
    w: Math.min(w, w - 80),
    h: Math.min(320, h * 0.26),
    visibility: 1,
    progress: 0,
  };
  const dom = setupDom(w, h);
  const signals = signalsStub(stage);
  const field = createParticleField(
    dom.canvas as unknown as HTMLCanvasElement,
    signals,
    () => ({
      mode: "wordmark" as const,
      capability: capability(tier),
      frequency: false,
      era: { index: 0, total: 0 },
      transition: "idle" as const,
      transitLabel: "",
      intensity: 1,
    })
  );

  const phases: { name: string; costs: number[]; drawn: number }[] = [];
  const verbose: string[] = [];
  let clock = 0;
  const runPhase = (name: string, count: number) => {
    const costs: number[] = [];
    let drawn = 0;
    for (let i = 0; i < count; i++) {
      let next = dom.frames.pop();
      if (!next) {
        // Engine sedang tidur di mode idle — bangunkan lewat timeout-nya,
        // lalu ambil frame yang baru dijadwalkan.
        const timer = dom.timeouts.pop();
        if (!timer) break;
        clock += 120;
        timer();
        next = dom.frames.pop();
        if (!next) break;
      }
      dom.frames.length = 0;
      dom.resetDrawn();
      clock += 16.67;
      const started = performance.now();
      next(clock);
      costs.push(performance.now() - started);
      drawn = dom.stats().drawn;
      if (i < 3 || i === count - 1) {
        verbose.push(
          `      ${name} #${i}: ${costs[costs.length - 1].toFixed(2)}ms / ${drawn} titik`
        );
      }
    }
    phases.push({ name, costs, drawn });
  };

  // 1. Merakit nama (paling mahal: medan aliran masih aktif).
  runPhase("merakit", 130);
  // 2. Nama terkunci — kondisi diam di layar.
  runPhase("terkunci", 120);
  // 3. Gulir cepat melewati panggung: titik dilepas, terbang bebas.
  signals.scrollVelocity = 3.2;
  stage.progress = 0.82;
  stage.visibility = 0.45;
  runPhase("lepas", 60);
  stage.progress = 0.95;
  stage.visibility = 0.08;
  runPhase("melintas", 90);
  // 4. Debu ambient di section berikutnya.
  signals.scrollVelocity = 0;
  stage.visibility = 0.01;
  runPhase("debu", 120);

  // 5. Fase "diam" — membaca tenang: panggung terlihat (wordmark terkunci,
  //    bernapas), semua sinyal tenang. Engine harus tidur ke frekuensi
  //    rendah: ukur berapa frame yang benar-benar dieksekusi dalam 10 detik
  //    waktu tiruan (docs/motion-performance-liquid-signal-pass.md §5.1).
  stage.visibility = 1;
  stage.progress = 0;
  signals.pointerActive = false;
  signals.pointerMovedAt = 0;
  signals.pointerPressed = false;
  signals.amplitude = 0;
  const IDLE_WALL_MS = 10_000;
  // Selesaikan dulu pembentukan ulang (scroll balik memutar ulang koreografi
  // masuk) supaya yang diukur adalah laju idle murni, bukan ekor fase aktif.
  for (let i = 0; i < 200; i++) {
    const settleNext = dom.frames.pop();
    if (settleNext) {
      dom.frames.length = 0;
      clock += 16.67;
      settleNext(clock);
    } else {
      const settleTimer = dom.timeouts.pop();
      if (!settleTimer) break;
      clock += 120;
      settleTimer();
    }
  }
  let idleExecuted = 0;
  let idleWall = 0;
  let idleDrawn = 0;
  while (idleWall < IDLE_WALL_MS) {
    if (dom.frames.length) {
      const next = dom.frames.pop();
      dom.frames.length = 0;
      if (!next) break;
      dom.resetDrawn();
      clock += 16.67;
      idleWall += 16.67;
      next(clock);
      idleExecuted += 1;
      idleDrawn = dom.stats().drawn;
    } else {
      // Timeout hanya membangunkan frame berikutnya — yang dihitung sebagai
      // eksekusi adalah frame-nya, bukan timeout-nya sendiri.
      const timer = dom.timeouts.pop();
      if (!timer) break;
      clock += 120;
      idleWall += 120;
      timer();
    }
  }
  phases.push({
    name: "diam",
    costs: [],
    drawn: idleDrawn,
    idleExecuted,
    idleWall,
  } as (typeof phases)[number] & { idleExecuted: number; idleWall: number });

  if (quiet) {
    field.destroy();
    return;
  }
  console.log(`\n${label} — ${w}×${h}, tier ${tier}`);
  console.log(
    "  fase        frame  rata-rata     p95      maks   titik digambar"
  );
  for (const phase of phases) {
    const idle = phase as (typeof phase) & {
      idleExecuted?: number;
      idleWall?: number;
    };
    if (idle.idleExecuted !== undefined && idle.idleWall !== undefined) {
      const fps = (idle.idleExecuted / idle.idleWall) * 1000;
      console.log(
        `  ${phase.name.padEnd(10)} ${String(idle.idleExecuted).padStart(5)} frame dalam ${(idle.idleWall / 1000).toFixed(0)}s ≈ ${fps.toFixed(1)}fps (vs 60fps penuh) ${String(phase.drawn).padStart(10)} titik`
      );
      continue;
    }
    const average =
      phase.costs.reduce((total, value) => total + value, 0) /
      Math.max(1, phase.costs.length);
    console.log(
      `  ${phase.name.padEnd(10)} ${String(phase.costs.length).padStart(5)} ` +
        `${fmt(average)}ms ${fmt(percentile(phase.costs, 0.95))}ms ` +
        `${fmt(Math.max(...phase.costs))}ms ${String(phase.drawn).padStart(10)}`
    );
  }
  if (process.env.BENCH_VERBOSE) console.log(verbose.join("\n"));
  field.destroy();
}

// Satu putaran pemanasan dulu: frame pertama di V8 (dan di browser) selalu
// membayar kompilasi JIT. Yang dilaporkan adalah kondisi tunak.
run("warmup", "full", 1440, 900, true);
run("warmup", "lite", 390, 780, true);

run("Desktop", "full", 1440, 900);
run("Desktop lebar", "full", 1920, 1080);
run("Ponsel (lite)", "lite", 390, 780);
console.log(
  "\nCatatan: fillRect di-stub, jadi angka ini biaya loop JavaScript saja;\n" +
    "frame pertama tiap fase memuat kompilasi JIT, karena itu ada putaran\n" +
    "pemanasan sebelum angka di atas diambil."
);
