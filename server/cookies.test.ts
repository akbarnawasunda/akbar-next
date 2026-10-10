import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AppRequest } from "./_core/httpTypes";
import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

const oauthCallback = readFileSync(
  resolve(process.cwd(), "app/api/oauth/callback/route.ts"),
  "utf8",
);

const request = (protocol: string, forwardedProto?: string) =>
  ({
    protocol,
    headers: forwardedProto ? { "x-forwarded-proto": forwardedProto } : {},
  }) as AppRequest;

describe("session cookie transport attributes", () => {
  it("uses SameSite=Lax without Secure on plain HTTP development requests", () => {
    expect(getSessionCookieOptions(request("http"))).toMatchObject({
      sameSite: "lax",
      secure: false,
      httpOnly: true,
      path: "/",
    });
  });

  it("keeps SameSite=None and Secure on direct or forwarded HTTPS", () => {
    expect(getSessionCookieOptions(request("https"))).toMatchObject({
      sameSite: "none",
      secure: true,
    });
    expect(getSessionCookieOptions(request("http", "https"))).toMatchObject({
      sameSite: "none",
      secure: true,
    });
  });

  it("uses the same computed attributes in the App Router OAuth callback", () => {
    expect(oauthCallback).toContain("sameSite: cookieOptions.sameSite");
    expect(oauthCallback).toContain("secure: cookieOptions.secure");
    expect(oauthCallback).toContain("secure: true");
  });
});
