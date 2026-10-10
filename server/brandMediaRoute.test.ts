import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../app/media/[...path]/route";

const routeContext = (path: string[]) => ({
  params: Promise.resolve({ path }),
});

const requestFor = (path: string) =>
  new NextRequest(`https://akbar.example${path}`);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("first-party public media route", () => {
  it("proxies only an allowlisted image and applies cache/security headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([0xff, 0xd8, 0xff]), {
        status: 200,
        headers: { "content-type": "image/jpeg; charset=binary" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      requestFor("/media/portrait/neon-portrait.jpg"),
      routeContext(["portrait", "neon-portrait.jpg"])
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("cache-control")).toContain("max-age=86400");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(await response.arrayBuffer()).toEqual(
      new Uint8Array([0xff, 0xd8, 0xff]).buffer
    );
  });

  it("redirects to a local brand image when the upstream is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("upstream unavailable"))
    );

    const response = await GET(
      requestFor("/media/portrait/kx07-portrait.jpg"),
      routeContext(["portrait", "kx07-portrait.jpg"])
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://akbar.example/assets/akbar-nawasunda-official-portrait.webp"
    );
    expect(response.headers.get("cache-control")).toContain("max-age=300");
  });

  it("falls back instead of serving active SVG content from upstream", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<svg></svg>", {
          status: 200,
          headers: { "content-type": "image/svg+xml" },
        })
      )
    );

    const response = await GET(
      requestFor("/media/portrait/neon-portrait.jpg"),
      routeContext(["portrait", "neon-portrait.jpg"])
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://akbar.example/assets/akbar-nawasunda-official-portrait.webp"
    );
  });

  it("rejects unknown paths without making an upstream request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      requestFor("/media/unknown.jpg"),
      routeContext(["unknown.jpg"])
    );

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
