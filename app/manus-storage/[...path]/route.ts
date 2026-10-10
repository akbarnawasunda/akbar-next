import { NextRequest, NextResponse } from "next/server";
import { ENV } from "../../../server/_core/env";

export const runtime = "nodejs";

const UPSTREAM_TIMEOUT_MS = 5_000;
const MAX_STORAGE_KEY_LENGTH = 500;

type StorageRouteContext = {
  params: Promise<{ path: string[] }>;
};

export function validStorageKey(segments: string[]): string | null {
  if (!segments.length || segments.length > 20) return null;
  if (
    segments.some(
      segment =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        /[\\/\u0000-\u001f\u007f]/.test(segment),
    )
  ) {
    return null;
  }

  // These namespaces back media selected for public site content, so their
  // URLs are intentionally public-by-URL. Private files must not be stored here.
  const isUserAsset =
    segments.length >= 4 &&
    segments[0] === "users" &&
    /^-?[0-9]+$/.test(segments[1] ?? "") &&
    segments[2] === "assets";
  const isGeneratedImage =
    segments.length === 2 && segments[0] === "generated";
  if (!isUserAsset && !isGeneratedImage) return null;

  const key = segments.join("/");
  return key.length <= MAX_STORAGE_KEY_LENGTH ? key : null;
}

export async function GET(
  request: NextRequest,
  { params }: StorageRouteContext,
) {
  const { path } = await params;
  const key = validStorageKey(path);
  if (!key) return new Response("Invalid storage key", { status: 400 });

  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    return new Response("Storage is not configured", { status: 503 });
  }

  try {
    const forgeUrl = new URL(
      "v1/storage/presign/get",
      `${ENV.forgeApiUrl.replace(/\/+$/, "")}/`,
    );
    forgeUrl.searchParams.set("path", key);

    const upstream = await fetch(forgeUrl, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      await upstream.body?.cancel().catch(() => undefined);
      return new Response("Storage backend error", {
        status: 502,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const payload: unknown = await upstream.json();
    const signedUrl =
      payload && typeof payload === "object" && "url" in payload
        ? (payload as { url?: unknown }).url
        : undefined;
    if (typeof signedUrl !== "string" || signedUrl.length > 4_096) {
      return new Response("Storage backend returned an invalid URL", {
        status: 502,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const destination = new URL(signedUrl);
    if (
      destination.protocol !== "https:" ||
      !destination.hostname ||
      destination.username ||
      destination.password
    ) {
      return new Response("Storage backend returned an unsafe URL", {
        status: 502,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const response = NextResponse.redirect(destination, 307);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  } catch (error) {
    console.error(`[StorageRoute] ${key} failed:`, error);
    return new Response("Storage service unavailable", {
      status: 502,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
