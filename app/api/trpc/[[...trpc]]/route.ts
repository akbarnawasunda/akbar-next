import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { NextRequest } from "next/server";
import { appRouter } from "../../../../server/routers";
import { createContext } from "../../../../server/_core/context";

export const runtime = "nodejs";
export const maxDuration = 30;

function serializeSessionCookie(name: string, value: string, options: Record<string, unknown>) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge / 1000))}`);
  }
  if (options.expires instanceof Date) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (typeof options.path === "string") parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) {
    const sameSite = String(options.sameSite);
    parts.push(`SameSite=${sameSite === "none" ? "None" : sameSite === "lax" ? "Lax" : "Strict"}`);
  }
  return parts.join("; ");
}

async function handler(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries());
  const firstForwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const expressRequest = {
    headers,
    protocol: request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(/:$/, ""),
    ip: firstForwardedIp,
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    method: request.method,
    originalUrl: `${request.nextUrl.pathname}${request.nextUrl.search}`,
    url: `${request.nextUrl.pathname}${request.nextUrl.search}`,
  } as unknown as ExpressRequest;

  const cookies: string[] = [];
  const expressResponse = {
    cookie(name: string, value: string, options: Record<string, unknown> = {}) {
      cookies.push(serializeSessionCookie(name, value, options));
      return this;
    },
    clearCookie(name: string, options: Record<string, unknown> = {}) {
      cookies.push(serializeSessionCookie(name, "", {
        ...options,
        expires: new Date(0),
        maxAge: 0,
      }));
      return this;
    },
  } as unknown as ExpressResponse;

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext({ req: expressRequest, res: expressResponse }),
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
