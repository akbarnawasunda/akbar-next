import type { Metadata } from "next";
import RouteNotFound from "./_components/RouteNotFound";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan | Akbar Nawasunda",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <RouteNotFound />;
}
