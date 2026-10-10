"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { COOKIE_NAME } from "@shared/const";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ScrollProgress } from "@/components/ScrollProgress";
import { RouteProgress } from "@/components/RouteTransition";
import { BirthdayMode } from "@/components/StudioClock";
import { StructuredData } from "@/components/StructuredData";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PublicShell } from "@/shell/PublicShell";

function RouteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  useEffect(() => {
    document.documentElement.lang =
      pathname === "/en" || pathname.startsWith("/en/") ? "en" : "id";
    // Next.js owns scroll restoration and hash-anchor navigation.
  }, [pathname]);
  return (
    <div className="route-motion" key={pathname} data-route={pathname}>
      {children}
    </div>
  );
}

export function SiteProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          headers() {
            try {
              const raw = sessionStorage.getItem("manus-cookie");
              if (raw) {
                const prefix = `${COOKIE_NAME}=`;
                const pair = raw.split(";").find(value => value.trim().startsWith(prefix));
                const token = pair?.trim().slice(prefix.length);
                if (token) return { Authorization: `Bearer ${token}` };
              }
            } catch {
              // sessionStorage is optional in private or embedded browsers.
            }
            return {};
          },
          fetch(input, init) {
            return globalThis.fetch(input, {
              ...(init ?? {}),
              credentials: "include",
            });
          },
        }),
      ],
    }),
  );

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
    const websiteId = process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID;
    if (!endpoint || !websiteId) return;
    const script = document.createElement("script");
    script.defer = true;
    script.src = `${endpoint}/umami`;
    script.dataset.websiteId = websiteId;
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  useEffect(() => {
    // Replace any older worker installed at this origin; v5 caches static
    // assets only and will never intercept route HTML or authenticated APIs.
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <ErrorBoundary>
              <PublicShell>
                <Toaster />
                <ScrollProgress />
                <RouteProgress />
                <BirthdayMode />
                <StructuredData />
                <RouteFrame>{children}</RouteFrame>
              </PublicShell>
            </ErrorBoundary>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
