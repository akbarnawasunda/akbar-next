import type { Metadata } from "next";
import "./globals.css";

/** Design philosophy: Analog Signal Desk — editorial metadata, instrument-like type, and a warm archival surface. */
export const metadata: Metadata = {
  metadataBase: new URL("https://akbarnawasunda.my.id"),
  title: "Akbar Nawasunda — Official Website",
  description: "Official website of Akbar Nawasunda: music, interactive experiments, releases, and booking information.",
  alternates: { canonical: "https://akbarnawasunda.my.id/" },
  openGraph: {
    title: "Akbar Nawasunda — Official Website",
    description: "Music, interactive experiments, releases, and booking information.",
    url: "https://akbarnawasunda.my.id/",
    siteName: "Akbar Nawasunda",
    images: [{ url: "/manus-storage/akbar-signal-desk-hero_50808100.jpg", width: 1200, height: 630, alt: "Akbar Nawasunda signal desk" }],
    type: "website",
  },
  icons: {
    icon: "/assets/media/favicon.png?v=2",
    apple: "/assets/media/favicon.png?v=2",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <script defer src="https://cloud.umami.is/script.js" data-website-id="" />
      </body>
    </html>
  );
}
