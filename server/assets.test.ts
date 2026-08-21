import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({ key: "users/1/assets/demo.png_key", url: "/manus-storage/users/1/assets/demo.png_key" })),
}));

vi.mock("./db", () => ({
  createStoredAsset: vi.fn(async (asset) => ({ id: 1, ...asset })),
  listStoredAssets: vi.fn(async () => [{ id: 1, ownerId: 1, fileKey: "demo-key", url: "/manus-storage/demo-key", fileName: "demo.png", mimeType: "image/png", size: 2, createdAt: new Date() }]),
}));

function context(user: TrpcContext["user"]): TrpcContext {
  return { user, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("assets procedures", () => {
  it("rejects unauthenticated asset listing", async () => {
    await expect(appRouter.createCaller(context(null)).assets.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects files larger than the storage upload limit", async () => {
    const user = { id: 1, openId: "asset-test", role: "user" } as TrpcContext["user"];
    await expect(appRouter.createCaller(context(user)).assets.upload({ fileName: "too-large.bin", mimeType: "application/octet-stream", size: 10 * 1024 * 1024 + 1, base64: "AA==" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("uploads a valid asset and returns persisted metadata", async () => {
    const user = { id: 1, openId: "asset-test", role: "user" } as TrpcContext["user"];
    const result = await appRouter.createCaller(context(user)).assets.upload({ fileName: "demo.png", mimeType: "image/png", size: 1, base64: "AA==" });
    expect(result).toMatchObject({ id: 1, fileName: "demo.png", mimeType: "image/png", url: "/manus-storage/users/1/assets/demo.png_key" });
  });

  it("lists the authenticated user’s stored assets", async () => {
    const user = { id: 1, openId: "asset-test", role: "user" } as TrpcContext["user"];
    const result = await appRouter.createCaller(context(user)).assets.list();
    expect(result).toHaveLength(1);
    expect(result[0]?.fileName).toBe("demo.png");
  });
});
