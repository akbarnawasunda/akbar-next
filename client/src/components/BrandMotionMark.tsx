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
        const color = blueParticle
          ? "#78a8df"
          : Math.random() > 0.9
            ? "#c7794c"
            : "#ece6dc";

        candidates.push({
          tx: targetX,
          ty: targetY,
          sx: centerX + Math.cos(angle) * introRadius,
          sy: centerY + Math.sin(angle) * introRadius,
          dx: Math.cos(angle) * dissolveRadius,
          dy: Math.sin(angle) * dissolveRadius,
          color,
          size:
            (mobile ? 1 : 1.15) +
            (Math.random() > 0.92 ? 0.85 : Math.random() * 0.35),
          alpha: 0.52 + Math.random() * 0.46,
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
      particles.forEach(particle => {
        context.globalAlpha = particle.alpha;
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
      return;
    }

    runningRef.current = true;
    setIsAnimating(true);
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
          opacity *= 0.18 + formation * 0.82;
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
          opacity *= 0.72 + reform * 0.28;
        }

        context.globalAlpha = opacity;
        context.fillStyle = particle.color;
        context.fillRect(x, y, particle.size, particle.size);
      });
      context.globalAlpha = 1;

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(draw);
      } else {
        frameRef.current = null;
        drawStatic();
        runningRef.current = false;
        setIsAnimating(false);
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
          frameRef.current = window.requestAnimationFrame(draw);
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
    };
  }, [assetReady, sequence]);

  const replay = () => {
    if (
      !runningRef.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setSequence(value => value + 1);
    }
  };

  return (
    <button
      className={`an-rmx-particle-hero${isAnimating ? " is-animating" : ""}`}
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
