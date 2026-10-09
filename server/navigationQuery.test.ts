import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const studio = read("client/src/pages/ContentStudio.tsx");
const dashboard = read("client/src/components/DashboardLayout.tsx");
const inquiry = read("client/src/pages/Inquiry.tsx");
const providers = read("app/_components/SiteProviders.tsx");

describe("query-only client navigation", () => {
  it("reacts when the Studio command palette changes only ?compose=", () => {
    expect(dashboard).toContain('setLocation("/studio?compose=release")');
    expect(studio).toContain("const search = useSearch();");
    expect(studio).toContain("const [, navigate] = useLocation();");
    expect(studio).toContain('new URLSearchParams(search).get("compose")');
    expect(studio).toContain('remainingSearch.delete("compose")');
    expect(studio).toContain("navigate(nextLocation, { replace: true });");
    expect(studio).toContain("  }, [navigate, search]);");
  });

  it("updates inquiry type and source when its query parameters change in place", () => {
    expect(inquiry).toContain("const search = useSearch();");
    expect(inquiry).toContain("setType(initialType);");
    expect(inquiry).toContain("setSource(initialSource);");
    expect(inquiry).toContain("[initialType, initialSource]");
  });

  it("updates document language on client-side navigation between locales", () => {
    expect(providers).toContain("document.documentElement.lang =");
    expect(providers).toContain('pathname.startsWith("/en/") ? "en" : "id"');
  });
});
