/**
 * Kontrak splash pembuka dan umpan balik perpindahan halaman.
 *
 * Splash hidup di client/index.html sebagai CSS+markup inline (supaya tidak
 * ada kedipan sebelum bundle jalan), jadi bagian itu diperiksa sebagai file.
 * Sisanya diperiksa lewat perilaku: splash tidak boleh ikut terkirim di HTML
 * hasil SSR halaman, dan garis progres navigasi hanya muncul di client.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const indexHtml = read("client/index.html");
const entryClient = read("client/src/entry-client.tsx");
const nextPreloaderScript = read("public/assets/js/preloader.js");
const nextPreloaderCss = read("app/preloader.css");
const nextLayout = read("app/layout.tsx");
const preloaderComponent = read("app/_components/Preloader.tsx");
const routeView = read("app/_components/RouteView.tsx");
const routeStateBoundary = read("app/_components/RouteStateBoundary.tsx");
const routeTransition = read("client/src/components/RouteTransition.tsx");

describe("splash pembuka", () => {
  it("tertanam inline supaya tidak ada kedipan sebelum bundle jalan", () => {
    expect(indexHtml).toContain('id="akbar-preloader"');
    expect(indexHtml).toContain('id="akbar-preloader-styles"');
    expect(indexHtml).toContain("an-splash-word");
    expect(indexHtml).toContain("Akbar");
    expect(indexHtml).toContain("Nawasunda");
  });

  it("memakai palet brand, bukan neon acak", () => {
    // Palet kanonik Phase 4 (satu sumber dengan :root di index.css).
    expect(indexHtml).toContain("#101211"); // ink
    expect(indexHtml).toContain("#9bb9c1"); // signal
    for (const aiNeon of ["#00ffd5", "#ffd319", "#ff0055", "#00d4ff"]) {
      expect(indexHtml).not.toContain(aiNeon);
    }
  });

  it("tidak memakai persentase atau telemetri karangan", () => {
    expect(indexHtml).not.toContain("an-eq-visualizer");
    expect(indexHtml).not.toContain("an-telemetry-pct");
    expect(indexHtml).not.toMatch(/Math\.random/);
  });

  it("menghormati prefers-reduced-motion", () => {
    expect(indexHtml).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it("punya fungsi dismiss dan jaring pengaman waktu", () => {
    expect(indexHtml).toContain("window.__dismissAkbarPreloader");
    expect(indexHtml).toContain("an-fade-out");
    expect(indexHtml).toContain("setTimeout");
    expect(entryClient).toContain("__dismissAkbarPreloader");
    expect(entryClient).toContain("requestAnimationFrame");
  });

  it("Next melepas splash setelah paint tanpa menunggu hydration", () => {
    expect(nextPreloaderScript).toContain("window.requestAnimationFrame");
    expect(nextPreloaderScript).toContain("var minimumVisible = seen ? 240 : 530;");
    expect(nextPreloaderScript).toContain("var maximumVisible = seen ? 650 : 1300;");
    expect(nextPreloaderScript).toContain("window.setTimeout(drop, maximumVisible + 40)");
    expect(nextPreloaderCss).toContain("an-splash-failsafe");
    expect(nextPreloaderCss).toMatch(/prefers-reduced-motion: reduce/);
    expect(preloaderComponent).toContain("Loading page · Producer · Remixer · West Bandung");
    expect(preloaderComponent).toContain("Memuat halaman · Produser · Remixer · Bandung Barat");
    expect(nextLayout).toContain('<script defer src="/assets/js/preloader.js" />');
  });

  it("menampilkan fallback rute yang bilingual dan tidak menahan navigasi", () => {
    expect(routeView).toContain("loading: () => <PageLoading />");
    expect(routeStateBoundary).toContain("fallback={<PageLoading />}");
    expect(routeTransition).toContain('const MIN_VISIBLE_MS = 160;');
    expect(routeTransition).toContain('const EXIT_MS = 180;');
    expect(routeTransition).toContain('english ? "Loading page" : "Memuat halaman"');
  });
});

describe("perpindahan halaman", () => {
  it("tidak mengirim splash atau garis progres di HTML hasil SSR", async () => {
    const { html } = await render("/music", {
      documents: async () => [] as never,
    });

    expect(html).not.toContain("akbar-preloader");
    expect(html).not.toContain("an-route-progress");
    expect(html).not.toContain("an-page-loading");
  });

  it("merender halaman pertama tanpa animasi masuk (demi LCP)", async () => {
    const { html } = await render("/", { documents: async () => [] as never });

    expect(html).toContain('class="route-motion"');
    expect(html).not.toContain("is-navigation");
  });
});
