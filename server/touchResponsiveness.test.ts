import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const gameCanvas = read("client/src/components/JedagRunCanvas.tsx");
const gameCss = read("client/src/components/JedagRunCanvas.css");

describe("Jedag Run touch and keyboard controls", () => {
  it("uses Pointer Events for touch and mouse without synthetic-click delay", () => {
    expect(gameCanvas).toContain('canvas.addEventListener("pointerdown", onPointerDown, { passive: false })');
    expect(gameCanvas).toContain("event.preventDefault();");
    expect(gameCanvas).toContain('world.input("jump")');
    expect(gameCss).toContain("touch-action: none");
  });

  it("does not steal taps from the game's actual controls", () => {
    expect(gameCanvas).toContain("?.closest(\"button\")");
    expect(gameCanvas).toContain("return;");
    expect(gameCss).toContain("pointer-events: auto");
  });

  it("keeps keyboard controls available alongside touch", () => {
    expect(gameCanvas).toContain('event.code === "Space" || event.code === "ArrowUp"');
    expect(gameCanvas).toContain('event.code === "Escape" || event.code === "KeyP"');
    expect(gameCanvas).toContain("window.addEventListener(\"keydown\", onKeyDown)");
  });
});
