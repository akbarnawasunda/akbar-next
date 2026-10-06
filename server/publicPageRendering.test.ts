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
    const { text, html } = await renderPage("/");
    for (const label of [
      "MUSIK",
      "VISUAL",
      "PERJALANAN",
      "TENTANG",
      "EPK",
      "KONTAK",
    ]) {
      expect(text).toContain(label);
    }
    // JADWAL hanya mengisi slot 3 nav saat CMS punya jadwal terkonfirmasi
    // (Phase 3 §2 baris 6). Konten uji tidak punya, jadi nav tetap 6 item
    // dan label "ARSIP" lama tidak boleh muncul lagi.
    expect(text).not.toContain("JADWAL");
    // Kata "arsip" boleh muncul sebagai judul konten; yang tidak boleh
    // kembali adalah label navigasi lama.
    expect(html).not.toMatch(/href="\/universe"[^>]*>ARSIP</);
    // Label Inggris lama tidak boleh bocor ke navigasi berbahasa Indonesia.
    expect(text).not.toMatch(/\bVISUALS\b/);
    expect(text).not.toMatch(/\bARCHIVE\b/);
  });

  it("memakai bahasa Inggris di rute /en", async () => {
    const { text } = await renderPage("/en");
    expect(text).toMatch(/\bMUSIC\b/);
    expect(text).toMatch(/\bVISUALS\b/);
    // Label /universe kini JOURNEY (bukan ARCHIVE) dan link-nya /en/universe.
    expect(text).toMatch(/\bJOURNEY\b/);
    expect(text).not.toContain("JADWAL");
    // Copy konten "VISUAL ARCHIVE" sah; yang dilarang hanya LABEL nav ARCHIVE.
    expect(text).not.toMatch(/>ARCHIVE</);
  });

  it("memberi setiap video thumbnail-nya sendiri di /visuals", async () => {
    // Daftar video tinggal di satu tempat: /visuals. Beranda tidak lagi
    // mengulang video yang sama.
    const home = await renderPage("/");
    expect(home.html.match(/i\.ytimg\.com/g) ?? []).toHaveLength(0);

    const { html } = await renderPage("/visuals");
    const thumbnails = [
      ...html.matchAll(/https:\/\/i\.ytimg\.com\/vi\/([\w-]+)\//g),
    ].map(match => match[1]);
    expect(thumbnails.length).toBeGreaterThanOrEqual(3);
    expect(new Set(thumbnails).size).toBe(thumbnails.length);
  });

  it("meminta turunan kecil ke CDN untuk artwork katalog di /music", async () => {
    const { html } = await renderPage("/music");
    const small = html.match(/-t200x200\./g) ?? [];

    expect(small.length).toBeGreaterThanOrEqual(2);
    expect(html).not.toMatch(/\/1200x1200bb\./);
    expect(html).toContain("ab67616d00001e02");
  });

  it("menampilkan seluruh katalog rilisan di /music, bukan lagi di beranda", async () => {
    const { text } = await renderPage("/music");
    for (const release of releases) {
      expect(text, `rilisan "${release.title}" hilang dari /music`).toContain(
        release.title
      );
    }
  });

  it("merender formulir langganan satu kali saja, di beranda", async () => {
    const home = await renderPage("/");
    expect(home.html.match(/data-fan-signal-source="home"/g)).toHaveLength(1);
    expect(home.text).toContain("JANGAN KETINGGALAN.");

    for (const route of ["/music", "/live", "/visuals", "/universe"]) {
      const { html } = await renderPage(route);
      expect(html.match(/data-fan-signal-source=/g), route).toBeNull();
    }
  });

  it("menyediakan jalur SoundCloud resmi tanpa memaksa player pihak ketiga", async () => {
    for (const route of ["/music", "/en/music"]) {
      const { html } = await renderPage(route);
      expect(html).toContain("soundcloud.com/akbarnawasunda");
      expect(html).toContain("pressure-catalog__services-links");
      expect(html).not.toContain("<iframe");
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
