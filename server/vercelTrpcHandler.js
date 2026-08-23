import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

function appendCookie(res, value) {
  const existing = res.getHeader?.("Set-Cookie");
  const cookies = Array.isArray(existing)
    ? existing.map(String)
    : existing
      ? [String(existing)]
      : [];
  res.setHeader?.("Set-Cookie", [...cookies, value]);
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(Number(options.maxAge) / 1000))}`);
  if (options.expires instanceof Date) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.path) parts.push(`Path=${String(options.path)}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) {
    const sameSite = String(options.sameSite);
    parts.push(`SameSite=${sameSite === "none" ? "None" : sameSite === "lax" ? "Lax" : "Strict"}`);
  }
  return parts.join("; ");
}

function installVercelExpressCompatibility(req, res) {
  const rawPath = req.query?.trpcPath;
  const queryPath = Array.isArray(rawPath) ? rawPath[0] : rawPath;
  const requestUrl = new URL(req.url || "/", `https://${req.headers?.host || "localhost"}`);
  const requestPath = queryPath
    ? `/api/trpc/${decodeURIComponent(String(queryPath))}`
    : requestUrl.pathname;

  // Vercel can expose an absolute URL to the function adapter. Express's
  // parseurl dependency falls back to deprecated url.parse() for that shape.
  // Keep the query string needed by tRPC, remove the routing-only rewrite
  // parameter, and hand Express a conventional relative request URL.
  requestUrl.searchParams.delete("trpcPath");
  Object.defineProperty(req, "url", {
    configurable: true,
    value: `${requestPath}${requestUrl.search}`,
  });
  Object.defineProperty(req, "path", { configurable: true, value: requestPath });

  if (typeof res.status !== "function") {
    res.status = code => {
      res.statusCode = code;
      return res;
    };
  }
  if (typeof res.json !== "function") {
    res.json = body => {
      res.setHeader?.("Content-Type", "application/json; charset=utf-8");
      res.end?.(JSON.stringify(body));
      return res;
    };
  }
  if (typeof res.send !== "function") {
    res.send = body => {
      if (typeof body === "string" || Buffer.isBuffer(body)) res.end?.(body);
      else res.json?.(body);
      return res;
    };
  }
  if (typeof res.cookie !== "function") {
    res.cookie = (name, value, options = {}) => {
      appendCookie(res, serializeCookie(name, value, options));
      return res;
    };
  }
  if (typeof res.clearCookie !== "function") {
    res.clearCookie = (name, options = {}) => {
      appendCookie(res, serializeCookie(name, "", { ...options, expires: new Date(0), maxAge: 0 }));
      return res;
    };
  }
}

const trpcHandler = createExpressMiddleware({
  router: appRouter,
  createContext,
});

export default function handler(req, res) {
  installVercelExpressCompatibility(req, res);
  return trpcHandler(req, res);
}
