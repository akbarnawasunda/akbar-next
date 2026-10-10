import path from "node:path";
import type { NextConfig } from "next";

const root = process.cwd();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],
  turbopack: {
    resolveAlias: {
      "@": "./client/src",
      "@shared": "./shared",
      "@app": "./app",
      "@assets": "./attached_assets",
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(root, "client/src"),
      "@shared": path.resolve(root, "shared"),
      "@app": path.resolve(root, "app"),
      "@assets": path.resolve(root, "attached_assets"),
    };
    return config;
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/epk.html", destination: "/epk", permanent: true },
      { source: "/privacy.html", destination: "/privacy", permanent: true },
      { source: "/legacy", destination: "/", permanent: true },
      { source: "/legacy/index.html", destination: "/", permanent: true },
      { source: "/legacy/epk.html", destination: "/epk", permanent: true },
      { source: "/legacy/privacy.html", destination: "/privacy", permanent: true },
      { source: "/legacy/404.html", destination: "/404", permanent: true },
      { source: "/api/brand/rmx-mark", destination: "/media/brand/rmx-mark.jpg", permanent: true },
      { source: "/archive", destination: "/universe", permanent: true },
      { source: "/archive/:path*", destination: "/universe/:path*", permanent: true },
      { source: "/visuals/portraits", destination: "/visuals#portraits", permanent: true },
      { source: "/en/visuals/portraits", destination: "/en/visuals#portraits", permanent: true },
      { source: "/favicon.ico", destination: "/assets/akbar-favicon.jpg", permanent: true },
      { source: "/favicon.png", destination: "/assets/akbar-favicon.jpg", permanent: true },
    ];
  },
};

export default nextConfig;
