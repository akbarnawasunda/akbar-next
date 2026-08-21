"use client";

/** Design philosophy: Analog Signal Desk — even errors feel like stamped archive notes, with a clear return path. */
import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

const LegacyDocument = dynamicImport(() => import("../components/LegacyDocument"), { ssr: false });

export default function NotFound() {
  return <LegacyDocument source="/legacy/404.html" scriptSet="home" />;
}
