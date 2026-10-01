/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

/** Public entry points used by the Fan Signal signup form. */
export const FAN_SIGNAL_SOURCES = {
  home: "home",
  music: "music",
  live: "footer",
  visuals: "visuals",
  universe: "universe",
} as const;

export type FanSignalSource =
  (typeof FAN_SIGNAL_SOURCES)[keyof typeof FAN_SIGNAL_SOURCES];
