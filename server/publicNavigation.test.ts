import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("public navigation in the App Router", () => {
  it("keeps retired LAB out of routes and public navigation", () => {
    const routes = projectFile("app/_components/RouteView.tsx");
    const homepage = projectFile("client/src/pages/Home.tsx");
    const chrome = projectFile("client/src/components/NightFrequencyChrome.tsx");
    const universe = projectFile("client/src/pages/Universe.tsx");
    const routeSignals = projectFile("client/src/signature/routeSignal.ts");

    expect(routes).not.toContain('"/lab"');
    expect(homepage).not.toContain('href="/lab"');
    expect(chrome).not.toContain('href: "/lab"');
    expect(universe).not.toContain('href="/lab"');
    expect(routes).toContain("privacy: page(");
    expect(routes).toContain("release: page(");
    expect(routeSignals).not.toContain('"/lab"');
  });

  it("serves the privacy and release routes through Next page modules", () => {
    const privacyRoute = projectFile("app/(id)/privacy/page.tsx");
    const releaseRoute = projectFile("app/(id)/music/[slug]/page.tsx");
    const privacy = projectFile("client/src/pages/PrivacyPolicy.tsx");
    const privacyCss = projectFile("client/src/pages/PrivacyPolicy.css");
    const contentQuery = projectFile("client/src/content/publicContent.ts");

    expect(privacyRoute).toContain("pathname='/privacy'");
    expect(privacyRoute).toContain("route='privacy'");
    expect(releaseRoute).toContain("route='release'");
    expect(privacy).toContain("No advertising, no tracking cookies, no selling data — ever.");
    expect(privacy).toContain("UU No. 27/2022");
    expect(privacyCss).toContain(".nf-page .an-privacy-reading");
    expect(contentQuery).toContain("trpc.content.documents.useQuery()");
    expect(contentQuery).toContain("customDocumentsToPublicContent");
    expect(contentQuery).not.toContain("@sanity/client");
    expect(privacy).toContain("usePublicArtistContent");
    expect(privacy).toContain("reviewedRights");
  });
});
