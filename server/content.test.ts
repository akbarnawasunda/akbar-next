import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listPublishedArtistContent: vi.fn(async () => [{ id: 1, kind: "release", slug: "night-run", title: "Night Run", subtitle: "", label: "SINGLE", href: "", imageUrl: "", sortOrder: 1, isPublished: true }]),
  listAllArtistContent: vi.fn(async () => []),
  upsertArtistContent: vi.fn(async (item: { slug: string }) => ({ slug: item.slug })),
  listFanSignals: vi.fn(async () => [{ email: "listener@example.com", source: "home", createdAt: new Date() }]),
}));

vi.mock("./db", () => ({
  createStoredAsset: vi.fn(), listStoredAssets: vi.fn(), createFanSignal: vi.fn(),
  listFanSignals: mocks.listFanSignals,
  listPublishedArtistContent: mocks.listPublishedArtistContent,
  listAllArtistContent: mocks.listAllArtistContent,
  upsertArtistContent: mocks.upsertArtistContent,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (role: "admin" | "user" | null): TrpcContext => ({
  user: role ? ({ id: 1, openId: "content-test", role } as TrpcContext["user"]) : null,
  req: {} as TrpcContext["req"], res: {} as TrpcContext["res"],
});

describe("artist content procedures", () => {
  it("exposes published content publicly", async () => {
    const items = await appRouter.createCaller(context(null)).content.list();
    expect(items[0]?.slug).toBe("night-run");
  });

  it("only allows admins to upsert artist content", async () => {
    const input = { kind: "release" as const, slug: "night-run", title: "Night Run" };
    await expect(appRouter.createCaller(context("user")).content.upsert(input)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("admin")).content.upsert(input)).resolves.toEqual({ slug: "night-run" });
  });

  it("only exposes Fan Signal leads to admins", async () => {
    await expect(appRouter.createCaller(context("user")).fanSignal.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("admin")).fanSignal.list()).resolves.toHaveLength(1);
  });
});
