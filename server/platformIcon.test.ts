import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlatformIcon } from "../client/src/components/PlatformIcon";

const renderIcon = (label: string) =>
  renderToStaticMarkup(createElement(PlatformIcon, { label }));

describe("platform icons in App Router bundles", () => {
  it.each(["X", "Twitter", "X / Twitter", "Twitter / X", "X (Twitter)"])(
    "normalizes %s to the official X icon",
    label => {
      const markup = renderIcon(label);
      expect(markup).toContain("an-platform-x");
      expect(markup).toMatch(/<svg[^>]*viewBox="0 0 24 24"/);
      expect(markup).toContain("<path d=");
    },
  );

  it("uses trusted icon path data without Vite raw imports or injected markup", () => {
    const markup = renderIcon("Spotify");
    expect(markup).toContain("an-platform-spotify");
    expect(markup).toContain("<path d=");
    expect(markup).not.toContain("dangerouslySetInnerHTML");
    expect(markup).not.toContain("?raw");
  });
});
