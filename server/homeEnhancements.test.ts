/**
 * Kontrak beranda.
 *
 * Yang bisa dilihat pengunjung diperiksa dari HTML hasil render (bukan dari
 * teks source), supaya rename variabel atau pindah komponen tidak memecahkan
 * tes. Hanya hal yang memang tidak muncul di SSR — aturan CSS, media query
 * hook, dan file statis — yang masih diperiksa sebagai teks file.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

let home = "";

beforeAll(async () => {
  home = (await render("/", { documents: async () => [] as never })).html;
});

describe("beranda yang dilihat pengunjung", () => {
  it("merender hero statis berbasis data rilisan, bukan placeholder", () => {
    expect(home).toContain('class="hero-title-editorial"');
    expect(home).toContain('data-no-scramble="true"');
    expect(home).toContain("hero-title-mask");
    expect(home).toContain('fetchPriority="high"');
    expect(home).not.toContain("MANAGED RELEASE");
  });

  it("menandai state loading konten secara aksesibel", () => {
    expect(home).toMatch(/aria-busy="(true|false)"/);
  });

  it("memasang progress scroll tanpa dekorasi berulang", () => {
    expect(home).toContain('class="an-scroll-progress"');
    // Marquee platform dihapus (redesign liquid-signal): kanal resminya
    // sudah tertulis sekali sebagai daftar tipografis di atas; mengulangnya
    // sebagai pita berjalan tanpa akhir hanya menambah gerak tanpa makna
    // (DESIGN.md §7 "endless marquee text" dan §38 motion tanpa nilai).
    expect(home).not.toContain("an-platform-marquee-track");
    // Judul section sudah menjelaskan isinya; indeks dan nomor dekoratif
    // hanya mengulang informasi dan membuat beranda terasa seperti template.
    expect(home).not.toContain('class="an-section-index"');
    expect(home).not.toContain("01 — SINYAL");
    expect(home).not.toContain("02 — Rilisan terbaru");
    expect(home).not.toContain("03 — Kanal resmi");
    expect(home).not.toContain("ed-signal-row__num");
  });

  it("tidak lagi memuat latar panggung berat; panggung milik /live", async () => {
    // Latar panggung dipindah ke /live supaya beranda tidak mengulang
    // halaman lain dan tidak menarik gambar besar untuk dekorasi.
    expect(home).not.toContain("akbar-night-frequency-hero-mobile-optimized");
    expect(home).not.toContain("/assets/akbar-night-frequency-hero.webp");

    const live = (await render("/live", { documents: async () => [] as never }))
      .html;
    expect(live).toContain("/assets/akbar-night-frequency-stage-optimized.webp");
    expect(live).not.toContain("/assets/akbar-night-frequency-stage.webp");
  });

  it("menyertakan logo brand yang punya fallback", () => {
    expect(home).toContain("/assets/akbar-logo.webp");
    expect(source("client/src/content/artistPlatform.ts")).toContain(
      "/assets/akbar-logo-fallback.webp"
    );
  });
});

describe("hal yang tidak terlihat di HTML hasil render", () => {
  it("menghormati preferensi reduced-motion", () => {
    const css = source("client/src/pages/Home.css");
    const globalCss = source("client/src/index.css");
    const reveal = source("client/src/hooks/useScrollReveal.ts");
    const pointer = source("client/src/signature/capability.ts");

    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(globalCss).toMatch(/scroll-behavior:\s*smooth/);
    expect(globalCss).toMatch(/scroll-behavior:\s*auto/);
    expect(reveal).toContain("prefers-reduced-motion: reduce");
    // Efek pointer (kursor signal, tarikan magnetik) hanya untuk perangkat
    // bermouse. Dulu kontrak ini diuji lewat hooks/useMagnetic.ts yang sudah
    // tidak dipakai halaman mana pun; sekarang diuji di tempat yang hidup.
    expect(pointer).toContain("(hover: hover) and (pointer: fine)");
  });

  it("menjaga dokumen HTML dan sitemap tetap layak crawl", () => {
    const index = source("client/index.html");
    const ssr = source("server/_core/ssrHtml.ts");
    const sitemap = source("client/public/sitemap.xml");

    expect(index).toContain('<html lang="id">');
    expect(index).toContain("<!--app-head-->");
    expect(ssr).toContain('rel="canonical"');
    expect(ssr).toContain('property="og:url"');
    expect(sitemap).toContain("https://akbarnawasunda.my.id/music");
  });

  /*
   * Dulu ada tes "mengukur Largest Contentful Paint di browser" yang membaca
   * hooks/usePerformanceMonitor.ts. Hook itu tidak pernah dipanggil halaman
   * mana pun, jadi tesnya hijau untuk kode mati: tidak ada yang benar-benar
   * mengukur LCP. Hook dan tesnya dihapus daripada memberi rasa aman palsu.
   */
});
