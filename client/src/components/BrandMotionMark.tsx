import { useEffect, useRef, useState } from "react";
import "./BrandMotionMark.css";

type Particle = {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  alpha: number;
  phase: number;
};

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const FALLBACK_RMX_MARK = "/assets/akbar-rmx-mark-fallback.jpg";

export function BrandMotionMark({ src }: { src: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const visibleRef = useRef(true);
  const [assetReady, setAssetReady] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [sequence, setSequence] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setAssetReady(false);
  }, [src]);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setAssetReady(true);
  }, [imageSrc]);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!assetReady || !image || !canvas || !image.naturalWidth) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    visibleRef.current = true;
    const mobile = window.matchMedia("(max-width: 820px)").matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const sample = document.createElement("canvas");
    sample.width = canvas.width;
    sample.height = canvas.height;
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) return;

    sampleContext.drawImage(image, 0, 0, sample.width, sample.height);
    let imageData: ImageData;
    try {
      imageData = sampleContext.getImageData(0, 0, sample.width, sample.height);
    } catch {
      return;
    }

    const particleCap = mobile ? 1200 : 2400;
    const step = mobile ? 4 : 5;
    const candidates: Particle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < sample.height; y += step * pixelRatio) {
      for (let x = 0; x < sample.width; x += step * pixelRatio) {
        const index = (Math.floor(y) * sample.width + Math.floor(x)) * 4;
        const red = imageData.data[index];
        const green = imageData.data[index + 1];
        const blue = imageData.data[index + 2];
        const alpha = imageData.data[index + 3];
        const brightness = red * 0.2126 + green * 0.7152 + blue * 0.0722;
        const isInk = brightness < 146;
        const isBlueAccent = blue > red + 24 && blue > green + 10 && blue > 82;
        if (alpha < 140 || (!isInk && !isBlueAccent)) continue;

        const targetX = x / pixelRatio;
        const targetY = y / pixelRatio;
        const angle = Math.random() * Math.PI * 2;
        const introRadius =
          Math.max(width, height) * (0.18 + Math.random() * 0.28);
        const dissolveRadius =
          Math.max(width, height) * (0.58 + Math.random() * 0.46);
        const blueParticle = isBlueAccent && blue > green + 8;
        const colorRoll = Math.random();
        const color = blueParticle
          ? "#9bc9ff"
          : colorRoll > 0.88
            ? "#d8ff65"
            : colorRoll > 0.76
              ? "#f0a06d"
              : "#f4ead8";

        candidates.push({
          tx: targetX,
          ty: targetY,
          sx: centerX + Math.cos(angle) * introRadius,
          sy: centerY + Math.sin(angle) * introRadius,
          dx: Math.cos(angle) * dissolveRadius,
          dy: Math.sin(angle) * dissolveRadius,
          color,
          size:
            (mobile ? 1.15 : 1.3) +
            (Math.random() > 0.86 ? 0.9 : Math.random() * 0.45),
          alpha: 0.72 + Math.random() * 0.28,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    const stride = Math.max(1, Math.ceil(candidates.length / particleCap));
    const particles = candidates
      .filter((_, index) => index % stride === 0)
      .slice(0, particleCap);
    canvas.dataset.particleCount = String(particles.length);
    canvas.dataset.particleMode = mobile ? "mobile" : "desktop";

    const drawStatic = () => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      particles.forEach(particle => {
        context.globalAlpha = Math.min(1, particle.alpha * 0.16);
        context.fillStyle = particle.color;
        context.fillRect(
          particle.tx - 0.7,
          particle.ty - 0.7,
          particle.size + 1.4,
          particle.size + 1.4
        );
      });
      context.globalCompositeOperation = "source-over";
      particles.forEach(particle => {
        context.globalAlpha = Math.min(1, particle.alpha * 0.96);
        context.fillStyle = particle.color;
        context.fillRect(
          particle.tx,
          particle.ty,
          particle.size,
          particle.size
        );
      });
      context.globalAlpha = 1;
    };

    if (!particles.length || reducedMotion) {
      drawStatic();
      setIsIdle(false);
      return;
    }

    runningRef.current = true;
    setIsAnimating(true);
    setIsIdle(false);
    const initialFormation = sequence === 0;
    const duration = initialFormation
      ? mobile
        ? 1180
        : 1420
      : mobile
        ? 1320
        : 1540;
    let startedAt = 0;
    let pausedAt: number | null = null;
    let pausedDuration = 0;

    let idleStartedAt: number | null = null;
    let idleActive = false;

    const drawIdle = (time: number) => {
      if (idleStartedAt === null) idleStartedAt = time;
      const idleTime = (time - idleStartedAt) * 0.001;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      particles.forEach(particle => {
        const driftX =
          Math.sin(idleTime * 0.78 + particle.phase) * (mobile ? 2.8 : 4.8) +
          Math.cos(idleTime * 0.38 + particle.ty * 0.02) * (mobile ? 1.1 : 1.9);
        const driftY =
          Math.cos(idleTime * 0.64 + particle.phase * 1.24) *
            (mobile ? 2.4 : 4.1) +
          Math.sin(idleTime * 0.31 + particle.tx * 0.018) *
            (mobile ? 0.9 : 1.7);
        const pulse =
          0.84 + (Math.sin(idleTime * 1.6 + particle.phase) + 1) * 0.13;
        context.globalAlpha = Math.min(1, particle.alpha * pulse * 0.2);
        context.fillStyle = particle.color;
        context.fillRect(
          particle.tx + driftX - 0.8,
          particle.ty + driftY - 0.8,
          particle.size + 1.6,
          particle.size + 1.6
        );
      });
      context.globalCompositeOperation = "source-over";
      particles.forEach(particle => {
        const driftX =
          Math.sin(idleTime * 0.78 + particle.phase) * (mobile ? 2.8 : 4.8) +
          Math.cos(idleTime * 0.38 + particle.ty * 0.02) * (mobile ? 1.1 : 1.9);
        const driftY =
          Math.cos(idleTime * 0.64 + particle.phase * 1.24) *
            (mobile ? 2.4 : 4.1) +
          Math.sin(idleTime * 0.31 + particle.tx * 0.018) *
            (mobile ? 0.9 : 1.7);
        const pulse =
          0.84 + (Math.sin(idleTime * 1.6 + particle.phase) + 1) * 0.13;
        context.globalAlpha = Math.min(1, particle.alpha * pulse);
        context.fillStyle = particle.color;
        context.fillRect(
          particle.tx + driftX,
          particle.ty + driftY,
          particle.size,
          particle.size
        );
      });
      context.globalAlpha = 1;
      frameRef.current = visibleRef.current
        ? window.requestAnimationFrame(drawIdle)
        : null;
    };

    const draw = (time: number) => {
      if (!visibleRef.current) {
        frameRef.current = null;
        return;
      }
      if (!startedAt) startedAt = time;
      if (pausedAt !== null) {
        pausedDuration += time - pausedAt;
        pausedAt = null;
      }
      const progress = Math.min(
        1,
        Math.max(0, (time - startedAt - pausedDuration) / duration)
      );
      context.clearRect(0, 0, width, height);

      particles.forEach(particle => {
        let x = particle.tx;
        let y = particle.ty;
        let opacity = particle.alpha;

        if (initialFormation) {
          const formation = easeOutCubic(progress);
          x = particle.sx + (particle.tx - particle.sx) * formation;
          y = particle.sy + (particle.ty - particle.sy) * formation;
          opacity *= 0.22 + formation * 0.78;
        } else if (progress < 0.42) {
          const dissolve = easeOutCubic(progress / 0.42);
          x = particle.tx + particle.dx * dissolve;
          y = particle.ty + particle.dy * dissolve;
          opacity *= 1 - dissolve * 0.28;
        } else {
          const reform = easeOutCubic((progress - 0.42) / 0.58);
          x =
            particle.tx +
            particle.dx +
            (particle.tx - (particle.tx + particle.dx)) * reform;
          y =
            particle.ty +
            particle.dy +
            (particle.ty - (particle.ty + particle.dy)) * reform;
          opacity *= 0.78 + reform * 0.22;
        }

        context.globalAlpha = Math.min(1, opacity * 0.2);
        context.globalCompositeOperation = "lighter";
        context.fillStyle = particle.color;
        context.fillRect(
          x - 0.7,
          y - 0.7,
          particle.size + 1.4,
          particle.size + 1.4
        );
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = Math.min(1, opacity);
        context.fillRect(x, y, particle.size, particle.size);
      });
      context.globalAlpha = 1;

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(draw);
      } else {
        idleActive = true;
        setIsAnimating(false);
        setIsIdle(true);
        drawIdle(time);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = Boolean(entry?.isIntersecting);
        visibleRef.current = isVisible;
        if (!isVisible) {
          if (pausedAt === null) pausedAt = performance.now();
          if (frameRef.current !== null) {
            window.cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
          }
        } else if (runningRef.current && frameRef.current === null) {
          frameRef.current = window.requestAnimationFrame(
            idleActive ? drawIdle : draw
          );
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);
    frameRef.current = window.requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null)
        window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      runningRef.current = false;
      setIsAnimating(false);
      setIsIdle(false);
    };
  }, [assetReady, sequence]);

  const replay = () => {
    if (
      !isAnimating &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsIdle(false);
      setSequence(value => value + 1);
    }
  };

  return (
    <button
      className={`an-rmx-particle-hero${isAnimating ? " is-animating" : ""}${isIdle ? " is-idle" : ""}`}
      type="button"
      onClick={replay}
      aria-label="Mainkan ulang particle logo Akbar Nawasunda"
    >
      <img
        ref={imageRef}
        className="an-rmx-particle-source"
        crossOrigin="anonymous"
        src={imageSrc}
        alt=""
        onLoad={() => setAssetReady(true)}
        onError={() => {
          if (imageSrc !== FALLBACK_RMX_MARK) setImageSrc(FALLBACK_RMX_MARK);
        }}
      />

      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="an-rmx-particle-access">
        Ketuk untuk memecah dan membentuk ulang logo partikel.
      </span>
    </button>
  );
}
