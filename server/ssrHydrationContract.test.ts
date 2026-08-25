import { describe, expect, it } from "vitest";
import superjson from "superjson";
import { composeHtml } from "./_core/ssrHtml";

const template = `<!doctype html><html lang="id"><head><!--app-head--></head><body><div id="root"><!--app-html--></div></body></html>`;

function extractStateString(html: string) {
  const match = html.match(/window\.\__RQ_STATE__ = ("[\s\S]*?")<\/script>/);
  expect(
    match,
    "SSR state must be assigned as a quoted JSON string"
  ).not.toBeNull();
  return JSON.parse(match![1]!) as string;
}

describe("SSR hydration contract", () => {
  it("serializes dehydrated state in the exact format entry-client parses", () => {
    const dehydratedState = {
      queries: [
        {
          queryKey: ["content", "documents"],
          state: { data: [{ kind: "release", title: "Masih Mencintainya" }] },
        },
      ],
    };

    const html = composeHtml(
      template,
      "<main>SSR body</main>",
      {
        title: "Akbar Nawasunda | Official Website",
        description: "Official website",
        canonicalPath: "/",
      },
      dehydratedState
    );

    const stateString = extractStateString(html);
    const parsed = JSON.parse(stateString);

    expect(html).toContain("<main>SSR body</main>");
    expect(html).not.toContain("window.__RQ_STATE__ = {");
    expect(superjson.deserialize(parsed)).toEqual(dehydratedState);
  });

  it("keeps state assignment before the closing body and head/body placeholders replaced", () => {
    const html = composeHtml(
      template,
      "<main>Safe body</main>",
      {
        title: "Safe title",
        description: "Safe description",
        canonicalPath: "/about",
      },
      { queries: [] }
    );

    expect(html).not.toContain("<!--app-head-->");
    expect(html).not.toContain("<!--app-html-->");
    expect(html.indexOf("window.__RQ_STATE__")).toBeGreaterThan(
      html.indexOf("Safe body")
    );
    expect(html.indexOf("window.__RQ_STATE__")).toBeLessThan(
      html.indexOf("</body>")
    );
  });
});
