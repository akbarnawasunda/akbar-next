/**
 * Kontrak maskot (DESIGN.md §17 "Mascot System").
 *
 * Maskot adalah detail identitas, bukan dekorasi yang diulang di setiap
 * halaman. Tes ini mengunci dua tempat yang disengaja — panggung hero
 * beranda dan halaman 404 — dan memastikan footer bersama (dipakai oleh
 * semua rute publik lain: musik, visual, tentang, privasi, dll.) tidak lagi
 * ikut menampilkannya di setiap kaki halaman.
 */
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";

const mascotSrc = "/assets/akbar-mascot-doodle.webp";

describe("maskot sebagai detail identitas, bukan stiker berulang", () => {
  it("muncul sekali di panggung hero beranda", async () => {
    const home = (await render("/", { documents: async () => [] as never }))
      .html;
    expect(home).toContain("an-hero-mascot");
    expect(home.split(mascotSrc).length - 1).toBe(1);
  });

  it("muncul di halaman 404 (ID dan EN) sebagai satu-satunya sinyal yang masih bergerak", async () => {
    const notFoundId = (
      await render("/rute-tidak-ada", { documents: async () => [] as never })
    ).html;
    const notFoundEn = (
      await render("/en/rute-tidak-ada", {
        documents: async () => [] as never,
      })
    ).html;
    expect(notFoundId).toContain("an-notfound-mascot");
    expect(notFoundEn).toContain("an-notfound-mascot");
  });

  it("tidak lagi ikut tertempel di footer bersama pada rute publik lain", async () => {
    const routes = ["/music", "/visuals", "/about", "/privacy", "/en/about"];
    for (const path of routes) {
      const { html } = await render(path, {
        documents: async () => [] as never,
      });
      expect(html).not.toContain("nf-footer-mascot");
      expect(html).not.toContain(mascotSrc);
    }
  });
});
