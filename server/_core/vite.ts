import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { buildSsrPrefetch } from "./ssrCaller";
import type { HeadMeta } from "../../client/src/ssr/prefetch";
import { buildHeadTags, composeHtml as composeSsrHtml } from "./ssrHtml";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(import.meta.dirname, "../..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/entry-client.tsx"`,
        `src="/src/entry-client.tsx?v=${nanoid()}`,
      );
      template = await vite.transformIndexHtml(url, template);
      template = template.replace(
        "</head>",
        `<link rel="stylesheet" href="/src/index.css?direct" data-ssr-dev-css></head>`,
      );
      const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
      const prefetch = await buildSsrPrefetch(req, res);
      const { html, dehydratedState, head } = await render(url, prefetch);
      res
        .status(head.notFound ? 404 : 200)
        .set("Cache-Control", "no-cache")
        .type("html")
        .end(composeSsrHtml(template, html, head, dehydratedState));
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      console.error("[SSR] dev render failed:", error);
      next(error);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  app.use((req, res, next) => {
    if (req.path === "/index.html") return res.redirect(301, "/");
    if (req.path === "/archive" || req.path.startsWith("/archive/")) {
      const suffix = req.path.slice("/archive".length);
      const query = req.originalUrl.slice(req.path.length);
      return res.redirect(301, `/universe${suffix}${query}`);
    }
    if (req.path !== "/" && /\/$/.test(req.path)) {
      const query = req.originalUrl.slice(req.path.length);
      const target = (req.path.replace(/\/+$/, "") || "/").replace(/^\/\/+/, "/");
      return res.redirect(301, target + query);
    }
    next();
  });

  app.use(express.static(distPath, { index: false, redirect: false }));
  const templatePath = path.resolve(distPath, "index.html");
  const serverEntryPath = path.resolve(import.meta.dirname, "server-ssr", "entry-server.js");

  app.use("*", async (req, res) => {
    try {
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const { render } = await import(serverEntryPath);
      const prefetch = await buildSsrPrefetch(req, res);
      const { html, dehydratedState, head } = await render(req.originalUrl, prefetch);
      res
        .status(head.notFound ? 404 : 200)
        .set("Cache-Control", "no-cache")
        .type("html")
        .end(composeSsrHtml(template, html, head, dehydratedState));
    } catch (error) {
      console.error("[SSR] render failed, serving shell:", error);
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const fallbackHead: HeadMeta = {
        title: "Akbar Nawasunda | Official Website",
        description: "Official website of Akbar Nawasunda — Indonesian music artist, producer, remixer, and DJ from West Bandung.",
        canonicalPath: "/",
      };
      res
        .status(200)
        .set("Cache-Control", "no-cache")
        .type("html")
        .end(template.replace("<!--app-head-->", () => buildHeadTags(fallbackHead)).replace("<!--app-html-->", () => ""));
    }
  });
}
