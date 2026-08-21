"use client";

/** Design philosophy: Analog Signal Desk — the home route is the preserved interactive studio surface. */
import dynamicImport from "next/dynamic";


const LegacyDocument = dynamicImport(() => import("../components/LegacyDocument"), { ssr: false });

export default function HomePage() {
  return <LegacyDocument source="/legacy/index.html" scriptSet="home" />;
}
