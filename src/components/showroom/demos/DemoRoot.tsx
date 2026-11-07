import type { CSSProperties, ReactNode } from "react";
import type { ShowroomDesign } from "@/content/showroom";
import { cn } from "@/lib/utils";

export type DemoProps = { design: ShowroomDesign };

export type DemoFonts = { body: string; heading: string };

// Every showroom demo renders inside this. `@container` makes the demo lay itself out by the width
// of its frame (the viewer's desktop/tablet/phone switch) rather than the browser window, so demos
// use container variants (`@3xl:`) and never viewport ones (`md:`). `.showroom-demo` applies the
// demo's fonts instead of the site's heading font (see styles.css), and `isolate` + `overflow-hidden`
// keep its colours, stacking and overlays inside the frame.
export function DemoRoot({
  design,
  fonts,
  className,
  children,
}: {
  design: ShowroomDesign;
  fonts: DemoFonts;
  className: string;
  children: ReactNode;
}) {
  const style = {
    "--demo-font-body": fonts.body,
    "--demo-font-heading": fonts.heading,
  } as CSSProperties;
  return (
    <div
      role="region"
      aria-label={`${design.businessName}: demonstration website`}
      className={cn("showroom-demo @container relative isolate overflow-hidden", className)}
      style={style}
    >
      {children}
    </div>
  );
}

// Shown in place of a demo form once it's "sent". Nothing leaves the page.
export function DemoSent({
  title,
  onReset,
  className,
}: {
  title: string;
  onReset: () => void;
  className?: string;
}) {
  return (
    <div role="status" className={cn("rounded-lg p-5 text-center", className)}>
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm opacity-80">
        This is a demonstration, so nothing was sent and no booking was made.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-3 text-sm font-semibold underline underline-offset-4"
      >
        Try it again
      </button>
    </div>
  );
}

// The last thing in every demo: whose work it is and that the business is invented.
export function DemoDisclaimer({
  design,
  className,
}: {
  design: ShowroomDesign;
  className?: string;
}) {
  return (
    <p className={cn("px-5 py-4 text-center text-xs", className)}>
      Demonstration website by Teague Industries. {design.businessName} is a fictional business, and
      every name, address, price and review on this page is sample content.
    </p>
  );
}
