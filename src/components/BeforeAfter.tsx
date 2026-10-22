import { DemoSite } from "@/components/DemoSite";

// The same café twice: a realistically dated page next to the demo site. The "before" is built from
// plain markup (no image to source or licence) and is decorative, so it's hidden from screen readers.
// Both sides are illustrative concepts, and say so.
export function BeforeAfter() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <figure className="glass overflow-hidden">
        <figcaption className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <span className="label">Before</span>
          <span className="text-xs text-muted-foreground">Illustrative concept</span>
        </figcaption>
        <div
          className="aspect-[16/10] overflow-hidden bg-[#f4f4f4] font-[Arial,sans-serif] text-[#333]"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#ccc] bg-[#2b4a8a] px-4 py-2 text-white">
            <span className="text-base font-bold">Harbour and Grain Cafe</span>
            <span className="text-[10px] underline">Home | Menu | About | Contact</span>
          </div>
          <div className="grid grid-cols-[1fr_1.2fr] gap-3 p-4">
            <div className="h-28 bg-[#d9d9d9] text-center text-[10px] leading-[7rem] text-[#777]">
              [ shopfront.jpg ]
            </div>
            <div className="text-[12px] leading-5">
              <p className="font-bold">Welcome to our website</p>
              <p className="mt-1">
                We are a cafe. We serve coffee and food. Open most days. Please see our menu{" "}
                <span className="text-[#1a0dab] underline">here (PDF, 14 MB)</span>.
              </p>
              <p className="mt-2 text-[11px] text-[#777]">
                Opening hours: call us. Phone: see Facebook.
              </p>
            </div>
          </div>
          <div className="mx-4 border-t border-[#ddd] pt-2 text-[10px] text-[#888]">
            Last updated 2017 · Site built with free website builder
          </div>
        </div>
      </figure>
      <figure className="glass glass-hover overflow-hidden">
        <figcaption className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <span className="label text-accent-tech">After</span>
          <span className="text-xs text-muted-foreground">Illustrative concept · about a week</span>
        </figcaption>
        <div
          className="pointer-events-none aspect-[16/10] overflow-hidden"
          aria-hidden="true"
          inert
        >
          <DemoSite kind="cafe" compact />
        </div>
      </figure>
    </div>
  );
}
