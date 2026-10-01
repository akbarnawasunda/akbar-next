/**
 * Tes perilaku, bukan tes isi file.
 *
 * Suite ini merender halaman publik lewat jalur SSR yang sama dengan produksi,
 * lalu memeriksa HTML yang benar-benar diterima pengunjung. Bedanya dengan tes
 * yang membaca source sebagai teks: refactor nama variabel/komponen tidak
 * memecahkan tes ini, tetapi perubahan yang benar-benar merusak halaman akan
 * ketahuan.
 */
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";
import { releases } from "../client/src/content/artistPlatform";

const PUBLIC_ROUTES = [
  "/",
  "/music",
  "/visuals",
  "/live",
  "/universe",
  "/about",
  "/epk",
  "/inquire",
  "/licensing",
  "/privacy",
];

type Rendered = { html: string; text: string; title: string };

const cache = new Map<string, Promise<Rendered>>();

function renderPage(path: string): Promise<Rendered> {
  const cached = cache.get(path);
  if (cached) return cached;

  const pending = render(path, { documents: async () => [] as never }).then(
    result => ({
      html: result.html,
      text: result.html
        .replace(/<script[\s\S]*?<\/script>/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
      title: result.head.title,
    })
  );

  cache.set(path, pending);
  return pending;
}

describe("halaman publik yang dirender server", () => {
  it("merender konten nyata di setiap rute publik, bukan cangkang kosong", async () => {
    for (const route of PUBLIC_ROUTES) {
      const page = await renderPage(route);
      expect(page.title, `judul untuk ${route}`).toMatch(/Akbar Nawasunda/i);
      expect(page.text.length, `panjang konten ${route}`).toBeGreaterThan(600);
      expect(page.html, `footer untuk ${route}`).toContain("AKBAR NAWASUNDA");
    }
  });

  it("tidak menampilkan spesifikasi karangan di beranda", async () => {
    const { text } = await renderPage("/");
    for (const fiction of [
      "130 BPM",
      "24-BIT MASTER",
      "CAT: AN-001",
      "TRANSMISSION ACTIVE",
      "STAGE ACTIVE",
      "PLAYABLE SIGNAL",
      "ENTER THE FREQUENCY",
    ]) {
      expect(text, `teks karangan "${fiction}" masih tampil`).not.toContain(
        fiction
      );
    }
  });

  it("memakai navigasi berbahasa Indonesia di rute Indonesia", async () => {
    const { text } = await renderPage("/");
    for (const label of [
      "MUSIK",
      "VISUAL",
      "JADWAL",
      "ARSIP",
      "TENTANG",
      "KONTAK",
    ]) {
      expect(text).toContain(label);
    }
    // Label Inggris lama tidak boleh bocor ke navigasi berbahasa Indonesia.
    expect(text).not.toMatch(/\bVISUALS\b/);
    expect(text).not.toMatch(/\bARCHIVE\b/);
  });

  it("memakai bahasa Inggris di rute /en", async () => {
    const { text } = await renderPage("/en");
    expect(text).toMatch(/\bMUSIC\b/);
    expect(text).toMatch(/\bVISUALS\b/);
    expect(text).not.toContain("JADWAL");
  });

  it("memberi setiap video thumbnail-nya sendiri", async () => {
    const { html } = await renderPage("/");
    const thumbnails = [
      ...html.matchAll(/https:\/\/i\.ytimg\.com\/vi\/([\w-]+)\//g),
    ].map(match => match[1]);
    expect(thumbnails.length).toBeGreaterThanOrEqual(3);
    expect(new Set(thumbnails).size).toBe(thumbnails.length);
  });

  it("meminta turunan kecil ke CDN untuk artwork katalog", async () => {
    const { html } = await renderPage("/");
    const small = html.match(/-t200x200\./g) ?? [];
    const full = html.match(/-t500x500\./g) ?? [];

    expect(small.length).toBeGreaterThanOrEqual(2);
    // Hanya cover rilisan unggulan yang boleh memakai master ukuran penuh.
    expect(full.length).toBeLessThanOrEqual(1);
    expect(html).not.toMatch(/\/1200x1200bb\./);
    expect(html).toContain("ab67616d00001e02");
  });

  it("menampilkan seluruh katalog rilisan di beranda", async () => {
    const { text } = await renderPage("/");
    for (const release of releases) {
      expect(text, `rilisan "${release.title}" hilang dari beranda`).toContain(
        release.title
      );
    }
  });

  it("merender satu sumber Fan Signal yang sesuai di lima halaman publik", async () => {
    const pageSources = [
      ["/", "home", "JANGAN KETINGGALAN."] as const,
      ["/music", "music", "DENGARKAN BERIKUTNYA."] as const,
      ["/live", "footer", "IKUTI KABARNYA."] as const,
      ["/visuals", "visuals", "LIHAT YANG BERIKUTNYA."] as const,
      ["/universe", "universe", "TETAP DI FREKUENSI."] as const,
    ];

    for (const [route, source, heading] of pageSources) {
      const { html, text } = await renderPage(route);
      expect(html.match(new RegExp(`data-fan-signal-source="${source}"`, "g")))
        .toHaveLength(1);
      expect(html).toContain(`id="fan-email-${source}"`);
      expect(text).toContain(heading);
    }
  });

  it("memakai satu konfigurasi SoundCloud audio yang tidak visual", async () => {
    for (const route of ["/music", "/en/music"]) {
      const { html } = await renderPage(route);
      expect(html).toMatch(
        /data-embed-url="https:\/\/w\.soundcloud\.com\/player\/[^\"]*visual=false/
      );
      expect(html).not.toContain("%230a1737");
      expect(html).not.toContain("visual=true");
    }
  });

  it("tidak merender penanda section sama sekali", async () => {
    // Dulu tesnya hanya melarang penanda kosong. Penandanya sendiri kini
    // sudah dibuang dari seluruh halaman publik.
    for (const route of ["/", "/en", "/visuals", "/universe"]) {
      const { html } = await renderPage(route);
      expect(html, route).not.toContain('class="an-section-index"');
    }
  });
});
