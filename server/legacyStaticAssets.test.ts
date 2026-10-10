import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const nextConfig = read("next.config.ts");
const packageJson = JSON.parse(read("package.json")) as {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

describe("completed Next.js migration", () => {
  it("permanently redirects the known legacy documents to their App Router pages", () => {
    for (const redirect of [
      'source: "/legacy", destination: "/", permanent: true',
      'source: "/legacy/index.html", destination: "/", permanent: true',
      'source: "/legacy/epk.html", destination: "/epk", permanent: true',
      'source: "/legacy/privacy.html", destination: "/privacy", permanent: true',
      'source: "/legacy/404.html", destination: "/404", permanent: true',
      'source: "/api/brand/rmx-mark", destination: "/media/brand/rmx-mark.jpg", permanent: true',
    ]) {
      expect(nextConfig).toContain(redirect);
    }
  });

  it("does not ship a second HTML site or Vite/Express application runtime", () => {
    for (const obsoletePath of [
      "client/index.html",
      "client/src/App.tsx",
      "client/src/entry-client.tsx",
      "client/src/entry-server.tsx",
      "client/src/main.tsx",
      "client/src/vite-env.d.ts",
      "client/src/lib/navigation.tsx",
      "client/src/lib/navigation.vite.tsx",
      "client/public",
      "legacy-next/app/page.tsx",
      "legacy-vite/api/trpc.js",
      "vite.config.ts",
      "vite.config.ssr.ts",
      "tsconfig.node.json",
      "template.json",
      "patches/wouter@3.7.1.patch",
      "server/_core/index.ts",
      "server/_core/vite.ts",
      "server/_core/oauth.ts",
      "server/_core/ssrHtml.ts",
      "server/index.ts",
      "server/vercelSsrHandler.ts",
      "server/vercelTrpcHandler.js",
      "public/legacy/index.html",
      "public/legacy/style.css",
      "public/assets/js/app.js",
    ]) {
      expect(existsSync(resolve(process.cwd(), obsoletePath)), obsoletePath).toBe(false);
    }

    expect(packageJson.scripts).not.toHaveProperty("dev:legacy");
    expect(packageJson.scripts).not.toHaveProperty("build:legacy");
    expect(packageJson.scripts).not.toHaveProperty("start:legacy");
    expect(packageJson.dependencies).not.toHaveProperty("wouter");
    expect(packageJson.dependencies).not.toHaveProperty("express");
    // Vitest itself uses Vite as a dev-only transform engine; no Vite app,
    // app plugin, or Vite build configuration remains.
    expect(packageJson.devDependencies).toHaveProperty("vite");
    expect(packageJson.devDependencies).not.toHaveProperty("@vitejs/plugin-react");
    expect(packageJson.devDependencies).not.toHaveProperty("@tailwindcss/vite");
  });

  it("keeps the only directly served splash script in the Next public directory", () => {
    expect(existsSync(resolve(process.cwd(), "public/assets/js/preloader.js"))).toBe(true);
    expect(read("app/layout.tsx")).toContain('<Script src="/assets/js/preloader.js" strategy="beforeInteractive" />');
  });
});
