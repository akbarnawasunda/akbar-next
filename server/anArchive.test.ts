import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("AN Archive", () => {
  it("grounds the archive in verified artist history, genres, and release artwork", () => {
    const archive = source("client/src/pages/Universe.tsx");
    expect(archive).toContain("AN ARCHIVE");
    expect(archive).toContain("verifiedArtistProfile.longBio");
    expect(archive).toContain("verifiedArtistProfile.genres.map");
    expect(archive).toContain("releases.slice(0, 4)");
  });

  it("keeps release, remix, and booking routes available from the archive", () => {
    const archive = source("client/src/pages/Universe.tsx");
    expect(archive).toContain('href: "/music"');
    expect(archive).toContain('type=remix&source=archive');
    expect(archive).toContain('type=booking&source=archive');
  });

  it("renames the public navigation label while preserving the established universe route", () => {
    const chrome = source("client/src/components/NightFrequencyChrome.tsx");
    const home = source("client/src/pages/Home.tsx");
    expect(chrome).toContain('{ href: "/universe", label: "ARCHIVE" }');
    expect(home).toContain('href="/universe">ARCHIVE');
  });
});
