import { describe, expect, it } from "vitest";
import { publicJourney, publicPhotoStories } from "../client/src/content/publicContent";
import { customDocumentTypes } from "./customContent";

describe("artist editorial content", () => {
  it("provides a verified journey fallback without requiring a CMS document", () => {
    const journey = publicJourney(null);
    expect(journey.milestones.length).toBeGreaterThan(0);
    expect(journey.title).toBe("PERJALANAN MUSIK.");
    expect(journey.milestones[0]?.year).toBe("2020");
  });

  it("merges partial journey CMS fields over the verified fallback", () => {
    const journey = publicJourney({
      releases: [],
      visuals: [],
      portraitStudies: [],
      events: [],
      journey: { title: "MANAGED JOURNEY.", intro: "Intro yang dikelola Studio.", milestones: [] },
    });
    expect(journey.title).toBe("MANAGED JOURNEY.");
    expect(journey.intro).toBe("Intro yang dikelola Studio.");
    expect(journey.titleEn).toBe("MUSIC JOURNEY.");
    expect(journey.milestones[0]?.year).toBe("2020");
  });

  it("uses managed photo stories when available and keeps bilingual fields", () => {
    const content = {
      releases: [],
      visuals: [],
      portraitStudies: [],
      events: [],
      photoStories: [{
        _id: "story-1",
        title: "Signal Study",
        titleEn: "Signal Study EN",
        imageUrl: "/media/portrait/neon-portrait.jpg",
        copyId: "Catatan Indonesia",
        copyEn: "English note",
        order: 1,
      }],
    };
    const stories = publicPhotoStories(content);
    expect(stories).toHaveLength(1);
    expect(stories[0]).toMatchObject({ title: "Signal Study", titleEn: "Signal Study EN", copyEn: "English note" });
  });

  it("registers journey as a singleton and photo story as a repeatable document type", () => {
    expect(customDocumentTypes).toContain("journey");
    expect(customDocumentTypes).toContain("photoStory");
  });
});
