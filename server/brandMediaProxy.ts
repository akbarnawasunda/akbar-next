import type { Express, Request, Response } from "express";
import { publicMediaSource } from "./publicMediaPolicy";

const BRAND_MEDIA_PATHS = [
  "/media/portrait/neon-portrait.jpg",
  "/media/portrait/kx07-portrait.jpg",
  "/media/portrait/official-portrait.jpg",
  "/media/brand/rmx-mark.jpg",
] as const;

export function registerBrandMediaProxy(app: Express) {
  for (const pathname of BRAND_MEDIA_PATHS) {
    const source = publicMediaSource(pathname);
    if (!source) continue;
    app.get(pathname, async (_req: Request, res: Response) => {
      try {
        const response = await fetch(source);
        if (!response.ok) {
          res.status(502).send("Brand media is unavailable");
          return;
        }
        const bytes = Buffer.from(await response.arrayBuffer());
        res.set("Content-Type", response.headers.get("content-type") || "image/jpeg");
        res.set("Content-Disposition", "inline");
        res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
        res.set("X-Content-Type-Options", "nosniff");
        res.send(bytes);
      } catch (error) {
        console.error(`[BrandMediaProxy] ${pathname} failed:`, error);
        res.status(502).send("Brand media is unavailable");
      }
    });
  }
}
