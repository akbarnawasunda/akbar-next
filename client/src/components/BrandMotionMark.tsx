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
  mobility: number;
  spark: boolean;
  introAngle: number;
  introRadius: number;
  spin: number;
};

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInOutCubic = (value: number) =>
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const roundHalf = (value: number) => Math.round(value * 2) / 2;
const FALLBACK_RMX_MARK = "/assets/akbar-rmx-mark-fallback.jpg";

export function BrandMotionMark({ src, locale = "id" }: { src: string; locale?: "id" | "en" }) {
  const replayLabel = locale === "en" ? "Replay the Akbar Nawasunda particle logo" : "Mainkan ulang particle logo Akbar Nawasunda";
  const accessText = locale === "en" ? "Tap to scatter and reform the particle logo." : "Ketuk untuk memecah dan membentuk ulang logo partikel.";
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
    const connection = (navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }).connection;
    const constrainedDevice = mobile && (
      connection?.saveData === true ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g" ||
      (navigator.hardwareConcurrency ?? 8) <= 4
    );
    const pixelRatio = Math.min(window.devicePixelRatio || 1, constrainedDevice ? 1.25 : mobile ? 1.5 : 2);
    const bounds = canvas.getBoundingClientRect();
    const hostBounds = canvas.parentElement?.getBoundingClientRect() ?? bounds;
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const hostWidth = Math.max(1, Math.round(hostBounds.width));
    const hostHeight = Math.max(1, Math.round(hostBounds.height));
    const paddingX = Math.max(0, (width - hostWidth) / 2);
    const paddingY = Math.max(0, (height - hostHeight) / 2);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = false;

    const sample = document.createElement("canvas");
    sample.width = canvas.width;
    sample.height = canvas.height;
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) return;

    sampleContext.imageSmoothingEnabled = true;
    sampleContext.clearRect(0, 0, sample.width, sample.height);
    sampleContext.drawImage(
      image,
      paddingX * pixelRatio,
      paddingY * pixelRatio,
      hostWidth * pixelRatio,
      hostHeight * pixelRatio
    );

    let imageData: ImageData;
    try {
      imageData = sampleContext.getImageData(0, 0, sample.width, sample.height);
    } catch {
      return;
    }

    const particleCap = constrainedDevice ? 900 : mobile ? 1400 : 3000;
    const step = constrainedDevice ? 4.35 : mobile ? 4.0 : 4.2;
    const candidates: Particle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const stageRadius = Math.max(hostWidth, hostHeight);

    for (let y = paddingY * pixelRatio; y < (paddingY + hostHeight) * pixelRatio; y += step * pixelRatio) {
      for (let x = paddingX * pixelRatio; x < (paddingX + hostWidth) * pixelRatio; x += step * pixelRatio) {
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
        const introRadius = stageRadius * (0.18 + Math.random() * 0.25);
        const spreadRadius = stageRadius * (0.48 + Math.random() * 0.52);
        const blueParticle = isBlueAccent && blue > green + 8;
        const colorRoll = Math.random();
        const color = blueParticle
          ? colorRoll > 0.42
            ? "#74b9ff"
            : "#9c7cff"
          : colorRoll > 0.78
            ? "#d8ff65"
            : colorRoll > 0.57
              ? "#ff9f6e"
              : colorRoll > 0.32
                ? "#67e8f9"
                : "#f7e6c6";

        candidates.push({
          tx: targetX,
          ty: targetY,
          sx: centerX + Math.cos(angle) * introRadius,
          sy: centerY + Math.sin(angle) * introRadius,
          dx: Math.cos(angle) * spreadRadius,
          dy: Math.sin(angle) * spreadRadius,
          color,
          size:
            (mobile ? 1.25 : 1.4) +
            (Math.random() > 0.8 ? 1.1 : Math.random() * 0.62),
          alpha: 0.9 + Math.random() * 0.1,
          phase: Math.random() * Math.PI * 2,
          mobility: 0.22 + Math.random() * 0.46,
          spark: Math.random() > 0.82,
          introAngle: angle + (Math.random() - 0.5) * 0.8,
          introRadius,
          spin: 0.75 + Math.random() * 0.75,
        });
      }
    }

    const stride = Math.max(1, Math.ceil(candidates.length / particleCap));
    const particles = candidates
      .filter((_, index) => index % stride === 0)
      .slice(0, particleCap);
    canvas.dataset.particleCount = String(particles.length);
    canvas.dataset.particleMode = mobile ? "mobile" : "desktop";
    canvas.dataset.stage = "overscan-iris";

    const getIdleOffset = (
      particle: Particle,
      idleTime: number,
      intensity = 1
    ) => {
      const mobility =
        particle.mobility * (particle.spark ? 1.52 : 0.68) * intensity;
      return {
        x:
          (Math.sin(idleTime * 0.62 + particle.phase) * (mobile ? 3.4 : 5.8) +
            Math.cos(idleTime * 0.29 + particle.ty * 0.02) *
              (mobile ? 1.35 : 2.2) +
            Math.sin(idleTime * 0.16 + particle.phase * 1.7) *
              (mobile ? 0.8 : 1.35)) *
          mobility,
        y:
          (Math.cos(idleTime * 0.53 + particle.phase * 1.24) *
            (mobile ? 3 : 5) +
            Math.sin(idleTime * 0.24 + particle.tx * 0.018) *
              (mobile ? 1.1 : 2) +
            Math.cos(idleTime * 0.13 + particle.phase * 0.7) *
              (mobile ? 0.7 : 1.2)) *
          mobility,
      };
    };

    const drawIrisReactor = (time: number, energy = 1) => {
      const seconds = time * 0.001;
      const radius = Math.min(hostWidth, hostHeight) * (mobile ? 0.24 : 0.22);
      const spokeCount = constrainedDevice ? 8 : mobile ? 12 : 16;
      const palette = ["#67e8f9", "#d8ff65", "#ff9f6e", "#9c7cff"];

      context.save();
      context.translate(centerX, centerY);
      context.rotate(seconds * 0.18);
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";

      for (let ring = 0; ring < 2; ring += 1) {
        context.beginPath();
        context.arc(
          0,
          0,
          radius * (0.76 + ring * 0.24) + Math.sin(seconds * 0.9 + ring) * 1.5,
          0,
          Math.PI * 2
        );
        context.setLineDash(ring === 0 ? [radius * 0.12, radius * 0.2] : [radius * 0.04, radius * 0.14]);
        context.lineDashOffset = -seconds * (ring === 0 ? 18 : 28);
        context.strokeStyle = palette[ring + 1];
        context.globalAlpha = (0.12 + energy * 0.2) * (ring === 0 ? 1 : 0.72);
        context.lineWidth = mobile ? 0.7 : 0.95;
        context.stroke();
      }

      for (let index = 0; index < spokeCount; index += 1) {
        const angle = (index / spokeCount) * Math.PI * 2;
        const pulse = 0.86 + Math.sin(seconds * 1.35 + index * 0.7) * 0.1;
        const inner = radius * 0.78;
        const outer = radius * (1.08 + pulse * 0.12);
        context.beginPath();
        context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        context.strokeStyle = palette[index % palette.length];
        context.globalAlpha = (0.09 + energy * 0.17) * pulse;
        context.lineWidth = mobile ? 0.55 : 0.8;
        context.stroke();
      }

      context.beginPath();
      context.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
      context.fillStyle = "rgba(4, 10, 15, 0.42)";
      context.globalAlpha = 0.7 * energy;
      context.fill();
      context.restore();
    };

    const drawOrbitingLines = (time: number, energy = 1) => {
      const seconds = time * 0.001;
      const orbitLines = [
        {
          rx: hostWidth * 0.58,
          ry: hostHeight * 0.22,
          rotation: -0.26,
          color: "#67e8f9",
          speed: 120,
          offset: 0.1,
        },
        {
          rx: hostWidth * 0.48,
          ry: hostHeight * 0.39,
          rotation: 0.63,
          color: "#d8ff65",
          speed: -92,
          offset: 2.2,
        },
        {
          rx: hostWidth * 0.35,
          ry: hostHeight * 0.54,
          rotation: -0.84,
          color: "#ff9f6e",
          speed: 75,
          offset: 4.4,
        },
      ].slice(0, constrainedDevice ? 1 : mobile ? 2 : 3);

      context.save();
      context.globalCompositeOperation = "lighter";
      context.translate(centerX, centerY);
      orbitLines.forEach((orbit, index) => {
        context.save();
        context.rotate(
          orbit.rotation + Math.sin(seconds * 0.38 + orbit.offset) * 0.035
        );
        context.beginPath();
        context.ellipse(
          0,
          0,
          orbit.rx,
          orbit.ry,
          0,
          orbit.offset + seconds * 0.12,
          orbit.offset + Math.PI * (1.16 + index * 0.12) + seconds * 0.12
        );
        context.setLineDash([hostWidth * 0.08, hostWidth * 0.18]);
        context.lineDashOffset = -seconds * orbit.speed;
        context.strokeStyle = orbit.color;
        context.globalAlpha = (0.34 + energy * 0.16) * (index === 1 ? 0.86 : 1);
        context.lineWidth = mobile ? 0.85 : 1.15;
        context.stroke();

        const markerAngle = orbit.offset + seconds * (orbit.speed > 0 ? 0.82 : -0.68);
        const markerX = Math.cos(markerAngle) * orbit.rx;
        const markerY = Math.sin(markerAngle) * orbit.ry;
        context.beginPath();
        context.arc(markerX, markerY, mobile ? 1.35 : 1.8, 0, Math.PI * 2);
        context.shadowColor = orbit.color;
        context.shadowBlur = mobile ? 5 : 8;
        context.fillStyle = orbit.color;
        context.globalAlpha = 0.76 * energy;
        context.fill();
        context.shadowBlur = 0;
        context.restore();
      });
      context.restore();
    };

    const particleX = new Float32Array(particles.length);
    const particleY = new Float32Array(particles.length);
    const particleOpacity = new Float32Array(particles.length);
    const drawParticles = (
      getPosition: (particle: Particle) => { x: number; y: number; opacity: number }
    ) => {
      particles.forEach((particle, index) => {
        const position = getPosition(particle);
        particleX[index] = position.x;
        particleY[index] = position.y;
        particleOpacity[index] = position.opacity;
      });

      context.globalCompositeOperation = "lighter";
      particles.forEach((particle, index) => {
        context.globalAlpha = Math.min(1, particleOpacity[index] * 0.3);
        context.fillStyle = particle.color;
        context.fillRect(
          roundHalf(particleX[index] - 0.8),
          roundHalf(particleY[index] - 0.8),
          particle.size + 1.8,
          particle.size + 1.8
        );
      });
      context.globalCompositeOperation = "source-over";
      particles.forEach((particle, index) => {
        context.globalAlpha = Math.min(1, particleOpacity[index]);
        context.fillStyle = particle.color;
        context.fillRect(
          roundHalf(particleX[index]),
          roundHalf(particleY[index]),
          particle.size,
          particle.size
        );
      });
      context.globalAlpha = 1;
    };

    const drawSignalSparks = (time: number, energy = 1) => {
      const seconds = time * 0.001;
      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      context.lineWidth = mobile ? 0.55 : 0.78;

      particles.forEach((particle, index) => {
        if (!particle.spark || particleOpacity[index] < 0.45) return;
        const twinkle = (Math.sin(seconds * 2.1 + particle.phase) + 1) / 2;
        if (twinkle < 0.82) return;

        const length = (mobile ? 2.4 : 4.6) * (twinkle - 0.78) * 4;
        const angle = particle.phase + seconds * 0.22;
        const x = particleX[index];
        const y = particleY[index];
        context.globalAlpha = Math.min(0.44, energy * (twinkle - 0.8) * 1.8);
        context.strokeStyle = particle.color;
        context.beginPath();
        context.moveTo(x - Math.cos(angle) * length, y - Math.sin(angle) * length);
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        context.stroke();
      });

      context.restore();
      context.globalAlpha = 1;
    };

    const drawStatic = () => {
      context.clearRect(0, 0, width, height);
      drawIrisReactor(0, 0.38);
      drawOrbitingLines(0, 0.58);
      drawParticles(particle => ({ x: particle.tx, y: particle.ty, opacity: particle.alpha }));
      drawSignalSparks(0, 0.42);
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
    const duration = initialFormation ? (mobile ? 3300 : 3600) : mobile ? 3500 : 3800;
    let startedAt = 0;
    let lastFrameAt = 0;
    const minFrameInterval = constrainedDevice ? 1000 / 30 : 0;
    let pausedAt: number | null = null;
    let pausedDuration = 0;
    let idleStartedAt: number | null = null;
    let idleActive = false;

    const getAnimatedPosition = (particle: Particle, progress: number, time: number) => {
      if (initialFormation) {
        const orbitProgress = clamp(progress / 0.48);
        const orbitAngle =
          particle.introAngle +
          orbitProgress * Math.PI * 2.1 * particle.spin +
          Math.sin(time * 0.0012 + particle.phase) * 0.08;
        const orbitRadius = particle.introRadius * (1 - orbitProgress * 0.16);
        const orbitX = centerX + Math.cos(orbitAngle) * orbitRadius;
        const orbitY = centerY + Math.sin(orbitAngle) * orbitRadius;
        const mergeProgress = easeInOutCubic(clamp((progress - 0.23) / 0.77));
        return {
          x: orbitX + (particle.tx - orbitX) * mergeProgress,
          y: orbitY + (particle.ty - orbitY) * mergeProgress,
          opacity: particle.alpha * (0.32 + mergeProgress * 0.68),
        };
      }

      const scatterProgress = clamp(progress / 0.54);
      const scatterEase = easeOutCubic(scatterProgress);
      const vortexRotation =
        Math.sin(scatterProgress * Math.PI) * particle.spin * 0.9;
      const scatterX = particle.tx + particle.dx * scatterEase;
      const scatterY = particle.ty + particle.dy * scatterEase;
      const rotatedX =
        centerX +
        (scatterX - centerX) * Math.cos(vortexRotation) -
        (scatterY - centerY) * Math.sin(vortexRotation);
      const rotatedY =
        centerY +
        (scatterX - centerX) * Math.sin(vortexRotation) +
        (scatterY - centerY) * Math.cos(vortexRotation);
      const reformProgress = easeInOutCubic(clamp((progress - 0.54) / 0.46));
      return {
        x: rotatedX + (particle.tx - rotatedX) * reformProgress,
        y: rotatedY + (particle.ty - rotatedY) * reformProgress,
        opacity:
          particle.alpha *
          (progress < 0.54 ? 1 - scatterProgress * 0.34 : 0.66 + reformProgress * 0.34),
      };
    };

    const drawIdle = (time: number) => {
      if (minFrameInterval && lastFrameAt && time - lastFrameAt < minFrameInterval) {
        frameRef.current = visibleRef.current
          ? window.requestAnimationFrame(drawIdle)
          : null;
        return;
      }
      lastFrameAt = time;
      if (idleStartedAt === null) idleStartedAt = time;
      const idleTime = (time - idleStartedAt) * 0.001;
      context.clearRect(0, 0, width, height);
      drawIrisReactor(time, 0.48);
      drawOrbitingLines(time, 0.72);
      drawParticles(particle => {
        const offset = getIdleOffset(particle, idleTime, 1.12);
        const pulse =
          0.78 + (Math.sin(idleTime * 1.45 + particle.phase) + 1) * 0.16;
        return {
          x: particle.tx + offset.x,
          y: particle.ty + offset.y,
          opacity: particle.alpha * pulse,
        };
      });
      drawSignalSparks(time, 0.78);
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
      if (minFrameInterval && lastFrameAt && time - lastFrameAt < minFrameInterval) {
        frameRef.current = window.requestAnimationFrame(draw);
        return;
      }
      lastFrameAt = time;
      if (pausedAt !== null) {
        pausedDuration += time - pausedAt;
        pausedAt = null;
      }
      const progress = clamp((time - startedAt - pausedDuration) / duration);
      context.clearRect(0, 0, width, height);
      drawIrisReactor(time, 0.48 + Math.sin(progress * Math.PI) * 0.52);
      drawOrbitingLines(time, 0.78 + Math.sin(progress * Math.PI) * 0.62);
      drawParticles(particle => getAnimatedPosition(particle, progress, time));
      drawSignalSparks(time, 0.72 + Math.sin(progress * Math.PI) * 0.28);

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
      { threshold: 0.05 }
    );

    observer.observe(canvas);
    frameRef.current = window.requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
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
      aria-label={replayLabel}
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
        {accessText}
      </span>
    </button>
  );
}
