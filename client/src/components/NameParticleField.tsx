import { useEffect, useRef } from "react";
import "./NameParticleField.css";

type Particle = { tx: number; ty: number; x: number; y: number; sx: number; sy: number; drift: number; size: number; alpha: number };

export function NameParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, dpr = 1, particles: Particle[] = [], frame = 0, started = 0, visible = false, destroyed = false;
    const pointer = { x: -9999, y: -9999, enabled: window.matchMedia("(hover: hover) and (pointer: fine)").matches };
    const build = () => {
      const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height); dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const offscreen = document.createElement("canvas"); offscreen.width = Math.round(width); offscreen.height = Math.round(height);
      const off = offscreen.getContext("2d"); if (!off) return;
      const mobile = width < 640; let fontSize = mobile ? Math.min(width * .19, 62) : Math.min(width * .13, 108);
      off.font = `800 ${fontSize}px Space Grotesk, sans-serif`; off.textAlign = "center"; off.textBaseline = "middle"; off.fillStyle = "white";
      const lines = mobile ? ["AKBAR", "NAWASUNDA"] : ["AKBAR", "NAWASUNDA"];
      while (off.measureText("NAWASUNDA").width > width * .88 && fontSize > 20) { fontSize -= 2; off.font = `800 ${fontSize}px Space Grotesk, sans-serif`; }
      const lineGap = fontSize * .88; const centerY = height / 2 - lineGap / 2;
      lines.forEach((line, index) => off.fillText(line, width / 2, centerY + index * lineGap));
      const data = off.getImageData(0, 0, offscreen.width, offscreen.height).data; const step = mobile ? 3 : 3; const points: Array<[number, number]> = [];
      for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) if (data[(Math.floor(y) * offscreen.width + Math.floor(x)) * 4 + 3] > 140) points.push([x, y]);
      const limit = mobile ? 760 : 2100; const stride = Math.max(1, Math.ceil(points.length / limit));
      particles = points.filter((_, index) => index % stride === 0).map(([tx, ty], index) => {
        const angle = Math.random() * Math.PI * 2; const radius = Math.max(width, height) * (.16 + Math.random() * .48);
        return { tx, ty, x: width / 2 + Math.cos(angle) * 3, y: height / 2 + Math.sin(angle) * 3, sx: Math.cos(angle) * radius, sy: Math.sin(angle) * radius, drift: index * .13 + Math.random() * 8, size: Math.random() > .9 ? 2.5 : 1.65, alpha: .42 + Math.random() * .58 };
      });
    };
    const repel = (x: number, y: number) => {
      if (!pointer.enabled) return [x, y] as const;
      const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy); if (distance > 105 || distance === 0) return [x, y] as const;
      const force = Math.pow(1 - distance / 105, 2) * 20; return [x + (dx / distance) * force, y + (dy / distance) * force] as const;
    };
    const paintFinal = (now: number) => {
      context.clearRect(0, 0, width, height); context.fillStyle = "#76efff";
      particles.forEach(particle => { const float = reduced.matches ? 0 : Math.sin(now / 1000 + particle.drift) * .8; const [x, y] = repel(particle.tx + float, particle.ty + float); context.globalAlpha = particle.alpha; context.fillRect(x, y, particle.size, particle.size); }); context.globalAlpha = 1;
    };
    const loop = (now: number) => {
      if (destroyed || !visible) return;
      frame = requestAnimationFrame(loop); if (!started) started = now; const elapsed = now - started;
      if (reduced.matches || elapsed >= 3150) { paintFinal(now); return; }
      context.clearRect(0, 0, width, height); context.fillStyle = "#76efff";
      particles.forEach(particle => {
        const blast = Math.min(elapsed / 700, 1); const converge = Math.max(0, Math.min((elapsed - 700) / 2450, 1)); const eased = 1 - Math.pow(1 - converge, 3);
        let x = elapsed < 700 ? width / 2 + particle.sx * blast : width / 2 + particle.sx * (1 - eased) + (particle.tx - width / 2) * eased;
        let y = elapsed < 700 ? height / 2 + particle.sy * blast : height / 2 + particle.sy * (1 - eased) + (particle.ty - height / 2) * eased;
        [x, y] = repel(x, y); context.globalAlpha = particle.alpha * (elapsed < 700 ? .72 : 1); context.fillRect(x, y, particle.size, particle.size);
      }); context.globalAlpha = 1;
    };
    const replay = () => { started = 0; if (visible && !frame) frame = requestAnimationFrame(loop); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { replay(); } else if (frame) { cancelAnimationFrame(frame); frame = 0; } }, { threshold: .2 });
    const resize = () => { build(); if (reduced.matches) paintFinal(performance.now()); else replay(); };
    const movePointer = (event: PointerEvent) => { const rect = canvas.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; };
    const clearPointer = () => { pointer.x = -9999; pointer.y = -9999; };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas); observer.observe(canvas); canvas.addEventListener("click", replay); canvas.addEventListener("pointermove", movePointer); canvas.addEventListener("pointerleave", clearPointer); reduced.addEventListener("change", resize); resize();
    return () => { destroyed = true; if (frame) cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect(); canvas.removeEventListener("click", replay); canvas.removeEventListener("pointermove", movePointer); canvas.removeEventListener("pointerleave", clearPointer); reduced.removeEventListener("change", resize); };
  }, []);
  return <div className="an-name-particle-field"><canvas ref={canvasRef} aria-label="Particle field forming AKBAR NAWASUNDA. Tap to replay." /><span>PARTICLE NAME FIELD · TAP TO REPLAY</span></div>;
}
