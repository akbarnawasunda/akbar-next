import path from "node:path";
import type { NextConfig } from "next";

const root = process.cwd();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID ?? process.env.VITE_APP_ID ?? "",
    NEXT_PUBLIC_OAUTH_PORTAL_URL: process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL ?? process.env.VITE_OAUTH_PORTAL_URL ?? "",
    NEXT_PUBLIC_FRONTEND_FORGE_API_KEY: process.env.NEXT_PUBLIC_FRONTEND_FORGE_API_KEY ?? process.env.VITE_FRONTEND_FORGE_API_KEY ?? "",
    NEXT_PUBLIC_FRONTEND_FORGE_API_URL: process.env.NEXT_PUBLIC_FRONTEND_FORGE_API_URL ?? process.env.VITE_FRONTEND_FORGE_API_URL ?? "",
    NEXT_PUBLIC_ANALYTICS_ENDPOINT: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT ?? process.env.VITE_ANALYTICS_ENDPOINT ?? "",
    NEXT_PUBLIC_ANALYTICS_WEBSITE_ID: process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID ?? process.env.VITE_ANALYTICS_WEBSITE_ID ?? "",
  },
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
      { source: "/archive", destination: "/universe", permanent: true },
      { source: "/archive/:path*", destination: "/universe/:path*", permanent: true },
      { source: "/visuals/portraits", destination: "/visuals#portraits", permanent: true },
      { source: "/en/visuals/portraits", destination: "/en/visuals#portraits", permanent: true },
      { source: "/favicon.ico", destination: "/assets/akbar-favicon.jpg", permanent: true },
      { source: "/favicon.png", destination: "/assets/akbar-favicon.jpg", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/brand/rmx-mark",
          destination: "https://akbarfolio-424qdvsv.manus.space/manus-storage/akbar-nawasunda-rmx-mark_d59968bf.jpg",
        },
        {
          source: "/media/portrait/neon-portrait.jpg",
          destination: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/qdnFVUsmqPWcPbsv.jpg",
        },
        {
          source: "/media/portrait/kx07-portrait.jpg",
          destination: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/zMxYKACXxuHdtyVJ.jpg",
        },
        {
          source: "/media/portrait/official-portrait.jpg",
          destination: "https://akbarfolio-424qdvsv.manus.space/manus-storage/akbar-nawasunda-official-portrait_2c39f68f.jpg",
        },
        {
          source: "/media/brand/rmx-mark.jpg",
          destination: "https://akbarfolio-424qdvsv.manus.space/manus-storage/akbar-nawasunda-rmx-mark_d59968bf.jpg",
        },
        {
          source: "/manus-storage/akbar-nawasunda-official-portrait_2c39f68f.jpg",
          destination: "https://akbarfolio-424qdvsv.manus.space/manus-storage/akbar-nawasunda-official-portrait_2c39f68f.jpg",
        },
      ],
    };
  },
};

export default nextConfig;
