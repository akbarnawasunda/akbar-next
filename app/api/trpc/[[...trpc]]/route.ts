import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";
import type {
  AppRequest,
  CookieResponse,
  SessionCookieOptions,
} from "../../../../server/_core/httpTypes";
import { appRouter } from "../../../../server/routers";
import { createContext } from "../../../../server/_core/context";

export const runtime = "nodejs";
export const maxDuration = 30;

function serializeSessionCookie(
  name: string,
  value: string,
  options: SessionCookieOptions,
) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge / 1000))}`);
  }
  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (typeof options.domain === "string") parts.push(`Domain=${options.domain}`);
  if (typeof options.path === "string") parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) {
    const sameSite = options.sameSite;
    parts.push(
      `SameSite=${sameSite === "none" ? "None" : sameSite === "lax" ? "Lax" : "Strict"}`,
    );
  }
  return parts.join("; ");
}

async function handler(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries());
  const firstForwardedIp = request.headers
    .get("x-forwarded-for")
    ?.split(",", 1)[0]
    ?.trim();
  const appRequest: AppRequest = {
    headers,
    protocol:
      request.headers.get("x-forwarded-proto") ||
      request.nextUrl.protocol.replace(/:$/, ""),
    ip: firstForwardedIp,
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    method: request.method,
    originalUrl: `${request.nextUrl.pathname}${request.nextUrl.search}`,
    url: `${request.nextUrl.pathname}${request.nextUrl.search}`,
  };

  const cookies: string[] = [];
  const cookieResponse: CookieResponse = {
    cookie(name, value, options = {}) {
      cookies.push(serializeSessionCookie(name, value, options));
    },
    clearCookie(name, options = {}) {
      cookies.push(
        serializeSessionCookie(name, "", {
          ...options,
          expires: new Date(0),
          maxAge: 0,
        }),
      );
    },
  };

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () =>
      createContext({ req: appRequest, res: cookieResponse }),
  });

  if (cookies.length === 0) return response;
  const responseHeaders = new Headers(response.headers);
  cookies.forEach(value => responseHeaders.append("set-cookie", value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export { handler as GET, handler as POST };
