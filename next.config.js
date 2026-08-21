/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  async rewrites() {
    return [
      { source: "/favicon.png", destination: "/assets/media/favicon.png" },
      { source: "/logo-an.png", destination: "/assets/media/logo-an.png" },
      { source: "/og-image.png", destination: "/assets/media/og-image.png" },
      { source: "/samples/:path*", destination: "/assets/media/:path*" },
      { source: "/music-games/:path*", destination: "/assets/media/:path*" },
    ];
  },
};
module.exports = nextConfig;
