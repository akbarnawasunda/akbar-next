import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; radius: number; phase: number; opacity: number };
type Ripple = { x: number; y: number; age: number; strength: number };

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
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const particles: Particle[] = Array.from({ length: coarsePointer.matches ? Math.min(18, getParticleCount()) : getParticleCount() }, (_, index) => ({
      x: Math.random(), y: Math.random(), vx: 0, vy: 0,
      radius: 0.6 + Math.random() * (index % 5 === 0 ? 2.1 : 1.15),
      phase: Math.random() * Math.PI * 2,
      opacity: 0.18 + Math.random() * 0.44,
    }));
    const ripples: Ripple[] = [];
    let width = 1;
    let height = 1;
    let visible = true;
    let frame = 0;
    let lastTime = 0;
    let pointer = { x: -1000, y: -1000, active: false };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const setPointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true };
    };
    const addRipple = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      setPointer(event);
      const bounds = canvas.getBoundingClientRect();
      ripples.push({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, age: 0, strength: coarsePointer.matches ? 0.7 : 1 });
      if (ripples.length > 7) ripples.shift();
    };
    const clearPointer = () => { pointer.active = false; };

    const draw = (time: number) => {
      if (!visible) { frame = 0; return; }
      const delta = Math.min(32, time - lastTime || 16);
      lastTime = time;
      context.clearRect(0, 0, width, height);
      const pulse = Math.sin(time * 0.00025);
      particles.forEach((particle) => {
        if (!reducedMotion.matches) {
          particle.vx *= 0.96;
          particle.vy *= 0.96;
          particle.vy -= 0.000012 * delta;
          if (pointer.active) {
            const px = pointer.x / width;
            const py = pointer.y / height;
            const dx = particle.x - px;
            const dy = particle.y - py;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 0.16 && distance > 0.001) {
              const force = (0.16 - distance) * 0.00032 * delta;
              particle.vx += (dx / distance) * force;
              particle.vy += (dy / distance) * force;
            }
          }
          particle.x += (particle.vx + Math.sin(time * 0.00018 + particle.phase) * 0.000025) * delta;
          particle.y += (particle.vy - 0.00006) * delta;
          if (particle.y < -0.04) particle.y = 1.04;
          if (particle.x < -0.04) particle.x = 1.04;
          if (particle.x > 1.04) particle.x = -0.04;
        }
        const x = particle.x * width;
        const y = particle.y * height;
        const alpha = particle.opacity * (0.84 + pulse * 0.16);
        context.beginPath();
        context.fillStyle = `rgba(207, 196, 255, ${alpha})`;
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fill();
        if (particle.radius > 1.7) {
          context.beginPath();
          context.strokeStyle = `rgba(216, 255, 101, ${alpha * 0.42})`;
          context.lineWidth = 0.65;
          context.arc(x, y, particle.radius * 3.4, 0, Math.PI * 2);
          context.stroke();
        }
      });
      if (!reducedMotion.matches) {
        ripples.splice(0, ripples.length, ...ripples.filter((ripple) => ripple.age < 1));
        ripples.forEach((ripple) => {
          ripple.age += delta / 1250;
          const radius = 20 + ripple.age * (coarsePointer.matches ? 110 : 170);
          const alpha = (1 - ripple.age) * 0.28 * ripple.strength;
          context.beginPath();
          context.strokeStyle = `rgba(216, 255, 101, ${alpha})`;
          context.lineWidth = 1;
          context.ellipse(ripple.x, ripple.y, radius * 1.65, radius * 0.28, 0, 0, Math.PI * 2);
          context.stroke();
          context.beginPath();
          context.strokeStyle = `rgba(207, 196, 255, ${alpha * 0.8})`;
          context.ellipse(ripple.x, ripple.y, radius * 1.1, radius * 0.18, 0, 0, Math.PI * 2);
          context.stroke();
        });
      }
      frame = window.requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !frame) frame = window.requestAnimationFrame(draw);
    }, { threshold: 0.01 });
    observer.observe(canvas);
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", setPointer, { passive: true });
    window.addEventListener("pointerdown", addRipple, { passive: true });
    window.addEventListener("pointerleave", clearPointer, { passive: true });
    frame = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", setPointer);
      window.removeEventListener("pointerdown", addRipple);
      window.removeEventListener("pointerleave", clearPointer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-ambient-canvas" aria-hidden="true" />;
}
