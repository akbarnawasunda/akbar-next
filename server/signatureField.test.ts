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
    setTimeout: () => 0,
    clearTimeout: () => undefined,
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

  return { canvas, drawn, frames, restore };
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
    interactive: false,
    magnetic: false,
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
    })
  );

  // 160 frame ≈ 2,7 detik: cukup untuk titik mengunci ke posisi hurufnya.
  const early: Drawn[] = [];
  const mid: Drawn[] = [];
  for (let i = 0; i < 160; i++) {
    const next = dom.frames.pop();
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
  options: { seed?: number; frameCostMs?: number; tier?: SignatureCapability["tier"] } = {}
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
    })
  );

  let clock = 0;
  const api = {
    signals,
    drawn: () => dom.drawn,
    frames(count: number) {
      for (let i = 0; i < count; i++) {
        const next = dom.frames.pop();
        dom.frames.length = 0;
        if (!next) break;
        dom.drawn.length = 0;
        clock += 16.67;
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

  it("menyusun wordmark di dalam panggung, bukan di tengah layar", () => {
    // Panggung setinggi 360px yang pusatnya ada di 70% tinggi viewport.
    const stage = {
      x: 720,
      y: 630,
      w: 1200,
      h: 360,
      visibility: 1,
      progress: 0,
    };
    const dom = runWordmark(1440, 900, "full", stage);

    const inside = dom.drawn.filter(
      point =>
        point.x > stage.x - stage.w / 2 - 8 &&
        point.x < stage.x + stage.w / 2 + 8 &&
        point.y > stage.y - stage.h / 2 - 8 &&
        point.y < stage.y + stage.h / 2 + 8
    );
    expect(inside.length / dom.drawn.length).toBeGreaterThan(0.9);

    // Area judul hero (sepertiga atas layar) harus bersih.
    const overTitle = dom.drawn.filter(point => point.y < 300);
    expect(overTitle.length / dom.drawn.length).toBeLessThan(0.02);
  });

  it("membentuk huruf menyapu dari kiri ke kanan", () => {
    const stage = { x: 720, y: 450, w: 1200, h: 360, visibility: 1, progress: 0 };
    const dom = runWordmark(1440, 900, "full", stage);

    // Hanya hitung titik yang benar-benar di dalam panggung — titik yang
    // masih menunggu di luar layar tidak boleh ikut terhitung.
    const inStage = (point: Drawn) =>
      point.y > stage.y - stage.h / 2 &&
      point.y < stage.y + stage.h / 2 &&
      point.x > stage.x - stage.w / 2 &&
      point.x < stage.x + stage.w / 2;
    // Pita kiri dan kanan diambil di dalam rentang teks (teks tiruan
    // menempati 20%–80% lebar panggung).
    const leftOf = (point: Drawn) =>
      inStage(point) &&
      point.x > stage.x - stage.w * 0.3 &&
      point.x < stage.x - stage.w * 0.15;
    const rightOf = (point: Drawn) =>
      inStage(point) &&
      point.x > stage.x + stage.w * 0.15 &&
      point.x < stage.x + stage.w * 0.3;
    const leftBand = dom.mid.filter(leftOf).length;
    const rightBand = dom.mid.filter(rightOf).length;
    // Di pertengahan animasi, huruf kiri sudah terbentuk sementara huruf
    // kanan masih dalam perjalanan.
    expect(leftBand).toBeGreaterThan(40);
    expect(leftBand).toBeGreaterThan(rightBand * 1.6);

    // Di akhir, kedua sisi sama-sama penuh.
    const leftFinal = dom.drawn.filter(leftOf).length;
    const rightFinal = dom.drawn.filter(rightOf).length;
    expect(leftFinal).toBeGreaterThan(40);
    expect(rightFinal).toBeGreaterThan(leftFinal * 0.6);
  });

  it("mengganti kata yang disusun saat jalur panggung digulir", () => {
    const stage = {
      x: 720,
      y: 450,
      w: 1200,
      h: 360,
      visibility: 1,
      progress: 0,
    };
    const dom = setupDom(1440, 900);
    const signals = signalsStub(stage);
    const field = createParticleField(
      dom.canvas as unknown as HTMLCanvasElement,
      signals,
      () => ({
        mode: "wordmark" as const,
        capability: capability("full"),
        frequency: false,
        era: { index: 0, total: 0 },
        transition: "idle" as const,
        transitLabel: "",
      })
    );

    const run = (frames: number, from: number) => {
      for (let i = 0; i < frames; i++) {
        const next = dom.frames.pop();
        dom.frames.length = 0;
        if (!next) break;
        dom.drawn.length = 0;
        next((from + i) * 16.67);
      }
    };

    run(170, 0);
    const first = dom.drawn.map(point => `${Math.round(point.x)}:${Math.round(point.y)}`);

    // Gulir ke sepertiga kedua jalur → kata berganti.
    if (signals.stage) signals.stage.progress = 0.5;
    run(10, 170);
    const breaking = dom.drawn.length;
    run(170, 180);
    const second = dom.drawn.map(point => `${Math.round(point.x)}:${Math.round(point.y)}`);

    expect(breaking).toBeGreaterThan(0);
    // Susunan titiknya benar-benar berbeda: huruf yang dibentuk berganti.
    const shared = second.filter(key => first.includes(key)).length;
    expect(shared / second.length).toBeLessThan(0.5);

    // Dan tetap rapi di dalam panggung.
    const inside = dom.drawn.filter(
      point =>
        point.x > stage.x - stage.w / 2 - 8 &&
        point.x < stage.x + stage.w / 2 + 8 &&
        point.y > stage.y - stage.h / 2 - 8 &&
        point.y < stage.y + stage.h / 2 + 8
    );
    expect(inside.length / dom.drawn.length).toBeGreaterThan(0.9);

    teardown = () => {
      field.destroy();
      dom.restore();
    };
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
      })
    );

    const run = (frames: number, from: number) => {
      for (let i = 0; i < frames; i++) {
        const next = dom.frames.pop();
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

  it("melepas titik saat panggung terlewat, bukan menyembunyikannya", () => {
    // Keluhan aslinya: lewat panggung, efeknya cuma memudar. Dulu 55% titik
    // berhenti digambar dan sisanya turun ke alpha 0,12 — terlihat seperti
    // mati, bukan buyar. Sekarang titik tetap digambar; yang hilang hanya
    // yang benar-benar terbang keluar layar.
    const stage = {
      x: 720,
      y: 450,
      w: 1200,
      h: 320,
      visibility: 1,
      progress: 0,
    };
    const run = scenario(1440, 900, stage, { seed: 7 });
    run.frames(170);
    const locked = run.drawn().length;
    expect(locked).toBeGreaterThan(2000);

    const inStageBox = (point: Drawn) =>
      point.x > stage.x - stage.w / 2 &&
      point.x < stage.x + stage.w / 2 &&
      point.y > stage.y - stage.h / 2 &&
      point.y < stage.y + stage.h / 2;
    expect(run.drawn().filter(inStageBox).length / locked).toBeGreaterThan(0.9);

    // Gulir melewati panggung.
    stage.progress = 0.95;
    stage.visibility = 0.45;
    run.signals.scrollVelocity = 2.4;
    run.frames(4);
    // Tidak ada pemangkasan: jumlah titik yang tergambar tetap hampir sama.
    expect(run.drawn().length).toBeGreaterThan(locked * 0.95);

    run.frames(40);
    const flying = run.drawn();
    // Masih hampir semua titik hidup…
    expect(flying.length).toBeGreaterThan(locked * 0.8);
    // …dan mereka sudah menyebar jauh melampaui kotak panggung.
    const outside = flying.filter(point => !inStageBox(point));
    expect(outside.length / flying.length).toBeGreaterThan(0.45);
    const spreadY =
      Math.max(...flying.map(point => point.y)) -
      Math.min(...flying.map(point => point.y));
    expect(spreadY).toBeGreaterThan(stage.h * 1.6);
  });

  it("menyisakan debu yang tetap bergerak setelah panggung hilang", () => {
    const stage = { x: 720, y: 450, w: 1200, h: 320, visibility: 1, progress: 0 };
    const run = scenario(1440, 900, stage, { seed: 11 });
    run.frames(170);
    const locked = run.drawn().length;

    stage.progress = 1;
    stage.visibility = 0.01;
    run.signals.scrollVelocity = 3;
    run.frames(220);
    run.signals.scrollVelocity = 0;
    run.frames(60);

    const dust = run.drawn();
    // Sepertiga titik ditahan sebagai debu ambient: tidak hilang total.
    expect(dust.length / locked).toBeGreaterThan(0.25);
    expect(dust.length / locked).toBeLessThan(0.45);

    // Dan debunya benar-benar masih bergerak, bukan membeku.
    const before = run.drawn().map(point => `${point.x.toFixed(2)}`);
    run.frames(1);
    const after = run.drawn().map(point => `${point.x.toFixed(2)}`);
    const moved = after.filter((key, index) => key !== before[index]).length;
    expect(moved / after.length).toBeGreaterThan(0.5);
  });

  it("menerbangkan titik masuk lagi saat digulir balik ke atas", () => {
    const stage = { x: 720, y: 450, w: 1200, h: 320, visibility: 1, progress: 0 };
    const run = scenario(1440, 900, stage, { seed: 3 });
    run.frames(170);
    const locked = run.drawn().length;

    // Gulir melewati panggung dengan kecepatan wajar, lalu berhenti.
    stage.progress = 0.9;
    stage.visibility = 0.3;
    run.signals.scrollVelocity = 1.8;
    run.frames(50);
    stage.progress = 1;
    stage.visibility = 0.02;
    run.frames(40);
    run.signals.scrollVelocity = 0;
    run.frames(130);
    expect(run.drawn().length).toBeLessThan(locked * 0.6);

    // Gulir balik: panggung terlihat lagi.
    stage.progress = 0.1;
    stage.visibility = 1;
    run.frames(200);
    const back = run.drawn();
    expect(back.length).toBeGreaterThan(locked * 0.9);
    const inStageBox = back.filter(
      point =>
        point.x > stage.x - stage.w / 2 - 8 &&
        point.x < stage.x + stage.w / 2 + 8 &&
        point.y > stage.y - stage.h / 2 - 8 &&
        point.y < stage.y + stage.h / 2 + 8
    );
    // Mereka menyusun nama lagi, bukan menggantung di tempatnya.
    expect(inStageBox.length / back.length).toBeGreaterThan(0.9);
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

  it("menurunkan jumlah titik sendiri saat frame-nya melar", () => {
    const stage = { x: 720, y: 450, w: 1200, h: 320, visibility: 1, progress: 0 };
    // Frame murah: tidak ada alasan memangkas apa pun.
    const cheap = scenario(1440, 900, stage, { seed: 5, frameCostMs: 0.4 });
    cheap.frames(260);
    const full = cheap.drawn().length;
    cheap.teardown();
    expect(full).toBeGreaterThan(2000);

    // Frame 12ms (di atas ambang 9ms): jumlah titik aktif turun bertahap.
    const heavy = scenario(1440, 900, { ...stage }, { seed: 5, frameCostMs: 12 });
    heavy.frames(260);
    const trimmed = heavy.drawn().length;
    heavy.teardown();
    expect(trimmed).toBeLessThan(full * 0.9);
    // …tapi tidak pernah di bawah lantai keterbacaan.
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
