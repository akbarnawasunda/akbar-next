/**
 * Kontrak untuk pass "Desktop Visual QA + Cursor System"
 * (docs/desktop-visual-qa-cursor-pass.md).
 *
 * Yang dijaga di sini adalah arsitektur yang tidak terlihat di HTML hasil
 * render: skala z-index, portal lapisan kursor, kebijakan wrap untuk teks
 * panjang, tangga lebar masthead, dan offset ganda masthead. Mengikuti
 * docs/notes/testing-policy.md pasal 3 — tes source hanya untuk yang memang
 * tidak muncul di HTML.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const indexCss = source("client/src/index.css");
const editorial = source("client/src/shell/EditorialRefresh.css");
const cursorTsx = source("client/src/components/signature/CursorSignal.tsx");
const cursorCss = source("client/src/components/signature/CursorSignal.css");
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

describe("skala z-index — cursor di atas seluruh UI publik", () => {
  it("menempatkan --z-cursor di atas setiap lapisan publik, di bawah splash saja", () => {
    const cursor = zToken("--z-cursor");
    const below = [
      "--z-base",
      "--z-field",
      "--z-hint",
      "--z-player",
      "--z-curtain",
      "--z-field-transit",
      "--z-lightbox",
      "--z-rail",
      "--z-nav",
      "--z-carrier",
      "--z-palette",
      "--z-transition",
      "--z-overlay",
    ];
    for (const name of below) {
      expect(
        cursor,
        `--z-cursor (${cursor}) harus di atas ${name} (${zToken(name)})`
      ).toBeGreaterThan(zToken(name));
    }
    // Hanya preloader splash (di luar aplikasi, sementara) yang boleh di atas.
    expect(cursor).toBeLessThan(zToken("--z-splash"));
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

describe("lapisan kursor — arsitektur", () => {
  it("dirender lewat portal ke <body> (root stacking context)", () => {
    // Drawer mobile diportal ke <body> dan berada di luar `isolation:
    // isolate` milik .an-public-shell — tanpa portal, tidak ada z-index di
    // dalam shell yang bisa mengalahkannya.
    expect(cursorTsx).toContain("createPortal");
    expect(cursorTsx).toContain("document.body");
  });

  it("tetap dekoratif: pointer-events none dan z-index dari token", () => {
    const block = ruleBlock(cursorCss, ".an-cursor-signal {");
    expect(block).toContain("pointer-events: none");
    expect(block).toContain("z-index: var(--z-cursor");
  });

  it("menyembunyikan kursor native hanya saat lapisan benar-benar hidup", () => {
    // Atribut dipasang di frame pertama loop (bukan sebelum loop siap), jadi
    // tidak pernah ada momen tanpa kursor sama sekali.
    expect(cursorTsx).toContain('dataset.signatureCursor = "on"');
    expect(cursorCss).toMatch(/html\[data-signature-cursor="on"\][^{]*\{[^}]*cursor:\s*none/);
  });

  it("menyembunyikan lapisan saat pointer tidak aktif, bukan mengejar -9999", () => {
    expect(cursorCss).toContain(".an-cursor-signal.is-idle");
    expect(cursorCss).toMatch(/\.an-cursor-signal\.is-idle\s*\{[^}]*visibility:\s*hidden/);
    expect(cursorTsx).toContain('classList.toggle("is-idle"');
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
