import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "./test-renderer";

const assetPath = (name: string) => resolve(process.cwd(), "public/assets", name);
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
    // Kontrak markup sama untuk semua permukaan OptimizedEditorialImage.
    // Pemiliknya /visuals: seksi #portraits (5d) memuat frame studi potret,
    // dan semuanya berada di bawah fold — jadi wajib lazy. Hero /visuals
    // memakai slot eager-nya sendiri (bukan OptimizedEditorialImage).
    const page = await render("/visuals", prefetch);
    const images = page.html.match(/<img[^>]*an-opt-img-element[^>]*>/g) || [];

    expect(images.length, "halaman tanpa gambar editorial").toBeGreaterThan(0);
    for (const img of images) {
      expect(img, "gambar tanpa decoding async").toContain('decoding="async"');
      expect(img, "gambar di bawah fold harus lazy").toContain('loading="lazy"');
    }
    // Varian mobile dikirim lewat <picture>, bukan `sizes` tanpa `srcSet`.
    expect(page.html, "tanpa <picture> untuk varian mobile").toContain("<picture");
  });

  it("redirects removed portrait routes to the in-page /visuals#portraits section", () => {
    const nextConfig = source("next.config.ts");
    expect(nextConfig).toContain(
      'source: "/visuals/portraits", destination: "/visuals#portraits", permanent: true'
    );
    expect(nextConfig).toContain(
      'source: "/en/visuals/portraits", destination: "/en/visuals#portraits", permanent: true'
    );
  });

  it("memakai ukuran intrinsik untuk gambar aset lokal", async () => {
    // Studi potret hanya hidup di /visuals#portraits (5e: blok foto /universe
    // dihapus), jadi kontrak ukuran intrinsik diperiksa di halaman pemiliknya.
    const page = await render("/visuals", prefetch);
    const images = page.html.match(/<img[^>]*an-opt-img-element[^>]*>/g) || [];
    const sized = images.filter(img => /width="\d+"/.test(img) && /height="\d+"/.test(img));
    expect(sized.length, "tidak ada gambar dengan ukuran intrinsik").toBeGreaterThan(0);
    for (const img of sized) {
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  it("menyajikan enam peran font self-hosted tanpa panggilan CDN", () => {
    // Roster inti dikunci oleh pemilik situs: display primer dan sekunder
    // terpisah, satu suara untuk teks/UI, serta tiga peran khusus.
    for (const file of [
      "fonts/fontsource/Recons-Regular.woff2",
      "fonts/fontsource/NEXROID-Regular.woff2",
      "fonts/fontsource/Good Times Rg.woff2",
      "fonts/fontsource/Towards-Regular.woff2",
      "fonts/fontsource/Fluorite.woff2",
      "fonts/fontsource/noto-sans-sundanese-400.woff2",
    ]) {
      expect(existsSync(assetPath(file)), file).toBe(true);
    }

    const indexCss = source("client/src/index.css");
    for (const family of [
      "Recons",
      "NEXROID",
      "Good Times",
      "Towards",
      "Fluorite",
      "Noto Sans Sundanese",
    ]) {
      expect(indexCss).toContain(`font-family: "${family}";`);
    }
    expect(indexCss).toContain('--font-title: "Recons"');
    expect(indexCss).toContain('--font-display: "NEXROID"');
    expect(indexCss).toContain('--font-body: "Good Times"');
    expect(indexCss).toContain('--font-mono: "Good Times"');
    expect(indexCss).toContain('--font-label: "Good Times"');
    expect(indexCss).toContain('--font-signature: "Towards"');
    expect(indexCss).toContain('--font-game: "Fluorite"');

    // Font yang dilarang tidak boleh menjadi wajah sistem atau fallback.
    expect(indexCss).not.toMatch(/--font-[\w-]+:\s*[^;]*(?:Noctavell|Velomino)/i);

    // Tidak ada CDN huruf di pembuka aplikasi maupun sistem token.
    for (const file of ["app/layout.tsx", "app/preloader.css", "client/src/index.css"]) {
      const text = source(file);
      expect(text).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|api\.fontshare\.com|fonts\.cdnfonts\.com/);
    }
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
