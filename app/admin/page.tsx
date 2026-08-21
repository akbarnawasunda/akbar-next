"use client";

/** Design philosophy: Analog Signal Desk — the admin panel remains an operational instrument, not a decorative rewrite. */
import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

const LegacyDocument = dynamicImport(() => import("../../components/LegacyDocument"), { ssr: false });

export default function AdminPage() {
  return <LegacyDocument source="/legacy/admin.html" scriptSet="admin" />;
}
