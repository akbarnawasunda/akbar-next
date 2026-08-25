import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("public identity consistency", () => {
  it("states producer, remixer, and DJ in fallback public copy", () => {
    const profile = source("client/src/content/artistPlatform.ts");
    const home = source("client/src/pages/Home.tsx");
    const english = source("client/src/pages/EnglishPages.tsx");
    expect(profile).toContain("Produser, remixer, dan DJ asal Bandung Barat.");
    expect(home).toContain("Produser, remixer, dan DJ asal Bandung Barat.");
    expect(english).toContain("Music producer, remixer, and DJ from Bandung Barat.");
  });

  it("normalizes only the known legacy CMS wording on public output", () => {
    const content = source("client/src/content/publicContent.ts");
    expect(content).toContain("normalizePublicRoleCopy");
    expect(content).toContain("normalizePublicRoleCopy(stringValue(payloadOf(profile).shortBio))");
    expect(content).toContain("normalizePublicRoleCopy(stringValue(payloadOf(hero).heroBody)");
  });
});
