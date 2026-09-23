import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Jedag Pad and Sequencer Touch Responsiveness", () => {
  const clientAppJs = fs.readFileSync(path.resolve(process.cwd(), "client/public/assets/js/app.js"), "utf8");
  const publicAppJs = fs.readFileSync(path.resolve(process.cwd(), "public/assets/js/app.js"), "utf8");
  const clientStyleCss = fs.readFileSync(path.resolve(process.cwd(), "client/public/legacy/style.css"), "utf8");
  const publicStyleCss = fs.readFileSync(path.resolve(process.cwd(), "public/legacy/style.css"), "utf8");

  it("configures touchstart listeners for Jedag Pad to prioritize touch response and prevent ghost clicks", () => {
    for (const [name, code] of [["client app.js", clientAppJs], ["public app.js", publicAppJs]]) {
      // Jedag Pad section contains touchstart
      expect(code, `${name} missing pad touchstart`).toContain(".pad");
      expect(code, `${name} missing pad touchstart listener`).toContain("p.addEventListener('touchstart'");
      // Prevents ghost clicks on touchstart
      expect(code, `${name} missing cancelable e.preventDefault in pad touchstart`).toContain("if (e.cancelable) e.preventDefault();");
      // Ignores synthetic touch pointer events or ghost clicks
      expect(code, `${name} missing pointerType === 'touch' check`).toContain("if (e.pointerType === 'touch') return;");
    }
  });

  it("configures touchstart listeners on sequencer rack with multi-touch and ghost click prevention", () => {
    for (const [name, code] of [["client app.js", clientAppJs], ["public app.js", publicAppJs]]) {
      // Sequencer rack listens to touchstart
      expect(code, `${name} missing body touchstart`).toContain("body.addEventListener('touchstart'");
      // Multi-touch handling via changedTouches
      expect(code, `${name} missing changedTouches processing`).toContain("e.changedTouches");
      // Ghost click suppression
      expect(code, `${name} missing cancelable e.preventDefault in rack touchstart`).toContain("if (touchedAny && e.cancelable) {");
      expect(code, `${name} missing ghost click suppression time check`).toContain("lastRackTouchTime < 500");
    }
  });

  it("attaches fast touch response to sequencer transport and preset controls", () => {
    for (const [name, code] of [["client app.js", clientAppJs], ["public app.js", publicAppJs]]) {
      expect(code, `${name} missing attachFastControl helper`).toContain("function attachFastControl");
      expect(code, `${name} missing playBtn fast control`).toContain("attachFastControl(playBtn");
      expect(code, `${name} missing stopBtn fast control`).toContain("attachFastControl(stopBtn2");
    }
  });

  it("configures touch-action and user-select in legacy css for both pad and sequencer steps", () => {
    for (const [name, css] of [["client style.css", clientStyleCss], ["public style.css", publicStyleCss]]) {
      expect(css, `${name} pad missing touch-action:none`).toContain("touch-action:none");
      expect(css, `${name} pad missing -webkit-user-select:none`).toContain("-webkit-user-select:none");
      expect(css, `${name} step missing touch-action:manipulation`).toContain("touch-action:manipulation");
    }
  });
});
