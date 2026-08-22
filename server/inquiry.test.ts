import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createArtistInquiry: vi.fn(async (item: { name: string; status?: string }) => ({ id: 7, ...item, status: item.status ?? "new" })),
  listArtistInquiries: vi.fn(async () => [{ id: 7, inquiryType: "booking", name: "Promoter", email: "book@example.com", projectTitle: "Night show", message: "Kami ingin mengundang Akbar untuk acara malam.", source: "epk", status: "new" }]),
  updateArtistInquiryStatus: vi.fn(async (id: number, status: string) => ({ id, status })),
}));

vi.mock("./db", () => ({
  createArtistInquiry: mocks.createArtistInquiry,
  listArtistInquiries: mocks.listArtistInquiries,
  updateArtistInquiryStatus: mocks.updateArtistInquiryStatus,
  createStoredAsset: vi.fn(), listStoredAssets: vi.fn(), createFanSignal: vi.fn(), listFanSignals: vi.fn(),
  listPublishedArtistContent: vi.fn(), listAllArtistContent: vi.fn(), upsertArtistContent: vi.fn(),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (role: "admin" | "user" | null): TrpcContext => ({
  user: role ? ({ id: 1, openId: "inquiry-test", role } as TrpcContext["user"]) : null,
  req: {} as TrpcContext["req"], res: {} as TrpcContext["res"],
});

describe("artist inquiry procedures", () => {
  const input = { inquiryType: "booking" as const, name: "Promoter", email: "BOOK@EXAMPLE.COM", projectTitle: "Night show", message: "Kami ingin mengundang Akbar untuk acara malam.", source: "epk" as const };

  it("accepts a public inquiry and normalizes optional fields", async () => {
    await expect(appRouter.createCaller(context(null)).inquiry.submit(input)).resolves.toMatchObject({ id: 7, status: "new" });
    expect(mocks.createArtistInquiry).toHaveBeenCalledWith(expect.objectContaining({ email: "book@example.com", organization: null, location: null, timeline: null, budgetContext: null }));
  });

  it("keeps the inquiry inbox and status changes admin-only", async () => {
    await expect(appRouter.createCaller(context("user")).inquiry.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("admin")).inquiry.list()).resolves.toHaveLength(1);
    await expect(appRouter.createCaller(context("user")).inquiry.updateStatus({ id: 7, status: "reviewed" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("admin")).inquiry.updateStatus({ id: 7, status: "reviewed" })).resolves.toEqual({ id: 7, status: "reviewed" });
  });
});
