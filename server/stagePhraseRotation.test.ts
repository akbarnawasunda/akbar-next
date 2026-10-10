/**
 * BUKTI PERILAKU: panggung beranda TIDAK lagi menyusun nama dari partikel.
 *
 * [BUGFIX] Dulu tes ini memastikan kedua nama dirasterkan menjadi titik.
 * Itu justru sumber bug "partikel kepotong": di lebar mobile huruf partikel
 * tidak pernah terbaca. Sekarang judul panggung tampil sebagai tipografi
 * DOM yang utuh (SignatureStage.tsx), dan engine hanya menjalankan medan
 * ambient. Kontrak yang dijaga tes ini:
 *   - engine tidak merasterkan satu pun nama di panggung (baik nama resmi,
 *     alias, maupun saat gulir melewati keduanya dan di layar ponsel);
 *   - aksara Sunda tetap tidak pernah masuk ke rasterisasi.
 * Nama tetap ada sebagai teks DOM (h2 + daftar frasa), dicek di tes DOM.
 *
 * Kanvas sampel palsu tetap mencatat setiap `fillText`: kalau satu pun
 * nama muncul di catatan itu, berarti engine masih menyusun huruf.
 */
import { afterEach, describe, expect, it } from "vitest";
import { createParticleField } from "../client/src/signature/field/particleField";
import { PHRASE_SCROLL_TARGET } from "../client/src/signature/stagePhrases";
import type {
  SignatureCapability,
  SignatureSignals,
} from "../client/src/signature/types";

/** Semua teks yang pernah dirasterkan engine, berurutan. */
const rasterized: string[] = [];

function fakeSampleContext(canvas: { width: number; height: number }) {
  let fontSize = 10;
  return {
    set font(value: string) {
      fontSize = Number(/([\d.]+)px/.exec(value)?.[1] || 10);
    },
    get font() {
      return `800 ${fontSize}px test`;
    },
    letterSpacing: "0px",
    fillStyle: "",
    textAlign: "",
    textBaseline: "",
    measureText: (text: string) => ({ width: text.length * fontSize * 0.58 }),
    fillText: (text: string) => {
      rasterized.push(text);
    },
    getImageData: () => {
      const { width, height } = canvas;
      const data = new Uint8ClampedArray(width * height * 4);
      // Pita terisi: cukup untuk membuat engine menemukan target, termasuk
      // target tepi (pita punya tepi atas, bawah, kiri, kanan).
      for (let y = Math.floor(height * 0.4); y < height * 0.52; y++) {
        for (let x = Math.floor(width * 0.2); x < width * 0.8; x++) {
          data[(y * width + x) * 4 + 3] = 255;
        }
      }
      return { data };
    },
  };
}

function capability(): SignatureCapability {
  return {
    tier: "full",
    reducedMotion: false,
    saveData: false,
    coarsePointer: false,
    lowPower: false,
    viewport: "wide",
    deviceScore: 0.8,
    measured: true,
  };
}

function signalsStub(stage: SignatureSignals["stage"]): SignatureSignals {
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

function setupDom(width: number, height: number) {
  const frames: ((time: number) => void)[] = [];
  const context: Record<string, unknown> & {
    globalCompositeOperation: string;
  } = {
    setTransform: () => undefined,
    clearRect: () => undefined,
    beginPath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    stroke: () => undefined,
    fillRect: () => undefined,
    save: () => undefined,
    restore: () => undefined,
    translate: () => undefined,
    scale: () => undefined,
    arc: () => undefined,
    fill: () => undefined,
    createRadialGradient: () => ({ addColorStop: () => undefined }),
    createLinearGradient: () => ({ addColorStop: () => undefined }),
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
  };

  const canvas = {
    width: 0,
    height: 0,
    getBoundingClientRect: () => ({ width, height, left: 0, top: 0 }),
    getContext: () => context,
  };

  const globals = globalThis as unknown as Record<string, unknown>;
  const previous = {
    window: globals.window,
    document: globals.document,
    getComputedStyle: globals.getComputedStyle,
    requestAnimationFrame: globals.requestAnimationFrame,
    cancelAnimationFrame: globals.cancelAnimationFrame,
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
  const timeouts: (() => void)[] = [];
  globals.window = {
    innerWidth: width,
    innerHeight: height,
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
    restore() {
      globals.window = previous.window;
      globals.document = previous.document;
      globals.getComputedStyle = previous.getComputedStyle;
      globals.requestAnimationFrame = previous.requestAnimationFrame;
      globals.cancelAnimationFrame = previous.cancelAnimationFrame;
    },
  };
}

let teardown: (() => void) | null = null;

afterEach(() => {
  teardown?.();
  teardown = null;
  rasterized.length = 0;
});

/** Jalankan panggung dari progres 0 sampai 0,7 seperti pengunjung menggulir. */
function scrollThroughStage(width = 1440, height = 900) {
  const dom = setupDom(width, height);
  const stage = {
    x: width / 2,
    y: height / 2,
    w: width * 0.8,
    h: height * 0.4,
    visibility: 1,
    progress: 0,
  };
  const signals = signalsStub(stage);
  const field = createParticleField(
    dom.canvas as unknown as HTMLCanvasElement,
    signals,
    () => ({
      mode: "wordmark" as const,
      capability: capability(),
      frequency: false,
      era: { index: 0, total: 0 },
      transition: "idle" as const,
      transitLabel: "",
      intensity: 1,
    })
  );
  teardown = () => {
    field.destroy();
    dom.restore();
  };

  let clock = 0;
  const advance = (count: number) => {
    for (let i = 0; i < count; i++) {
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
      clock += 16.67;
      next(clock);
    }
  };

  // Awal jalur: nama resmi.
  stage.progress = PHRASE_SCROLL_TARGET[0];
  advance(40);
  const afterFirst = [...rasterized];

  // Gulir ke bagian alias.
  stage.progress = PHRASE_SCROLL_TARGET[1];
  advance(40);
  const afterSecond = [...rasterized];

  return { afterFirst, afterSecond };
}

describe("panggung ambient: nama tidak disusun partikel", () => {
  it("tidak merasterkan nama resmi di bagian awal jalur", () => {
    const { afterFirst } = scrollThroughStage();
    expect(afterFirst).toEqual([]);
  });

  it("tidak merasterkan alias saat gulir mencapai bagian keduanya", () => {
    const { afterSecond } = scrollThroughStage();
    expect(afterSecond).toEqual([]);
  });

  it("tetap tanpa rasterisasi di layar ponsel (judul dipecah dua baris)", () => {
    const { afterSecond } = scrollThroughStage(390, 780);
    expect(afterSecond).toEqual([]);
  });

  it("tidak pernah diminta merasterkan aksara Sunda", () => {
    const { afterSecond } = scrollThroughStage();
    // Titik tidak bisa membentuk rarangkén; kalau suatu hari aksara masuk
    // ke sini lagi, tes ini yang merahkan lebih dulu.
    expect(afterSecond.join(" ")).not.toMatch(/[\u1B80-\u1BBF]/);
  });
});
