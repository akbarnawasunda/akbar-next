/**
 * Tes engine particle field.
 *
 * Kanvas tidak pernah muncul di HTML SSR (memang `aria-hidden` dan dibuat
 * setelah mount), jadi sesuai docs/notes/testing-policy.md bagian 3 engine-nya
 * diuji langsung sebagai modul — bukan lewat teks source. Yang diuji adalah
 * perilakunya: titik benar-benar dibuat, benar-benar digambar, dan berkumpul
 * membentuk wordmark di dalam viewport pada berbagai rasio layar.
 */
import { afterEach, describe, expect, it } from "vitest";
import { createParticleField } from "../client/src/signature/field/particleField";
import type {
  SignatureCapability,
  SignatureSignals,
} from "../client/src/signature/types";

type Drawn = { x: number; y: number };

/** Pita "teks" buatan: 20%–80% lebar, 40%–52% tinggi kanvas sampel. */
const BAND = { left: 0.2, right: 0.8, top: 0.4, bottom: 0.52 };

function fakeSampleContext(canvas: { width: number; height: number }) {
  let fontSize = 10;
  return {
    set font(value: string) {
      fontSize = Number(/([\d.]+)px/.exec(value)?.[1] || 10);
    },
    get font() {
      return `700 ${fontSize}px test`;
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
      for (let y = Math.floor(height * BAND.top); y < height * BAND.bottom; y++) {
        for (let x = Math.floor(width * BAND.left); x < width * BAND.right; x++) {
          data[(y * width + x) * 4 + 3] = 255;
        }
      }
      return { data };
    },
  };
}

