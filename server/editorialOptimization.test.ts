import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";

const assetPath = (name: string) => resolve(process.cwd(), "client/public/assets", name);
const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const prefetch = { documents: async () => [] as never };

describe("high-performance image optimization & non-Google typography", () => {
  it("keeps lightweight mobile-optimized editorial assets ready for responsive loading", () => {
    const mobileStage = assetPath("akbar-night-frequency-stage-mobile-optimized.webp");
    const mobileHero = assetPath("akbar-night-frequency-hero-mobile-optimized.webp");
    const optPortrait = assetPath("akbar-official-portrait-optimized.webp");

    expect(existsSync(mobileStage)).toBe(true);
    expect(existsSync(mobileHero)).toBe(true);
    expect(existsSync(optPortrait)).toBe(true);

    expect(statSync(mobileStage).size).toBeLessThan(200_000);
    expect(statSync(mobileHero).size).toBeLessThan(200_000);
    expect(statSync(optPortrait).size).toBeLessThan(150_000);
  });

  // Gambar editorial dirender di HTML, jadi kontraknya diuji dari halaman
  // nyata (lihat docs/notes/testing-policy.md), bukan dari nama variabel.
  it("mengirim markup gambar yang aman layout-shift, responsif, dan hemat data", async () => {
    const page = await render("/visuals/portraits", prefetch);
    const images = page.html.match(/<img[^>]*an-opt-img-element[^>]*>/g) || [];

    expect(images.length, "halaman potret tanpa gambar editorial").toBeGreaterThan(0);
    for (const img of images) {
      expect(img, "gambar tanpa decoding async").toContain('decoding="async"');
      expect(img, "gambar tanpa kebijakan loading").toMatch(/loading="(lazy|eager)"/);
    }
    // Frame pertama adalah above-the-fold: boleh eager, sisanya wajib lazy.
    expect(images[0], "frame pertama harus eager").toContain('loading="eager"');
    for (const img of images.slice(1)) {
      expect(img, "gambar bawah fold harus lazy").toContain('loading="lazy"');
    }
    // Varian mobile dikirim lewat <picture>, bukan `sizes` tanpa `srcSet`.
    expect(page.html, "tanpa <picture> untuk varian mobile").toContain("<picture");
  });

  it("memakai ukuran intrinsik untuk gambar aset lokal", async () => {
    const page = await render("/", prefetch);
    const images = page.html.match(/<img[^>]*an-opt-img-element[^>]*>/g) || [];
    const sized = images.filter(img => /width="\d+"/.test(img) && /height="\d+"/.test(img));
    expect(sized.length, "tidak ada gambar dengan ukuran intrinsik").toBeGreaterThan(0);
    for (const img of sized) {
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  it("serves curated non-Google Fontshare fonts locally with zero external Google font latency", () => {
    const clashFont = assetPath("fonts/fontshare/clash-display-600.woff2");
    const generalFont = assetPath("fonts/fontshare/general-sans-500.woff2");
    const azeretFont = assetPath("fonts/fontshare/azeret-mono-500.woff2");

    expect(existsSync(clashFont)).toBe(true);
    expect(existsSync(generalFont)).toBe(true);
    expect(existsSync(azeretFont)).toBe(true);

    const indexCss = source("client/src/index.css");
    expect(indexCss).toContain('@font-face {\n  font-family: "Clash Display";');
    expect(indexCss).toContain('@font-face {\n  font-family: "General Sans";');
    expect(indexCss).toContain('@font-face {\n  font-family: "Azeret Mono";');
    expect(indexCss).toContain('--font-display: "Clash Display"');
    expect(indexCss).toContain('--font-body:    "General Sans"');
    expect(indexCss).toContain('--font-mono:    "Azeret Mono"');
  });

  it("mencegah teks terpotong tanpa menyembunyikan overflow", () => {
    const homeCss = source("client/src/pages/Home.css");
    const indexCss = source("client/src/index.css");
    const shellCss = source("client/src/shell/PublicShell.css");

    // hero-title-mask must not crop descenders with overflow: hidden
    expect(homeCss).toContain(".hero-title-mask {\n  display: inline-block;\n  overflow: visible;");
    // hero-title-editorial must support word break and fluid clamp
    expect(homeCss).toContain("word-break: break-word;");
    expect(homeCss).toContain("overflow-wrap: break-word;");

    // Containment policy: html/body tidak boleh menyembunyikan overflow,
    // karena itu menutupi elemen yang sebenarnya keluar viewport.
    // Komentar dibuang dulu supaya dokumentasi kebijakan tidak ikut terbaca
    // sebagai aturan CSS.
    const indexRules = indexCss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(indexRules, "index.css kembali menyembunyikan overflow").not.toMatch(
      /overflow-x:\s*(hidden|clip)/
    );
    // Satu-satunya jaring pengaman ada di public shell dan dipakai `clip`
    // supaya tidak membuat scroll container (sticky nav tetap bekerja).
    expect(shellCss).toMatch(/\.an-public-shell \{[\s\S]*?overflow-x: clip;/);
  });
});
