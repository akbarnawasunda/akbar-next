import { NextRequest, NextResponse } from "next/server";
import {
  localMediaFallback,
  publicMediaSource,
} from "../../../server/publicMediaPolicy";

export const runtime = "nodejs";

const UPSTREAM_TIMEOUT_MS = 5_000;
const IMAGE_CONTENT_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const SUCCESS_CACHE_CONTROL =
  "public, max-age=86400, stale-while-revalidate=604800";
const FALLBACK_CACHE_CONTROL =
  "public, max-age=300, stale-while-revalidate=3600";

type MediaRouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, { params }: MediaRouteContext) {
  const { path } = await params;
  const pathname = `/media/${path.join("/")}`;
  const source = publicMediaSource(pathname);

  if (!source) return new Response("Media not found", { status: 404 });

  const fallback = localMediaFallback(pathname);
  const redirectToFallback = () => {
    if (!fallback) {
      return new Response("Brand media is unavailable", { status: 502 });
    }

    const response = NextResponse.redirect(new URL(fallback, request.url), 302);
    response.headers.set("Cache-Control", FALLBACK_CACHE_CONTROL);
    return response;
  };

  try {
    const upstream = await fetch(source, {
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const contentType = upstream.headers
      .get("content-type")
      ?.split(";", 1)[0]
      .trim()
      .toLowerCase();

    if (
      !upstream.ok ||
      !upstream.body ||
      !contentType ||
      !IMAGE_CONTENT_TYPES.has(contentType)
    ) {
      await upstream.body?.cancel().catch(() => undefined);
      return redirectToFallback();
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": SUCCESS_CACHE_CONTROL,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return redirectToFallback();
  }
}
