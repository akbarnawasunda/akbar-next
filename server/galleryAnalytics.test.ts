import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("portrait gallery analytics", () => {
  it("uses a first-party anonymous visitor marker", () => {
    const gallery = source("client/src/pages/VisualPortraitGallery.tsx");
    expect(gallery).toContain("an_portrait_gallery_visitor");
    expect(gallery).toContain('gallery: "portrait-gallery"');
    expect(gallery).toContain("localStorage");
  });

  it("keeps the public write endpoint narrow and the summary owner-only", () => {
    const routers = source("server/routers.ts");
    const db = source("server/db.ts");
    const schema = source("drizzle/schema.ts");
    expect(routers).toContain('gallery: z.literal("portrait-gallery")');
    expect(routers).toContain("portraitGallery: adminProcedure");
    expect(db).toContain("analyticsVisitorHash");
    expect(db).toContain("visitorHash");
    expect(db).not.toContain("req.ip");
    expect(schema).toContain('galleryAnalytics = mysqlTable("galleryAnalytics"');
    expect(schema).toContain("galleryAnalytics_visitor_day_unique");
  });

  it("explains the aggregate anonymous counter in public privacy copy", () => {
    const idPrivacy = source("client/src/pages/PrivacyPolicy.tsx");
    const enPrivacy = source("client/src/pages/EnglishPages.tsx");
    expect(idPrivacy).toContain("penanda anonim");
    expect(idPrivacy).toContain("tidak menyimpan IP, email, atau user-agent");
    expect(enPrivacy).toContain("anonymous gallery visitor marker");
    expect(enPrivacy).toContain("does not store IP, email, or user-agent");
  });
});
