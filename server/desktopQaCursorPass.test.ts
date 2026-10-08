/**
 * Kontrak untuk pass "Desktop Visual QA + Cursor System"
 * (docs/desktop-visual-qa-cursor-pass.md) dan pass lanjutan "Signal Mark"
 * (docs/signal-mark-pass.md).
 *
 * Yang dijaga di sini adalah arsitektur yang tidak terlihat di HTML hasil
 * render: skala z-index (tanpa lapisan kursor), kebijakan kursor native,
 * kebijakan wrap untuk teks panjang, tangga lebar masthead, dan offset ganda
 * masthead. Mengikuti docs/notes/testing-policy.md pasal 3 — tes source hanya
 * untuk yang memang tidak muncul di HTML.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const indexCss = source("client/src/index.css");
const editorial = source("client/src/shell/EditorialRefresh.css");
const chromeTsx = source("client/src/components/NightFrequencyChrome.tsx");
const chromeRedesign = source("client/src/shell/ChromeRedesign.css");

/** Ambil nilai satu token `--z-*` dari index.css. */
function zToken(name: string): number {
  const match = indexCss.match(new RegExp(`${name}:\\s*(\\d+)`));
  expect(match, `token ${name} tidak ada di index.css`).toBeTruthy();
  return Number(match![1]);
}

/** Ambil blok aturan untuk satu selektor (kurung kurawal seimbang, level atas). */
function ruleBlock(css: string, selector: string): string {
  const at = css.indexOf(selector);
  expect(at, `selektor tidak ditemukan: ${selector}`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open, i + 1);
    }
  }
  return css.slice(open);
}

describe("skala z-index — tanpa lapisan kursor di atas UI", () => {
  it("menghapus --z-cursor: kursor native, tidak ada lapisan di atas UI publik", () => {
    // Pass Signal Mark menghapus seluruh sistem kursor kustom. Token lamanya
    // tidak boleh kembali tanpa sengaja.
    expect(indexCss).not.toContain("--z-cursor");
    // Signal Mark punya token sendiri: di atas tirai rute (tirai menutupi layar
    // saat transisi — tanpa ini sapuan transisi mark tidak akan terlihat),
    // tetap di bawah lightbox. Ia tidak bersaing dengan dock: secara spasial
    // ia mengangkat diri di atas dock (lihat SignalMark.css).
    const mark = zToken("--z-mark");
    expect(mark).toBeGreaterThan(zToken("--z-curtain"));
    expect(mark).toBeGreaterThan(zToken("--z-field-transit"));
    expect(mark).toBeLessThan(zToken("--z-lightbox"));
    // Shell hint tetap dekoratif di bawah player.
    expect(zToken("--z-hint")).toBeLessThan(zToken("--z-player"));
  });

  it("memakai token, bukan angka mentah, pada lapisan global publik", () => {
    const tokenized: [string, string, string][] = [
      ["client/src/components/NightFrequencyChrome.css", ".nf-nav", "--z-nav"],
      [
        "client/src/components/NightFrequencyChrome.css",
        ".nf-mobile-drawer-root",
        "--z-overlay",
      ],
      ["client/src/components/CommandPalette.css", "z-index", "--z-palette"],
      [
        "client/src/components/RouteTransition.css",
        "z-index",
        "--z-transition",
      ],
      [
        "client/src/components/signature/GlobalAudioPlayer.css",
        ".an-global-player",
        "--z-player",
      ],
      [
        "client/src/components/signature/Lightbox.css",
        ".an-lightbox",
        "--z-lightbox",
      ],
      [
        "client/src/components/signature/RouteSignalCurtain.css",
        ".an-route-signal",
        "--z-curtain",
      ],
      [
        "client/src/components/signature/SignatureBackground.css",
        ".an-signature-field",
        "--z-field",
      ],
      [
        "client/src/components/NightFrequencySignature.css",
        ".nf-signature-rail",
        "--z-rail",
      ],
    ];
    for (const [file, needle, token] of tokenized) {
      const css = source(file);
      // Satu nama kelas bisa punya beberapa blok aturan — cari blok yang
      // memuat z-index (kalau ada beberapa, yang mana pun yang z-index-nya
      // sudah bertoken).
      let found = false;
      let searchFrom = 0;
      while (true) {
        const at = css.indexOf(needle, searchFrom);
        if (at === -1) break;
        searchFrom = at + needle.length;
        const block = css.slice(at, css.indexOf("}", at));
        if (block.includes("z-index") && block.includes(`var(${token}`)) {
          found = true;
          break;
        }
      }
      expect(
        found,
        `${needle} di ${file} harus memakai var(${token}) pada aturan z-index-nya`
      ).toBe(true);
    }
  });
});

