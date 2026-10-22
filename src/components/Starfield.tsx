import { useEffect, useRef } from "react";

export function Starfield({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0,
      h = 0,
      raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    type Star = { x: number; y: number; r: number; a: number; tw: number; s: number };
    let stars: Star[] = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.floor((w * h) / 6000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.7 + 0.2,
        tw: Math.random() < 0.08 ? Math.random() * 0.03 + 0.01 : 0,
        s: Math.random() * 0.06 + 0.01,
      }));
    };

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        const alpha = st.tw ? st.a * (0.5 + 0.5 * Math.sin(t * st.tw * 10 + st.x)) : st.a;
        ctx.fillStyle = `rgba(220,235,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduce) {
          st.x -= st.s;
          if (st.x < 0) st.x = w;
        }
      }
      t += 0.016;
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) draw();
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
