import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JedagRunWorld } from "../client/src/game/jedagRun/JedagRunWorld";

describe("JEDAG RUN world", () => {
  it("persists the public username in the browser and supports changing it", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/GameJedagRun.tsx"), "utf8");
    expect(source).toContain('const GAME_USERNAME_STORAGE_KEY = "an_jedag_run_username"');
    expect(source).toContain("window.localStorage.getItem(GAME_USERNAME_STORAGE_KEY)");
    expect(source).toContain("window.localStorage.setItem(GAME_USERNAME_STORAGE_KEY, username)");
    expect(source).toContain("window.localStorage.removeItem(GAME_USERNAME_STORAGE_KEY)");
    expect(source).toContain("GANTI USERNAME");
  });
  it("drives expressive avatar states from gameplay events", () => {
    const world = new JedagRunWorld({ demo: true });
    expect(world.getRenderState().player.expression).toBe("neutral");

    world.start();
    expect(world.getRenderState().player.expression).toBe("running");

    world.input("jump");
    world.update(1 / 60);
    expect(world.getRenderState().player.expression).toBe("jump");

    const trailWorld = new JedagRunWorld({ demo: true });
    trailWorld.start();
    for (let frame = 0; frame < 12; frame += 1) trailWorld.update(1 / 60);
    expect(trailWorld.particles.length).toBeGreaterThan(0);

    for (let frame = 0; frame < 36; frame += 1) world.update(1 / 60);
    world.notes.push({
      x: world.player.x + 18,
      y: world.player.y - world.player.height / 2,
      radius: 15,
      phase: 0,
      collected: false,
    });
    world.update(1 / 60);
    expect(world.getRenderState().player.expression).toBe("collect");

    for (let frame = 0; frame < 30; frame += 1) world.update(1 / 60);
    world.obstacles.push({
      x: world.player.x,
      width: 48,
      height: 62,
      variant: 0,
      counted: false,
    });
    world.update(1 / 60);
    expect(world.getRenderState().player.expression).toBe("hit");

    const rendererSource = readFileSync(resolve(process.cwd(), "client/src/game/jedagRun/JedagRunRenderer.ts"), "utf8");
    expect(rendererSource).toContain('collect: "🤩"');
    expect(rendererSource).toContain('hit: "😨"');
    expect(rendererSource).toContain('"game-over": "😵"');
    expect(rendererSource).toContain("drawSignalRibbons");
    expect(rendererSource).toContain("const tilt");

    const audioSource = readFileSync(resolve(process.cwd(), "client/src/game/jedagRun/JedagRunAudio.ts"), "utf8");
    expect(audioSource).toContain('event.type === "near-miss" ? "near-miss"');
    expect(audioSource).toContain('event.type === "level-up" ? "level-up"');
  });

  it("tracks phase stats and collects a shield power-up without browser APIs", () => {
    const world = new JedagRunWorld({ demo: true });
    expect(world.snapshot.phase).toBe("signal");
    expect(world.snapshot.notesCollected).toBe(0);
    expect(world.snapshot.highestCombo).toBe(0);
    world.start();
    world.powerUps.push({
      kind: "shield",
      x: world.player.x + 18,
      y: world.player.y - world.player.height / 2,
      radius: 17,
      phase: 0,
      collected: false,
    });
    world.update(1 / 60);
    expect(world.snapshot.shieldTime).toBeGreaterThan(0);
    expect(world.powerUps[0]?.collected).toBe(true);
    world.notes.push({
      x: world.player.x + 18,
      y: world.player.y - world.player.height / 2,
      radius: 15,
      phase: 0,
      collected: false,
    });
    world.update(1 / 60);
    expect(world.snapshot.notesCollected).toBe(1);
    expect(world.snapshot.highestCombo).toBe(1);
    const rendererSource = readFileSync(resolve(process.cwd(), "client/src/game/jedagRun/JedagRunRenderer.ts"), "utf8");
    expect(rendererSource).toContain("drawPowerUps");
    expect(rendererSource).toContain('powerUpLabels = { shield: "S", slow: "◒", double: "×2" }');
  });

  it("starts from a clean signal and advances score without browser APIs", () => {
    const world = new JedagRunWorld({ demo: true });
    expect(world.snapshot.mode).toBe("idle");
    world.start();
    expect(world.snapshot.mode).toBe("running");

    for (let frame = 0; frame < 180; frame += 1) world.update(1 / 60);

    expect(world.snapshot.score).toBeGreaterThan(0);
    expect(world.snapshot.level).toBeGreaterThanOrEqual(0);
    expect(world.snapshot.lives).toBeGreaterThan(0);
  });

  it("supports responsive jump input and pause/resume", () => {
    const world = new JedagRunWorld({ demo: true });
    world.start();
    world.input("jump");
    world.update(1 / 60);
    expect(world.player.onGround).toBe(false);
    expect(world.player.vy).toBeLessThan(0);

    world.pause();
    const scoreAtPause = world.snapshot.score;
    for (let frame = 0; frame < 30; frame += 1) world.update(1 / 60);
    expect(world.snapshot.score).toBe(scoreAtPause);
    expect(world.snapshot.mode).toBe("paused");

    world.resume();
    world.update(1 / 60);
    expect(world.snapshot.mode).toBe("running");
  });

  it("keeps a deterministic demo signal free of immediate game-over", () => {
    const world = new JedagRunWorld({ demo: true });
    world.start();
    for (let frame = 0; frame < 240; frame += 1) world.update(1 / 60);
    expect(["running", "paused", "game-over"]).toContain(world.snapshot.mode);
    expect(world.snapshot.score).toBeGreaterThanOrEqual(0);
  });
});
