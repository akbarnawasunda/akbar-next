/**
 * Slug rilisan hanya boleh punya satu sumber.
 *
 * Sesuai docs/notes/testing-policy.md, kontraknya diuji lewat HTML hasil
 * `entry-server.tsx`: setiap judul rilisan di katalog di-slug memakai
 * `shared/slug.ts` yang sama dengan yang dipakai katalog, command palette,
 * prefetch SSR, dan JSON-LD — lalu halamannya harus benar-benar terisi.
 */
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";
import { releases } from "../client/src/content/artistPlatform";
import { slugify } from "../shared/slug";

const renderPage = async (path: string) => {
  const result = await render(path, { documents: async () => [] as never });
  return {
    html: result.html,
    text: result.html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  };
};

describe("rute detail rilisan", () => {
  it("menemukan setiap rilisan katalog lewat slug bersama", async () => {
    expect(releases.length).toBeGreaterThan(0);
    for (const release of releases) {
      const slug = slugify(release.title);
      expect(slug, `slug untuk ${release.title}`).not.toBe("");
      const page = await renderPage(`/music/${slug}`);
      expect(page.text.length, `isi /music/${slug}`).toBeGreaterThan(400);
      // Judulnya harus muncul, bukan halaman "tidak ditemukan".
      const words = release.title
        .split(/[^A-Za-z0-9]+/)
        .filter(word => word.length > 3);
      const needle = words[0] || release.title;
      expect(page.html.toLowerCase(), `judul di /music/${slug}`).toContain(
        needle.toLowerCase()
      );
      expect(page.html, `shell /music/${slug}`).toContain("an-public-shell");
    }
  });

  it("melayani versi Inggris dengan slug yang sama", async () => {
    const slug = slugify(releases[0].title);
    const page = await renderPage(`/en/music/${slug}`);
    expect(page.text.length).toBeGreaterThan(400);
    expect(page.html).toContain("an-public-shell");
  });

  it("tetap mengirim halaman penuh untuk slug yang tidak dikenal", async () => {
    // Bukan cangkang kosong: pengunjung dan crawler tetap dapat halaman utuh.
    const page = await renderPage("/music/slug-yang-tidak-ada");
    expect(page.text.length).toBeGreaterThan(200);
  });
});
