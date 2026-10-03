import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("AN Archive", () => {
  it("menjadikan linimasa babak sebagai tulang punggung halaman perjalanan", () => {
    const archive = source("client/src/pages/Universe.tsx");
    // Label hiasan "ARSIP AKBAR" sengaja dibuang; isinya yang dijaga.
    expect(archive).toContain("publicEras");
    expect(archive).toContain("publicJourney");
    expect(archive).toContain("EraTimeline");
    // Duplikasi yang Phase 3 pindahkan tidak boleh kembali ke halaman ini:
    // biografi panjang milik /about, photo-stories milik /visuals#portraits,
    // dinding artwork terpisah sudah diserap oleh rilisan tiap babak.
    expect(archive, "biografi panjang adalah milik /about").not.toContain("longBio");
    expect(archive, "photo-stories adalah milik /visuals").not.toContain("PhotoStories");
    expect(archive, "dinding artwork terpisah sudah dihapus").not.toContain("an-arc-wall");
  });

  it("mengarahkan rilisan tiap babak ke dokumennya dan menyisakan dua jalur keluar", () => {
    const archive = source("client/src/pages/Universe.tsx");
    expect(archive).toContain('href: "/music"');
    expect(archive).toContain('href: "/visuals"');
    // Layanan booking/remix adalah milik /epk — /universe tidak boleh jadi
    // pitch profesional kedua (Phase 3 §3).
    expect(archive).not.toContain("type=remix");
    expect(archive).not.toContain("type=booking");

    // Tautan "buka rilisan" di linimasa menuju dokumen /music/:slug.
    const timeline = source("client/src/components/signature/EraTimeline.tsx");
    expect(timeline).toContain("/music/${era.releaseSlug}");
    const eras = source("client/src/content/eras.ts");
    expect(eras).toContain("releaseSlug");
  });

  it("renames the public navigation label while preserving the established universe route", () => {
    const chrome = source("client/src/components/NightFrequencyChrome.tsx");
    const home = source("client/src/pages/Home.tsx");
    // Label kini PERJALANAN di id/ (Phase 3 §2 baris 7); /universe route tetap stabil.
    expect(chrome).toContain('{ href: "/universe", label: "PERJALANAN" }');
    expect(home).toContain('href="/universe"');
  });
});
