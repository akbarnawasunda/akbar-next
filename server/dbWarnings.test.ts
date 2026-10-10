import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeDatabaseUrl } from "./db";

const trpcRoute = readFileSync(
  resolve(process.cwd(), "app/api/trpc/[[...trpc]]/route.ts"),
  "utf8",
);

describe("database warning guards", () => {
  it("removes mysql2-incompatible ssl-mode while preserving other parameters", () => {
    const normalized = normalizeDatabaseUrl(
      "mysql://user:pass@example.com:27482/defaultdb?ssl-mode=REQUIRED&charset=utf8mb4",
    );

    const parsed = new URL(normalized);
    expect(parsed.searchParams.has("ssl-mode")).toBe(false);
    expect(parsed.searchParams.get("charset")).toBe("utf8mb4");
  });

  it("keeps malformed URLs unchanged for the normal connection error path", () => {
    const malformed = "not-a-database-url";
    expect(normalizeDatabaseUrl(malformed)).toBe(malformed);
  });
});

describe("Next App Router tRPC request contract", () => {
  it("uses the Fetch adapter and framework-neutral cookie context", () => {
    expect(trpcRoute).toContain('@trpc/server/adapters/fetch');
    expect(trpcRoute).toContain('endpoint: "/api/trpc"');
    expect(trpcRoute).toContain("createContext({ req: appRequest, res: cookieResponse })");
    expect(trpcRoute).not.toMatch(/from [\"']express[\"']/);
    expect(trpcRoute).not.toContain("vercelTrpcHandler");
  });
});
