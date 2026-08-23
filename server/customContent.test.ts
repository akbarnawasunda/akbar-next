import { describe, expect, it } from "vitest";
import type { ArtistContent } from "../drizzle/schema";
import { toArtistContentInput, toCustomArtistDocument } from "./customContent";

const baseRow = (overrides: Partial<ArtistContent> = {}): ArtistContent => ({
  id: 7,
  kind: "release",
  slug: "custom-release-masih-mencintainya",
  title: "Masih Mencintainya — Papinka",
  subtitle: JSON.stringify({ schemaVersion: 1, data: { title: "Masih Mencintainya — Papinka", year: "2025", format: "Remix", platform: "SoundCloud", url: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda", isCurrent: true } }),
  label: "Remix",
  href: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda",
  imageUrl: "",
  sortOrder: 0,
  isPublished: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

describe("custom content codec", () => {
  it("stores singleton profile documents in the existing artistContent table shape", () => {
    const row = toArtistContentInput({ documentType: "profile", slug: "default", payload: { shortBio: "Producer", genres: ["Breakbeat"] }, sortOrder: 0, isPublished: true });
    expect(row.kind).toBe("hero");
    expect(row.slug).toBe("custom-profile");
    expect(JSON.parse(row.subtitle)).toEqual({ schemaVersion: 1, data: { shortBio: "Producer", genres: ["Breakbeat"] } });
  });

  it("round-trips rich release fields and ignores legacy rows", () => {
    const document = toCustomArtistDocument(baseRow());
    expect(document).toMatchObject({ documentType: "release", slug: "masih-mencintainya", isPublished: true });
    expect(document?.payload).toMatchObject({ year: "2025", platform: "SoundCloud", isCurrent: true });
    expect(toCustomArtistDocument(baseRow({ slug: "legacy-release" }))).toBeNull();
  });
});
