import type { Metadata } from "next";
import ServerNotFound from "@app/_components/ServerNotFound";

export const metadata: Metadata = {
  title: "Page not found | Akbar Nawasunda",
  robots: { index: false, follow: true },
};

export default function EnglishNotFound() {
  return <ServerNotFound locale="en" />;
}
