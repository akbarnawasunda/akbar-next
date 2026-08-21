"use client";

/** Design philosophy: Analog Signal Desk — legal content stays plain, legible, and document-like. */
import dynamicImport from "next/dynamic";


const LegacyDocument = dynamicImport(() => import("../../components/LegacyDocument"), { ssr: false });

export default function PrivacyPage() {
  return <LegacyDocument source="/legacy/privacy.html" scriptSet="home" />;
}
