/** Contract tests for the App Router's first-paint splash and route loading UI. */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Preloader } from "../app/_components/Preloader";
import { render } from "./test-renderer";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const preloaderScript = read("public/assets/js/preloader.js");
const preloaderCss = read("app/preloader.css");
const nextLayout = read("app/layout.tsx");
const routeView = read("app/_components/RouteView.tsx");
const routeStateBoundary = read("app/_components/RouteStateBoundary.tsx");
const routeTransition = read("client/src/components/RouteTransition.tsx");

describe("App Router first-paint splash", () => {
  it("renders the brand splash with accessible, locale-specific copy", () => {
    const id = renderToStaticMarkup(createElement(Preloader, { locale: "id" }));
    const en = renderToStaticMarkup(createElement(Preloader, { locale: "en" }));

    expect(id).toContain('id="akbar-preloader"');
    expect(id).toContain('role="status"');
    expect(id).toContain('aria-live="polite"');
    expect(id).toContain("Akbar");
    expect(id).toContain("Nawasunda");
    expect(id).toContain("Memuat halaman · Produser · Remixer · Bandung Barat");
    expect(en).toContain("Loading page · Producer · Remixer · West Bandung");
    expect(id).not.toContain("an-splash-elapsed");
    expect(en).not.toContain("an-splash-elapsed");
  });

  it("owns the splash outside the React tree so pre-hydration DOM churn cannot mismatch", () => {
    // preloader.js memutasi teks jam/kelas/atribut lalu menghapus #akbar-preloader
    // sebelum hidrasi. Itu hanya aman jika React tidak pernah mem-patch isi
    // splash — yaitu saat splash dikirim lewat dangerouslySetInnerHTML di dalam
    // pembungkus statis #akbar-splash-root. Mengembalikannya ke JSX biasa akan
    // memicu React #418 di semua rute.
    const source = read("app/_components/Preloader.tsx");
    const markup = renderToStaticMarkup(createElement(Preloader, { locale: "id" }));

    expect(source).toContain("dangerouslySetInnerHTML");
    expect(markup).toContain('id="akbar-splash-root"');
    expect(markup.indexOf('id="akbar-splash-root"')).toBeLessThan(
      markup.indexOf('id="akbar-preloader"'),
    );
    // Skrip splash hanya boleh menyentuh node di dalam pembungkus, tidak
    // boleh menghapus/mengganti node milik React.
    expect(preloaderScript).not.toContain("akbar-splash-root");
  });

  it("uses the brand palette, reduced-motion support, and a 1.6 second CSS failsafe", () => {
    expect(preloaderCss).toContain("#101211");
    expect(preloaderCss).toContain("#9bb9c1");
    for (const neon of ["#00ffd5", "#ffd319", "#ff0055", "#00d4ff"]) {
      expect(preloaderCss).not.toContain(neon);
    }
    expect(preloaderCss).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(preloaderCss).toMatch(/an-splash-failsafe\s+1ms\s+linear\s+1\.6s\s+forwards/);
    expect(preloaderCss).not.toContain("an-splash-elapsed");
  });

  it("dismisses independently of React hydration at 530/780ms and 240/420ms", () => {
    expect(preloaderScript).toContain("var minimumVisible = seen ? 240 : 530;");
    expect(preloaderScript).toContain("var maximumVisible = seen ? 650 : 1300;");
    expect(preloaderScript).toContain("var exitDuration = seen ? 150 : 220;");
    expect(preloaderScript).toContain("window.requestAnimationFrame");
    expect(preloaderScript).toContain("window.__dismissAkbarPreloader = requestDismiss");
    expect(preloaderScript).toContain("window.setTimeout(drop, maximumVisible + 40)");
    expect(preloaderScript).not.toMatch(/an-splash-elapsed|elapsedEl|toFixed\(1\)/i);
    expect(nextLayout).toContain("<Preloader locale={lang} />");
    expect(nextLayout).toContain('<Script src="/assets/js/preloader.js" strategy="beforeInteractive" />');
  });

  it("keeps Next's route fallback bilingual and avoids app/loading.tsx", () => {
    expect(routeView).toContain("loading: () => <PageLoading />");
    expect(routeStateBoundary).toContain("fallback={<PageLoading />}");
    expect(routeTransition).toContain('const MIN_VISIBLE_MS = 160;');
    expect(routeTransition).toContain('const EXIT_MS = 180;');
    expect(routeTransition).toContain('english ? "Loading page" : "Memuat halaman"');
    expect(existsSync(resolve(process.cwd(), "app/loading.tsx"))).toBe(false);
  });
});

describe("route transition SSR", () => {
  it("does not send the splash or client-only route progress in page content", async () => {
    const { html } = await render("/music", {
      documents: async () => [] as never,
    });

    expect(html).not.toContain("akbar-preloader");
    expect(html).not.toContain("an-route-progress");
    expect(html).not.toContain("an-page-loading");
  });

  it("renders the first route without a navigation animation", async () => {
    const { html } = await render("/", { documents: async () => [] as never });

    expect(html).toContain('class="route-motion"');
    expect(html).not.toContain("is-navigation");
  });
});
