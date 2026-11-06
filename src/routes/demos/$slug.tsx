import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Columns2,
  Info,
  Maximize2,
  Minimize2,
  Monitor,
  Share2,
  Smartphone,
  Tablet,
} from "lucide-react";
import { DemoShareDialog } from "@/components/showroom/DemoShareDialog";
import { showroomDemos } from "@/components/showroom/demos";
import {
  demoDomain,
  getShowroomDesign,
  isShowroomSlug,
  showroomDesigns,
  type ShowroomDesign,
  type ShowroomSlug,
} from "@/content/showroom";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/demos/$slug")({
  beforeLoad: ({ params }) => {
    if (!isShowroomSlug(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const design = isShowroomSlug(params.slug) ? getShowroomDesign(params.slug) : undefined;
    return seo(
      `/demos/${params.slug}`,
      design ? `${design.title} Website Design Demo` : "Website Design Demo",
      design
        ? `Try a live ${design.industry.toLowerCase()} website design by Teague Industries, with ${design.interactiveWidget.toLowerCase()}. ${design.businessName} is a fictional business.`
        : "Try a live website design by Teague Industries.",
    );
  },
  component: DemoViewer,
});

const viewports = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Phone", icon: Smartphone },
] as const;
type Viewport = (typeof viewports)[number]["id"];

const toolButton =
  "shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary";

function DemoViewer() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [full, setFull] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [compare, setCompare] = useState(false);
  // The design shown next to this one in compare mode. Falls back to the next design in the list.
  const [otherSlug, setOtherSlug] = useState<ShowroomSlug | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Full screen uses the browser's Fullscreen API where it exists, and otherwise (e.g. iPhone
  // Safari) a fixed overlay that Escape or the exit button closes.
  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  useEffect(() => {
    if (!full || document.fullscreenElement) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  const enterFull = async () => {
    const el = stageRef.current;
    if (el && document.fullscreenEnabled) {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        // Refused (e.g. inside an iframe): use the overlay instead.
      }
    }
    setFull(true);
  };
  const exitFull = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    setFull(false);
  };
  // Dialogs render on <body>, which is hidden while the stage is full screen.
  const share = async () => {
    if (full) await exitFull();
    setSharing(true);
  };

  if (!isShowroomSlug(slug)) return null;
  const design = getShowroomDesign(slug);
  const index = showroomDesigns.findIndex((d) => d.slug === slug);
  const count = showroomDesigns.length;
  const prev = showroomDesigns[(index - 1 + count) % count];
  const next = showroomDesigns[(index + 1) % count];
  // Never compare a design with itself, even if the saved choice is the one now being viewed.
  const other =
    (otherSlug && otherSlug !== slug ? showroomDesigns.find((d) => d.slug === otherSlug) : null) ??
    next;
  const comparing = compare && other !== undefined && other.slug !== slug;

  return (
    <div className="pt-16 lg:pt-20">
      <div className="sticky top-16 z-30 border-b border-border bg-surface/90 backdrop-blur-xl lg:top-20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6">
          <Link
            to="/demos"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All Designs
          </Link>
          <label className="min-w-[11rem] flex-1 sm:max-w-xs">
            <span className="sr-only">Switch design</span>
            <select
              value={slug}
              onChange={(e) => {
                const value = e.target.value;
                if (isShowroomSlug(value))
                  void navigate({ to: "/demos/$slug", params: { slug: value } });
              }}
              className="w-full rounded-md border border-input bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {showroomDesigns.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.id} · {d.title}
                </option>
              ))}
            </select>
          </label>
          <div
            role="group"
            aria-label="Preview size"
            className="hidden items-center rounded-md border border-border p-0.5 md:flex"
          >
            {viewports.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={viewport === id}
                onClick={() => setViewport(id)}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  viewport === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={compare}
            onClick={() => setCompare((c) => !c)}
            className={`inline-flex ${toolButton} ${compare ? "!border-primary !bg-primary/15 !text-foreground" : ""}`}
          >
            <Columns2 className="h-4 w-4" aria-hidden="true" />
            Compare
          </button>
          <button
            type="button"
            onClick={() => void share()}
            className={`inline-flex ${toolButton}`}
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </button>
          <button
            type="button"
            onClick={() => void (full ? exitFull() : enterFull())}
            className={`${toolButton} hidden sm:inline-flex`}
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
            Full screen
          </button>
          <Link
            to="/contact"
            search={{ design: slug }}
            className="btn-primary !px-4 !py-2 !text-xs sm:ml-auto"
          >
            Request a Build Like This <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {compare && (
          <div className="border-t border-border">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6">
              <p className="label">Side by side</p>
              <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                Compare with
                <select
                  value={other?.slug ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isShowroomSlug(value)) setOtherSlug(value);
                  }}
                  className="min-w-0 rounded-md border border-input bg-surface-2 px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {showroomDesigns
                    .filter((d) => d.slug !== slug)
                    .map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.id} · {d.title}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <p className="label">Design {design.id}</p>
        <h1 className="mt-2 text-2xl text-foreground sm:text-3xl">{design.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {design.tagline} Try the {design.interactiveWidget.toLowerCase()}.
        </p>
        <p
          role="note"
          className="mt-4 flex gap-3 rounded-lg border border-accent-tech/40 bg-accent-tech/10 px-4 py-3 text-sm text-foreground"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-tech" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Demonstration only.</strong> {design.businessName} is
            a fictional business. Every name, address, price, photo and review in this demo is
            illustrative sample content, and its forms don't send anything.
          </span>
        </p>
      </div>

      <div
        ref={stageRef}
        className={
          full
            ? "fixed inset-0 z-[60] flex flex-col bg-background"
            : "mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6"
        }
      >
        {full && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-2">
            <p className="min-w-0 flex-1 truncate text-sm text-foreground">
              Design {design.id} · {design.title}
              {comparing && other ? ` vs ${other.title}` : ""}
            </p>
            <Link
              to="/contact"
              search={{ design: slug }}
              className="btn-primary !px-4 !py-2 !text-xs"
            >
              Request a Build Like This
            </Link>
            <button
              type="button"
              onClick={() => void exitFull()}
              className={`inline-flex ${toolButton}`}
            >
              <Minimize2 className="h-4 w-4" aria-hidden="true" /> Exit full screen
            </button>
          </div>
        )}
        <div className={full ? "min-h-0 flex-1 overflow-auto p-4" : undefined}>
          {comparing && other ? (
            <div
              className={
                viewport === "desktop"
                  ? "grid gap-6 xl:grid-cols-2"
                  : "flex flex-wrap items-start justify-center gap-6"
              }
            >
              {[design, other].map((d) => (
                <figure key={d.slug} className="min-w-0">
                  <figcaption className="mb-3 flex items-center gap-2 text-sm text-foreground">
                    <span
                      className="h-2 w-6 rounded-full"
                      style={{ background: d.accentColor }}
                      aria-hidden="true"
                    />
                    <span className="label">Design {d.id}</span>
                    <span className="truncate font-medium">{d.title}</span>
                  </figcaption>
                  <DeviceFrame viewport={viewport} full={full} design={d} side>
                    <DemoView design={d} />
                  </DeviceFrame>
                </figure>
              ))}
            </div>
          ) : (
            <DeviceFrame viewport={viewport} full={full} design={design}>
              <DemoView design={design} />
            </DeviceFrame>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="glass corner-marks mb-8 flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div className="min-w-0">
            <p className="label">Your website</p>
            <h2 className="mt-2 text-xl text-foreground sm:text-2xl">
              Want a website like the {design.title}?
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              We'll build a free preview around your business: your name, services, prices and
              photos. No deposit, no obligation.
            </p>
          </div>
          <Link to="/contact" search={{ design: slug }} className="btn-primary shrink-0">
            Request a Build Like This <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {prev && next && (
          <nav
            aria-label="More designs"
            className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
          >
            <Link
              to="/demos/$slug"
              params={{ slug: prev.slug }}
              className="glass glass-hover flex items-center gap-3 p-4 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="label block">Previous design</span>
                {prev.title}
              </span>
            </Link>
            <Link
              to="/demos/$slug"
              params={{ slug: next.slug }}
              className="glass glass-hover flex items-center justify-end gap-3 p-4 text-right text-sm text-muted-foreground hover:text-foreground"
            >
              <span>
                <span className="label block">Next design</span>
                {next.title}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </nav>
        )}
      </div>

      <DemoShareDialog design={design} open={sharing} onOpenChange={setSharing} />
    </div>
  );
}

