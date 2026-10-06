/**
 * Kontrak kanal resmi di beranda.
 *
 * Di redesign, deretan kartu identik diganti daftar kanal tipografis
 * (`.an-channel`). Yang dijaga tetap sama: setiap tautan platform resmi
 * tampil, punya nama platform yang terbaca, dan punya aria-label yang jelas.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";
import { publicPlatformLinks } from "../client/src/content/publicContent";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("kanal resmi di beranda", () => {
  it("merender setiap tautan platform resmi dengan aria-label yang jelas", async () => {
    const home = (await render("/", { documents: async () => [] as never }))
      .html;
    for (const platform of publicPlatformLinks(undefined)) {
      expect(home, `kanal ${platform.label} hilang`).toContain(
        `aria-label="Buka Akbar Nawasunda di ${platform.label}"`
      );
      expect(home, `nama kanal ${platform.label} tidak terbaca`).toContain(
        `>${platform.label}<`
      );
      expect(home).toContain(platform.href.replace(/&/g, "&amp;"));
    }
    expect(home).toContain("an-channel");
  });

  it("tetap memakai kelas brand per platform untuk warna identitas", async () => {
    const home = (await render("/", { documents: async () => [] as never }))
      .html;
    expect(home).toMatch(/an-channel platform-[a-z0-9-]+/);
  });

  it("menjaga eksposur potret resmi beserta fallback-nya", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain("src={heroImage}");
    expect(home).toContain(
      "event.currentTarget.src = officialBrand.portraitFallback"
    );
    expect(source("client/src/content/artistPlatform.ts")).toContain(
      'portraitFallback: "/assets/akbar-nawasunda-official-portrait.jpg"'
    );
  });
});
