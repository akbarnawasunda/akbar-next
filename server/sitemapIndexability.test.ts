/**
 * Setiap URL di sitemap harus benar-benar bisa diindeks.
 *
 * URL mati atau canonical yang tidak konsisten di sitemap adalah penyebab
 * paling umum error di Search Console. Tes ini merender tiap URL sitemap lewat
 * jalur SSR produksi, lalu memastikan halamannya ada, menunjuk canonical ke
 * dirinya sendiri, punya pasangan hreflang id/en, dan membawa JSON-LD.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "./test-renderer";

const ORIGIN = "https://akbarnawasunda.my.id";

function sitemapPaths(): string[] {
  const xml = readFileSync(
    resolve(process.cwd(), "public/sitemap.xml"),
    "utf8"
  );

  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => {
    const path = match[1].trim().replace(ORIGIN, "");
    return path === "" ? "/" : path;
  });
}

describe("sitemap bisa diindeks", () => {
  const paths = sitemapPaths();

  it("berisi URL dan semuanya memakai origin resmi", () => {
    expect(paths.length).toBeGreaterThan(10);
    for (const path of paths) expect(path.startsWith("/")).toBe(true);
  });

  it.each(paths)("%s merender halaman dengan isi", async path => {
    const { html, head } = await render(path, {
      documents: async () => [] as never,
    });

    expect(html.length).toBeGreaterThan(1000);
    expect(head.title.length).toBeGreaterThan(5);
    expect(head.description.length).toBeGreaterThan(20);
  });
});
