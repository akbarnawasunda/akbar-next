import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listAllGameLeaderboard: vi.fn(async () => [{ id: 4, username: "Akbar", score: 120, createdAt: new Date("2026-08-25T00:00:00Z") }]),
  addGameLeaderboardEntry: vi.fn(async (input: { username: string; score: number }) => ({ added: true as const, ...input })),
  deleteGameLeaderboardEntry: vi.fn(async (id: number) => ({ deleted: true as const, id })),
  clearGameLeaderboard: vi.fn(async () => ({ deleted: 2 })),
}));

vi.mock("./db", () => ({
  addGameLeaderboardEntry: mocks.addGameLeaderboardEntry,
  clearGameLeaderboard: mocks.clearGameLeaderboard,
  deleteGameLeaderboardEntry: mocks.deleteGameLeaderboardEntry,
  listAllGameLeaderboard: mocks.listAllGameLeaderboard,
  listGameLeaderboard: vi.fn(async () => []),
  issueLeaderboardRunToken: vi.fn(() => "token"),
  consumeLeaderboardRunToken: vi.fn(() => true),
  leaderboardSubmissionAllowed: vi.fn(() => true),
  submitGameScore: vi.fn(async () => ({ submitted: true as const, score: 1 })),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (role: "admin" | "user" | null): TrpcContext => ({
  user: role ? ({ id: 1, openId: "leaderboard-admin-test", role } as TrpcContext["user"]) : null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("leaderboard admin procedures", () => {
  it("only allows admins to read and mutate the full board", async () => {
    const userCaller = appRouter.createCaller(context("user"));
    const publicCaller = appRouter.createCaller(context(null));
    const adminCaller = appRouter.createCaller(context("admin"));

    await expect(publicCaller.leaderboard.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(userCaller.leaderboard.adminAdd({ username: "Akbar", score: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(userCaller.leaderboard.adminDelete({ id: 4 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(userCaller.leaderboard.adminClear()).rejects.toMatchObject({ code: "FORBIDDEN" });

    await expect(adminCaller.leaderboard.adminList()).resolves.toHaveLength(1);
    await expect(adminCaller.leaderboard.adminAdd({ username: "Akbar", score: 120 })).resolves.toMatchObject({ added: true, username: "Akbar", score: 120 });
    await expect(adminCaller.leaderboard.adminDelete({ id: 4 })).resolves.toEqual({ deleted: true, id: 4 });
    await expect(adminCaller.leaderboard.adminClear()).resolves.toEqual({ deleted: 2 });
  });

  it("uses the same public username rules for manual entries", async () => {
    const adminCaller = appRouter.createCaller(context("admin"));
    await expect(adminCaller.leaderboard.adminAdd({ username: "a", score: 10 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(adminCaller.leaderboard.adminAdd({ username: "name@example.com", score: 10 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(adminCaller.leaderboard.adminAdd({ username: "Akbar", score: 1_000_000 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
