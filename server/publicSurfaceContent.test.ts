import { describe, expect, it } from "vitest";
import { formatPublicIndex } from "../client/src/content/artistPlatform";
import { isUpcomingPublicEvent, publicUpcomingEvents } from "../client/src/content/publicContent";
import type { CmsArtistContent, CmsEvent } from "../client/src/content/publicContent";

const contentWithEvents = (events: CmsEvent[]): CmsArtistContent => ({ releases: [], visuals: [], portraitStudies: [], events });

describe("public content safety", () => {
  it("formats public indexes as two digits", () => {
    expect(formatPublicIndex(0)).toBe("01");
    expect(formatPublicIndex(8)).toBe("09");
    expect(formatPublicIndex(9)).toBe("10");
    expect(formatPublicIndex(99)).toBe("100");
  });

  it("filters the confirmed placeholder event from public dates", () => {
    const placeholder: CmsEvent = {
      _id: "custom-placeholder",
      title: "MALAS-MALASAN AJA",
      date: "2027-01-01",
      venue: "Ololololololo Huh Huh",
      city: "Bandoeng Multiverse",
      status: "announced" as const,
    };
    expect(isUpcomingPublicEvent(placeholder)).toBe(false);
    expect(publicUpcomingEvents(contentWithEvents([placeholder]))).toEqual([]);
  });

  it("keeps a real future event eligible for public display", () => {
    const realEvent: CmsEvent = {
      _id: "custom-real-event",
      title: "Bandung Night Session",
      date: "2099-09-19",
      venue: "Verified Venue",
      city: "Bandung",
      country: "Indonesia",
      status: "announced" as const,
    };
    expect(isUpcomingPublicEvent(realEvent)).toBe(true);
    expect(publicUpcomingEvents(contentWithEvents([realEvent]))).toEqual([realEvent]);
  });
});
