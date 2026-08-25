import type { GameRenderState, PlayerExpression } from "./types";

const palette = [
  { cyan: "#70f0ff", magenta: "#ff58c9", amber: "#ffcf5a", sky: "#0b1021", road: "#120d24" },
  { cyan: "#85ffe0", magenta: "#bf7bff", amber: "#ffd36e", sky: "#100c25", road: "#170c2e" },
  { cyan: "#ffe36e", magenta: "#ff6f91", amber: "#ffffff", sky: "#211025", road: "#220e26" },
];

const expressionEmoji: Record<PlayerExpression, string> = {
  neutral: "😐",
  running: "😏",
  jump: "😮",
  collect: "🤩",
  "near-miss": "😎",
  hit: "😨",
  drop: "🤯",
  "level-up": "🥳",
  paused: "😶‍🌫️",
  "game-over": "😵",
};

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

  constructor(canvas: HTMLCanvasElement, logicalWidth: number, logicalHeight: number) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context is unavailable");
    this.canvas = canvas;
    this.context = context;
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.context.setTransform(this.canvas.width / this.logicalWidth, 0, 0, this.canvas.height / this.logicalHeight, 0, 0);
    this.context.imageSmoothingEnabled = true;
  }

  draw(state: GameRenderState, reducedMotion = false) {
    const ctx = this.context;
    const colors = palette[state.level % palette.length];
    const shake = reducedMotion ? 0 : Math.min(5, state.level > 1 ? 2 : 0);
    ctx.save();
    if (shake && state.mode === "running") ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    this.drawBackground(state, colors, reducedMotion);
    if (state.dropActive) this.drawDropPulse(state, colors, reducedMotion);
    this.drawRoad(state, colors);
    this.drawSignalRibbons(state, colors, reducedMotion);
    this.drawNotes(state, colors, reducedMotion);
    this.drawObstacles(state, colors, reducedMotion);
    this.drawPlayer(state, colors);
    this.drawParticles(state, reducedMotion);
    this.drawPopups(state, reducedMotion);
    this.drawDamageFlash(state);
    ctx.restore();
  }

  private drawBackground(state: GameRenderState, colors: (typeof palette)[number], reducedMotion: boolean) {
    const ctx = this.context;
    const gradient = ctx.createLinearGradient(0, 0, 0, this.logicalHeight);
    gradient.addColorStop(0, "#04050c");
    gradient.addColorStop(0.62, colors.sky);
    gradient.addColorStop(1, colors.road);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    ctx.globalAlpha = 0.36;
    for (let index = 0; index < 56; index += 1) {
      const x = (index * 173 + 31) % this.logicalWidth;
      const y = 32 + ((index * 71) % 238);
      const pulse = reducedMotion ? 1 : 0.55 + Math.abs(Math.sin(state.frame * 0.016 + index)) * 0.45;
      ctx.fillStyle = index % 3 === 0 ? colors.magenta : "#f2f5ff";
      ctx.globalAlpha = 0.15 + pulse * 0.28;
      ctx.fillRect(x, y, index % 4 === 0 ? 2 : 1, index % 5 === 0 ? 2 : 1);
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

  private drawRoad(state: GameRenderState, colors: (typeof palette)[number]) {
    const ctx = this.context;
    ctx.fillStyle = colors.road;
    ctx.fillRect(0, 400, this.logicalWidth, 140);
    ctx.strokeStyle = colors.cyan;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 432);
    for (let x = 0; x <= this.logicalWidth; x += 18) {
      const pulse = Math.sin((x + state.frame * 3.2) * 0.055) * 2.5;
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
      ctx.shadowColor = colors.amber;
      ctx.shadowBlur = reducedMotion ? 7 : 15;
      ctx.fillStyle = "#171321";
      ctx.beginPath();
      ctx.arc(0, 0, note.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
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

  private drawPlayer(state: GameRenderState, colors: (typeof palette)[number]) {
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
    ctx.scale(1 + (1 - stretch) * 0.45, stretch);
    ctx.shadowColor = colors.cyan;
    ctx.shadowBlur = expression === "drop" ? 22 : 12;
    ctx.fillStyle = "#edf8ff";
    ctx.beginPath();
    ctx.roundRect(-16, -48, 32, 39, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
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

    ctx.shadowColor = glow;
    ctx.shadowBlur = expression === "hit" || expression === "game-over" ? 18 : 12;
    ctx.fillStyle = "#151321";
    ctx.beginPath();
    ctx.arc(0, -59, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = glow;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = "27px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(expressionEmoji[expression], 0, -59);
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
    ctx.font = "700 13px 'IBM Plex Mono', monospace";
    for (const popup of state.popups) {
      ctx.globalAlpha = Math.min(1, popup.life * 2) * (reducedMotion ? 0.75 : 1);
      ctx.fillStyle = popup.color;
      ctx.shadowColor = popup.color;
      ctx.shadowBlur = 8;
      ctx.fillText(popup.text, popup.x, popup.y);
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  private drawDamageFlash(state: GameRenderState) {
    if (state.mode !== "running") return;
    // The runtime exposes a damage flash through the canvas CSS layer; keep the renderer clean.
  }
}
