import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Monitor, Smartphone, Globe } from "lucide-react";
import { DemoSite } from "@/components/DemoSite";
import { Button } from "@/components/ui/button";
import { demoKinds, demos, type DemoKind } from "@/content/demos";

const labels: Record<DemoKind, string> = {
  cafe: "Café",
  tradie: "Trades",
  salon: "Salon",
  retail: "Retail",
};

// Until the visitor touches it, the preview plays by itself: it scrolls a little way into each demo
// and moves on to the next, so the hero has motion without a video file. Hovering pauses it, any
// click or keypress inside hands control over for good, and a reduced-motion setting keeps it still.
export function WebsitePreview() {
  const [kind, setKind] = useState<DemoKind>("cafe");
  const [mobile, setMobile] = useState(false);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stop = () => setAuto(false);

  useEffect(() => {
    const el = viewportRef.current;
    if (!auto || paused || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timers: number[] = [];
    const clear = () => {
      timers.forEach((t) => clearTimeout(t));
      timers = [];
    };
    const play = () => {
      clear();
      timers = [
        window.setTimeout(() => el.scrollTo({ top: 260, behavior: "smooth" }), 2200),
        window.setTimeout(() => el.scrollTo({ top: 0, behavior: "smooth" }), 4600),
        window.setTimeout(() => {
          setKind((k) => demoKinds[(demoKinds.indexOf(k) + 1) % demoKinds.length] ?? k);
        }, 6500),
      ];
    };
    // Only animate while the preview is actually on screen.
    const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? play() : clear()), {
      threshold: 0.5,
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, [auto, paused, kind]);

  return (
    <div
      className="website-preview"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onPointerDown={stop}
      onKeyDown={stop}
    >
      <div className="preview-toolbar">
        <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <Globe size={14} />
          <span className="truncate">
            {demos[kind].name} <span className="text-primary-soft">· Demo</span>
          </span>
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Desktop preview"
            aria-label="Desktop preview"
            aria-pressed={!mobile}
            onClick={() => setMobile(false)}
          >
            <Monitor />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Mobile preview"
            aria-label="Mobile preview"
            aria-pressed={mobile}
            onClick={() => setMobile(true)}
          >
            <Smartphone />
          </Button>
        </div>
      </div>
      <div ref={viewportRef} className={`preview-viewport ${mobile ? "preview-mobile" : ""}`}>
        <DemoSite key={kind} kind={kind} compact priority />
      </div>
      <div className="preview-bottom">
        <div className="flex min-w-0 flex-wrap gap-1">
          {demoKinds.map((value) => (
            <Button
              key={value}
              size="sm"
              variant="ghost"
              className="preview-tab"
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
            >
              {labels[value]}
            </Button>
          ))}
        </div>
        <Button asChild size="icon" variant="ghost" title="Open full demo">
          <Link to="/demo/$kind" params={{ kind }} aria-label="Open full demo">
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
