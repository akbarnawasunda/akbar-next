"use client";

/** Design philosophy: Analog Signal Desk — press material reads like a clean, exportable studio dossier. */
import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

const LegacyDocument = dynamicImport(() => import("../../components/LegacyDocument"), { ssr: false });

export default function EpkPage() {
  return <LegacyDocument source="/legacy/epk.html" scriptSet="home" />;
}