describe("kursor native — tidak ada sisa sistem kursor kustom", () => {
  it("tidak menyembunyikan kursor native di CSS publik mana pun", () => {
    // Gate `cursor: none` dihapus total (docs/signal-mark-pass.md): kursor
    // browser harus normal di tombol, tautan, iframe, audio, sentuhan, dan fokus.
    const cssFiles = [
      "client/src/index.css",
      "client/src/shell/EditorialRefresh.css",
      "client/src/components/NightFrequencyChrome.css",
      "client/src/components/signature/GlobalAudioPlayer.css",
      "client/src/components/signature/SignalMark.css",
      "client/src/components/signature/SignatureBackground.css",
    ];
    for (const file of cssFiles) {
      const css = source(file);
      expect(css, `${file} masih menyembunyikan kursor`).not.toMatch(
        /cursor:\s*none/
      );
      expect(css, `${file} masih punya token kursor`).not.toContain(
        "--z-cursor"
      );
    }
    expect(indexCss).not.toContain("data-signature-cursor");
  });

  it("tidak ada atribut data-cursor / data-signal-interactive tersisa di source", () => {
    const tsxFiles = [
      "client/src/components/NightFrequencyChrome.tsx",
      "client/src/components/PortraitStudiesSection.tsx",
      "client/src/components/signature/EraTimeline.tsx",
      "client/src/components/signature/GlobalAudioPlayer.tsx",
      "client/src/components/signature/InteractiveArtworkCard.tsx",
      "client/src/pages/Home.tsx",
      "client/src/pages/Music.tsx",
      "client/src/pages/Visuals.tsx",
    ];
    for (const file of tsxFiles) {
      const tsx = source(file);
      expect(tsx, `${file} masih punya data-cursor`).not.toContain(
        "data-cursor"
      );
      expect(tsx, `${file} masih punya data-signal-interactive`).not.toContain(
        "data-signal-interactive"
      );
    }
  });

  it("shell tidak lagi memasang CursorSignal, melainkan SignalMark", () => {
    const shell = source("client/src/shell/PublicShell.tsx");
    expect(shell).not.toContain("CursorSignal");
    expect(shell).toContain("<SignalMark />");
    // Signal Mark tetap dekoratif: pointer-events none di CSS-nya.
    const markCss = source("client/src/components/signature/SignalMark.css");
    const block = ruleBlock(markCss, ".an-signal-mark {");
    expect(block).toContain("pointer-events: none");
    expect(block).toContain("z-index: var(--z-mark");
  });
});

describe("masthead — hierarki dan tangga lebar", () => {
  it("tidak lagi merender tagline di wordmark (rumah tetapnya di footer/hero)", () => {
    expect(chromeTsx).not.toContain("{t.tagline}");
    expect(chromeTsx).not.toContain("tagline:");
    expect(chromeRedesign).not.toContain(".nf-wordmark-text small");
  });

  it("memakai jam studio versi ringkas di masthead", () => {
    expect(chromeTsx).toContain("<StudioClock locale={lang} compact />");
    const clock = source("client/src/components/StudioClock.tsx");
    expect(clock).toContain("compact");
    expect(clock).toContain("nf-clock--time");
  });

  it("memiliki tangga lebar yang terukur: clock lalu bahasa sebelum drawer", () => {
    // ≥1360: semua zona. ≤1359: jam studio pindah ke footer.
    expect(editorial).toContain("@media (max-width: 1359.98px)");
    const clockRung = editorial.slice(
      editorial.indexOf("@media (max-width: 1359.98px)")
    );
    expect(clockRung).toContain(".nf-nav .nf-nav-clock");
    // ≤1239: switch bahasa pindah ke footer bawah + drawer.
    expect(editorial).toContain("@media (max-width: 1239.98px)");
    const langRung = editorial.slice(
      editorial.indexOf("@media (max-width: 1239.98px)")
    );
    expect(langRung).toContain(".nf-nav .an-language-switcher");
  });

  it("label nav kembali ke skala metadata (bukan 0,82rem)", () => {
    const block = ruleBlock(editorial, ".an-public-shell.an-editorial .nf-nav nav a {");
    expect(block).toContain("font-size: 0.66rem");
    expect(block).toContain("text-transform: uppercase");
    expect(block).toContain("letter-spacing: 0.12em");
  });
});

