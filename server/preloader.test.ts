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

describe("splash pembuka", () => {
  it("tertanam inline supaya tidak ada kedipan sebelum bundle jalan", () => {
    expect(indexHtml).toContain('id="akbar-preloader"');
    expect(indexHtml).toContain('id="akbar-preloader-styles"');
    expect(indexHtml).toContain("an-splash-word");
    expect(indexHtml).toContain("Akbar");
    expect(indexHtml).toContain("Nawasunda");
  });

  it("memakai palet brand, bukan neon acak", () => {
    expect(indexHtml).toContain("#0c0d12"); // ink
    expect(indexHtml).toContain("#4f46e5"); // signal
    for (const aiNeon of ["#00ffd5", "#ffd319", "#ff0055"]) {
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
