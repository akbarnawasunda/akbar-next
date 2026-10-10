import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const studioCss = readFileSync(
  resolve(process.cwd(), "client/src/studio/studio.css"),
  "utf8",
);

describe("audit fondasi layout", () => {
  it("berjalan tanpa pelanggaran CSS yang diketahui", () => {
    const result = spawnSync(
      process.execPath,
      [resolve(process.cwd(), "scripts/audit-layout.mjs")],
      { encoding: "utf8" },
    );

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toContain("Tidak ada pelanggaran kebijakan fondasi.");
  });

  it("sidebar Studio tidak memotong overflow horizontal secara diam-diam", () => {
    expect(studioCss).toContain("overflow-y: auto;");
    expect(studioCss).not.toMatch(/overflow-x:\s*(hidden|clip)\s*;/);
  });
});