describe("teks panjang — email, URL, judul", () => {
  it("tidak lagi memaksa anchor ke overflow-wrap: normal secara global", () => {
    // Aturan lama `a, button, label { overflow-wrap: normal }` membuat email
    // di dalam link tidak bisa patah dan menembus kontainernya.
    expect(indexCss).not.toMatch(/a,\s*\nbutton,\s*\nlabel\s*\{[^}]*overflow-wrap:\s*normal/);
    expect(indexCss).toMatch(/button,\s*\nlabel\s*\{[^}]*overflow-wrap:\s*normal/);
  });

  it("memakai anywhere pada link email di primitif fakta dan sheet EPK", () => {
    const sceneKit = source("client/src/shell/SceneKit.css");
    expect(sceneKit).toContain(".an-facts dd a");
    expect(ruleBlock(sceneKit, ".an-public-shell.an-editorial .an-facts dd a {")).toContain(
      "overflow-wrap: anywhere"
    );
    const pressStage = source("client/src/pages/PressStage.css");
    expect(
      ruleBlock(
        pressStage,
        ".an-public-shell.an-editorial .an-press-sheet-facts dd a {"
      )
    ).toContain("overflow-wrap: anywhere");
  });

  it("memakai <wbr> setelah @ pada email yang dirender sebagai teks", () => {
    const emailText = source("client/src/components/EmailText.tsx");
    expect(emailText).toContain("<wbr />");
    expect(source("client/src/pages/PressKit.tsx")).toContain("<EmailText");
    expect(source("client/src/pages/Inquiry.tsx")).toContain("<EmailText");
  });

  it("mengizinkan judul rilisan patah antar kata di dalam kartu tautan", () => {
    const sceneKit = source("client/src/shell/SceneKit.css");
    expect(
      ruleBlock(sceneKit, ".an-public-shell.an-editorial .an-release-meta strong {")
    ).toContain("overflow-wrap: break-word");
  });
});

describe("ritme vertikal — tidak ada offset masthead ganda", () => {
  it("hero halaman dalam tidak lagi menghitung tinggi masthead di padding atas", () => {
    // Masthead itu sticky (mengalir), jadi offset hanya untuk hero beranda
    // yang ditarik ke bawah bar transparan.
    const cases: [string, string][] = [
      ["client/src/shell/SceneKit.css", ".an-public-shell.an-editorial .an-page-hero {"],
      ["client/src/pages/ArchiveStage.css", ".an-public-shell.an-editorial .an-arc-hero {"],
      ["client/src/pages/ArchiveStage.css", ".an-public-shell.an-editorial .an-ab-hero {"],
      ["client/src/pages/ShowcaseStage.css", ".an-public-shell.an-editorial .an-vis-hero {"],
      ["client/src/pages/ShowcaseStage.css", ".an-public-shell.an-editorial .an-live-hero {"],
      ["client/src/pages/CatalogStage.css", ".an-public-shell.an-editorial .an-cat-hero {"],
      ["client/src/pages/CatalogStage.css", ".an-public-shell.an-editorial .an-rel-hero {"],
      ["client/src/pages/PressStage.css", ".an-public-shell.an-editorial .an-press-hero {"],
      ["client/src/pages/InquiryStage.css", ".an-public-shell.an-editorial .an-inq-hero {"],
    ];
    for (const [file, selector] of cases) {
      const block = ruleBlock(source(file), selector);
      expect(
        block,
        `${selector} di ${file} tidak boleh menghitung --chrome-h di padding atas`
      ).not.toContain("calc(var(--chrome-h");
    }
  });

  it("hero beranda tetap mempertahankan offset-nya (ditarik ke bawah bar)", () => {
    const homeStage = source("client/src/pages/HomeStage.css");
    const block = ruleBlock(homeStage, ".an-site .an-hero-scene {");
    expect(block).toContain("margin-top: calc(var(--chrome-h, 78px) * -1)");
    expect(block).toContain("calc(var(--chrome-h, 78px) + var(--space-lg))");
  });
});
