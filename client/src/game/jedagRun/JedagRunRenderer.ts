import type { GameRenderState, PlayerExpression } from "./types";

const palette = [
  { cyan: "#70f0ff", magenta: "#ff58c9", amber: "#ffcf5a", sky: "#0b1021", road: "#120d24" },
  { cyan: "#85ffe0", magenta: "#bf7bff", amber: "#ffd36e", sky: "#100c25", road: "#170c2e" },
  { cyan: "#ffe36e", magenta: "#ff6f91", amber: "#ffffff", sky: "#211025", road: "#220e26" },
];

/** Mouth shape per expression for the geometric fallback face (used until the mascot image is ready). */
type MouthShape = "smile" | "open" | "flat" | "frown";
const expressionMouth: Record<PlayerExpression, MouthShape> = {
  neutral: "flat",
  running: "flat",
  jump: "open",
  collect: "smile",
  "near-miss": "smile",
  hit: "frown",
  drop: "open",
  "level-up": "smile",
  paused: "flat",
  "game-over": "frown",
};

const GROUND_Y = 432;
const MASCOT_SRC = "/assets/akbar-mascot-doodle.webp";
const HIT_SHAKE_PX = 6;

const expressionGlow: Record<PlayerExpression, string> = {
  neutral: "#70f0ff",
  running: "#70f0ff",
  jump: "#85ffe0",
  collect: "#ffcf5a",
  "near-miss": "#70f0ff",
  hit: "#ff5c82",
  drop: "#ff58c9",
  "level-up": "#ffcf5a",
  paused: "#a8a7b9",
  "game-over": "#ff5c82",
};