function setupDom(
  viewportWidth: number,
  viewportHeight: number,
  options: {
    /** Math.random deterministik: dua skenario bisa dibandingkan adil. */
    seed?: number;
    /** Biaya frame palsu (ms) untuk menguji pengaman adaptif. */
    frameCostMs?: number;
  } = {}
) {
  const drawn: Drawn[] = [];
  const frames: ((time: number) => void)[] = [];
  const timeouts: (() => void)[] = [];

  const stack: { composite: string; alpha: number }[] = [];
  const mainContext: Record<string, unknown> & {
    globalCompositeOperation: string;
  } = {
    setTransform: () => undefined,
    clearRect: () => undefined,
    beginPath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    stroke: () => undefined,
    fillRect(x: number, y: number) {
      // Fade jejak memakai destination-out — bukan titik, jangan dicatat.
      if (mainContext.globalCompositeOperation === "source-over") {
        drawn.push({ x, y });
      }
    },
    // save/restore ditiru seadanya supaya composite mode benar-benar pulih
    // seperti di kanvas asli.
    save() {
      stack.push({
        composite: mainContext.globalCompositeOperation,
        alpha: mainContext.globalAlpha as number,
      });
    },
    restore() {
      const previous = stack.pop();
      if (!previous) return;
      mainContext.globalCompositeOperation = previous.composite;
      mainContext.globalAlpha = previous.alpha;
    },
    translate: () => undefined,
    scale: () => undefined,
    arc: () => undefined,
    fill: () => undefined,
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

  const documentStub = {
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

  const windowStub = {
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

  const globals = globalThis as unknown as Record<string, unknown>;
  const previous = {
    window: globals.window,
    document: globals.document,
    getComputedStyle: globals.getComputedStyle,
    requestAnimationFrame: globals.requestAnimationFrame,
    cancelAnimationFrame: globals.cancelAnimationFrame,
    random: Math.random,
    performance: globals.performance,
  };

  globals.window = windowStub;
  globals.document = documentStub;
  globals.getComputedStyle = () => ({ getPropertyValue: () => "#eceae5" });
  globals.requestAnimationFrame = (callback: (time: number) => void) => {
    frames.push(callback);
    return frames.length;
  };
  globals.cancelAnimationFrame = () => undefined;

  if (options.seed !== undefined) {
    // LCG kecil: cukup untuk membuat dua jalannya identik.
    let state = options.seed >>> 0 || 1;
    Math.random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  if (options.frameCostMs !== undefined) {
    // Engine mengukur frame dengan dua panggilan performance.now(); tiap
    // panggilan memajukan jam palsu ini, jadi biaya per frame bisa dipesan.
    let clock = 0;
    globals.performance = {
      now: () => {
        clock += options.frameCostMs as number;
        return clock;
      },
    };
  }

  const restore = () => {
    globals.window = previous.window;
    globals.document = previous.document;
    globals.getComputedStyle = previous.getComputedStyle;
    globals.requestAnimationFrame = previous.requestAnimationFrame;
    globals.cancelAnimationFrame = previous.cancelAnimationFrame;
    globals.performance = previous.performance;
    Math.random = previous.random;
  };

  return { canvas, drawn, frames, timeouts, restore };
}

function capability(tier: SignatureCapability["tier"]): SignatureCapability {
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

function signalsStub(stage: SignatureSignals["stage"] = null): SignatureSignals {
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

let teardown: (() => void) | null = null;

afterEach(() => {
  teardown?.();
  teardown = null;
});

function runWordmark(
  viewportWidth: number,
  viewportHeight: number,
  tier: SignatureCapability["tier"] = "full",
  stage: SignatureSignals["stage"] = null
) {
  const dom = setupDom(viewportWidth, viewportHeight);
  const field = createParticleField(
    dom.canvas as unknown as HTMLCanvasElement,
    signalsStub(stage),
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

  // 160 frame ≈ 2,7 detik: cukup untuk titik mengunci ke posisi hurufnya.
  const early: Drawn[] = [];
  const mid: Drawn[] = [];
  for (let i = 0; i < 160; i++) {
    let next = dom.frames.pop();
    if (!next) {
      // Engine bisa tidur di mode idle (setTimeout, bukan rAF) — bangunkan
      // lewat timeout-nya supaya frame berikutnya tetap bisa dipop.
      const timer = dom.timeouts.pop();
      if (timer) {
        timer();
        next = dom.frames.pop();
      }
    }
    dom.frames.length = 0;
    if (!next) break;
    dom.drawn.length = 0; // tiap tangkapan hanya berisi satu frame
    next(i * 16.67);
    if (i === 12) early.push(...dom.drawn);
    if (i === 46) mid.push(...dom.drawn);
  }

  teardown = () => {
    field.destroy();
    dom.restore();
  };
  return { ...dom, early, mid };
}

/** Pusat massa titik yang tergambar — ukuran dorongan yang tahan derau. */
function centroid(points: Drawn[]) {
  if (!points.length) return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / points.length, y: y / points.length };
}

/** Titik per 1000px² di dalam kotak yang benar-benar ditempati wordmark. */
function density(points: Drawn[]) {
  if (points.length < 2) return 0;
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const area =
    Math.max(1, Math.max(...xs) - Math.min(...xs)) *
    Math.max(1, Math.max(...ys) - Math.min(...ys));
  return (points.length / area) * 1000;
}

/**
 * Jalan yang bisa dikemudikan: frame dimajukan manual, sinyal boleh diubah
 * di tengah jalan (gulir, kecepatan, visibilitas panggung).
 */
function scenario(
  viewportWidth: number,
  viewportHeight: number,
  stage: SignatureSignals["stage"],
  options: {
    seed?: number;
    frameCostMs?: number;
    frameIntervalMs?: number;
    tier?: SignatureCapability["tier"];
  } = {}
) {
  const dom = setupDom(viewportWidth, viewportHeight, options);
  const signals = signalsStub(stage);
  const field = createParticleField(
    dom.canvas as unknown as HTMLCanvasElement,
    signals,
    () => ({
      mode: "wordmark" as const,
      capability: capability(options.tier || "full"),
      frequency: false,
      era: { index: 0, total: 0 },
      transition: "idle" as const,
      transitLabel: "",
      intensity: 1,
    })
  );

  let clock = 0;
  const api = {
    signals,
    drawn: () => dom.drawn,
    frames(count: number) {
      for (let i = 0; i < count; i++) {
        let next = dom.frames.pop();
        if (!next) {
          // Mode idle: bangunkan lewat timeout, lalu ambil frame berikutnya.
          const timer = dom.timeouts.pop();
          if (timer) {
            timer();
            next = dom.frames.pop();
          }
        }
        dom.frames.length = 0;
        if (!next) break;
        dom.drawn.length = 0;
        clock += options.frameIntervalMs ?? 16.67;
        next(clock);
      }
      return api;
    },
    teardown() {
      field.destroy();
      dom.restore();
      teardown = null;
    },
  };
  teardown = () => {
    field.destroy();
    dom.restore();
  };
  return api;
}

describe("particle field", () => {
  it("menggambar ribuan titik di desktop dan menyusunnya jadi wordmark", () => {
    const dom = runWordmark(1440, 900);
    expect(dom.drawn.length).toBeGreaterThan(1500);

    const inside = dom.drawn.filter(
      point =>
        point.x >= 0 && point.x <= 1440 && point.y >= 0 && point.y <= 900
    );
    // Semua titik tetap di dalam viewport — dulu pemetaan Y memakai rasio
    // lebar, jadi wordmark bisa melayang keluar layar.
    expect(inside.length / dom.drawn.length).toBeGreaterThan(0.98);

    const band = dom.drawn.filter(
      point => point.y > 900 * 0.3 && point.y < 900 * 0.65
    );
    expect(band.length / dom.drawn.length).toBeGreaterThan(0.9);

    const left = Math.min(...dom.drawn.map(point => point.x));
    const right = Math.max(...dom.drawn.map(point => point.x));
    // Wordmark tidak terpotong di tepi layar.
    expect(left).toBeGreaterThan(1440 * 0.1);
    expect(right).toBeLessThan(1440 * 0.9);
  });

  it("menerbangkan titik dari luar layar lalu mengunci jadi huruf", () => {
    const dom = runWordmark(1440, 900);
    const bandEarly = dom.early.filter(
      point => point.y > 900 * 0.3 && point.y < 900 * 0.65
    );
    const bandLate = dom.drawn.filter(
      point => point.y > 900 * 0.3 && point.y < 900 * 0.65
    );
    // Di awal sebagian besar titik masih dalam perjalanan masuk…
    expect(bandEarly.length / Math.max(1, dom.early.length)).toBeLessThan(0.6);
    // …dan di akhir hampir semuanya sudah membentuk wordmark.
    expect(bandLate.length / dom.drawn.length).toBeGreaterThan(0.9);
  });

  it("tetap memetakan wordmark dengan benar di layar sangat lebar", () => {
    const dom = runWordmark(1920, 1080);
    const outside = dom.drawn.filter(
      point => point.y < 0 || point.y > 1080 || point.x < 0 || point.x > 1920
    );
    expect(outside.length).toBe(0);
  });

  it("tetap memberi wordmark yang padat di perangkat sentuh (tier lite)", () => {
    const dom = runWordmark(390, 780, "lite");
    // Ponsel tidak boleh mendapat layar kosong, dan tetap terbaca.
    expect(dom.drawn.length).toBeGreaterThan(600);
    const band = dom.drawn.filter(
      point => point.y > 780 * 0.2 && point.y < 780 * 0.6
    );
    expect(band.length / dom.drawn.length).toBeGreaterThan(0.9);
  });

  it("menulis label tujuan di tengah layar saat pindah halaman", () => {
    // Panggung tetap ada di bawah layar, tapi selama transisi label tujuan
    // yang menang: huruf harus muncul di tengah viewport.
    const stage = {
      x: 720,
      y: 820,
      w: 1200,
      h: 300,
      visibility: 1,
      progress: 0,
    };
    const dom = setupDom(1440, 900);
    const phase = { value: "sweep" as "idle" | "sweep" | "settle" };
    const field = createParticleField(
      dom.canvas as unknown as HTMLCanvasElement,
      signalsStub(stage),
      () => ({
        mode: "wordmark" as const,
        capability: capability("full"),
        frequency: false,
        era: { index: 0, total: 0 },
        transition: phase.value,
        transitLabel: "MUSIK",
        intensity: 1,
      })
    );

    const run = (frames: number, from: number) => {
      for (let i = 0; i < frames; i++) {
        let next = dom.frames.pop();
        if (!next) {
          // Mode idle: bangunkan lewat timeout, lalu ambil frame berikutnya.
          const timer = dom.timeouts.pop();
          if (timer) {
            timer();
            next = dom.frames.pop();
          }
        }
        dom.frames.length = 0;
        if (!next) break;
        dom.drawn.length = 0;
        next((from + i) * 16.67);
      }
    };

    run(70, 0);
    const middle = dom.drawn.filter(
      point => point.y > 900 * 0.3 && point.y < 900 * 0.65
    );
    expect(dom.drawn.length).toBeGreaterThan(500);
    expect(middle.length / dom.drawn.length).toBeGreaterThan(0.85);

    // Nyaris tidak ada titik yang tertinggal di panggung bawah layar.
    const atStage = dom.drawn.filter(point => point.y > 700);
    expect(atStage.length / dom.drawn.length).toBeLessThan(0.05);

    // Fase settle: label meluruh sebelum halaman baru tampil.
    phase.value = "settle";
    run(2, 70);
    const beforeSettle = dom.drawn.length;
    run(28, 72);
    expect(dom.drawn.length).toBeLessThan(beforeSettle);

    teardown = () => {
      field.destroy();
      dom.restore();
    };
  });

  it("mendorong lebih jauh saat gulirnya lebih cepat", () => {
    // Dua jalan identik (Math.random diseed sama) yang hanya berbeda
    // kecepatan gulir: dorongan harus sebanding dengan kecepatannya.
    const measure = (velocity: number) => {
      const stage = {
        x: 720,
        y: 450,
        w: 1200,
        h: 320,
        visibility: 1,
        progress: 0,
      };
      const run = scenario(1440, 900, stage, { seed: 99 });
      run.frames(170);
      const before = centroid(run.drawn());

      stage.progress = 0.95;
      stage.visibility = 0.5;
      run.signals.scrollVelocity = velocity;
      run.frames(12);
      const after = centroid(run.drawn());
      run.teardown();
      return { dx: after.x - before.x, dy: after.y - before.y };
    };

    const slow = measure(0.3);
    const fast = measure(3);
    // Gulir turun menyapu titik ke atas layar.
    expect(fast.dy).toBeLessThan(0);
    expect(Math.abs(fast.dy)).toBeGreaterThan(Math.abs(slow.dy) * 2);
  });

  // [BUGFIX] Panggung beranda sekarang medan ambient (lihat `resolveMode`):
  // titik TIDAK lagi dikunci menjadi huruf, judul tampil sebagai tipografi
  // DOM. Tes-tes lama yang mengukur "huruf terbentuk/menyapu/diganti" sudah
  // tidak berlaku dan diganti dengan kontrak ambient di bawah ini.
  it("panggung tidak menyusun huruf: titik tersebar merata, tidak membentuk pita", () => {
    const stage = { x: 720, y: 450, w: 1200, h: 320, visibility: 1, progress: 0 };
    const run = scenario(1440, 900, stage, { seed: 21 });
    run.frames(170);
    const pts = run.drawn();
    expect(pts.length).toBeGreaterThan(300);

    // Semua titik tetap di dalam viewport — tidak ada yang kepotong di tepi.
    const inside = pts.filter(
      point => point.x >= 0 && point.x <= 1440 && point.y >= 0 && point.y <= 900
    );
    expect(inside.length / pts.length).toBeGreaterThan(0.98);

    // Sebaran merata: tidak ada kantong padat (gumpalan/pita huruf). Grid 9×9
    // di dalam viewport; bin terpadat tidak boleh melampaui ~2,2× rata-rata.
    const bins = new Array(81).fill(0);
    for (const point of inside) {
      const bx = Math.min(8, Math.floor((point.x / 1440) * 9));
      const by = Math.min(8, Math.floor((point.y / 900) * 9));
      bins[by * 9 + bx] += 1;
    }
    const mean = inside.length / 81;
    expect(Math.max(...bins) / mean).toBeLessThan(2.2);
  });

  it("medan ambient tetap hidup dan bergerak setelah panggung dilewati", () => {
    const stage = { x: 720, y: 450, w: 1200, h: 320, visibility: 1, progress: 0 };
    const run = scenario(1440, 900, stage, { seed: 11 });
    run.frames(170);
    const before = run.drawn().length;
    expect(before).toBeGreaterThan(300);

    // Gulir melewati panggung: titik tidak dipangkas dan tidak hilang total.
    stage.progress = 0.95;
    stage.visibility = 0.45;
    run.signals.scrollVelocity = 2;
    run.frames(60);
    run.signals.scrollVelocity = 0;
    run.frames(20);
    const after = run.drawn();
    expect(after.length).toBeGreaterThan(before * 0.8);

    // Dan masih bergerak, bukan membeku di tempat.
    const snapshot = after.map(point => `${point.x.toFixed(2)}`);
    run.frames(1);
    const next = run.drawn().map(point => `${point.x.toFixed(2)}`);
    const moved = next.filter((key, index) => key !== snapshot[index]).length;
    expect(moved / next.length).toBeGreaterThan(0.3);
  });

  it("menjaga kerapatan wordmark meski titiknya lebih kecil", () => {
    // Titik 1,6px hanya terbaca kalau kerapatannya naik. Ambangnya dipilih
    // di atas kerapatan engine lama (±28 titik per 1000px² di desktop,
    // ±42 di ponsel) supaya pengecilan ukuran tidak pernah diam-diam
    // ditukar dengan wordmark yang lebih tipis.
    const desktop = runWordmark(1440, 900);
    expect(density(desktop.drawn)).toBeGreaterThan(35);

    const phone = runWordmark(390, 780, "lite");
    expect(density(phone.drawn)).toBeGreaterThan(45);
  });

  it("menurunkan jumlah titik sendiri saat biaya loop JavaScript-nya tinggi", () => {
    const stage = { x: 720, y: 450, w: 1200, h: 320, visibility: 1, progress: 0 };
    // Frame murah: tidak ada alasan memangkas apa pun.
    const cheap = scenario(1440, 900, stage, { seed: 5, frameCostMs: 0.4 });
    cheap.frames(260);
    const full = cheap.drawn().length;
    cheap.teardown();
    expect(full).toBeGreaterThan(2000);

    // Pengaman biaya loop lama tetap bekerja secara independen.
    const heavy = scenario(1440, 900, { ...stage }, { seed: 5, frameCostMs: 12 });
    heavy.frames(260);
    const trimmed = heavy.drawn().length;
    heavy.teardown();
    expect(trimmed).toBeLessThan(full * 0.9);
    expect(trimmed).toBeGreaterThan(full * 0.25);
  });

  it("menurunkan beban particle saat cadence rAF turun meski loop JS murah", () => {
    const stage = { x: 720, y: 450, w: 1200, h: 320, visibility: 1, progress: 0 };
    const smooth = scenario(1440, 900, stage, {
      seed: 12,
      frameIntervalMs: 16.67,
    });
    smooth.signals.scrollVelocity = 3;
    smooth.frames(220);
    const full = smooth.drawn().length;
    smooth.teardown();

    const slow = scenario(1440, 900, { ...stage }, {
      seed: 12,
      frameIntervalMs: 33.34,
    });
    slow.signals.scrollVelocity = 3;
    slow.frames(220);
    const trimmed = slow.drawn().length;
    slow.teardown();

    expect(full).toBeGreaterThan(2000);
    expect(trimmed).toBeLessThan(full * 0.85);
    // Adaptive quality must preserve enough points to keep the wordmark legible.
    expect(trimmed).toBeGreaterThan(full * 0.25);
  });

  it("tidak menggambar apa pun saat reduced motion atau hemat data", () => {
    // Keduanya dipetakan ke tier "off" oleh capability detection; engine
    // tidak boleh menggambar satu titik pun, apa pun alasannya.
    for (const reason of ["reducedMotion", "saveData"] as const) {
      const dom = setupDom(1440, 900);
      const field = createParticleField(
        dom.canvas as unknown as HTMLCanvasElement,
        signalsStub(),
        () => ({
          mode: "wordmark" as const,
          capability: { ...capability("off"), [reason]: true },
          frequency: false,
          era: { index: 0, total: 0 },
          transition: "idle" as const,
          transitLabel: "",
          intensity: 1,
        })
      );
      dom.frames.forEach(frame => frame(16));
      expect(dom.drawn.length, reason).toBe(0);
      field.destroy();
      dom.restore();
    }
  });

  it("tidak menggambar apa pun saat tier off", () => {
    const dom = setupDom(1440, 900);
    const field = createParticleField(
      dom.canvas as unknown as HTMLCanvasElement,
      signalsStub(),
      () => ({
        mode: "wordmark" as const,
        capability: capability("off"),
        frequency: false,
        era: { index: 0, total: 0 },
        transition: "idle" as const,
        transitLabel: "",
        intensity: 1,
      })
    );
    dom.frames.forEach(frame => frame(16));
    expect(dom.drawn.length).toBe(0);
    teardown = () => {
      field.destroy();
      dom.restore();
    };
  });
});