// Keyed by slug so switching designs resets every demo's local state.
function DemoView({ design }: { design: ShowroomDesign }) {
  if (!isShowroomSlug(design.slug)) return null;
  const Demo = showroomDemos[design.slug];
  return <Demo key={design.slug} design={design} />;
}

// Desktop shows the demo in a browser window at full height. Tablet and phone show it at their real
// widths (768px and 375px of content) in a device bezel that scrolls inside, like the real thing.
// Demos lay out by container width, so each size gets its proper layout. `side` is set when two
// frames share the row: the browser window then scrolls inside a capped height.
function DeviceFrame({
  viewport,
  full,
  design,
  side = false,
  children,
}: {
  viewport: Viewport;
  full: boolean;
  design: ShowroomDesign;
  side?: boolean;
  children: ReactNode;
}) {
  if (viewport === "desktop") {
    return (
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-xl border border-border bg-[#0b0f17] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 px-4 py-2.5" aria-hidden="true">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="mx-auto w-full max-w-sm truncate rounded-md bg-white/5 px-3 py-1 text-center text-[11px] text-muted-foreground">
            {demoDomain(design)}
          </span>
        </div>
        {side ? (
          <div
            tabIndex={0}
            aria-label={`${design.title} demo. Scroll to see more.`}
            className="max-h-[max(560px,calc(100dvh_-_16rem))] overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:outline-primary"
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
  const phone = viewport === "mobile";
  const height = full
    ? "h-[calc(100dvh_-_7rem)]"
    : phone
      ? "h-[max(560px,min(812px,calc(100dvh_-_13rem)))]"
      : "h-[max(560px,min(1024px,calc(100dvh_-_13rem)))]";
  return (
    <div
      className={`relative mx-auto max-w-full border-[12px] border-[#0b0f17] bg-[#0b0f17] shadow-[0_30px_80px_rgba(0,0,0,0.45)] ${
        phone ? "w-[399px] rounded-[2.75rem]" : "w-[792px] rounded-[2rem]"
      }`}
    >
      {phone && (
        <span
          className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-[#0b0f17]"
          aria-hidden="true"
        />
      )}
      <div
        tabIndex={0}
        aria-label={`${design.title} demo, ${phone ? "phone" : "tablet"} size. Scroll to see more.`}
        className={`overflow-y-auto overscroll-contain bg-white focus-visible:outline-2 focus-visible:outline-primary ${height} ${
          phone ? "rounded-[2rem]" : "rounded-[1.25rem]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
