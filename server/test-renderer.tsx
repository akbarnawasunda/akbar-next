import { dehydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { renderToString } from "react-dom/server";
import type { ComponentType } from "react";
import { trpc } from "@/lib/trpc";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ScrollProgress } from "@/components/ScrollProgress";
import { RouteProgress } from "@/components/RouteTransition";
import { RouteStateBoundary } from "../app/_components/RouteStateBoundary";
import { BirthdayMode } from "@/components/StudioClock";
import { StructuredData } from "@/components/StructuredData";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PublicShell } from "@/shell/PublicShell";
import About from "@/pages/About";
import GameJedagRun, { EnglishGameJedagRun } from "@/pages/GameJedagRun";
import Home from "@/pages/Home";
import Licensing from "@/pages/Licensing";
import Inquiry from "@/pages/Inquiry";
import Live from "@/pages/Live";
import Music from "@/pages/Music";
import NotFound from "@/pages/NotFound";
import PressKit from "@/pages/PressKit";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ReleaseDetail from "@/pages/ReleaseDetail";
import Universe from "@/pages/Universe";
import Visuals from "@/pages/Visuals";
import {
  EnglishAbout,
  EnglishEpk,
  EnglishHome,
  EnglishInquiry,
  EnglishLicensing,
  EnglishLive,
  EnglishMusic,
  EnglishPrivacy,
  EnglishReleaseDetail,
  EnglishUniverse,
  EnglishVisuals,
} from "@/pages/EnglishPages";
import { prefetchForPath, type HeadMeta, type SsrPrefetch } from "@/lib/route-prefetch";
import { TestNextNavigationProvider } from "./test-navigation/next-navigation-context";
import superjson from "superjson";

export type RenderResult = {
  html: string;
  dehydratedState: unknown;
  head: HeadMeta;
};

function routeForPath(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const isEnglish = path === "/en" || path.startsWith("/en/");
  const localPath = isEnglish ? path.replace(/^\/en(?=\/|$)/, "") || "/" : path;
  const route = isEnglish
    ? ({
        "/": EnglishHome,
        "/music": EnglishMusic,
        "/visuals": EnglishVisuals,
        "/live": EnglishLive,
        "/universe": EnglishUniverse,
        "/about": EnglishAbout,
        "/epk": EnglishEpk,
        "/inquire": EnglishInquiry,
        "/licensing": EnglishLicensing,
        "/privacy": EnglishPrivacy,
        "/game/jedag-run": EnglishGameJedagRun,
      } as Record<string, ComponentType<any>>)
    : ({
        "/": Home,
        "/music": Music,
        "/visuals": Visuals,
        "/live": Live,
        "/universe": Universe,
        "/about": About,
        "/epk": PressKit,
        "/inquire": Inquiry,
        "/licensing": Licensing,
        "/privacy": PrivacyPolicy,
        "/game/jedag-run": GameJedagRun,
      } as Record<string, ComponentType<any>>);

  if (/^\/music\/[^/]+$/.test(localPath)) {
    return {
      Component: isEnglish ? EnglishReleaseDetail : ReleaseDetail,
      params: { slug: localPath.split("/").slice(-1)[0] || "" },
      props: {},
    };
  }
  const Component = route[localPath] || NotFound;
  return {
    Component,
    params: {},
    props: Component === NotFound ? { locale: isEnglish ? "en" : "id" } : {},
  };
}


export async function render(
  url: string,
  prefetch: SsrPrefetch,
): Promise<RenderResult> {
  const parsed = new URL(url, "http://test.local");
  const pathname = parsed.pathname || "/";
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
  });

  const head = await prefetchForPath(
    `${pathname}${parsed.search}`,
    queryClient,
    prefetch,
  );
  const route = routeForPath(pathname);
  const Component = head.notFound ? NotFound : route.Component;
  const params: Record<string, string | string[] | undefined> = head.notFound
    ? {}
    : route.params;
  const componentProps: Record<string, unknown> = head.notFound
    ? { locale: pathname === "/en" || pathname.startsWith("/en/") ? "en" : "id" }
    : route.props || {};
  const trpcClient = trpc.createClient({
    links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
  });
  const dehydratedState = dehydrate(queryClient);
  const serializedState = superjson.serialize(dehydratedState);

  const html = renderToString(
    <TestNextNavigationProvider
      state={{ pathname, search: parsed.search, params }}
    >
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
                  <div className="route-motion" data-route={pathname}>
                    <RouteStateBoundary state={serializedState}>
                      <Component {...componentProps} />
                    </RouteStateBoundary>
                  </div>
                </PublicShell>
              </ErrorBoundary>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </TestNextNavigationProvider>,
  );

  return { html, dehydratedState, head };
}
