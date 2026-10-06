import { useEffect, useRef, useState } from "react";
import { useSignatureState } from "@/signature/useSignature";
import "./MaterialLiquidField.css";

type Point = { x: number; y: number; vx: number; vy: number };

const NODE_COUNT = 7;

/**
 * Viscous cursor material for the identity stage only.
 *
 * The field is completely still and costs no animation frame until a precise
 * pointer enters the stage. A short spring chain creates continuity, inertia,
 * resistance, and recovery; it settles and stops after the pointer leaves.
 */
export function MaterialLiquidField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const reduced = useSignatureState(
    snapshot => snapshot.capability.reducedMotion
  );
  const coarse = useSignatureState(
    snapshot => snapshot.capability.coarsePointer
  );
  const tier = useSignatureState(snapshot => snapshot.capability.tier);
  const enabled = mounted && !reduced && !coarse && tier === "full";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const field = canvas?.closest<HTMLElement>("[data-signal-stage]");
    const context = canvas?.getContext("2d");
    if (!canvas || !field || !context) return;
    const ctx = context;

    const nodes: Point[] = Array.from({ length: NODE_COUNT }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    }));
    const target = { x: 0, y: 0 };
    let opacity = 0;
    let active = false;
    let primed = false;
    let frame = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;

    const resize = () => {
      const rect = field.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = (x: number, y: number) => {
      target.x = x;
      target.y = y;
      nodes.forEach(node => {
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
      });
      primed = true;
    };

    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const pointerPosition = (event: PointerEvent) => {
      const rect = field.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const point = pointerPosition(event);
      if (!primed) seed(point.x, point.y);
      target.x = point.x;
      target.y = point.y;
      active = true;
      field.dataset.liquidActive = "true";
      start();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const point = pointerPosition(event);
      target.x = point.x;
      target.y = point.y;
      active = true;
      start();
    };

    const onLeave = () => {
      active = false;
      field.dataset.liquidActive = "false";
      start();
    };

    const drawBlob = (speed: number) => {
      const signal =
        getComputedStyle(field).getPropertyValue("--signal").trim() ||
        "#9bb9c1";
      const left: { x: number; y: number }[] = [];
      const right: { x: number; y: number }[] = [];

      nodes.forEach((node, index) => {
        const next = nodes[Math.min(index + 1, nodes.length - 1)];
        const dx = next.x - node.x;
        const dy = next.y - node.y;
        const length = Math.max(0.001, Math.hypot(dx, dy));
        const radius = Math.max(7, 25 - index * 2.7 + speed * 0.2);
        const nx = -dy / length;
        const ny = dx / length;
        left.push({ x: node.x + nx * radius, y: node.y + ny * radius });
        right.push({ x: node.x - nx * radius, y: node.y - ny * radius });
      });

      ctx.beginPath();
      ctx.moveTo(left[0].x, left[0].y);
      for (let index = 1; index < left.length; index += 1) {
        const previous = left[index - 1];
        const point = left[index];
        ctx.quadraticCurveTo(
          previous.x,
          previous.y,
          (previous.x + point.x) / 2,
          (previous.y + point.y) / 2
        );
      }
      for (let index = right.length - 1; index >= 0; index -= 1) {
        const previous = right[Math.min(index + 1, right.length - 1)];
        const point = right[index];
        ctx.quadraticCurveTo(
          previous.x,
          previous.y,
          (previous.x + point.x) / 2,
          (previous.y + point.y) / 2
        );
      }
      ctx.closePath();
      ctx.globalAlpha = opacity * 0.2;
      ctx.fillStyle = signal;
      ctx.fill();

      const head = nodes[0];
      const gradient = ctx.createRadialGradient(
        head.x - 5,
        head.y - 7,
        1,
        head.x,
        head.y,
        34 + speed * 0.28
      );
      gradient.addColorStop(0, signal);
      gradient.addColorStop(0.48, signal);
      gradient.addColorStop(1, "transparent");
      ctx.globalAlpha = opacity * 0.3;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 34 + speed * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    function draw() {
      frame = 0;
      ctx.clearRect(0, 0, width, height);
      opacity += ((active ? 1 : 0) - opacity) * (active ? 0.16 : 0.07);

      nodes.forEach((node, index) => {
        const leader = index === 0 ? target : nodes[index - 1];
        const spring = index === 0 ? 0.2 : 0.12;
        const damping = index === 0 ? 0.68 : 0.72;
        node.vx = (node.vx + (leader.x - node.x) * spring) * damping;
        node.vy = (node.vy + (leader.y - node.y) * spring) * damping;
        node.x += node.vx;
        node.y += node.vy;
      });

      const speed = Math.min(32, Math.hypot(nodes[0].vx, nodes[0].vy));
      if (opacity > 0.008) drawBlob(speed);
      if (active || opacity > 0.008 || speed > 0.05) start();
      else ctx.clearRect(0, 0, width, height);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(field);
    resize();
    field.addEventListener("pointerenter", onEnter, { passive: true });
    field.addEventListener("pointermove", onMove, { passive: true });
    field.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      observer.disconnect();
      field.removeEventListener("pointerenter", onEnter);
      field.removeEventListener("pointermove", onMove);
      field.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
      delete field.dataset.liquidActive;
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <canvas className="an-material-liquid" ref={canvasRef} aria-hidden="true" />
  );
}
