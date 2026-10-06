import { describe, expect, it } from "vitest";
import {
  resolveCursorPose,
  type CursorHover,
  type CursorPoseInput,
} from "../client/src/signature/cursorPose";

const base: CursorPoseInput = {
  pressed: false,
  dragging: false,
  hover: null,
  still: false,
};

describe("cursor companion state machine", () => {
  it("defaults to idle when nothing is happening", () => {
    expect(resolveCursorPose(base)).toBe("idle");
  });

  it("switches to thinking after the pointer has been still, from idle or aware", () => {
    expect(resolveCursorPose({ ...base, still: true })).toBe("thinking");
    expect(resolveCursorPose({ ...base, hover: "aware", still: true })).toBe(
      "thinking"
    );
  });

  it("shows curious for ordinary interactive elements", () => {
    expect(resolveCursorPose({ ...base, hover: "aware" })).toBe("curious");
  });

  it("shows pointing only for elements explicitly marked as important", () => {
    expect(resolveCursorPose({ ...base, hover: "point" })).toBe("pointing");
  });

  it("shows music for music-specific surfaces, even while idle-still", () => {
    // Music beats "thinking" — resting over a player should stay musical,
    // not fall back to the idle easter egg.
    expect(resolveCursorPose({ ...base, hover: "music", still: true })).toBe(
      "music"
    );
  });

  it("shows stop for disabled/unavailable elements", () => {
    expect(resolveCursorPose({ ...base, hover: "stop" })).toBe("stop");
  });

  it("press always wins over any hover state", () => {
    const hovers: CursorHover[] = ["stop", "music", "point", "aware", null];
    for (const hover of hovers) {
      expect(resolveCursorPose({ ...base, pressed: true, hover })).toBe(
        "press"
      );
    }
  });

  it("drag only applies while pressed, never on its own", () => {
    expect(resolveCursorPose({ ...base, dragging: true })).not.toBe("drag");
    expect(resolveCursorPose({ ...base, pressed: true, dragging: true })).toBe(
      "drag"
    );
  });

  it("enforces the full priority order: press/drag > stop > music > point > aware > still > idle", () => {
    // stop beats music — "a disabled music element should still use STOP".
    expect(
      resolveCursorPose({ ...base, hover: "stop" })
    ).toBe("stop");
    // music beats pointing.
    expect(resolveCursorPose({ ...base, hover: "music" })).toBe("music");
    // press/drag beats everything, including stop and music.
    expect(
      resolveCursorPose({ ...base, pressed: true, hover: "stop" })
    ).toBe("press");
    expect(
      resolveCursorPose({
        ...base,
        pressed: true,
        dragging: true,
        hover: "music",
      })
    ).toBe("drag");
  });

  it("is a pure function: identical input always yields identical output", () => {
    const input: CursorPoseInput = {
      pressed: false,
      dragging: false,
      hover: "point",
      still: false,
    };
    const results = new Set(
      Array.from({ length: 20 }, () => resolveCursorPose({ ...input }))
    );
    expect(results.size).toBe(1);
  });
});
