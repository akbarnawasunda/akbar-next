import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const vercelConfig = readFileSync(
  resolve(process.cwd(), "vercel.json"),
  "utf8"
);

describe("Vercel canonical routing", () => {
  it("routes index.html through SSR before the filesystem handler", () => {
    const indexRoute = vercelConfig.indexOf('"source": "/index.html"');
    const ssrDestination = vercelConfig.indexOf(
      '"destination": "/api/ssr.js"',
      indexRoute
    );
    const filesystemHandler = vercelConfig.indexOf('"handle": "filesystem"');

    expect(indexRoute).toBeGreaterThan(-1);
    expect(ssrDestination).toBeGreaterThan(indexRoute);
    expect(filesystemHandler).toBeGreaterThan(ssrDestination);
  });

  it("keeps the legacy index redirect target canonical", () => {
    expect(vercelConfig).toContain('"source": "/index.html"');
    expect(vercelConfig).toContain('"destination": "/"');
    expect(vercelConfig).toContain('"source": "/archive"');
    expect(vercelConfig).toContain('"destination": "/universe"');
  });
});
