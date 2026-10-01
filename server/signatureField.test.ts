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

function setupDom(viewportWidth: number, viewportHeight: number) {
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
  };

  globals.window = windowStub;
  globals.document = documentStub;
  globals.getComputedStyle = () => ({ getPropertyValue: () => "#eceae5" });
  globals.requestAnimationFrame = (callback: (time: number) => void) => {
    frames.push(callback);
    return frames.length;
  };
  globals.cancelAnimationFrame = () => undefined;

  const restore = () => {
    globals.window = previous.window;
    globals.document = previous.document;
    globals.getComputedStyle = previous.getComputedStyle;
    globals.requestAnimationFrame = previous.requestAnimationFrame;
    globals.cancelAnimationFrame = previous.cancelAnimationFrame;
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
