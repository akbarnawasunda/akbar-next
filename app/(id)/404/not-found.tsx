import type { Metadata } from "next";
import ServerNotFound from "@app/_components/ServerNotFound";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan | Akbar Nawasunda",
  robots: { index: false, follow: true },
};

export default function ExplicitNotFoundBoundary() {
  return <ServerNotFound locale="id" />;
}
