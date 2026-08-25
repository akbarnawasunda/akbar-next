import type {
  GameEvent,
  GameInput,
  GameMode,
  GameNote,
  GameObstacle,
  GameParticle,
  GamePopup,
  GameRenderState,
  PlayerExpression,
  GameSnapshot,
} from "./types";

const WIDTH = 960;
const HEIGHT = 540;
const GROUND = 432;
const PLAYER_X = 142;
const PLAYER_WIDTH = 34;
const PLAYER_HEIGHT = 68;
const BEST_SCORE_KEY = "akbar_jedag_run_best_v2";

function browserBestScore() {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(BEST_SCORE_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(value: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(value));
  } catch {
    // Private browsing and disabled storage should not affect gameplay.
  }
}

export type JedagRunWorldOptions = {
  demo?: boolean;
  onEvent?: (event: GameEvent) => void;
};

export class JedagRunWorld {
  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly ground = GROUND;
  readonly demo: boolean;

  private readonly onEvent?: (event: GameEvent) => void;
  private mode: GameMode = "idle";
  private frame = 0;
  private distance = 0;
  private bonus = 0;
  private best = browserBestScore();
  private lives = 3;
  private combo = 0;
  private level = 0;
  private previousLevel = 0;
  private dropMeter = 0;
  private dropTime = 0;
  private nextLifeAt = 1200;
  private obstacleTimer = 0.9;
  private noteTimer = 0.75;
  private coyoteTime = 0;
  private jumpBuffer = 0;
  private seed = 73;
  private hitFlash = 0;
  private shake = 0;
  private expressionTimer = 0;

  readonly player = {
    x: PLAYER_X,
    y: GROUND,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vy: 0,
    onGround: true,
    jumps: 0,
    invulnerable: 0,
    squash: 1,
    expression: "neutral" as PlayerExpression,
  };

  readonly obstacles: GameObstacle[] = [];
  readonly notes: GameNote[] = [];
  readonly particles: GameParticle[] = [];
  readonly popups: GamePopup[] = [];

  constructor(options: JedagRunWorldOptions = {}) {
    this.demo = Boolean(options.demo);
    this.onEvent = options.onEvent;
  }

  get snapshot(): GameSnapshot {
    return {
      mode: this.mode,
      score: this.score,
      best: this.best,
      lives: this.lives,
      combo: this.combo,
      multiplier: this.multiplier,
      level: this.level,
      dropMeter: this.dropMeter,
      dropActive: this.dropTime > 0,
    };
  }

  get score() {
    return Math.floor(this.distance / 8) + this.bonus;
  }

  get multiplier() {
    if (this.combo >= 12) return 4;
    if (this.combo >= 7) return 3;
    if (this.combo >= 3) return 2;
    return 1;
  }

  get currentMode() {
    return this.mode;
  }

  get frameNumber() {
    return this.frame;
  }

  getRenderState(): GameRenderState {
    return {
      ...this.snapshot,
      frame: this.frame,
      player: { ...this.player },
      obstacles: this.obstacles.map(item => ({ ...item })),
      notes: this.notes.map(item => ({ ...item })),
      particles: this.particles.map(item => ({ ...item })),
      popups: this.popups.map(item => ({ ...item })),
    };
  }

  start() {
    this.reset();
    this.mode = "running";
    this.setExpression("running", 0.25);
  }

  pause() {
    if (this.mode === "running") {
      this.mode = "paused";
      this.setExpression("paused", 0);
    }
  }

  resume() {
    if (this.mode === "paused") {
      this.mode = "running";
      this.setExpression("running", 0.25);
    }
  }

  togglePause() {
    if (this.mode === "running") this.pause();
    else if (this.mode === "paused") this.resume();
  }

  input(input: GameInput) {
    if (input === "pause") {
      this.togglePause();
      return;
    }
    if (input !== "jump") return;
    if (this.mode === "idle" || this.mode === "game-over") {
      this.start();
      return;
    }
    if (this.mode === "paused") {
      this.resume();
      return;
    }
    this.jumpBuffer = 0.12;
  }

