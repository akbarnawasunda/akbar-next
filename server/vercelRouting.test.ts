import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const nextConfig = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");

describe("Next.js canonical routing", () => {
  it("keeps legacy index and archive URLs on permanent redirects", () => {
    expect(nextConfig).toContain('source: "/index.html", destination: "/", permanent: true');
    expect(nextConfig).toContain('source: "/archive", destination: "/universe", permanent: true');
    expect(nextConfig).toContain('source: "/epk.html", destination: "/epk", permanent: true');
    expect(nextConfig).toContain('source: "/privacy.html", destination: "/privacy", permanent: true');
  });

  it("redirects removed portrait routes to the in-page section in both locales", () => {
    expect(nextConfig).toContain('source: "/visuals/portraits", destination: "/visuals#portraits", permanent: true');
    expect(nextConfig).toContain('source: "/en/visuals/portraits", destination: "/en/visuals#portraits", permanent: true');
  });

  it("serves the app through Next.js on Vercel", () => {
    const vercel = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8"));
    expect(vercel.framework).toBe("nextjs");
    expect(vercel.outputDirectory).toBe(".next");
  });
});
