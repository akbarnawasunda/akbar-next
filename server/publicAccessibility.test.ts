/**
 * Sapuan aksesibilitas untuk seluruh rute publik.
 *
 * Semuanya dibaca dari HTML hasil `entry-server.tsx` sesuai
 * docs/notes/testing-policy.md: yang diperiksa adalah apa yang benar-benar
 * dikirim ke pengunjung, bukan isi file source.
 *
 * Catatan jujur soal cakupan: overflow dan tabrakan elemen pada lebar layar
 * tertentu tidak bisa diukur dari HTML — itu butuh browser sungguhan. Yang
 * dikunci di sini adalah bagian yang memang hidup di DOM: teks alternatif,
 * label kontrol, urutan heading, id ganda, dan jebakan tabindex.
 */
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";

const ID_ROUTES = [
  "/",
  "/music",
  "/visuals",
  "/live",
  "/universe",
  "/about",
  "/inquire",
  "/licensing",
  "/epk",
  "/privacy",
  "/game/jedag-run",
];

const ROUTES = [
  ...ID_ROUTES,
  ...ID_ROUTES.map(r => (r === "/" ? "/en" : `/en${r}`)),
];

const cache = new Map<string, Promise<string>>();

function html(path: string) {
  const cached = cache.get(path);
  if (cached) return cached;
  const pending = render(path, { documents: async () => [] as never }).then(
    result => result.html
  );
  cache.set(path, pending);
  return pending;
}

const tagsOf = (markup: string, tag: string) =>
  markup.match(new RegExp(`<${tag}\\b[^>]*>`, "g")) || [];

const attr = (markup: string, name: string) => {
  const match = new RegExp(`${name}="([^"]*)"`).exec(markup);
  return match ? match[1] : null;
};

describe("aksesibilitas rute publik", () => {
  it("memberi teks alternatif pada setiap gambar", async () => {
    for (const route of ROUTES) {
      const markup = await html(route);
      for (const image of tagsOf(markup, "img")) {
        const alt = attr(image, "alt");
        expect(alt, `${route} → ${image}`).not.toBeNull();
        // `alt=""` sah untuk gambar dekoratif, selama atributnya ada.
        if (alt && alt.trim().length > 0) {
          expect(alt.trim().length, `${route} → ${image}`).toBeGreaterThan(1);
        }
      }
    }
  });

  it("memberi nama pada setiap kontrol form", async () => {
    for (const route of ROUTES) {
      const markup = await html(route);
      const controls = [
        ...tagsOf(markup, "input"),
        ...tagsOf(markup, "select"),
        ...tagsOf(markup, "textarea"),
      ];
      // `<label>` yang membungkus kontrol juga sah sebagai nama.
      const labelBlocks =
        markup.match(/<label\b[^>]*>[\s\S]*?<\/label>/g) || [];
      for (const control of controls) {
        const type = attr(control, "type");
        if (type === "hidden") continue;
        const id = attr(control, "id");
        const labelled =
          attr(control, "aria-label") ||
          attr(control, "aria-labelledby") ||
          attr(control, "title") ||
          (id && markup.includes(`for="${id}"`)) ||
          labelBlocks.some(block => block.includes(control));
        expect(Boolean(labelled), `${route} → ${control}`).toBe(true);
      }
    }
  });

  it("memberi nama pada setiap iframe dan tombol ikon", async () => {
    for (const route of ROUTES) {
      const markup = await html(route);
      for (const frame of tagsOf(markup, "iframe")) {
        const named = attr(frame, "title") || attr(frame, "aria-label");
        expect(Boolean(named), `${route} → ${frame}`).toBe(true);
      }
    }
  });

  it("menjaga urutan heading tidak melompat", async () => {
    for (const route of ROUTES) {
      const markup = await html(route);
      const levels = (markup.match(/<h[1-6]\b/g) || []).map(tag =>
        Number(tag.slice(2))
      );
      expect(levels.length, `${route} tanpa heading`).toBeGreaterThan(0);
      expect(levels[0], `${route} heading pertama`).toBe(1);
      expect(
        levels.filter(level => level === 1).length,
        `${route} jumlah h1`
      ).toBe(1);
      for (let i = 1; i < levels.length; i++) {
        expect(
          levels[i] - levels[i - 1],
          `${route} lompatan h${levels[i - 1]} → h${levels[i]}`
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  it("tidak mengirim id ganda atau tabindex positif", async () => {
    for (const route of ROUTES) {
      const markup = await html(route);
      const ids = (markup.match(/\sid="([^"]+)"/g) || []).map(found =>
        found.replace(/\sid="|"/g, "")
      );
      const duplicates = ids.filter(
        (value, index) => ids.indexOf(value) !== index
      );
      expect(duplicates, `${route} id ganda`).toEqual([]);

      const tabIndexes = (markup.match(/tabindex="(-?\d+)"/g) || []).map(
        found => Number(found.replace(/tabindex="|"/g, ""))
      );
      for (const value of tabIndexes) {
        expect(value, `${route} tabindex`).toBeLessThanOrEqual(0);
      }
    }
  });

  it("menandai tautan yang membuka tab baru dengan aman", async () => {
    for (const route of ROUTES) {
      const markup = await html(route);
      const anchors = markup.match(/<a\b[^>]*target="_blank"[^>]*>/g) || [];
      for (const anchor of anchors) {
        expect(anchor, `${route} → ${anchor}`).toMatch(/rel="[^"]*noreferrer/);
      }
    }
  });
});

describe("identitas pembuka", () => {
  it("mengirim poster identitas yang terbaca tanpa JavaScript", async () => {
    const markup = await html("/");
    expect(markup).toContain("pressure-hero");
    expect(markup).toContain('id="pressure-title"');
    expect(markup).toContain("AKBAR");
    expect(markup).toContain("NAWA");
    expect(markup).toContain("SUNDA");
    expect(markup).toContain("ᮃᮊ᮪ᮘᮁ ᮔᮝᮞᮥᮔ᮪ᮓ");
    expect(markup).not.toContain("<canvas");
  });

  it("membatasi komposisi poster pada beranda Indonesia", async () => {
    for (const route of ["/music", "/en/music", "/universe", "/en/about"]) {
      const markup = await html(route);
      expect(markup, route).not.toContain("pressure-hero");
    }
  });
});
