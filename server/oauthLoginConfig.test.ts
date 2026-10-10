import { afterEach, describe, expect, it, vi } from "vitest";
import { isOAuthLoginConfigured, startLogin } from "../client/src/const";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("OAuth login configuration guard", () => {
  it("does not throw or navigate when the portal URL is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_OAUTH_PORTAL_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "test-app");

    expect(isOAuthLoginConfigured()).toBe(false);
    expect(startLogin()).toBe(false);
  });

  it("does not throw or navigate when the public app ID is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_OAUTH_PORTAL_URL", "https://oauth.example.test");
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "");

    expect(isOAuthLoginConfigured()).toBe(false);
    expect(startLogin()).toBe(false);
  });

  it("accepts only HTTP(S) portal origins", () => {
    vi.stubEnv("NEXT_PUBLIC_OAUTH_PORTAL_URL", "javascript:alert(1)");
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "test-app");

    expect(isOAuthLoginConfigured()).toBe(false);
    expect(startLogin()).toBe(false);
  });
});
