import { useEffect, useRef, useState } from "react";
import { demoDomain, isShowroomSlug, type ShowroomDesign } from "@/content/showroom";
import { showroomDemos } from "./demos";

// Gallery card preview: the real demo rendered at desktop width and scaled down to fit the card,
// inside a mock browser bar. Decorative and inert — "View Live Demo" opens the interactive viewer.
// It mounts only when the card scrolls near the viewport, so the gallery stays light on first
// paint; until then the card shows a wireframe in the design's own palette.
const STAGE_W = 1280;
const STAGE_H = 720;

export function DemoPreview({ design }: { design: ShowroomDesign }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [scale, setScale] = useState(0);
  const Demo = isShowroomSlug(design.slug) ? showroomDemos[design.slug] : undefined;
  const { background, surface, text, accent } = design.palette;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || !near) return;
    const measure = () => setScale(el.clientWidth / STAGE_W);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [near]);

  return (
    <div className="border-b border-border bg-[#0b0f17]">
      <div className="flex items-center gap-2 px-3 py-1.5" aria-hidden="true">
        <span className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto w-full max-w-[65%] truncate rounded bg-white/5 px-2 py-0.5 text-center text-[10px] text-muted-foreground">
          {demoDomain(design)}
        </span>
        <span className="label shrink-0 !text-[9px]" style={{ color: accent }}>
          {design.id}
        </span>
      </div>
      <div ref={boxRef} className="relative aspect-[16/9] overflow-hidden" aria-hidden="true">
        {/* Palette wireframe: the placeholder until the live demo mounts over it. */}
        <div
          className="absolute inset-0 p-4"
          style={{ background: `linear-gradient(135deg, ${background} 0%, ${surface} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <span className="h-2 w-16 rounded-full" style={{ background: text, opacity: 0.85 }} />
            <span className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-6 rounded-full"
                  style={{ background: text, opacity: 0.35 }}
                />
              ))}
            </span>
          </div>
          <div className="mt-6 space-y-2">
            <span className="block h-3 w-3/5 rounded" style={{ background: text, opacity: 0.9 }} />
            <span className="block h-3 w-2/5 rounded" style={{ background: text, opacity: 0.6 }} />
            <span className="mt-3 block h-5 w-24 rounded" style={{ background: accent }} />
          </div>
          <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-8 rounded"
                style={{ background: text, opacity: 0.08 + i * 0.04 }}
              />
            ))}
          </div>
        </div>
        {Demo && near && scale > 0 && (
          <div className="absolute inset-0 overflow-hidden" inert>
            <div
              style={{
                width: STAGE_W,
                height: STAGE_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <Demo design={design} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
