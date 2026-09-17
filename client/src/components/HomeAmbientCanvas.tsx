import { useEffect, useRef } from "react";

function getParticleCount() {
  if (typeof navigator === "undefined") return 26;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (memory <= 2 || cores <= 2) return 14;
  if (memory <= 4 || cores <= 4) return 22;
  return 34;
}

export default function HomeAmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isCoarse = window.matchMedia("(pointer: coarse)");
    const particles = Array.from({ length: isCoarse.matches ? Math.min(18, getParticleCount()) : getParticleCount() }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.6 + Math.random() * (index % 5 === 0 ? 2.1 : 1.15),
      drift: 0.00008 + Math.random() * 0.00018,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.18 + Math.random() * 0.44,
    }));
    let frame = 0;
    let width = 0;
    let height = 0;
    let visible = true;
    let lastTime = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      if (!visible) {
        frame = 0;
        return;
      }
      const delta = Math.min(32, time - lastTime || 16);
      lastTime = time;
      context.clearRect(0, 0, width, height);
      const pulse = Math.sin(time * 0.00025);
      particles.forEach((particle) => {
        if (!reducedMotion.matches) {
          particle.y -= particle.drift * delta;
          particle.x += Math.sin(time * 0.00018 + particle.phase) * 0.000025 * delta;
          if (particle.y < -0.04) particle.y = 1.04;
          if (particle.x < -0.04) particle.x = 1.04;
          if (particle.x > 1.04) particle.x = -0.04;
        }
        const x = particle.x * width;
        const y = particle.y * height;
        const alpha = particle.opacity * (0.84 + pulse * 0.16);
        context.beginPath();
        context.fillStyle = `rgba(185, 235, 229, ${alpha})`;
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fill();
        if (particle.radius > 1.7) {
          context.beginPath();
          context.strokeStyle = `rgba(231, 196, 109, ${alpha * 0.42})`;
          context.lineWidth = 0.65;
          context.arc(x, y, particle.radius * 3.4, 0, Math.PI * 2);
          context.stroke();
        }
      });
      frame = window.requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !frame) frame = window.requestAnimationFrame(draw);
    }, { threshold: 0.01 });
    observer.observe(canvas);
    resize();
    window.addEventListener("resize", resize, { passive: true });
    frame = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-ambient-canvas" aria-hidden="true" />;
}
