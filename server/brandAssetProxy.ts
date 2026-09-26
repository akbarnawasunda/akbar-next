import type { Express, Request, Response } from "express";

const RMX_MARK_SOURCE = "https://akbarfolio-424qdvsv.manus.space/manus-storage/akbar-nawasunda-rmx-mark_d59968bf.jpg";

export function registerBrandAssetProxy(app: Express) {
  app.get("/api/brand/rmx-mark", async (_req: Request, res: Response) => {
    try {
      const response = await fetch(RMX_MARK_SOURCE);
      if (!response.ok) {
        res.status(502).send("RMX mark is unavailable");
        return;
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      res.set("Content-Type", response.headers.get("content-type") || "image/jpeg");
      res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.send(bytes);
    } catch (error) {
      console.error("[BrandAssetProxy] RMX mark failed:", error);
      res.status(502).send("RMX mark is unavailable");
    }
  });
}
