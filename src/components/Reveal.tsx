import { useLayoutEffect, useRef, type ReactNode } from "react";

// Content already on screen at load stays visible from the first paint (it is server-rendered,
// so it must not wait for JavaScript). Only content that starts below the fold fades in on scroll.
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.style.opacity = "0";
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        el.style.opacity = "";
        el.animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: 400,
            delay: delay * 1000,
            easing: "ease-out",
            fill: "backwards",
          },
        );
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.style.opacity = "";
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function PageHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <header className="relative px-6 pb-16 pt-40 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(59,140,255,0.18),transparent_70%)]" />
      <div className="animate-rise">
        <p className="label">{label}</p>
        <h1 className="mx-auto mt-5 max-w-3xl text-2xl text-chrome sm:text-4xl">{title}</h1>
        {sub && <p className="mx-auto mt-6 max-w-xl text-muted-foreground">{sub}</p>}
      </div>
      <div className="chrome-line mx-auto mt-14 max-w-3xl" />
    </header>
  );
}
