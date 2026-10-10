import { describe, expect, it } from "vitest";
import { storageUrlForKey } from "./storage";

describe("storage URL generation", () => {
  it("preserves namespace separators while encoding user-controlled path segments", () => {
    expect(
      storageUrlForKey("users/42/assets/cover #1?.png"),
    ).toBe("/manus-storage/users/42/assets/cover%20%231%3F.png");
  });

  it("keeps ordinary storage keys unchanged", () => {
    expect(storageUrlForKey("generated/1740000000000_cover.png")).toBe(
      "/manus-storage/generated/1740000000000_cover.png",
    );
  });
});
