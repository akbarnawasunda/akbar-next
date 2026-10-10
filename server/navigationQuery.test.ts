import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const studio = read("client/src/pages/ContentStudio.tsx");
const dashboard = read("client/src/components/DashboardLayout.tsx");
const inquiry = read("client/src/pages/Inquiry.tsx");
const providers = read("app/_components/SiteProviders.tsx");

describe("App Router query navigation", () => {
  it("reacts when the Studio command palette changes only ?compose=", () => {
    expect(dashboard).toContain('import { usePathname, useRouter } from "next/navigation"');
    expect(dashboard).toContain('setLocation("/studio?compose=release")');
    expect(studio).toContain("const search = useSearchParams();");
    expect(studio).toContain("const router = useRouter();");
    expect(studio).toContain('search.get("compose")');
    expect(studio).toContain('remainingSearch.delete("compose")');
    expect(studio).toContain("router.replace(nextLocation);");
    expect(studio).toContain("  }, [router, search]);");
  });

  it("updates inquiry type and source when its query parameters change in place", () => {
    expect(inquiry).toContain("const params = useSearchParams();");
    expect(inquiry).toContain('params.get("type")');
    expect(inquiry).toContain('params.get("source")');
    expect(inquiry).toContain("setType(initialType);");
    expect(inquiry).toContain("setSource(initialSource);");
    expect(inquiry).toContain("[initialType, initialSource]");
  });

  it("updates locale without overriding Next hash and scroll restoration", () => {
    expect(providers).toContain("document.documentElement.lang =");
    expect(providers).toContain('pathname.startsWith("/en/") ? "en" : "id"');
    expect(providers).not.toContain("window.scrollTo");
  });
});
