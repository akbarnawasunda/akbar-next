"use client";

import { usePathname } from "next/navigation";
import NotFound from "@/pages/NotFound";

export default function RouteNotFound() {
  const pathname = usePathname() || "/";
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "id";
  return <NotFound locale={locale} />;
}
