import { createHash, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { getDb, getUserByOpenId, upsertUser } from "./db";

const DASHBOARD_OPEN_ID = "dashboard-owner";
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

type AttemptState = {
  count: number;
  windowStartedAt: number;
  blockedUntil: number;
};

const attempts = new Map<string, AttemptState>();

function clientKey(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (firstForwarded || req.ip || "unknown").trim();
}

function configuredPassword(): string {
  return process.env.DASHBOARD_PASSWORD?.trim() ?? "";
}

function isConfigured(): boolean {
  const password = configuredPassword();
  return password.length >= 16;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function isMatch(actual: string, expected: string): boolean {
  return timingSafeEqual(digest(actual), digest(expected));
}

function checkAttemptLimit(key: string): void {
  const now = Date.now();
  const state = attempts.get(key);
  if (!state) return;
  if (state.blockedUntil > now) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many login attempts. Try again later." });
  }
  if (now - state.windowStartedAt >= ATTEMPT_WINDOW_MS) attempts.delete(key);
}

function recordFailure(key: string): void {
  const now = Date.now();
  const current = attempts.get(key);
  const state = current && now - current.windowStartedAt < ATTEMPT_WINDOW_MS
    ? current
    : { count: 0, windowStartedAt: now, blockedUntil: 0 };
  state.count += 1;
  if (state.count >= MAX_ATTEMPTS) state.blockedUntil = now + BLOCK_MS;
  attempts.set(key, state);
}

function clearFailures(key: string): void {
  attempts.delete(key);
}

export async function loginWithDashboardPassword(
  req: Request,
  res: Response,
  username: string,
  password: string,
) {
  if (!isConfigured()) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Owner login is not configured yet. Add DASHBOARD_PASSWORD in Vercel Production environment variables.",
    });
  }

  const key = clientKey(req);
  checkAttemptLimit(key);
  const expectedUsername = process.env.DASHBOARD_USERNAME?.trim() || "owner";
  const expectedPassword = configuredPassword();
  if (username.trim() !== expectedUsername || !isMatch(password, expectedPassword)) {
    recordFailure(key);
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid owner credentials." });
  }

  clearFailures(key);
  if (!(await getDb())) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Database is not available for owner session." });
  }

  const ownerName = process.env.DASHBOARD_OWNER_NAME?.trim() || "Akbar Nawasunda";
  const ownerEmail = process.env.DASHBOARD_OWNER_EMAIL?.trim() || null;
  await upsertUser({
    openId: DASHBOARD_OPEN_ID,
    name: ownerName,
    email: ownerEmail,
    loginMethod: "dashboard",
    role: "admin",
    lastSignedIn: new Date(),
  });
  const user = await getUserByOpenId(DASHBOARD_OPEN_ID);
  if (!user) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Owner account could not be created." });
  }

  const token = await sdk.signSession(
    { openId: DASHBOARD_OPEN_ID, appId: "dashboard", name: ownerName },
    { expiresInMs: ONE_YEAR_MS },
  );
  res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
  return { success: true as const, user: { name: ownerName, email: ownerEmail, role: "admin" as const } };
}

export function resetDashboardAuthAttemptsForTests() {
  attempts.clear();
}

export const dashboardAuthOpenId = DASHBOARD_OPEN_ID;
