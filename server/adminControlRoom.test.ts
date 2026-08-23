import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("AN Control Room", () => {
  it("keeps the owner workflow focused on editorial, inquiry, assets, and delivery tools", () => {
    const admin = projectFile("client/src/pages/Admin.tsx");
    const layout = projectFile("client/src/components/DashboardLayout.tsx");

    expect(admin).toContain("Custom Website Editor");
    expect(admin).toContain('href: "/studio"');
    expect(admin).toContain("Inquiry Inbox");
    expect(admin).toContain("Asset Library");
    expect(admin).toContain("GITHUB → MAIN → VERCEL");
    expect(admin).toContain("NEWSLETTER / BROADCAST IS CURRENTLY PAUSED.");
    expect(layout).toContain('path: "/admin"');
    expect(layout).toContain('path: "/studio/inquiries"');
    expect(layout).toContain('path: "/assets"');
  });
});
