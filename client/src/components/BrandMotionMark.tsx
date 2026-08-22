import { useState } from "react";
import "./BrandMotionMark.css";

export function BrandMotionMark({ src }: { src: string }) {
  const [isAnimating, setIsAnimating] = useState(false);

  return <button className={`an-rmx-mark${isAnimating ? " is-animating" : ""}`} type="button" onClick={() => setIsAnimating(true)} onAnimationEnd={() => setIsAnimating(false)} aria-label="Putar motion logo Akbar Nawasunda">
    <span className="an-rmx-mark-art"><img src={src} alt="Akbar Nawasunda RMX mark" /></span>
    <span className="an-rmx-mark-caption"><span>RMX / MARK</span><small>TEKAN UNTUK PUTAR</small></span>
  </button>;
}
