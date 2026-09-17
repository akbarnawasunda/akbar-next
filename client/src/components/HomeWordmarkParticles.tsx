import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; radius: number; phase: number; opacity: number; target: { x: number; y: number } };

export default function HomeWordmarkParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const source = document.createElement("canvas");
    const sourceCtx = source.getContext("2d", { willReadFrequently: true });
    if (!sourceCtx) return;
    const width = 420;
    const height = 112;
    source.width = width;
    source.height = height;
    sourceCtx.fillStyle = "#fff";
    sourceCtx.font = "700 34px Arial, sans-serif";
    sourceCtx.textAlign = "center";
    sourceCtx.textBaseline = "middle";
    sourceCtx.fillText("AKBAR", width / 2, 35);
    sourceCtx.font = "700 22px Arial, sans-serif";
    sourceCtx.fillText("NAWASUNDA", width / 2, 79);
    const pixels = sourceCtx.getImageData(0, 0, width, height).data;
    const step = coarse ? 4 : 3;
    const targets: { x: number; y: number }[] = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (pixels[(y * width + x) * 4 + 3] > 120) targets.push({ x, y });
      }
    }
    const particles: Particle[] = targets.map((target, index) => ({
      x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0,
      radius: 0.7 + (index % 5 === 0 ? 0.9 : 0), phase: index * 0.37, opacity: 1, target,
    }));
    let frame = 0;
    let lastPaint = 0;
    let pointer = { x: -1000, y: -1000, active: false };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(bounds.width * dpr));
      canvas.height = Math.max(1, Math.floor(bounds.height * dpr));
      ctx.setTransform(dpr * bounds.width / width, 0, 0, dpr * bounds.height / height, 0, 0);
    };
    const move = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer = { x: (event.clientX - bounds.left) * width / bounds.width, y: (event.clientY - bounds.top) * height / bounds.height, active: true };
    };
    const leave = () => { pointer.active = false; };
    const draw = (time: number) => {
      const frameBudget = coarse ? 1000 / 30 : 1000 / 45;
      if (time - lastPaint < frameBudget) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastPaint = time;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        const dx = particle.target.x - particle.x;
        const dy = particle.target.y - particle.y;
        if (!reducedMotion.matches) {
          particle.vx = (particle.vx + dx * 0.012) * 0.88;
          particle.vy = (particle.vy + dy * 0.012) * 0.88;
          if (pointer.active) {
            const px = particle.x - pointer.x;
            const py = particle.y - pointer.y;
            const distance = Math.max(1, Math.hypot(px, py));
            if (distance < 58) {
              const force = (58 - distance) * 0.012;
              particle.vx += px / distance * force;
              particle.vy += py / distance * force;
            }
          }
          particle.x += particle.vx + Math.sin(time * 0.002 + particle.phase) * 0.08;
          particle.y += particle.vy + Math.cos(time * 0.0017 + particle.phase) * 0.05;
        } else {
          particle.x += dx * 0.16;
          particle.y += dy * 0.16;
        }
        const shimmer = 0.72 + Math.sin(time * 0.003 + index) * 0.25;
        ctx.fillStyle = index % 11 === 0 ? `rgba(216,255,101,${shimmer})` : `rgba(230,224,255,${shimmer})`;
        ctx.fillRect(particle.x, particle.y, coarse ? 2.1 : 1.7, coarse ? 2.1 : 1.7);
      });
      frame = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    canvas.addEventListener("pointermove", move, { passive: true });
    canvas.addEventListener("pointerleave", leave, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="home-wordmark-particles" role="img" aria-label="Akbar Nawasunda">
      <span className="home-wordmark-fallback" aria-hidden="true">AKBAR<br />NAWASUNDA</span>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
