import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { composeHtml } from "./_core/ssrHtml";
import type { HeadMeta } from "../client/src/ssr/prefetch";

type SsrRenderModule = {
  render: (url: string, prefetch: { documents: () => Promise<unknown> }) => Promise<{
    html: string;
    dehydratedState: unknown;
    head: HeadMeta;
  }>;
};

let renderPromise: Promise<SsrRenderModule> | undefined;

async function loadRender() {
  const bundlePath = path.resolve(process.cwd(), "dist/server-ssr/entry-server.js");
  renderPromise ||= import(pathToFileURL(bundlePath).href) as Promise<SsrRenderModule>;
  return renderPromise;
}

async function withRetry<T>(operation: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  throw lastError;
}

function templatePath() {
  return path.resolve(process.cwd(), "dist/public/index.html");
}

function redirect(res: any, location: string) {
  res.statusCode = 301;
  res.setHeader("Location", location);
  res.end();
}

function canonicalRedirect(url: string): string | undefined {
  const queryIndex = url.indexOf("?");
  const pathname = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : url.slice(queryIndex);
  if (pathname === "/index.html") return `/${query}`;
  if (pathname === "/archive" || pathname.startsWith("/archive/")) {
    return `/universe${pathname.slice("/archive".length)}${query}`;
  }
  if (pathname !== "/" && /\/$/.test(pathname)) {
    return `${pathname.replace(/\/+$/, "") || "/"}${query}`;
  }
  return undefined;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.end("Method Not Allowed");
    return;
  }

  const url = req.url || "/";
  req.originalUrl ||= url;
  const redirectTarget = canonicalRedirect(url);
  if (redirectTarget) {
    redirect(res, redirectTarget);
    return;
  }
  try {
    const ctx = await createContext({ req, res });
    const caller = appRouter.createCaller(ctx);
    const prefetch = {
      documents: () => withRetry(() => caller.content.documents()),
    };
    const { render } = await loadRender();
    const result = await render(url, prefetch);
    const template = fs.readFileSync(templatePath(), "utf8");
    const html = composeHtml(template, result.html, result.head, result.dehydratedState);
    res.statusCode = result.head.notFound ? 404 : 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    if (req.method === "HEAD") res.end();
    else res.end(html);
  } catch (error) {
    console.error("[Vercel SSR] render failed:", error);
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("The site is temporarily unavailable.");
  }
}