export class JedagRunRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly logicalWidth: number;
  private readonly logicalHeight: number;
  private readonly mascot: HTMLImageElement | null;
  private mascotReady = false;
  /** Static sky + stars, rendered once per palette and canvas size. Cleared on resize. */
  private readonly skyCache = new Map<number, HTMLCanvasElement>();

  constructor(canvas: HTMLCanvasElement, logicalWidth: number, logicalHeight: number) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context is unavailable");
    this.canvas = canvas;
    this.context = context;
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;
    // One image load per renderer. Until it decodes, the geometric face is drawn instead.
    this.mascot = typeof Image === "undefined" ? null : new Image();
    if (this.mascot) {
      this.mascot.decoding = "async";
      this.mascot.onload = () => {
        this.mascotReady = true;
      };
      this.mascot.src = MASCOT_SRC;
    }
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.context.setTransform(this.canvas.width / this.logicalWidth, 0, 0, this.canvas.height / this.logicalHeight, 0, 0);
    this.context.imageSmoothingEnabled = true;
    this.skyCache.clear();
  }

  draw(state: GameRenderState, reducedMotion = false) {
    const ctx = this.context;
    const colors = palette[state.level % palette.length];
    // Hit shake only: decays in the world, and is off entirely under reduced motion.
    const shake = reducedMotion ? 0 : state.shake * HIT_SHAKE_PX / 10;
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    this.drawBackground(state, colors, state.level % palette.length);
    if (state.dropActive) this.drawDropPulse(state, colors, reducedMotion);
    this.drawRoad(state, colors, reducedMotion);
    this.drawSignalRibbons(state, colors, reducedMotion);
    this.drawNotes(state, colors, reducedMotion);
    this.drawPowerUps(state, colors, reducedMotion);
    this.drawObstacles(state, colors, reducedMotion);
    this.drawPlayer(state, colors, reducedMotion);
    this.drawParticles(state, reducedMotion);
    this.drawPopups(state, reducedMotion);
    this.drawJedagRing(state, reducedMotion);
    this.drawDamageFlash(state, reducedMotion);
    this.drawCountdown(state);
    ctx.restore();
  }

  /** Builds the static sky once: gradient plus a fixed star field. Stars no longer pulse, so the layer stays cacheable. */
  private skyFor(index: number, colors: (typeof palette)[number]) {
    const cached = this.skyCache.get(index);
    if (cached) return cached;
    if (typeof document === "undefined") return null;
    const layer = document.createElement("canvas");
    layer.width = this.canvas.width;
    layer.height = this.canvas.height;
    const ctx = layer.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(layer.width / this.logicalWidth, 0, 0, layer.height / this.logicalHeight, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, 0, this.logicalHeight);
    gradient.addColorStop(0, "#04050c");
    gradient.addColorStop(0.62, colors.sky);
    gradient.addColorStop(1, colors.road);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    ctx.globalAlpha = 0.36;
    for (let star = 0; star < 56; star += 1) {
      const x = (star * 173 + 31) % this.logicalWidth;
      const y = 32 + ((star * 71) % 238);
      ctx.fillStyle = star % 3 === 0 ? colors.magenta : "#f2f5ff";
      ctx.globalAlpha = 0.3 + ((star * 37) % 10) / 40;
      ctx.fillRect(x, y, star % 4 === 0 ? 2 : 1, star % 5 === 0 ? 2 : 1);
    }
    this.skyCache.set(index, layer);
    return layer;
  }

  private drawBackground(state: GameRenderState, colors: (typeof palette)[number], paletteIndex: number) {
    const ctx = this.context;
    const sky = this.skyFor(paletteIndex, colors);
    if (sky) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(sky, 0, 0);
      ctx.restore();
    } else {
      ctx.fillStyle = colors.sky;
      ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    }
    ctx.globalAlpha = 1;

    const mountainOffset = (state.frame * 0.14) % 960;
    this.drawMountainLayer(0, 298, 56, colors.magenta, 0.22, mountainOffset);
    this.drawMountainLayer(0, 328, 36, "#3a235e", 0.6, mountainOffset * 1.8);
    this.drawCityLayer(state, colors);
  }

  private drawMountainLayer(xStart: number, baseline: number, height: number, color: string, alpha: number, offset: number) {
    const ctx = this.context;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(xStart, baseline + 42);
    for (let x = -80; x <= this.logicalWidth + 100; x += 26) {
      const worldX = x + offset;
      const shape = Math.abs(Math.sin(worldX * 0.009)) * height + Math.abs(Math.sin(worldX * 0.021)) * height * 0.36;
      ctx.lineTo(x, baseline - shape);
    }
    ctx.lineTo(this.logicalWidth, baseline + 42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawCityLayer(state: GameRenderState, colors: (typeof palette)[number]) {
    const ctx = this.context;
    const offset = (state.frame * 0.35) % 84;
    for (let index = -1; index < 18; index += 1) {
      const x = index * 67 - offset;
      const height = 32 + ((index * 29) % 56 + 56) % 56;
      const y = 385 - height;
      ctx.fillStyle = index % 2 === 0 ? "#17142c" : "#1c1736";
      ctx.fillRect(x, y, 54, height);
      ctx.fillStyle = index % 3 === 0 ? colors.amber : colors.cyan;
      ctx.globalAlpha = 0.35;
      for (let windowIndex = 0; windowIndex < 5; windowIndex += 1) {
        ctx.fillRect(x + 9 + (windowIndex % 2) * 17, y + 12 + Math.floor(windowIndex / 2) * 18, 4, 3);
      }
      ctx.globalAlpha = 1;
    }
  }

  private drawDropPulse(state: GameRenderState, colors: (typeof palette)[number], reducedMotion: boolean) {
    const ctx = this.context;
    const pulse = reducedMotion ? 0.1 : 0.07 + Math.abs(Math.sin(state.frame * 0.18)) * 0.06;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = colors.magenta;
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    ctx.globalAlpha = reducedMotion ? 0.35 : 0.5 + Math.abs(Math.sin(state.frame * 0.16)) * 0.2;
    ctx.strokeStyle = colors.amber;
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, this.logicalWidth - 28, this.logicalHeight - 28);
    ctx.restore();
  }

  private drawSignalRibbons(state: GameRenderState, colors: (typeof palette)[number], reducedMotion: boolean) {
    const ctx = this.context;
    const phase = reducedMotion ? 0 : state.frame * 0.08;
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.lineWidth = 1;
    for (let index = 0; index < 4; index += 1) {
      const y = 230 + index * 34 + Math.sin(phase + index * 1.7) * (reducedMotion ? 0 : 7);
      const length = 110 + ((state.frame * (index + 1) * 0.7) % 90);
      ctx.strokeStyle = index % 2 ? colors.magenta : colors.cyan;
      ctx.beginPath();
      ctx.moveTo(520 - length / 2, y);
      ctx.lineTo(520 + length / 2, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawRoad(state: GameRenderState, colors: (typeof palette)[number], reducedMotion: boolean) {
    const ctx = this.context;
    ctx.fillStyle = colors.road;
    ctx.fillRect(0, 400, this.logicalWidth, 140);
    ctx.strokeStyle = colors.cyan;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 432);
    // The road line swells on every beat (decays in the world); no swell under reduced motion.
    const beatSwell = reducedMotion ? 0 : state.beatPulse * 4;
    for (let x = 0; x <= this.logicalWidth; x += 18) {
      const pulse = Math.sin((x + state.frame * 3.2) * 0.055) * 2.5 + beatSwell;
      ctx.lineTo(x, 432 + pulse);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.18;
    ctx.lineWidth = 1;
    for (let y = 446; y < 540; y += 8) ctx.fillRect(0, y, this.logicalWidth, 1);
    ctx.globalAlpha = 0.38;
    const shift = (state.frame * 2.1) % 92;
    for (let x = -92; x < this.logicalWidth + 92; x += 92) {
      ctx.fillStyle = x % 184 === 0 ? colors.magenta : colors.cyan;
      ctx.fillRect(x - shift, 462 + ((x / 92) % 4) * 15, 22, 1);
    }
    ctx.globalAlpha = 1;
  }

  private drawNotes(state: GameRenderState, colors: (typeof palette)[number], reducedMotion: boolean) {
    const ctx = this.context;
    for (const note of state.notes) {
      const y = note.y + (reducedMotion ? 0 : Math.sin(note.phase) * 7);
      ctx.save();
      ctx.translate(note.x, y);
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = colors.amber;
      ctx.beginPath();
      ctx.arc(0, 0, note.radius + 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#171321";
      ctx.beginPath();
      ctx.arc(0, 0, note.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colors.amber;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = colors.amber;
      ctx.lineWidth = 1.6;
      for (let bar = -3; bar <= 3; bar += 1) {
        const barHeight = 4 + (Math.abs(bar) === 1 ? 8 : Math.abs(bar) === 2 ? 5 : 3);
        ctx.beginPath();
        ctx.moveTo(bar * 3, -barHeight);
        ctx.lineTo(bar * 3, barHeight);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.38;
      ctx.beginPath();
      ctx.arc(0, 0, note.radius + 6 + (reducedMotion ? 0 : Math.sin(note.phase) * 2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawPowerUps(state: GameRenderState, colors: (typeof palette)[number], reducedMotion: boolean) {
    const ctx = this.context;
    const powerUpColors = { shield: colors.cyan, slow: "#bf7bff", double: colors.amber };
    const powerUpLabels = { shield: "S", slow: "◒", double: "×2" };
    for (const powerUp of state.powerUps) {
      const y = powerUp.y + (reducedMotion ? 0 : Math.sin(powerUp.phase) * 6);
      const color = powerUpColors[powerUp.kind];
      ctx.save();
      ctx.translate(powerUp.x, y);
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, powerUp.radius + 8 + (reducedMotion ? 0 : Math.sin(powerUp.phase) * 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#111020";
      ctx.beginPath();
      ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = powerUp.kind === "double" ? "12px JetBrains Mono, monospace" : "15px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(powerUpLabels[powerUp.kind], 0, 1);
      ctx.restore();
    }
  }

  private drawObstacles(state: GameRenderState, colors: (typeof palette)[number], reducedMotion: boolean) {
    const ctx = this.context;
    for (const obstacle of state.obstacles) {
      const y = 432 - obstacle.height;
      ctx.save();
      ctx.fillStyle = obstacle.variant === 2 ? "#1b152d" : "#141126";
      ctx.fillRect(obstacle.x, y, obstacle.width, obstacle.height);
      ctx.strokeStyle = colors.magenta;
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.x + 1, y + 1, obstacle.width - 2, obstacle.height - 2);
      ctx.globalAlpha = 0.5;
      for (let line = 0; line < obstacle.height; line += 7) {
        ctx.fillStyle = line % 14 === 0 ? colors.magenta : colors.cyan;
        ctx.fillRect(obstacle.x + 5 + ((line * 3) % Math.max(8, obstacle.width - 12)), y + line + 4, Math.min(16, obstacle.width - 10), 1);
      }
      ctx.globalAlpha = reducedMotion ? 0.3 : 0.65;
      ctx.fillStyle = colors.magenta;
      ctx.beginPath();
      ctx.arc(obstacle.x + obstacle.width / 2, y + 12, 4 + (reducedMotion ? 0 : Math.sin(state.frame * 0.18) * 1.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawPlayer(state: GameRenderState, colors: (typeof palette)[number], reducedMotion: boolean) {
    const ctx = this.context;
    const player = state.player;
    if (player.invulnerable > 0 && Math.floor(state.frame / 5) % 2 === 0) return;
    const baseX = player.x + player.width / 2;
    const baseY = player.y;
    const stretch = player.squash;
    const expression = player.expression;
    const glow = expressionGlow[expression];
    const runPhase = Math.sin(state.frame * 0.22);
    const bob = player.onGround ? runPhase * 1.8 : 0;
    const tilt = Math.max(-0.16, Math.min(0.16, player.vy / 5200));
    ctx.save();
    ctx.translate(baseX, baseY + bob);
    ctx.rotate(tilt);
    if (state.shieldTime > 0 || state.doubleScoreTime > 0 || state.slowTime > 0) {
      const activeColor = state.shieldTime > 0 ? colors.cyan : state.doubleScoreTime > 0 ? colors.amber : "#bf7bff";
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -28, 31 + (reducedMotion ? 0 : Math.sin(state.frame * 0.12) * 2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.scale(1 + (1 - stretch) * 0.45, stretch);
    ctx.globalAlpha = expression === "drop" ? 0.32 : 0.18;
    ctx.fillStyle = colors.cyan;
    ctx.beginPath();
    ctx.roundRect(-20, -52, 40, 47, 9);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#edf8ff";
    ctx.beginPath();
    ctx.roundRect(-16, -48, 32, 39, 6);
    ctx.fill();
    ctx.fillStyle = colors.magenta;
    ctx.fillRect(-16, -48, 32, 5);
    ctx.fillStyle = "#101020";
    ctx.fillRect(-10, -37, 20, 8);

    if (expression === "drop" || expression === "level-up") {
      const pulse = 19 + Math.sin(state.frame * 0.16) * 3;
      ctx.globalAlpha = 0.56;
      ctx.strokeStyle = glow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -59, pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#151321";
    ctx.beginPath();
    ctx.arc(0, -59, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = glow;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (this.mascotReady && this.mascot) {
      // Mascot head: circular crop of the doodle, so the black square corners never show.
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, -59, 16, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.mascot, -16, -75, 32, 32);
      ctx.restore();
    } else {
      this.drawFallbackFace(expression, glow);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#101020";
    ctx.fillRect(-13, -7, 10, 5);
    ctx.fillRect(3, -7, 11, 5);
    ctx.fillStyle = colors.cyan;
    ctx.fillRect(-9, -35, 18, 2);
    ctx.fillStyle = colors.magenta;
    const stride = player.onGround ? runPhase * 4 : 0;
    ctx.fillRect(-11 - stride, -1, 7, 5);
    ctx.fillRect(4 + stride, -1, 7, 5);
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = glow;
    ctx.fillRect(-25 - stride, -25, 14, 2);
    ctx.fillRect(-30 - stride * 0.6, -18, 10, 1);
    ctx.restore();
  }

  /** Ring that expands from the feet on a JEDAG jump. Fixed size under reduced motion. */
  private drawJedagRing(state: GameRenderState, reducedMotion: boolean) {
    if (state.jedagFlash <= 0) return;
    const ctx = this.context;
    const t = 1 - state.jedagFlash / 0.35;
    const radius = reducedMotion ? 40 : 22 + t * 70;
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.jedagFlash / 0.35) * 0.85;
    ctx.strokeStyle = "#ffcf5a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(state.player.x + state.player.width / 2, GROUND_Y, radius, radius * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /** Geometric face used until the mascot decodes, or if it never does. Eyes + mouth per expression. */
  private drawFallbackFace(expression: PlayerExpression, color: string) {
    const ctx = this.context;
    ctx.fillStyle = color;
    ctx.fillRect(-8, -63, 4, 5);
    ctx.fillRect(4, -63, 4, 5);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const mouth = expressionMouth[expression];
    if (mouth === "open") {
      ctx.arc(0, -52, 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (mouth === "smile") {
      ctx.arc(0, -55, 6, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else if (mouth === "frown") {
      ctx.arc(0, -48, 6, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    } else {
      ctx.moveTo(-5, -52);
      ctx.lineTo(5, -52);
      ctx.stroke();
    }
  }

  private drawCountdown(state: GameRenderState) {
    if (state.mode !== "running" || state.countdown <= 0) return;
    const ctx = this.context;
    // Three steps across the countdown: 3 → 2 → 1.
    const step = Math.min(3, Math.ceil(state.countdown * 3));
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#f2f5ff";
    ctx.font = "700 64px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(step), this.logicalWidth / 2, 230);
    ctx.restore();
  }

  private drawParticles(state: GameRenderState, reducedMotion: boolean) {
    const ctx = this.context;
    for (const particle of state.particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife) * (reducedMotion ? 0.6 : 1);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
  }

  private drawPopups(state: GameRenderState, reducedMotion: boolean) {
    const ctx = this.context;
    ctx.textAlign = "center";
    ctx.font = "700 13px JetBrains Mono, monospace";
    for (const popup of state.popups) {
      ctx.globalAlpha = Math.min(1, popup.life * 2) * (reducedMotion ? 0.75 : 1);
      ctx.fillStyle = popup.color;
      ctx.fillText(popup.text, popup.x, popup.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  private drawDamageFlash(state: GameRenderState, reducedMotion: boolean) {
    if (state.damageFlash <= 0) return;
    // Thin red wash that fades with the world's hit timer. Half strength under reduced motion.
    const ctx = this.context;
    ctx.save();
    ctx.globalAlpha = state.damageFlash * (reducedMotion ? 0.18 : 0.36);
    ctx.fillStyle = "#ff5c82";
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    ctx.restore();
  }
}