  update(rawDelta: number) {
    if (this.mode !== "running") return;
    const dt = Math.min(Math.max(rawDelta, 0), 0.034);
    this.frame += 1;
    this.distance += this.speed * dt;
    this.coyoteTime = Math.max(0, this.coyoteTime - dt);
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.shake = Math.max(0, this.shake - dt * 18);
    this.expressionTimer = Math.max(0, this.expressionTimer - dt);
    if (this.expressionTimer === 0 && this.player.expression !== "running") {
      this.player.expression = this.player.onGround ? "running" : "jump";
    }
    this.player.invulnerable = Math.max(0, this.player.invulnerable - dt);
    this.dropTime = Math.max(0, this.dropTime - dt);

    this.level = Math.floor(this.score / 500);
    if (this.level > this.previousLevel) {
      this.previousLevel = this.level;
      this.setExpression("level-up", 0.78);
      this.emit({ type: "level-up", value: this.level });
      this.addPopup("SIGNAL SHIFT", WIDTH * 0.55, 116, "#70f0ff");
      this.burst(WIDTH * 0.55, 142, "#ff58c9", 16);
    }

    this.updatePlayer(dt);
    this.spawnAndMove(dt);
    this.resolveCollisions();
    this.updateEffects(dt);

    if (this.score >= this.nextLifeAt) {
      this.nextLifeAt += 1200;
      if (this.lives < 3) {
        this.lives += 1;
        this.addPopup("+1 LIFE", this.player.x + 20, this.player.y - 94, "#ffcf5a");
      }
    }

    if (this.demo) this.demoPilot();
  }

  get speed() {
    return 315 + this.level * 24 + Math.min(115, this.distance * 0.018);
  }

  get paletteIndex() {
    return Math.min(2, this.level);
  }

  get screenShake() {
    return this.shake;
  }

  get damageFlash() {
    return this.hitFlash;
  }

  private reset() {
    this.mode = "idle";
    this.frame = 0;
    this.distance = 0;
    this.bonus = 0;
    this.lives = 3;
    this.combo = 0;
    this.level = 0;
    this.previousLevel = 0;
    this.dropMeter = 0;
    this.dropTime = 0;
    this.nextLifeAt = 1200;
    this.obstacleTimer = 0.9;
    this.noteTimer = 0.65;
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
    this.hitFlash = 0;
    this.shake = 0;
    this.expressionTimer = 0;
    this.seed = this.demo ? 73 : (Date.now() ^ 0x9e3779b9) >>> 0;
    this.obstacles.length = 0;
    this.notes.length = 0;
    this.particles.length = 0;
    this.popups.length = 0;
    this.player.x = PLAYER_X;
    this.player.y = GROUND;
    this.player.vy = 0;
    this.player.onGround = true;
    this.player.jumps = 0;
    this.player.invulnerable = 0;
    this.player.squash = 1;
    this.player.expression = "neutral";
  }

  private jump() {
    if (!(this.player.onGround || this.coyoteTime > 0 || this.player.jumps < 2)) return;
    const isDouble = !this.player.onGround && this.player.jumps > 0;
    this.player.vy = isDouble ? -690 : -760;
    this.player.onGround = false;
    this.player.jumps += 1;
    this.player.squash = 1.16;
    this.setExpression("jump", 0.3);
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
    this.burst(this.player.x + this.player.width / 2, this.player.y, "#70f0ff", isDouble ? 10 : 7);
    this.emit({ type: isDouble ? "double-jump" : "jump" });
  }

