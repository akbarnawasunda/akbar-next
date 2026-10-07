/**
 * Cursor companion — state machine.
 *
 * Mascot kecil yang menemani pointer dan berganti pose menurut apa yang
 * sedang dilakukan pengunjung. Bukan "tempelkan mascot.png di dekat
 * pointer": ini bahasa interaksi dengan prioritas yang pasti, supaya tidak
 * ada dua state yang berebut di frame yang sama.
 *
 * Modul ini sengaja murni (tidak menyentuh DOM/window) supaya urutan
 * prioritas bisa diuji langsung tanpa jsdom — lihat server/cursorPose.test.ts.
 */

/** Delapan pose dari aset mascot (lihat client/public/assets/cursor/). */
export type CursorPose =
  | "idle"
  | "curious"
  | "pointing"
  | "press"
  | "drag"
  | "thinking"
  | "music"
  | "stop";

/**
 * Hasil resolusi elemen yang sedang di bawah pointer/fokus — ditentukan dari
 * atribut semantik `data-cursor` (plus beberapa alias yang sudah ada di
 * situs ini: `data-signal-magnetic` untuk CTA utama, selector native untuk
 * elemen nonaktif). Lihat resolveCursorHover di CursorSignal.tsx.
 */
export type CursorHover = "stop" | "music" | "point" | "aware" | null;

export type CursorPoseInput = {
  /** Tombol pointer sedang ditekan (mousedown s.d. mouseup). */
  pressed: boolean;
  /**
   * Drag sungguhan sedang berlangsung — hanya berarti bila `pressed` juga
   * true. Diaktifkan oleh pergerakan nyata di elemen `data-cursor="drag"`,
   * bukan oleh pointer yang sekadar bergerak.
   */
  dragging: boolean;
  /** Elemen apa yang sedang disentuh pointer/fokus, lihat CursorHover. */
  hover: CursorHover;
  /** Pointer sudah diam >= ambang waktu (lihat STILL_THRESHOLD_MS). */
  still: boolean;
};

/** Pointer dianggap "diam" setelah 3,4 detik — di tengah jendela 3–5 detik. */
export const STILL_THRESHOLD_MS = 3400;

/** Jarak tempuh sebelum tekan-dan-tahan dianggap drag sungguhan, bukan klik. */
export const DRAG_THRESHOLD_PX = 6;

/**
 * Prioritas, dari tertinggi ke terendah:
 * CLICK/DRAG (satu cabang, sama-sama butuh `pressed`) > STOP > MUSIC >
 * POINTING > CURIOUS > THINKING > IDLE.
 *
 * Deterministik: input yang sama selalu menghasilkan pose yang sama, tidak
 * ada dua state yang bisa menang bersamaan.
 */
export function resolveCursorPose(input: CursorPoseInput): CursorPose {
  const { pressed, dragging, hover, still } = input;

  if (pressed) return dragging ? "drag" : "press";
  if (hover === "stop") return "stop";
  if (hover === "music") return "music";
  if (hover === "point") return "pointing";
  if (hover === "aware") return still ? "thinking" : "curious";
  return still ? "thinking" : "idle";
}
