import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GET,
  validStorageKey,
} from "../app/manus-storage/[...path]/route";

const requestFor = (segments: string[]) =>
  new NextRequest(`https://site.example/manus-storage/${segments.join("/")}`);
const routeContext = (path: string[]) => ({ params: Promise.resolve({ path }) });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("storage download route namespace boundary", () => {
  it.each([
    ["config", ".env"],
    ["users", "42", "private", "notes.txt"],
    ["users", "42", "assets", "..", "secrets.txt"],
    ["arbitrary", "bucket", "object"],
  ])("rejects out-of-scope storage key %s", async (...segments) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      requestFor(segments),
      routeContext(segments),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retains only application asset and generated-image namespaces", () => {
    expect(validStorageKey(["users", "42", "assets", "cover.jpg"])).toBe(
      "users/42/assets/cover.jpg",
    );
    expect(
      validStorageKey(["users", "42", "assets", "cover #1?.png"]),
    ).toBe("users/42/assets/cover #1?.png");
    expect(
      validStorageKey(["generated", "1740000000000_cover.png"]),
    ).toBe("generated/1740000000000_cover.png");
    expect(validStorageKey(["users", "42", "assets"])).toBeNull();
  });
});
