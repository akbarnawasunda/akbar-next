import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createFanSignal: vi.fn(async (signal: { email: string; source: "home" | "footer" }) => signal),
}));

vi.mock("./db", () => ({
  createStoredAsset: vi.fn(),
  listStoredAssets: vi.fn(),
  createFanSignal: mocks.createFanSignal,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;

describe("fanSignal.subscribe", () => {
  it("normalizes and stores a public signup without requiring authentication", async () => {
    const result = await appRouter.createCaller(context).fanSignal.subscribe({
      email: "  LISTENER@EXAMPLE.COM ",
      source: "home",
    });

    expect(mocks.createFanSignal).toHaveBeenCalledWith({ email: "listener@example.com", source: "home" });
    expect(result).toEqual({ email: "listener@example.com", source: "home" });
  });

  it("rejects malformed email addresses", async () => {
    await expect(appRouter.createCaller(context).fanSignal.subscribe({ email: "not-an-email" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
