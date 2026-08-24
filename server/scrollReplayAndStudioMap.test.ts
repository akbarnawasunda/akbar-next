import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("scroll replay and studio site map contracts", () => {
  it("keeps internal route sections observed for both enter and exit transitions", () => {
    const motion = source("client/src/components/MotionOrchestrator.tsx");
    const replayCss = source("client/src/components/ScrollReplay.css");

    expect(motion).toContain('threshold: [0, 0.12]');
    expect(motion).toContain('section.classList.toggle("is-motion-in-view", isVisible)');
    expect(motion).toContain('section.dataset.motionDirection = direction');
    expect(motion).toContain('section.dataset.motionPhase = isVisible ? "acquiring" : "released"');
    expect(motion).not.toContain("observer?.unobserve(entry.target)");
    expect(replayCss).toContain('data-motion-direction="up"');
    expect(replayCss).toContain("prefers-reduced-motion: reduce");
  });

  it("replays homepage sections and keeps English homepage wired to the same hook", () => {
    const hook = source("client/src/hooks/useScrollReveal.ts");
    const english = source("client/src/pages/EnglishPages.tsx");
    const app = source("client/src/App.tsx");
    const replayCss = source("client/src/components/ScrollReplay.css");

    expect(hook).toContain('element.dataset.revealReplay = "true"');
    expect(hook).toContain('element.classList.toggle("is-revealed", entry.isIntersecting)');
    expect(hook).toContain('element.dataset.revealPhase = entry.isIntersecting ? "acquiring" : "released"');
    expect(hook).toContain('threshold: [0, threshold]');
    expect(english).toContain('import { useScrollReveal } from "@/hooks/useScrollReveal";');
    expect(english).toContain("ref={platformSectionRef}");
    expect(english).toContain("ref={signalSectionRef}");
    expect(app).toContain('import "./components/ScrollReplay.css";');
    expect(app).toContain('import "./components/SignalTuningMotion.css";');
    expect(replayCss).toContain(".nf-page .nf-page-hero .nf-hero-note");
    expect(replayCss).toContain("justify-self: stretch !important");
    expect(replayCss).toContain(".nf-page .nf-epk-hero .nf-hero-note");
    expect(replayCss).not.toContain(".nf-page .nf-page-hero h1,");
    const tuningCss = source("client/src/components/SignalTuningMotion.css");
    expect(tuningCss).toContain("signal-tuning-heading-lock");
    expect(tuningCss).toContain("signal-tuning-carrier");
    expect(tuningCss).toContain("signal-tuning-tune-card");
    expect(tuningCss).toContain("signal-tuning-tune-card-up");
    expect(tuningCss).toContain("signal-tuning-panel-lock-up");
    expect(tuningCss).toContain("signal-route-handoff");
    expect(tuningCss).toContain("prefers-reduced-motion: reduce");
    expect(tuningCss).toContain("opacity: 1;");
    expect(tuningCss).toContain("overflow-x: clip");
  });

  it("maps the public pages and their editable sources in Control Room", () => {
    const map = source("client/src/pages/StudioSiteMap.tsx");
    const studio = source("client/src/pages/ContentStudio.tsx");

    for (const route of ["/", "/music", "/visuals", "/live", "/universe", "/about", "/epk", "/inquire", "/licensing", "/privacy"]) {
      expect(map).toContain(`route: "${route}"`);
    }
    for (const label of ["Foto & hero utama", "Platform resmi", "Diskografi", "Visual archive", "Jadwal pertunjukan", "Official assets", "Fan Signal"]) {
      expect(map).toContain(label);
    }
    expect(map).toContain("VERIFIED FALLBACK");
    expect(studio).toContain("<StudioSiteMap");
    expect(studio).toContain('id="studio-compose"');
    expect(studio).toContain('id="studio-document-library"');
  });
});
