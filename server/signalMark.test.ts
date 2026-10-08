/**
 * Kontrak untuk pass "Signal Mark" (docs/signal-mark-pass.md).
 *
 * Yang dijaga: kursor kembali sepenuhnya native (sistem kursor kustom dihapus
 * bersih), Signal Mark terpasang sebagai elemen dekoratif di shell tanpa
 * bocor ke SSR, tanpa loop runtime/pointer tracking, state machine-nya hidup
 * di CSS lewat sinyal bersama yang sudah ada, dan penempatannya aman
 * (angkat di atas dock, tertekan di footer, statis saat reduced motion).
 * Mengikuti docs/notes/testing-policy.md pasal 3 — tes source hanya untuk
 * yang memang tidak muncul di HTML.
 */
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const indexCss = source("client/src/index.css");
const shell = source("client/src/shell/PublicShell.tsx");
const markTsx = source("client/src/components/signature/SignalMark.tsx");
const markCss = source("client/src/components/signature/SignalMark.css");
const pointer = source("client/src/signature/pointerSignal.ts");
const player = source("client/src/components/signature/GlobalAudioPlayer.tsx");

describe("kursor native — sistem kursor kustom dihapus bersih", () => {
  it("tidak ada lagi gate cursor: none, atribut, maupun token z-index kursor", () => {
    expect(indexCss).not.toContain("cursor: none");
    expect(indexCss).not.toContain("data-signature-cursor");
    expect(indexCss).not.toContain("--z-cursor");
    // CSS permukaan publik lain juga tidak boleh menyembunyikan kursor.
    for (const file of [
      "client/src/shell/EditorialRefresh.css",
      "client/src/shell/PublicShell.css",
      "client/src/components/NightFrequencyChrome.css",
      "client/src/components/signature/SignalMark.css",
      "client/src/components/signature/GlobalAudioPlayer.css",
    ]) {
      expect(source(file), file).not.toMatch(/cursor:\s*none/);
    }
  });

  it("berkas dan aset sistem kursor sudah dihapus dari repo", () => {
    const gone = [
      "client/src/components/signature/CursorSignal.tsx",
      "client/src/components/signature/CursorSignal.css",
      "client/src/signature/cursorPose.ts",
      "server/cursorPose.test.ts",
      "client/public/assets/cursor",
    ];
    for (const path of gone) {
      expect(existsSync(resolve(process.cwd(), path)), `${path} masih ada`).toBe(
        false
      );
    }
    // Maskot hero (pakai non-kursor) tetap ada.
    expect(
      existsSync(resolve(process.cwd(), "client/public/assets/akbar-mascot-doodle.webp"))
    ).toBe(true);
  });

  it("tidak ada atribut data-cursor / data-signal-interactive tersisa", () => {
    for (const file of [
      "client/src/components/NightFrequencyChrome.tsx",
      "client/src/components/PortraitStudiesSection.tsx",
      "client/src/components/signature/EraTimeline.tsx",
      "client/src/components/signature/GlobalAudioPlayer.tsx",
      "client/src/components/signature/InteractiveArtworkCard.tsx",
      "client/src/pages/Home.tsx",
      "client/src/pages/Music.tsx",
      "client/src/pages/Visuals.tsx",
    ]) {
      const tsx = source(file);
      expect(tsx, file).not.toContain("data-cursor");
      expect(tsx, file).not.toContain("data-signal-interactive");
    }
  });

  it("sinyal bersama tidak lagi menyimpan status hover/drag/magnetik kursor", () => {
    expect(pointer).not.toContain("resolveHover");
    expect(pointer).not.toContain("INTERACTIVE_SELECTOR");
    expect(pointer).not.toContain("signals.hover");
    expect(pointer).not.toContain("signals.dragging");
    expect(pointer).not.toContain("signals.magneticElement");
    // Yang dipakai engine partikel tetap ada.
    expect(pointer).toContain("signals.pointerPressed");
  });
});

describe("Signal Mark — terpasang, dekoratif, tidak bocor ke SSR", () => {
  it("dipasang oleh public shell, bukan CursorSignal", () => {
    expect(shell).toContain("<SignalMark />");
    expect(shell).not.toContain("CursorSignal");
    // Dipasang setelah tirai rute, sebelum player (urutan z-index via token).
    expect(shell.indexOf("<SignalMark />")).toBeLessThan(
      shell.indexOf("<GlobalAudioPlayer />")
    );
  });

  it("tidak muncul di HTML SSR (lapisan client-only)", async () => {
    const prefetch = { documents: async () => [] as never };
    for (const route of ["/", "/music", "/en/live"]) {
      const page = await render(route, prefetch);
      expect(page.html, `${route} membocorkan Signal Mark`).not.toContain(
        "an-signal-mark"
      );
    }
  });

  it("sepenuhnya dekoratif: aria-hidden, pointer-events none, z-index token", () => {
    expect(markTsx).toContain('aria-hidden="true"');
    expect(markCss).toContain("pointer-events: none");
    expect(markCss).toContain("z-index: var(--z-mark");
  });
});

