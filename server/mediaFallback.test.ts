import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("official media fallback and online EPK", () => {
  it("keeps an explicit official source action when an embedded provider is slow or blocked", () => {
    const media = source("client/src/components/OfficialMediaFrame.tsx");
    expect(media).toContain("OPEN {provider.toUpperCase()}");
    expect(media).toContain("Player belum merespons di browser ini");
    expect(media).toContain("PLAY HERE");
  });

  it("defers third-party audio and video players behind the stable official media card", () => {
    const music = source("client/src/pages/Music.tsx");
    const visuals = source("client/src/pages/Visuals.tsx");
    expect(music).toContain("OfficialMediaFrame");
    expect(visuals).toContain("OfficialMediaFrame");
    expect(music).not.toContain("<iframe");
    expect(visuals).not.toContain("<iframe");
  });

  it("makes the EPK usable online without claiming nonexistent photo packs or a technical rider", () => {
    const epk = source("client/src/pages/PressKit.tsx");
    const shell = source("client/src/pages/EcosystemPages.css");
    const overrides = source("client/src/pages/VercelAssetOverrides.css");
    const epkStyles = source("client/src/pages/EpkReady.css");
    const live = source("client/src/pages/Live.tsx");
    expect(epk).toContain("SAVE / PRINT EPK");
    expect(epk).toContain("ASET RESMI");
    expect(epk).not.toContain("PHOTO PACK");
    expect(epk).not.toContain("TECH RIDER");
    expect(shell).toContain("/assets/akbar-night-frequency-stage.webp");
    expect(overrides).toContain("/assets/akbar-night-frequency-stage.webp");
    expect(shell).not.toContain("an-night-frequency-stage_113bf174.jpg");
    expect(overrides).not.toContain("an-night-frequency-stage_113bf174.jpg");
    expect(epkStyles).toContain(".nf-page .an-epk-contact-panel");
    expect(epkStyles).toContain("background: #d8ff65 !important");
    expect(epkStyles).toContain("color: #141412 !important");
    expect(live).toContain("BELUM ADA SHOW TERKONFIRMASI.");
  });
});
