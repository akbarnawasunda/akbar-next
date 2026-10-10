import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "client/src/_core/hooks/useAuth.ts"),
  "utf8",
);

describe("client authentication data minimization", () => {
  it("does not persist user profile data in localStorage during render", () => {
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("manus-runtime-user-info");
  });
});
