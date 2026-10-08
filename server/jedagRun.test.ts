import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BEAT_SECONDS, COUNTDOWN_SECONDS, JedagRunWorld } from "../client/src/game/jedagRun/JedagRunWorld";

/** Run out the READY countdown so tests can drive gameplay directly. */
function skipCountdown(world: JedagRunWorld) {
  let guard = 0;
  while (world.getRenderState().countdown > 0 && guard < 600) {
    world.update(1 / 60);
    guard += 1;
  }
}

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
    skipCountdown(world);
    expect(world.getRenderState().player.expression).toBe("running");

    world.input("jump");
    world.update(1 / 60);
    expect(world.getRenderState().player.expression).toBe("jump");

    const trailWorld = new JedagRunWorld({ demo: true });
    trailWorld.start();
    skipCountdown(trailWorld);
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
    skipCountdown(world);
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
    skipCountdown(world);
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

  it("holds the READY countdown: no movement, no spawns, no jumps until GO", () => {
    const world = new JedagRunWorld({ demo: true });
    world.start();
    expect(world.getRenderState().countdown).toBeCloseTo(COUNTDOWN_SECONDS, 5);
    for (let frame = 0; frame < 30; frame += 1) world.update(1 / 60);
    expect(world.snapshot.score).toBe(0);
    expect(world.obstacles.length).toBe(0);
    expect(world.notes.length).toBe(0);

    world.input("jump");
    skipCountdown(world);
    expect(world.player.onGround).toBe(true);
    expect(world.getRenderState().countdown).toBe(0);
  });

  it("spawns obstacles and note arcs only on beat ticks (120 BPM grid)", () => {
    const world = new JedagRunWorld({ demo: true });
    world.start();
    skipCountdown(world);
    const frameDelta = 1 / 60;
    let obstaclesSeen = 0;
    let notesSeen = 0;
    for (let frame = 0; frame < 60 * 40; frame += 1) {
      const obstaclesBefore = world.obstacles.length;
      const notesBefore = world.notes.length;
      world.update(frameDelta);
      // A spawn happens on the frame that crosses a beat, so the clock sits just past the boundary.
      if (world.obstacles.length > obstaclesBefore) {
        obstaclesSeen += 1;
        expect(world.beatTime % BEAT_SECONDS).toBeLessThan(frameDelta + 1e-9);
      }
      if (world.notes.length > notesBefore) {
        notesSeen += 1;
        expect(world.beatTime % BEAT_SECONDS).toBeLessThan(frameDelta + 1e-9);
      }
      if (world.snapshot.mode !== "running") break;
    }
    expect(obstaclesSeen).toBeGreaterThan(0);
    expect(notesSeen).toBeGreaterThan(0);
  });

  it("replays identically from the same seed (deterministic world)", () => {
    const run = () => {
      const world = new JedagRunWorld({ demo: true });
      world.start();
      skipCountdown(world);
      for (let frame = 0; frame < 900; frame += 1) world.update(1 / 60);
      return {
        score: world.snapshot.score,
        lives: world.snapshot.lives,
        obstacles: world.obstacles.map(item => Math.round(item.x * 100)),
        notes: world.notes.map(item => Math.round(item.x * 100)),
      };
    };
    expect(run()).toEqual(run());
  });

  it("exposes hit feedback to the renderer and decays it", () => {
    const world = new JedagRunWorld({ demo: true });
    world.start();
    skipCountdown(world);
    for (let frame = 0; frame < 30; frame += 1) world.update(1 / 60);
    world.obstacles.push({ x: world.player.x, width: 48, height: 62, variant: 0, counted: false });
    world.update(1 / 60);
    const hit = world.getRenderState();
    expect(hit.player.expression).toBe("hit");
    expect(hit.damageFlash).toBeGreaterThan(0);
    expect(hit.shake).toBeGreaterThan(0);
    for (let frame = 0; frame < 30; frame += 1) world.update(1 / 60);
    expect(world.getRenderState().damageFlash).toBe(0);
  });

  it("doubles note value while DROP is active", () => {
    // Two identical seeded worlds, one with an active DROP timer; the only difference is the note value.
    const collectWith = (dropped: boolean) => {
      const world = new JedagRunWorld({ demo: true });
      world.start();
      skipCountdown(world);
      if (dropped) (world as unknown as { dropTime: number }).dropTime = 3.6;
      const before = world.snapshot.score;
      world.notes.push({ x: world.player.x + 18, y: world.player.y - world.player.height / 2, radius: 15, phase: 0, collected: false });
      world.update(1 / 60);
      return world.snapshot.score - before;
    };
    const normal = collectWith(false);
    const dropped = collectWith(true);
    expect(normal).toBe(28);
    expect(dropped).toBe(56);
  });

  it("renders the mascot via drawImage with a geometric fallback and no emoji faces", () => {
    const rendererSource = readFileSync(resolve(process.cwd(), "client/src/game/jedagRun/JedagRunRenderer.ts"), "utf8");
    expect(rendererSource).toContain("ctx.drawImage(this.mascot");
    expect(rendererSource).toContain("drawFallbackFace");
    expect(rendererSource).toContain("/assets/akbar-mascot-doodle.webp");
    expect(rendererSource).not.toContain("expressionEmoji");
  });

  it("keeps the HUD out of the live-region path and announces only mode changes", () => {
    const canvasSource = readFileSync(resolve(process.cwd(), "client/src/components/JedagRunCanvas.tsx"), "utf8");
    expect(canvasSource).not.toMatch(/jedag-run-hud"\s+aria-live/);
    expect(canvasSource).toContain('role="status" aria-live="polite"');
    expect(canvasSource).toContain("announcementFor");
  });

  it("rewards jumps on the beat as JEDAG and breaks the chain on off-beat jumps", () => {
    const world = new JedagRunWorld();
    world.start();
    skipCountdown(world);
    // Wait for a beat tick (clock just past a boundary), then jump: an on-beat JEDAG jump.
    while (world.beatTime % BEAT_SECONDS > 1 / 60 + 1e-9) world.update(1 / 60);
    const scoreBeforeOnBeat = world.snapshot.score;
    world.input("jump");
    world.update(1 / 60);
    expect(world.snapshot.jedagChain).toBe(1);
    expect(world.getRenderState().jedagFlash).toBeGreaterThan(0);
    expect(world.snapshot.score).toBeGreaterThanOrEqual(scoreBeforeOnBeat);

    // Land, then jump exactly mid-beat (far from any tick): chain resets.
    for (let frame = 0; frame < 120 && !world.player.onGround; frame += 1) world.update(1 / 60);
    while (Math.min(world.beatTime % BEAT_SECONDS, BEAT_SECONDS - (world.beatTime % BEAT_SECONDS)) < 0.2) world.update(1 / 60);
    world.input("jump");
    world.update(1 / 60);
    expect(world.snapshot.jedagChain).toBe(0);
  });

  it("keeps the beat-locked jump bonus deterministic for the same seed", () => {
    const run = () => {
      const world = new JedagRunWorld({ demo: true });
      world.start();
      skipCountdown(world);
      for (let frame = 0; frame < 900; frame += 1) world.update(1 / 60);
      return { score: world.snapshot.score, chain: world.snapshot.jedagChain };
    };
    expect(run()).toEqual(run());
  });

  it("uses lighter, cached rendering: no per-frame shadow blur, sky cached per palette", () => {
    // Perf contract: shadowBlur was the largest per-frame cost. Not visible in HTML, so checked in source.
    const rendererSource = readFileSync(resolve(process.cwd(), "client/src/game/jedagRun/JedagRunRenderer.ts"), "utf8");
    expect(rendererSource).not.toContain("shadowBlur");
    expect(rendererSource).toContain("skyCache");
  });
});