describe("Signal Mark — tanpa loop runtime dan pointer tracking", () => {
  it("tidak ada rAF, listener pointer, maupun listener scroll di komponen", () => {
    expect(markTsx).not.toContain("requestAnimationFrame");
    expect(markTsx).not.toContain('addEventListener("pointermove"');
    expect(markTsx).not.toContain('addEventListener("pointerdown"');
    expect(markTsx).not.toContain('addEventListener("scroll"');
    // Satu-satunya observer: IntersectionObserver untuk footer.
    expect(markTsx).toContain("IntersectionObserver");
    expect(markTsx).not.toContain("pointerSignal");
  });

  it("seluruh gerakan hidup di CSS keyframes/transition, tanpa canvas", () => {
    expect(markCss).toContain("@keyframes an-signal-mark-breathe");
    expect(markCss).toContain("@keyframes an-signal-mark-drift");
    expect(markCss).toContain("@keyframes an-signal-mark-sweep");
    expect(markCss).not.toContain("<canvas");
    expect(markTsx).not.toContain("<canvas");
    expect(markTsx).not.toContain('createElement("canvas")');
  });
});

describe("Signal Mark — state machine via sinyal bersama", () => {
  it("gulir: atribut data-signal-scroll di <html> menggerakkan jejak (arah-aware)", () => {
    // Ditulis/dihapus pointerSignal hanya saat arah atau keadaan berubah.
    // Ditulis sebagai dataset.signalScroll (atribut data-signal-scroll).
    expect(pointer).toContain("dataset.signalScroll");
    expect(markCss).toContain('html[data-signal-scroll="up"]');
    expect(markCss).toContain("html[data-signal-scroll] .an-signal-mark-trace");
  });

  it("audio: napas amplitudo dari loop bersama, bukan equalizer", () => {
    // Varian root ditulis loop epsilon player yang sudah ada.
    expect(player).toContain('"--an-signal-amp"');
    // Saat audio berhenti, var dihapus — mark kembali ke napas idle murni,
    // tidak "mengingat" amplitudo terakhir.
    expect(player).toContain('removeProperty("--an-signal-amp")');
    expect(markCss).toContain("var(--an-signal-amp");
    expect(markCss).toContain(".an-signal-mark.is-playing");
    // Respons audio berupa napas opacity/durasi — tidak ada FFT/waveform.
    expect(markCss).not.toContain("analyser");
    expect(markTsx).not.toContain("AnalyserNode");
  });

  it("transisi rute: satu sapuan pendek dari fase yang sudah ada", () => {
    expect(markTsx).toContain('phase === "sweep"');
    expect(markCss).toContain(".an-signal-mark.is-transit");
    expect(markCss).toContain("@keyframes an-signal-mark-dash");
    // Sapuan titik harus berakhir di titik awal (translate3d(0)) — drift idle
    // dipasang lagi dari awal saat kelas dilepas, jadi titik tidak meloncat.
    const dash = markCss.slice(markCss.indexOf("@keyframes an-signal-mark-dash"));
    expect(dash).toMatch(/100%\s*\{\s*transform:\s*translate3d\(0, 0, 0\)/);
  });
});

describe("Signal Mark — penempatan aman dan aksesibilitas", () => {
  it("terletak di sudut aman kanan bawah dengan safe-area inset", () => {
    expect(markCss).toContain("position: fixed");
    expect(markCss).toContain("right: 28px");
    expect(markCss).toContain("env(safe-area-inset-bottom");
  });

  it("mengangkat diri di atas dock audio, mengikuti tinggi dock yang sama", () => {
    // Meniru padding-bottom body milik dock (68px; 76px ≤640px; 80px coarse;
    // + tinggi rak embed saat terbuka).
    expect(markCss).toContain('html[data-an-player="visible"] .an-signal-mark');
    expect(markCss).toContain('html[data-an-player="visible"][data-an-player-shelf="open"]');
    expect(markCss).toContain("--an-embed-audio-h, 166px");
    expect(markCss).toContain("@media (max-width: 640px)");
    expect(markCss).toContain("@media (pointer: coarse)");
  });

  it("menekan diri saat bar bawah footer dekat (tidak menutupi teks)", () => {
    expect(markTsx).toContain(".nf-footer .footer-bottom");
    expect(markCss).toContain(".an-signal-mark.is-near-footer");
    expect(markCss).toMatch(
      /\.an-signal-mark\.is-near-footer\s*\{[^}]*visibility:\s*hidden/
    );
  });

  it("statis total saat prefers-reduced-motion", () => {
    const at = markCss.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(at).toBeGreaterThanOrEqual(0);
    const block = markCss.slice(at);
    expect(block).toMatch(/animation:\s*none/);
    expect(block).toMatch(/transition:\s*none/);
  });
});
