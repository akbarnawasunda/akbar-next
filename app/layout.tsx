import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteProviders } from "./_components/SiteProviders";
import { Preloader } from "./_components/Preloader";
import "@/index.css";
import "@/CinematicReference.css";
import "./preloader.css";

const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.CANONICAL_ORIGIN || "https://akbarnawasunda.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: "Akbar Nawasunda | Official Website",
  description: "Website resmi Akbar Nawasunda — produser, remixer, dan DJ asal Bandung Barat, Indonesia.",
  applicationName: "Akbar Nawasunda | Official Website",
  icons: {
    icon: "/assets/akbar-favicon.jpg",
    apple: "/assets/akbar-favicon.jpg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Akbar Nawasunda | Official Website",
    description: "Music, visuals, releases, and booking information.",
    siteName: "Akbar Nawasunda",
    type: "website",
    images: [{ url: "/assets/akbar-social-preview-optimized.webp", width: 1000, height: 1000, alt: "Akbar Nawasunda official website artwork" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akbar Nawasunda | Official Website",
    description: "Music, visuals, releases, and booking information.",
    images: ["/assets/akbar-social-preview-optimized.webp"],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-akbar-pathname") || "/";
  const lang = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "id";

  return (
    <html lang={lang} data-theme="dark">
      <head>
        <meta name="theme-color" content="#101211" />
        <link rel="preload" href="/assets/fonts/fontsource/Recons-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/fontsource/Good Times Rg.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/fontsource/NEXROID-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/fontsource/noto-sans-sundanese-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <Preloader locale={lang} />
        <SiteProviders>{children}</SiteProviders>
        <script defer src="/assets/js/preloader.js" />
      </body>
    </html>
  );
}