  private updatePlayer(dt: number) {
    if (this.jumpBuffer > 0 && (this.player.onGround || this.coyoteTime > 0 || this.player.jumps < 2)) {
      this.jump();
    }
    this.player.vy += 2050 * dt;
    this.player.y += this.player.vy * dt;
    this.player.squash += (1 - this.player.squash) * Math.min(1, dt * 13);
    if (this.player.y >= GROUND) {
      if (!this.player.onGround && this.player.vy > 100) {
        this.burst(this.player.x + 17, GROUND, "#bca9e8", 7);
      }
      this.player.y = GROUND;
      this.player.vy = 0;
      if (!this.player.onGround) this.coyoteTime = 0.1;
      this.player.onGround = true;
      this.player.jumps = 0;
    } else {
      if (this.player.onGround) this.coyoteTime = 0.1;
      this.player.onGround = false;
    }
  }

  private spawnAndMove(dt: number) {
    this.obstacleTimer -= dt;
    this.noteTimer -= dt;
    if (this.obstacleTimer <= 0) {
      this.spawnObstacle();
      const difficulty = Math.min(0.24, this.level * 0.022);
      this.obstacleTimer = 0.95 - difficulty + this.random() * (0.52 - Math.min(0.22, this.level * 0.015));
    }
    if (this.noteTimer <= 0) {
      this.spawnNoteArc();
      this.noteTimer = 1.08 + this.random() * 0.78 - Math.min(0.18, this.level * 0.015);
    }

    for (const obstacle of this.obstacles) obstacle.x -= this.speed * dt;
    for (const note of this.notes) {
      note.x -= this.speed * dt;
      note.phase += dt * 4.6;
    }
    this.obstacles.splice(0, this.obstacles.length, ...this.obstacles.filter(item => item.x + item.width > -80));
    this.notes.splice(0, this.notes.length, ...this.notes.filter(item => item.x + item.radius > -60 && !item.collected));
  }

  private spawnObstacle() {
    const variant = Math.floor(this.random() * 3) as 0 | 1 | 2;
    const height = variant === 0 ? 62 : variant === 1 ? 78 : 50;
    const width = variant === 2 ? 56 : 48;
    const last = this.obstacles[this.obstacles.length - 1];
    const extraGap = last && last.x > WIDTH - 240 ? 130 : 0;
    this.obstacles.push({
      x: WIDTH + 60 + extraGap,
      width,
      height,
      variant,
      counted: false,
    });
  }

  private spawnNoteArc() {
    const startX = WIDTH + 70;
    const baseY = GROUND - 118 - this.random() * 30;
    const direction = this.random() > 0.5 ? 1 : -1;
    for (let index = 0; index < 3; index += 1) {
      this.notes.push({
        x: startX + index * 48,
        y: baseY + direction * Math.sin(index / 2) * 42,
        radius: 15,
        phase: index * 0.8,
        collected: false,
      });
    }
  }

  private resolveCollisions() {
    const playerLeft = this.player.x + 5;
    const playerRight = this.player.x + this.player.width - 5;
    const playerTop = this.player.y - this.player.height + 8;
    const playerBottom = this.player.y - 4;

    for (const obstacle of this.obstacles) {
      const obstacleTop = GROUND - obstacle.height;
      const overlaps = playerRight > obstacle.x && playerLeft < obstacle.x + obstacle.width && playerBottom > obstacleTop + 5 && playerTop < GROUND;
      if (overlaps && this.player.invulnerable <= 0) {
        this.hitObstacle();
        break;
      }
      if (!obstacle.counted && obstacle.x + obstacle.width < this.player.x) {
        obstacle.counted = true;
        const close = this.player.y < obstacleTop + 34;
        if (close) {
          this.bonus += 22;
          this.dropMeter = Math.min(1, this.dropMeter + 0.08);
          this.addPopup("NEAR MISS +22", this.player.x + 34, this.player.y - 88, "#70f0ff");
          this.burst(this.player.x + 22, this.player.y - 28, "#70f0ff", 8);
          this.setExpression("near-miss", 0.56);
          this.emit({ type: "near-miss", value: 22 });
        }
      }
    }

    for (const note of this.notes) {
      if (note.collected) continue;
      const noteY = note.y + Math.sin(note.phase) * 7;
      const dx = note.x - (this.player.x + this.player.width / 2);
      const dy = noteY - (this.player.y - this.player.height / 2);
      if (Math.abs(dx) < 27 && Math.abs(dy) < 42) {
        note.collected = true;
        this.combo += 1;
        const points = 28 * this.multiplier;
        this.bonus += points;
        this.dropMeter = Math.min(1, this.dropMeter + 0.12);
        this.addPopup(`+${points}${this.multiplier > 1 ? ` ×${this.multiplier}` : ""}`, note.x, noteY - 22, "#ffcf5a");
        this.burst(note.x, noteY, "#ffcf5a", 13);
        this.setExpression("collect", 0.36);
        this.emit({ type: "collect", value: points });
        if (this.dropMeter >= 1) this.activateDrop();
      }
      if (!note.collected && note.x < this.player.x - 30) {
        note.collected = true;
        if (this.combo > 0) {
          this.combo = 0;
          this.addPopup("COMBO LOST", this.player.x + 32, this.player.y - 104, "#ff5c82");
        }
      }
    }
  }

