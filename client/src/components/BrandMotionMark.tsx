import { useEffect, useRef, useState } from "react";
import "./BrandMotionMark.css";

export function BrandMotionMark({ src }: { src: string }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isAnimating || !imageRef.current || !canvasRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsAnimating(false);
      return;
    }

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const rect = image.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const ctx = canvas.getContext("2d");
    if (!ctx || !image.naturalWidth) {
      setIsAnimating(false);
      return;
    }

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sample = document.createElement("canvas");
    sample.width = Math.round(width * dpr);
    sample.height = Math.round(height * dpr);
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) {
      setIsAnimating(false);
      return;
    }
    sampleContext.drawImage(image, 0, 0, sample.width, sample.height);

    type Particle = { x: number; y: number; dx: number; dy: number; color: string; size: number };
    let pixels: ImageData;
    try {
      pixels = sampleContext.getImageData(0, 0, sample.width, sample.height);
    } catch {
      setIsAnimating(false);
      return;
    }

    const mobile = window.matchMedia("(max-width: 820px)").matches;
    const particleCap = mobile ? 300 : 520;
    const candidates: Particle[] = [];
    const step = mobile ? 5 : 4;
    for (let y = 0; y < sample.height; y += step * dpr) {
      for (let x = 0; x < sample.width; x += step * dpr) {
        const index = (Math.floor(y) * sample.width + Math.floor(x)) * 4;
        const red = pixels.data[index];
        const green = pixels.data[index + 1];
        const blue = pixels.data[index + 2];
        const alpha = pixels.data[index + 3];
        const brightness = (red * 0.2126) + (green * 0.7152) + (blue * 0.0722);
        if (alpha < 120 || brightness > 224) continue;
        const targetX = x / dpr;
        const targetY = y / dpr;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height) * (.28 + Math.random() * .58);
        candidates.push({ x: targetX, y: targetY, dx: Math.cos(angle) * distance, dy: Math.sin(angle) * distance, color: `rgb(${red}, ${green}, ${blue})`, size: mobile ? 1.35 : 1.6 });
      }
    }
    const stride = Math.max(1, Math.ceil(candidates.length / particleCap));
    const particles = candidates.filter((_, index) => index % stride === 0).slice(0, particleCap);
    if (!particles.length) {
      setIsAnimating(false);
      return;
    }
    canvas.dataset.particleCount = String(particles.length);
    canvas.dataset.particleMode = mobile ? "mobile" : "desktop";

    let frame = 0;
    let start = 0;
    const duration = mobile ? 1120 : 1260;
    const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);
    const draw = (time: number) => {
      if (!start) start = time;
      const progress = Math.min(1, (time - start) / duration);
      const spread = progress < .43 ? easeOut(progress / .43) : 1 - easeOut((progress - .43) / .57);
      ctx.clearRect(0, 0, width, height);
      particles.forEach(particle => {
        ctx.globalAlpha = .92 - (spread * .22);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x + (particle.dx * spread), particle.y + (particle.dy * spread), particle.size, particle.size);
      });
      ctx.globalAlpha = 1;
      if (progress < 1) frame = window.requestAnimationFrame(draw);
      else setIsAnimating(false);
    };
    frame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame);
  }, [isAnimating]);

  return <button className={`an-rmx-mark${isAnimating ? " is-animating" : ""}`} type="button" onClick={() => setIsAnimating(true)} aria-label="Putar particle logo Akbar Nawasunda">
    <span className="an-rmx-mark-art"><img ref={imageRef} crossOrigin="anonymous" src={src} alt="Akbar Nawasunda RMX mark" /><canvas ref={canvasRef} aria-hidden="true" /></span>
    <span className="an-rmx-mark-caption"><span>RMX / PARTICLE</span><small>TEKAN UNTUK PECah</small></span>
  </button>;
}
