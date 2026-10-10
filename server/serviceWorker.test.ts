import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

type MockResponse = {
  ok: boolean;
  status: number;
  type: string;
  body: string;
  clone: () => MockResponse;
};

type FetchEventLike = {
  request: { url: string; method: string; mode?: string };
  respondWith: (response: Promise<MockResponse>) => void;
};

const source = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8");

function mockResponse(body: string, status = 200): MockResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    type: "basic",
    body,
    clone: () => mockResponse(body, status),
  };
}

function bootWorker(
  fetchAsset: (request: FetchEventLike["request"]) => Promise<MockResponse>,
  rejectCachePut = false,
) {
  let fetchHandler: ((event: FetchEventLike) => void) | undefined;
  const records = new Map<string, MockResponse>();
  const cache = {
    addAll: async () => undefined,
    match: async (request: string | FetchEventLike["request"]) =>
      records.get(typeof request === "string" ? request : request.url),
    put: async (request: string | FetchEventLike["request"], response: MockResponse) => {
      if (rejectCachePut || response.status === 206) {
        throw new Error("partial responses cannot be cached");
      }
      records.set(typeof request === "string" ? request : request.url, response);
    },
  };
  const self = {
    location: { origin: "https://site.test" },
    addEventListener(type: string, handler: (event: FetchEventLike) => void) {
      if (type === "fetch") fetchHandler = handler;
    },
    skipWaiting() {},
    clients: { claim() {} },
  };
  const caches = {
    open: async () => cache,
    keys: async () => [],
    delete: async () => true,
  };
  runInNewContext(source, {
    self,
    caches,
    fetch: fetchAsset,
    URL,
    Response: { error: () => ({ type: "error" }) },
  });
  if (!fetchHandler) throw new Error("service worker fetch handler was not registered");
  return { fetchHandler, records };
}

function request(pathname: string, mode = "same-origin") {
  return { url: `https://site.test${pathname}`, method: "GET", mode };
}

async function dispatch(
  handler: (event: FetchEventLike) => void,
  value: FetchEventLike["request"],
) {
  let response: Promise<MockResponse> | undefined;
  handler({ request: value, respondWith: result => { response = result; } });
  return response;
}

describe("Next.js service worker privacy and route safety", () => {
  it("registers the single root worker from the Next provider", () => {
    const providers = readFileSync(
      resolve(process.cwd(), "app/_components/SiteProviders.tsx"),
      "utf8",
    );
    expect(providers).toContain('navigator.serviceWorker.register("/sw.js")');
    expect(source).not.toMatch(/caches?\.match\(\s*["']\/index\.html/);
  });

  it("does not intercept page navigation, APIs, content JSON, or Studio routes", async () => {
    let networkCalls = 0;
    const worker = bootWorker(async () => {
      networkCalls += 1;
      return mockResponse("network");
    });

    for (const [path, mode] of [
      ["/music", "navigate"],
      ["/api/trpc/auth.me", "cors"],
      ["/data/content.json", "cors"],
      ["/admin", "navigate"],
      ["/studio/inquiries", "navigate"],
    ]) {
      const response = await dispatch(worker.fetchHandler, request(path, mode));
      expect(response, `${path} should go directly to the browser network`).toBeUndefined();
    }

    expect(networkCalls).toBe(0);
    expect(worker.records.size).toBe(0);
  });

  it("network-first caches only static assets and uses that cache if offline", async () => {
    const assetPath = "/assets/site.css";
    let networkFails = false;
    const worker = bootWorker(async () => {
      if (networkFails) throw new Error("offline");
      return mockResponse("fresh CSS");
    });

    const first = await dispatch(worker.fetchHandler, request(assetPath));
    expect(first).toBeDefined();
    expect((await first)?.body).toBe("fresh CSS");
    expect(worker.records.get(`https://site.test${assetPath}`)?.body).toBe("fresh CSS");

    networkFails = true;
    const offline = await dispatch(worker.fetchHandler, request(assetPath));
    expect((await offline)?.body).toBe("fresh CSS");
    expect(worker.records.size).toBe(1);
  });

  it("returns network media when the browser rejects caching a partial response", async () => {
    const partialMedia = mockResponse("partial audio range", 206);
    const worker = bootWorker(async () => partialMedia);

    const online = await dispatch(worker.fetchHandler, request("/assets/media/KICK.mp3"));
    expect((await online)?.body).toBe("partial audio range");
    expect(worker.records.size).toBe(0);
  });
});
