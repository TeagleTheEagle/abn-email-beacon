import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Columns3, Search } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { DemoEnquiryModal } from "@/components/showroom/DemoEnquiryModal";
import { DemoPreview } from "@/components/showroom/DemoPreview";
import { ShowroomComparison } from "@/components/showroom/ShowroomComparison";
import {
  categoryLabel,
  MAX_COMPARE,
  showroomCategories,
  showroomDesigns,
  type ShowroomCategory,
  type ShowroomDesign,
} from "@/content/showroom";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/demos/")({
  head: () =>
    seo(
      "/demos",
      "Website Designs Showroom",
      "Explore live demonstration websites across 12 industries, from barbershops and cafés to trades, fitness studios and online stores. Try every design on desktop, tablet or phone.",
    ),
  component: Showroom,
});

const process = [
  {
    n: "01",
    title: "Explore",
    body: "Try the live demos on desktop, tablet or phone, and shortlist the ones that feel like your business.",
  },
  {
    n: "02",
    title: "Customise",
    body: "We build a free preview around your business: your name, services, prices and photos. It's usually ready within a few days, with no deposit and no obligation.",
  },
  {
    n: "03",
    title: "Launch",
    body: "Happy with it? We finish the remaining pages, connect your domain and launch, usually in about a week.",
  },
];

const matches = (d: ShowroomDesign, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    d.title,
    d.industry,
    d.businessName,
    d.tagline,
    categoryLabel(d.category),
    ...d.styleTags,
    ...d.includedFeatures,
    d.interactiveWidget,
  ].some((text) => text.toLowerCase().includes(q));
};

function Showroom() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ShowroomCategory | "all">("all");
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [enquiring, setEnquiring] = useState(false);

  const visible = useMemo(
    () =>
      showroomDesigns.filter(
        (d) => (category === "all" || d.category === category) && matches(d, query),
      ),
    [category, query],
  );
  const shortlisted = showroomDesigns.filter((d) => shortlist.includes(d.slug));
  const full = shortlist.length >= MAX_COMPARE;

  const toggle = (slug: string) =>
    setShortlist((list) =>
      list.includes(slug)
        ? list.filter((s) => s !== slug)
        : list.length < MAX_COMPARE
          ? [...list, slug]
          : list,
    );

  const filters: { id: ShowroomCategory | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...showroomCategories,
  ];

  return (
    <div className={shortlist.length ? "pb-32" : undefined}>
      <header className="relative px-6 pb-10 pt-28 text-center sm:pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(59,140,255,0.18),transparent_70%)]" />
        <div className="animate-rise">
          <p className="label">Website designs · 12 live demos</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl text-chrome sm:text-5xl lg:text-6xl">
            Explore Websites Built to Impress
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Twelve working website designs across twelve industries. Open any of them, try the
            booking forms, calculators and carts, and see how it looks on a phone.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <label className="relative block">
            <span className="sr-only">Search designs</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by industry, style or feature"
              className="field !pl-11"
            />
          </label>
        </div>
        <div
          role="group"
          aria-label="Filter by industry"
          className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-2"
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={category === f.id}
              onClick={() => setCategory(f.id)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                category === f.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="chrome-line mx-auto mt-8 max-w-3xl" />
      </header>

      <section aria-labelledby="designs-heading" className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="designs-heading" className="text-lg text-foreground">
            Designs
          </h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {visible.length} of {showroomDesigns.length}
            {full && ` · Shortlist full (${MAX_COMPARE} max)`}
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="glass px-6 py-12 text-center">
            <p className="text-foreground">No designs match that search.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="btn-chrome mt-5"
            >
              Show all designs
            </button>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((d) => {
              const selected = shortlist.includes(d.slug);
              return (
                <li key={d.slug}>
                  <DesignCard
                    design={d}
                    selected={selected}
                    disabled={full && !selected}
                    onToggle={() => toggle(d.slug)}
                  />
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Every business in these demos is fictional. Names, addresses, prices and reviews are
          sample content.
        </p>
      </section>

      <section aria-labelledby="make-it-yours" className="mx-auto mt-24 max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="glass corner-marks relative overflow-hidden p-8 sm:p-12">
            <p className="label">Your website</p>
            <h2 id="make-it-yours" className="mt-4 max-w-2xl text-2xl text-foreground sm:text-4xl">
              See a Design You Love? Let's Make It Yours
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {process.map((s) => (
                <li key={s.n} className="rounded-lg border border-border bg-background/40 p-6">
                  <span className="font-display text-xs text-primary-soft">{s.n}</span>
                  <h3 className="mt-3 text-lg text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary">
                Get a free preview <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/pricing" className="btn-chrome">
                See pricing
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <ShowroomComparison
        designs={shortlisted}
        onRemove={(slug) => setShortlist((list) => list.filter((s) => s !== slug))}
        onClear={() => setShortlist([])}
        onEnquire={() => setEnquiring(true)}
      />
      <DemoEnquiryModal designs={shortlisted} open={enquiring} onOpenChange={setEnquiring} />
    </div>
  );
}

function DesignCard({
  design: d,
  selected,
  disabled,
  onToggle,
}: {
  design: ShowroomDesign;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={`glass glass-hover flex h-full flex-col overflow-hidden ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <DemoPreview design={d} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-silver">
            {categoryLabel(d.category)}
          </span>
          <span className="text-[11px] text-muted-foreground">Design {d.id}</span>
        </div>
        <h3 className="mt-3 text-lg text-foreground">{d.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{d.tagline}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Style">
          {d.styleTags.map((t) => (
            <li
              key={t}
              className="rounded border border-border bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground" aria-label="Key features">
          {[d.interactiveWidget, ...d.includedFeatures.slice(0, 3)].map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-tech" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Link
            to="/demos/$slug"
            params={{ slug: d.slug }}
            className="btn-primary flex-1 !px-4 !py-2.5"
            aria-label={`View live demo: ${d.title}`}
          >
            View Live Demo <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            aria-pressed={selected}
            aria-label={`Compare ${d.title}`}
            title={disabled ? `You can compare up to ${MAX_COMPARE} designs` : undefined}
            className={`inline-flex items-center gap-1.5 rounded-[var(--radius)] border px-4 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 ${
              selected
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {selected ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Columns3 className="h-4 w-4" aria-hidden="true" />
            )}
            Compare
          </button>
        </div>
      </div>
    </article>
  );
}