  private hitObstacle() {
    this.lives -= 1;
    this.combo = 0;
    this.dropMeter = Math.max(0, this.dropMeter - 0.22);
    this.player.invulnerable = 1.15;
    this.player.squash = 0.78;
    this.hitFlash = 0.22;
    this.shake = 10;
    this.burst(this.player.x + 18, this.player.y - 32, "#ff5c82", 20);
    this.addPopup("-1 LIFE", this.player.x + 18, this.player.y - 94, "#ff5c82");
    this.setExpression("hit", 0.72);
    this.emit({ type: "hit", value: this.lives });
    if (this.lives <= 0) this.gameOver();
  }

  private activateDrop() {
    this.dropMeter = 0;
    this.dropTime = 3.6;
    this.bonus += 80;
    this.addPopup("DROP", WIDTH * 0.52, 170, "#ff58c9");
    this.burst(WIDTH * 0.52, 190, "#ff58c9", 28);
    this.setExpression("drop", 1.05);
    this.emit({ type: "drop" });
  }

  private gameOver() {
    this.mode = "game-over";
    this.setExpression("game-over", 0);
    const finalScore = this.score;
    if (finalScore > this.best) {
      this.best = finalScore;
      saveBestScore(finalScore);
    }
    this.emit({ type: "game-over", value: finalScore });
  }

  private updateEffects(dt: number) {
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 520 * dt;
      particle.life -= dt;
    }
    for (const popup of this.popups) {
      popup.y -= 30 * dt;
      popup.life -= dt;
    }
    this.particles.splice(0, this.particles.length, ...this.particles.filter(item => item.life > 0));
    this.popups.splice(0, this.popups.length, ...this.popups.filter(item => item.life > 0));
  }

  private demoPilot() {
    const imminent = this.obstacles.find(item => item.x > this.player.x && item.x < this.player.x + 170);
    if (imminent && this.player.onGround) this.jumpBuffer = 0.12;
    const note = this.notes.find(item => item.x > this.player.x + 32 && item.x < this.player.x + 112);
    if (note && this.player.onGround && note.y < this.player.y - 115) this.jumpBuffer = 0.12;
  }

  private burst(x: number, y: number, color: string, count: number) {
    for (let index = 0; index < count; index += 1) {
      const angle = this.random() * Math.PI * 2;
      const speed = 42 + this.random() * 145;
      const maxLife = 0.28 + this.random() * 0.34;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        life: maxLife,
        maxLife,
        color,
        size: 2 + this.random() * 4,
      });
    }
  }

  private addPopup(text: string, x: number, y: number, color: string) {
    this.popups.push({ text, x, y, life: 0.78, color });
  }

  private setExpression(expression: PlayerExpression, duration: number) {
    this.player.expression = expression;
    this.expressionTimer = duration;
  }

  private random() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  private emit(event: GameEvent) {
    this.onEvent?.(event);
  }
}
