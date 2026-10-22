import { DemoSite } from "@/components/DemoSite";

// The same café twice: a deliberately dated page next to the demo site. The "before" is built from
// plain markup (no image to source or licence) and is decorative, so it's hidden from screen readers.
export function BeforeAfter() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <figure className="glass overflow-hidden">
        <figcaption className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <span className="label">Before</span>
          <span className="text-xs text-muted-foreground">A typical old site</span>
        </figcaption>
        <div
          className="aspect-[16/10] overflow-hidden bg-[#e9e9e9] font-[Times_New_Roman,serif] text-[#222]"
          aria-hidden="true"
        >
          <div className="bg-[#1a3f8f] px-5 py-3 text-lg font-bold text-[#ffdd00] underline sm:text-xl">
            Welcome to Harbour &amp; Grain Cafe!!!
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-[#999] bg-[#d9d9d9] px-5 py-2 text-xs text-[#0000ee] underline">
            <span>Home</span>
            <span>About Us</span>
            <span>Menu (PDF)</span>
            <span>Contact</span>
            <span>Links</span>
          </div>
          <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 p-5 sm:grid-cols-[120px_minmax(0,1fr)]">
            <div className="h-24 bg-[#bbb] text-center text-[10px] leading-[6rem] text-[#666]">
              photo1.jpg
            </div>
            <div className="text-sm leading-6">
              <p>
                <b>UNDER CONSTRUCTION</b> - Our new menu is coming soon! Please call for opening
                hours.
              </p>
              <p className="mt-2 text-xs text-[#555]">
                Last updated: 14/03/2015. Best viewed in Internet Explorer.
              </p>
              <p className="mt-3 text-[11px]">
                You are visitor number{" "}
                <span className="bg-black px-1 font-mono text-[#0f0]">004271</span>
              </p>
            </div>
          </div>
          <div className="border-t border-[#999] px-5 py-2 text-center text-[10px] text-[#555]">
            Site designed by my nephew · Copyright 2015
          </div>
        </div>
      </figure>
      <figure className="glass glass-hover overflow-hidden">
        <figcaption className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <span className="label text-accent-tech">After</span>
          <span className="text-xs text-muted-foreground">Built in about a week</span>
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
