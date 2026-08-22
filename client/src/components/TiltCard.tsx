import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  href: string;
  target?: string;
  rel?: string;
}

type TiltStyle = CSSProperties & {
  "--tilt-x"?: string;
  "--tilt-y"?: string;
};

export function TiltCard({
  children,
  className,
  href,
  target,
  rel,
}: TiltCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setCanTilt(pointerQuery.matches && !motionQuery.matches);
    update();
    pointerQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      pointerQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  const reset = () => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
  };

  const handleMouseMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!canTilt) return;
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const xPercent = (event.clientX - rect.left) / rect.width - 0.5;
    const yPercent = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty("--tilt-x", `${(-yPercent * 4).toFixed(2)}deg`);
    element.style.setProperty("--tilt-y", `${(xPercent * 4).toFixed(2)}deg`);
  };

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      onBlur={reset}
      style={{ "--tilt-x": "0deg", "--tilt-y": "0deg" } as TiltStyle}
    >
      {children}
    </a>
  );
}
