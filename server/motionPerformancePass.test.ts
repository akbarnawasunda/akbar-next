/**
 * Kontrak untuk pass "Motion Performance + Liquid Signal"
 * (docs/motion-performance-liquid-signal-pass.md).
 *
 * Yang dijaga: mesin idle engine partikel, pemisahan listener pointer
 * (satu loop kursor, tanpa listener ganda), elisi penulisan style,
 * pembatasan pompa lenis, dan perilaku per-rute (intensitas). Mengikuti
 * docs/notes/testing-policy.md pasal 3 — hal yang tidak muncul di HTML
 * diuji dari source.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const field = source("client/src/signature/field/particleField.ts");
const pointer = source("client/src/signature/pointerSignal.ts");
const cursor = source("client/src/components/signature/CursorSignal.tsx");
const smooth = source("client/src/lib/smoothScroll.ts");
const chrome = source("client/src/components/NightFrequencyChrome.tsx");
const era = source("client/src/components/signature/EraTimeline.tsx");
const player = source("client/src/components/signature/GlobalAudioPlayer.tsx");
const routes = source("client/src/signature/routeSignal.ts");
const bg = source("client/src/components/signature/SignatureBackground.tsx");
const bench = source("scripts/bench-particle-field.ts");

describe("mesin idle engine partikel", () => {
  it("tidur ke frekuensi rendah saat tidak ada aktivitas, bukan berhenti atau jalan terus", () => {
    // Jadwal idle lewat setTimeout (bukan rAF) — frame berikutnya baru
    // dieksekusi setelah jeda; loop tidak pernah berhenti total (sisa hidup
    // tetap terasa) dan tidak jalan 60fps saat dibaca.
    expect(field).toContain("IDLE_FRAME_MS");
    expect(field).toMatch(/setTimeout\(\(\)\s*=>\s*\{[\s\S]*?requestAnimationFrame\(step\)[\s\S]*?\}, IDLE_FRAME_MS\)/);
  });

  it("bangun instan dari gerakan pointer, gulir, dan perubahan state diskrit", () => {
    // Listener bangun: pointermove/pointerdown/scroll + hook onWake (store).
    expect(field).toContain('window.addEventListener("pointermove", onWakeEvent');
    expect(field).toContain('window.addEventListener("scroll", onWakeEvent');
    expect(field).toContain("disposeWake = onWake?.(wake)");
    // cleanup melepas semuanya
    expect(field).toContain('window.removeEventListener("pointermove", onWakeEvent)');
    expect(field).toContain("disposeWake?.()");
  });

  it("menghitung aktivitas dari pointer, gulir, audio, transisi, dan pembentukan", () => {
    expect(field).toContain("POINTER_ACTIVE_MS");
    expect(field).toContain("AMPLITUDE_ACTIVE");
    expect(field).toMatch(/signals\.scrollVelocity !== 0/);
    expect(field).toMatch(/state\.transition !== "idle"/);
    expect(field).toMatch(/formation < 1/);
  });

  it("tidak lagi dianggap aktif oleh debu ambient yang melayang terus", () => {
    // Debu ambient (titik FREE yang melingkar di viewport) adalah "sisa
    // hidup", bukan aktivitas — hanya titik non-ambient yang sedang terbang
    // yang menahan laju penuh.
    expect(field).toContain("airborneCore");
    expect(field).toMatch(/flyingCore > 0/);
    expect(field).not.toMatch(/[^a-zA-Z]flying > 0;/);
  });

  it("berhenti total saat tab disembunyikan dan saat dihancurkan", () => {
    expect(field).toContain('document.addEventListener("visibilitychange", onVisibility)');
    expect(field).toMatch(/function stop\(\)\s*\{[\s\S]*?clearTimeout\(idleTimer\)/);
  });

  it("mengukur laju idle di bench (bukti: frame tereksekusi per 10 detik)", () => {
    expect(bench).toContain("IDLE_WALL_MS");
    expect(bench).toContain("idleExecuted");
    // Frame aktif (rAF) dan timeout (idle) harus bisa dibedakan harness-nya.
    expect(bench).toContain("dom.timeouts.pop()");
  });
});

describe("satu loop kursor — tanpa listener ganda", () => {
  it("CursorSignal tidak lagi memasang listener pointer sendiri", () => {
    // Status hover/pressed/dragging/magnetik di-resolve pointerSignal;
    // CursorSignal hanya menjalankan loop rAF.
    expect(cursor).not.toContain('addEventListener("pointermove"');
    expect(cursor).not.toContain('addEventListener("pointerdown"');
    expect(cursor).not.toContain('addEventListener("focusin"');
    expect(cursor).not.toContain("INTERACTIVE_SELECTOR");
    expect(cursor).not.toContain("resolveHover");
  });

  it("CursorSignal membaca status dari sinyal bersama", () => {
    expect(cursor).toContain("signals.pointerPressed");
    expect(cursor).toContain("signals.dragging");
    expect(cursor).toContain("signals.hover");
    expect(cursor).toContain("signals.magneticElement");
  });

  it("pointerSignal adalah satu-satunya pemilik resolve hover/drag/magnetik", () => {
    expect(pointer).toContain("STOP_SELECTOR");
    expect(pointer).toContain("MUSIC_SELECTOR");
    expect(pointer).toContain("POINT_SELECTOR");
    expect(pointer).toContain("DRAG_SELECTOR");
    expect(pointer).toContain("resolveHover");
    expect(pointer).toContain("signals.hover");
    expect(pointer).toContain("signals.dragging");
    expect(pointer).toContain("signals.magneticElement");
    // Satu listener untuk seluruh situs (tidak ada duplikasi di komponen lain).
    expect(cursor).not.toContain("attachPointerSignal");
  });

  it("menulis transform seperlunya (elisi saat pointer diam)", () => {
    expect(cursor).toContain("lastDotX");
    expect(cursor).toContain("converged");
    // Tidak menulis style setiap frame tanpa perubahan.
    expect(cursor).toMatch(/if \(signals\.pointerX !== lastDotX \|\| signals\.pointerY !== lastDotY\)/);
  });
});

describe("scroll — komputasi seminimal mungkin", () => {
  it("lenis berhenti memompa rAF saat idle dan bangun dari event", () => {
    // Pompa hanya lanjut saat lenis masih bekerja.
    expect(smooth).toMatch(/if \(lenis\.isScrolling\) rafId = requestAnimationFrame\(raf\)/);
    // Bangun dari wheel/touch/scroll/keydown.
    expect(smooth).toContain('window.addEventListener("wheel", wake');
    expect(smooth).toContain('window.addEventListener("scroll", wake');
    expect(smooth).toContain('document.addEventListener("keydown", wake');
    // Scroll programmatic ikut membangunkan pompa.
    expect(smooth).toContain("wakePump?.()");
    // Cleanup melepas listener.
    expect(smooth).toContain('window.removeEventListener("wheel", wake)');
  });

  it("status scrolled header di-throttle ke satu setState per frame", () => {
    const effect = chrome.slice(chrome.indexOf("setScrolled"));
    expect(effect).toContain("requestAnimationFrame");
    expect(effect).not.toMatch(/const onScroll = \(\) => setScrolled\(/);
  });

  it("progres timeline era ditulis sebagai CSS var, bukan state React per frame", () => {
    expect(era).toContain("rootRef.current?.style.setProperty");
    expect(era).toContain("--era-progress");
    // Tidak ada lagi setProgress di jalur scroll.
    const update = era.slice(era.indexOf("const update = () =>"));
    expect(update.slice(0, update.indexOf("};") + 2)).not.toContain("setProgress");
  });
});

describe("penulisan style — seperlunya", () => {
  it("amplitudo player hanya ditulis saat berubah material (epsilon)", () => {
    expect(player).toContain("lastAmp");
    expect(player).toMatch(/Math\.abs\(amp - lastAmp\) >= 0\.004/);
  });
});

describe("perilaku per rute — sinyal punya ingatan", () => {
  it("setiap rute punya intensitas sendiri", () => {
    expect(routes).toContain("intensity");
    // LIVE lebih energik dari MUSIC; halaman senyap paling rendah.
    expect(routes).toMatch(/"\/live":\s*\{[^}]*intensity:\s*1\.2/);
    expect(routes).toMatch(/"\/music":\s*\{[^}]*intensity:\s*0\.9/);
    expect(routes).toMatch(/"\/visuals":\s*\{[^}]*intensity:\s*0\.65/);
    expect(routes).toMatch(/"\/epk":\s*\{[^}]*intensity:\s*0\.5/);
  });

  it("engine membaca intensitas dari state dan menyalurkannya ke runtime", () => {
    expect(field).toContain("state.intensity");
    expect(field).toMatch(/const intensity = state\.intensity > 0 \? state\.intensity : 1/);
    expect(bg).toContain("intensity: snapshot.route.intensity");
  });
});
