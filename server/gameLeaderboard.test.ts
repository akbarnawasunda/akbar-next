import { describe, expect, it } from "vitest";
import { consumeLeaderboardRunToken, issueLeaderboardRunToken } from "./db";
import {
  normalizeLeaderboardScore,
  normalizeLeaderboardUsername,
} from "../shared/gameLeaderboard";

describe("game leaderboard contract", () => {
  it("normalizes readable public handles and rejects personal-looking inputs", () => {
    expect(normalizeLeaderboardUsername("  AN   Signal  ").value).toBe("AN Signal");
    expect(normalizeLeaderboardUsername("a").value).toBe("");
    expect(normalizeLeaderboardUsername("player@example.com").value).toBe("");
    expect(normalizeLeaderboardUsername("https://example.com").value).toBe("");
    expect(normalizeLeaderboardUsername("night_runner").value).toBe("night_runner");
  });

  it("keeps scores bounded and integer-only", () => {
    expect(normalizeLeaderboardScore(0)).toBe(0);
    expect(normalizeLeaderboardScore(999_999)).toBe(999_999);
    expect(normalizeLeaderboardScore(-1)).toBeNull();
    expect(normalizeLeaderboardScore(1.5)).toBeNull();
    expect(normalizeLeaderboardScore(1_000_000)).toBeNull();
  });

  it("accepts a signed run token once for the matching username", () => {
    const token = issueLeaderboardRunToken("AN Signal");
    expect(consumeLeaderboardRunToken(token, "AN Signal")).toBe(true);
    expect(consumeLeaderboardRunToken(token, "AN Signal")).toBe(false);
    const otherToken = issueLeaderboardRunToken("AN Signal");
    expect(consumeLeaderboardRunToken(otherToken, "Other Signal")).toBe(false);
  });
});
