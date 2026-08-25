export type GameMode = "idle" | "running" | "paused" | "game-over";

export type GameInput = "jump" | "pause";

export type PlayerExpression =
  | "neutral"
  | "running"
  | "jump"
  | "collect"
  | "near-miss"
  | "hit"
  | "drop"
  | "level-up"
  | "paused"
  | "game-over";

export type GameEventType =
  | "jump"
  | "double-jump"
  | "collect"
  | "near-miss"
  | "hit"
  | "drop"
  | "level-up"
  | "game-over";

export type GameEvent = {
  type: GameEventType;
  value?: number;
};

export type GameAudioConfig = {
  bgmUrl?: string;
  jumpSfxUrl?: string;
  collectSfxUrl?: string;
  hitSfxUrl?: string;
  dropSfxUrl?: string;
  gameOverSfxUrl?: string;
};

export type PublicGameConfig = GameAudioConfig & {
  title: string;
  kicker: string;
  intro: string;
  isEnabled: boolean;
  shareLabel: string;
};

export type GameParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

export type GamePopup = {
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
};

export type GamePlayerState = {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  onGround: boolean;
  jumps: number;
  invulnerable: number;
  squash: number;
  expression: PlayerExpression;
};

export type GameObstacle = {
  x: number;
  width: number;
  height: number;
  variant: 0 | 1 | 2;
  counted: boolean;
};

export type GameNote = {
  x: number;
  y: number;
  radius: number;
  phase: number;
  collected: boolean;
};

export type GameRenderState = {
  mode: GameMode;
  frame: number;
  score: number;
  best: number;
  lives: number;
  combo: number;
  multiplier: number;
  level: number;
  dropMeter: number;
  dropActive: boolean;
  player: GamePlayerState;
  obstacles: GameObstacle[];
  notes: GameNote[];
  particles: GameParticle[];
  popups: GamePopup[];
};

export type GameSnapshot = Pick<
  GameRenderState,
  "mode" | "score" | "best" | "lives" | "combo" | "multiplier" | "level" | "dropMeter" | "dropActive"
>;
