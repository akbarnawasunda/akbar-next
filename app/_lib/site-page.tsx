import "server-only";

import { cache } from "react";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { prefetchForPath, type HeadMeta } from "@/lib/route-prefetch";
import { appRouter } from "../../server/routers";
import type { TrpcContext } from "../../server/_core/context";
import { RouteStateBoundary } from "../_components/RouteStateBoundary";
import { RouteView, type SiteRoute } from "../_components/RouteView";

const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || process.env.CANONICAL_ORIGIN || "https://akbarnawasunda.my.id").replace(/\/$/, "");

const publicDocuments = cache(async () => {
  const req: TrpcContext["req"] = {
    headers: { cookie: "", authorization: "" },
    protocol: "https",
    ip: "",
  };
  const res: TrpcContext["res"] = {
    cookie: () => undefined,
    clearCookie: () => undefined,
  };
  const caller = appRouter.createCaller({ req, res, user: null });
  try {
    return await caller.content.documents();
  } catch (error) {
    // Public pages keep rendering with their verified source-data fallback if
    // the CMS/database is temporarily unavailable.
    console.error("[Next SSR] public content prefetch failed:", error);
    return [] as Awaited<ReturnType<typeof caller.content.documents>>;
  }
});

const pageData = cache(async (pathname: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });
  const head = await prefetchForPath(pathname, queryClient, {
    documents: publicDocuments,
  });
  return {
    head,
    state: superjson.serialize(dehydrate(queryClient)),
  };
});

export async function createPageMetadata(pathname: string): Promise<Metadata> {
  const { head } = await pageData(pathname);
  const canonicalPath = head.canonicalPath;
  const isEnglish = head.locale?.startsWith("en") ?? (pathname === "/en" || pathname.startsWith("/en/"));
  const idPath = isEnglish ? pathname.replace(/^\/en(?=\/|$)/, "") || "/" : pathname;
  const enPath = isEnglish ? pathname : pathname === "/" ? "/en" : `/en${pathname}`;
  const image = head.ogImage
    ? head.ogImage.startsWith("http")
      ? head.ogImage
      : `${SITE_ORIGIN}${head.ogImage.startsWith("/") ? "" : "/"}${head.ogImage}`
    : undefined;

  return {
    title: head.title,
    description: head.description,
    alternates: canonicalPath
      ? {
          canonical: `${SITE_ORIGIN}${canonicalPath}`,
          languages: head.noindex || head.notFound
            ? undefined
            : {
                id: `${SITE_ORIGIN}${idPath}`,
                en: `${SITE_ORIGIN}${enPath}`,
                "x-default": `${SITE_ORIGIN}${idPath}`,
              },
        }
      : undefined,
    robots: head.noindex || head.notFound ? { index: false, follow: true } : undefined,
    openGraph: {
      title: head.title,
      description: head.description,
      type: head.ogType || "website",
      url: canonicalPath ? `${SITE_ORIGIN}${canonicalPath}` : undefined,
      siteName: "Akbar Nawasunda",
      locale: head.locale || "id_ID",
      images: image
        ? [{
            url: image,
            width: head.ogImageWidth,
            height: head.ogImageHeight,
            alt: head.ogImageAlt,
          }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: head.title,
      description: head.description,
      images: image ? [image] : undefined,
    },
  };
}

function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  return (
    <script
      id="akbar-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export async function SitePage({
  pathname,
  route,
}: {
  pathname: string;
  route: SiteRoute;
}) {
  const { head, state } = await pageData(pathname);
  if (head.notFound) notFound();
  return (
    <>
      <JsonLd data={head.structuredData} />
      <RouteStateBoundary state={state}>
        <RouteView route={route} />
      </RouteStateBoundary>
    </>
  );
}
