import { useEffect, useRef } from "react";
import "./ParticleWordmark.css";

type Props = { text: string };

/** A deliberately small, progressive canvas signature. The semantic wordmark remains in the DOM. */
export function ParticleWordmark({ text }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const lowPower =
      (navigator.hardwareConcurrency || 2) <= 2 ||
      connection?.saveData ||
      window.innerWidth < 768;
    if (reduced || lowPower) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let visible = true;
    let pointerX = -999;
    let pointerY = -999;
    const points: {
      x: number;
      y: number;
      tx: number;
      ty: number;
      seed: number;
    }[] = [];

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points.length = 0;
      const count = Math.min(
        1500,
        Math.max(500, Math.floor((width * height) / 170))
      );
      const offscreen = document.createElement("canvas");
      offscreen.width = Math.ceil(width);
      offscreen.height = Math.ceil(height);
      const sample = offscreen.getContext("2d");
      if (!sample) return;
      const fontSize = Math.max(28, Math.min(112, width * 0.12));
      sample.fillStyle = "white";
      sample.font = `700 ${fontSize}px Clash Display, sans-serif`;
      sample.textAlign = "center";
      sample.textBaseline = "middle";
      sample.fillText(text.toUpperCase(), width / 2, height / 2);
      const pixels = sample.getImageData(
        0,
        0,
        offscreen.width,
        offscreen.height
      ).data;
      const targets: { x: number; y: number }[] = [];
      for (let y = 0; y < height; y += 3)
        for (let x = 0; x < width; x += 3) {
          if (pixels[(y * offscreen.width + x) * 4 + 3] > 120)
            targets.push({ x, y });
        }
      for (let i = 0; i < count; i++) {
        const target = targets[i % Math.max(1, targets.length)] || {
          x: Math.random() * width,
          y: Math.random() * height,
        };
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          tx: target.x,
          ty: target.y,
          seed: Math.random() * 10,
        });
      }
    };
    const draw = (time: number) => {
      if (!running || !visible) return;
      ctx.clearRect(0, 0, width, height);
      const breath = Math.sin(time * 0.0012) * 1.8;
      for (const point of points) {
        const dx = point.x - pointerX;
        const dy = point.y - pointerY;
        const distance = Math.hypot(dx, dy);
        const repel = distance > 0 && distance < 90 ? (90 - distance) / 90 : 0;
        const targetX =
          point.tx +
          Math.cos(time * 0.0007 + point.seed) * breath -
          (dx / Math.max(distance, 1)) * repel * 13;
        const targetY =
          point.ty +
          Math.sin(time * 0.0008 + point.seed) * breath -
          (dy / Math.max(distance, 1)) * repel * 13;
        point.x += (targetX - point.x) * 0.075;
        point.y += (targetY - point.y) * 0.075;
        ctx.fillStyle = `rgba(143,178,192,${0.28 + (point.seed % 5) / 12})`;
        ctx.fillRect(point.x, point.y, 1.35, 1.35);
      }
      frame = requestAnimationFrame(draw);
    };
    const start = () => {
      if (!running && visible) {
        running = true;
        frame = requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const observer = new IntersectionObserver(
      entries => {
        visible = entries[0]?.isIntersecting ?? false;
        visible ? start() : stop();
      },
      { rootMargin: "120px" }
    );
    observer.observe(host);
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };
    const onLeave = () => {
      pointerX = pointerY = -999;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    start();
    const onVisibility = () => {
      visible = !document.hidden;
      visible ? start() : stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [text]);

  return (
    <div ref={hostRef} className="an-particle-wordmark" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
