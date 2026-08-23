import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("public navigation", () => {
  it("does not expose the retired LAB route in the router or public navigation shells", () => {
    const router = projectFile("client/src/App.tsx");
    const homepage = projectFile("client/src/pages/Home.tsx");
    const chrome = projectFile("client/src/components/NightFrequencyChrome.tsx");
    const universe = projectFile("client/src/pages/Universe.tsx");
    const privacy = projectFile("client/src/pages/PrivacyPolicy.tsx");
    const privacyCss = projectFile("client/src/pages/PrivacyPolicy.css");

    expect(router).not.toContain('path={"/lab"}');
    expect(homepage).not.toContain('href="/lab"');
    expect(chrome).not.toContain('href: "/lab"');
    expect(universe).not.toContain('href="/lab"');
    expect(router).toContain('path={"/about"}');
    expect(router).toContain('path={"/music/:slug"}');
    expect(router).toContain('path={"/inquire"}');
    expect(router).toContain('path={"/licensing"}');
    expect(router).toContain('path={"/privacy"} component={PrivacyPolicy}');
    expect(privacy).toContain("No advertising, no tracking cookies, no selling data — ever.");
    expect(privacy).toContain("UU No. 27/2022");
    expect(privacyCss).toContain(".nf-page .an-privacy-reading");
    expect(chrome).toContain('href: "/about"');
  });
});
