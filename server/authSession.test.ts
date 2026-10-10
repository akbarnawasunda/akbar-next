import { afterEach, describe, expect, it, vi } from "vitest";
import { sdk } from "./_core/sdk";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("optional session authentication", () => {
  it("treats an anonymous request as normal without logging a warning", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await expect(sdk.verifySession(undefined)).resolves.toBeNull();
    expect(warning).not.toHaveBeenCalled();
  });
});
