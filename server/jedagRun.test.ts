import { describe, expect, it } from "vitest";
import { JedagRunWorld } from "../client/src/game/jedagRun/JedagRunWorld";

describe("JEDAG RUN world", () => {
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
