import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import * as db from "../../../../server/db";
import { getSessionCookieOptions } from "../../../../server/_core/cookies";
import { sdk } from "../../../../server/_core/sdk";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.json({ error: "code and state are required" }, { status: 400 });
  }

  const { nonce } = decodeOAuthState(state);
  const expectedNonce = parseCookieHeader(request.headers.get("cookie") || "")[OAUTH_STATE_COOKIE];
  if (!nonce || nonce !== expectedNonce) {
    return NextResponse.json({ error: "invalid oauth state" }, { status: 403 });
  }

  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
    if (!userInfo.openId) {
      return NextResponse.json({ error: "openId missing from user info" }, { status: 400 });
    }

    await db.upsertUser({
      openId: userInfo.openId,
      name: userInfo.name || null,
      email: userInfo.email ?? null,
      loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      lastSignedIn: new Date(),
    });
    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name || "",
      expiresInMs: ONE_YEAR_MS,
    });

    const requestLike = {
      protocol: request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(/:$/, ""),
      headers: Object.fromEntries(request.headers.entries()),
    } as Parameters<typeof getSessionCookieOptions>[0];
    const cookieOptions = getSessionCookieOptions(requestLike);
    const response = NextResponse.redirect(new URL("/", request.url), 302);
    response.cookies.set(OAUTH_STATE_COOKIE, "", {
      path: "/",
      // The __Host- cookie was always written Secure; preserve that attribute
      // when expiring it even when the callback is served over local HTTP.
      secure: true,
      sameSite: "none",
      maxAge: 0,
    });
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
      maxAge: Math.floor(ONE_YEAR_MS / 1000),
    });
    return response;
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    return NextResponse.json({ error: "OAuth callback failed" }, { status: 500 });
  }
}
