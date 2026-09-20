export function HeroDots() {
  const dots = [
    { top: "18%", left: "62%", size: 5, delay: 0 },
    { top: "32%", left: "78%", size: 3, delay: 600 },
    { top: "58%", left: "88%", size: 4, delay: 1200 },
    { top: "72%", left: "58%", size: 6, delay: 400 },
    { top: "44%", left: "94%", size: 3, delay: 900 },
    { top: "12%", left: "90%", size: 4, delay: 1500 },
  ];

  return (
    <div className="an-hero-dots" aria-hidden="true">
      {dots.map((dot, i) => (
        <span
          key={i}
          className="an-hero-dot"
          style={{
            top: dot.top,
            left: dot.left,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            animationDelay: `${dot.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}
