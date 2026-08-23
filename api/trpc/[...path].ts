import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

type VercelResponse = Response & {
  status?: (code: number) => VercelResponse;
  json?: (body: unknown) => VercelResponse;
  send?: (body: unknown) => VercelResponse;
};

function appendCookie(res: Response, value: string) {
  const existing = res.getHeader("Set-Cookie");
  const cookies = Array.isArray(existing)
    ? existing.map(String)
    : existing
      ? [String(existing)]
      : [];
  res.setHeader("Set-Cookie", [...cookies, value]);
}

function serializeCookie(name: string, value: string, options: Record<string, unknown> = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(Number(options.maxAge) / 1000))}`);
  if (options.expires instanceof Date) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.path) parts.push(`Path=${String(options.path)}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${String(options.sameSite) === "none" ? "None" : String(options.sameSite) === "lax" ? "Lax" : "Strict"}`);
  return parts.join("; ");
}

function installVercelExpressCompatibility(req: Request, res: VercelResponse) {
  const requestPath = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`).pathname;
  if (typeof (req as any).path !== "string") {
    Object.defineProperty(req, "path", { configurable: true, value: requestPath });
  }
  if (typeof res.status !== "function") {
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
  }
  if (typeof res.json !== "function") {
    res.json = (body: unknown) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(body));
      return res;
    };
  }
  if (typeof res.send !== "function") {
    res.send = (body: unknown) => {
      if (typeof body === "string" || Buffer.isBuffer(body)) res.end(body);
      else res.json?.(body);
      return res;
    };
  }
  if (typeof (res as any).cookie !== "function") {
    (res as any).cookie = (name: string, value: string, options: Record<string, unknown> = {}) => {
      appendCookie(res, serializeCookie(name, value, options));
      return res;
    };
  }
  if (typeof (res as any).clearCookie !== "function") {
    (res as any).clearCookie = (name: string, options: Record<string, unknown> = {}) => {
      appendCookie(res, serializeCookie(name, "", { ...options, expires: new Date(0), maxAge: 0 }));
      return res;
    };
  }
}

const trpcHandler = createExpressMiddleware({
  router: appRouter,
  createContext,
});

export default function handler(req: Request, res: Response) {
  const compatibleResponse = res as VercelResponse;
  installVercelExpressCompatibility(req, compatibleResponse);
  return trpcHandler(req, compatibleResponse, () => {
    if (!compatibleResponse.headersSent) {
      compatibleResponse.status?.(404).json?.({ error: "Not found" });
    }
  });
}
