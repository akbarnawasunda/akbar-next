import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { normalizeDatabaseUrl } from "./db";

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

// The Vercel handler normalizes req.url before passing it to Express so the
// framework does not fall back to Node's deprecated url.parse() path.
describe("vercel request URL contract", () => {
  it("uses relative request URLs for Express compatibility", () => {
    const handlerSource = readFileSync(
      new URL("./vercelTrpcHandler.js", import.meta.url),
      "utf8",
    );
    expect(handlerSource).toContain('value: `${requestPath}${requestUrl.search}`');
    expect(handlerSource).toContain('requestUrl.searchParams.delete("trpcPath")');
  });
});
