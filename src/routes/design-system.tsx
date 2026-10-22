import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { PageHeader, Reveal } from "@/components/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { projects } from "@/content/projects";
import { demos, demoKinds } from "@/content/demos";
import { site } from "@/content/site";
import { seo } from "@/lib/seo";

// Internal reference for Ben, Lovable and Claude. Unlisted: not in the nav or sitemap, and noindex.
export const Route = createFileRoute("/design-system")({
  head: () => {
    const base = seo(
      "/design-system",
      "Design System",
      "Brand foundations, colour tokens and components used across the Teague Industries site.",
    );
    base.meta.push({ name: "robots", content: "noindex, nofollow" });
    return base;
  },
  component: DesignSystem,
});

// Every swatch reads its colour from the live CSS variable, so this page can't drift from styles.css.
const coreTokens = [
  { name: "--background", use: "Page canvas" },
  { name: "--surface", use: "Cards, drawer, glass base" },
  { name: "--surface-2", use: "Inputs, raised panels" },
  { name: "--primary", use: "Buttons, links, glow" },
  { name: "--primary-soft", use: "Icons, highlights, hover text" },
  { name: "--accent-tech", use: "Prices, ticks, free-preview badge (same cyan as --primary)" },
  { name: "--silver", use: "Technical labels (.label), chrome text" },
  { name: "--foreground", use: "Body text" },
  { name: "--muted-foreground", use: "Secondary text, labels" },
  { name: "--border", use: "Hairlines on cards and inputs" },
  { name: "--input", use: "Input borders" },
  { name: "--destructive", use: "Form errors" },
];
const coreTokenNames = coreTokens.map((t) => t.name); // stable reference: a fresh array each render would re-run the effect forever
const demoTokens = [
  "--demo-background",
  "--demo-accent",
  "--demo-foreground",
  "--demo-muted",
  "--demo-border",
];

function useComputedVars(names: string[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setValues(Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()])));
  }, [names]);
  return values;
}

function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10">
          <p className="label">{label}</p>
          <h2 className="mt-3 text-2xl">{title}</h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function Spec({
  title,
  note,
  children,
  className = "",
}: {
  title: string;
  note?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass p-6 ${className}`}>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {note && <code className="text-xs text-muted-foreground">{note}</code>}
      </div>
      {children}
    </div>
  );
}

function Swatch({ name, use, value }: { name: string; use?: string; value?: string | undefined }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="h-12 w-12 shrink-0 rounded-lg border border-border"
        style={{ background: `var(${name})` }}
      />
      <div className="min-w-0">
        <code className="block truncate text-xs text-foreground">{name}</code>
        <p className="truncate text-xs text-muted-foreground">
          {value || "…"}
          {use ? ` · ${use}` : ""}
        </p>
      </div>
    </div>
  );
}

const nav = [
  ["brand", "Brand"],
  ["type", "Typography"],
  ["colour", "Colour"],
  ["effects", "Effects"],
  ["demos", "Demo themes"],
  ["buttons", "Buttons"],
  ["forms", "Forms"],
  ["surfaces", "Surfaces"],
  ["feedback", "Feedback"],
] as const;

function DesignSystem() {
  const core = useComputedVars(coreTokenNames);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(true);

  return (
    <>
      <PageHeader
        label="Internal reference"
        title="Design system"
        sub="The real tokens, type and components behind teagueindustries.com.au. Unlisted and not indexed."
      />

      <nav aria-label="Sections" className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6">
        {nav.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary-soft hover:text-foreground"
          >
            {label}
          </a>
        ))}
      </nav>

      <Section id="brand" label="Foundations" title="Brand">
        <div className="grid gap-6 md:grid-cols-3">
          <Spec title="Logomark" note="<Logo glow />">
            <div className="flex items-center gap-8">
              <Logo glow className="h-20 w-20" />
              <Logo className="h-10 w-10" />
              <Logo className="h-7 w-7" />
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Chrome "T". Glow only in the hero; plain in the nav and footer.
            </p>
          </Spec>
          <Spec title="Wordmark & tagline" note=".font-display .tracking-brand">
            <p className="font-display text-sm tracking-brand">Teague Industries</p>
            <p className="label mt-4 !text-[10px] leading-6">{site.tagline}</p>
            <p className="mt-5 text-xs text-muted-foreground">
              Michroma is reserved for the wordmark, section labels and uppercase tags. Never for
              body copy.
            </p>
          </Spec>
          <Spec title="Corner badge" note="hero, sm+ only">
            <div className="w-fit border-l border-foreground/40 pl-3">
              <p className="font-display text-[9px] tracking-[0.3em] text-foreground">
                Teague Industries
              </p>
              <p className="label mt-1 !text-[9px]">{site.est}</p>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Aligned to the content column, bottom-left of the hero.
            </p>
          </Spec>
        </div>
      </Section>

      <Section id="type" label="Foundations" title="Typography">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Spec title="Type scale" note="Inter · h1–h4 are 700 weight, line-height 1.3">
            <div className="space-y-6">
              <div>
                <p className="hero-heading font-bold">Built for your next chapter.</p>
                <code className="text-xs text-muted-foreground">
                  .hero-heading · 54px (home hero only)
                </code>
              </div>
              <div>
                <h1 className="text-2xl text-chrome sm:text-4xl">Honest, simple pricing</h1>
                <code className="text-xs text-muted-foreground">
                  h1 · text-2xl sm:text-4xl · .text-chrome (page headers)
                </code>
              </div>
              <div>
                <h2 className="text-2xl">A clear scope. An honest price.</h2>
                <code className="text-xs text-muted-foreground">
                  h2 · text-2xl (section titles)
                </code>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Website Build</h3>
                <code className="text-xs text-muted-foreground">
                  h3 · text-sm font-semibold (card titles)
                </code>
              </div>
              <div>
                <p className="text-muted-foreground">
                  A better home for your business online. Custom websites, online stores and smart
                  tools, with a free preview before you pay.
                </p>
                <code className="text-xs text-muted-foreground">
                  body · 16px, line-height 1.65, text-muted-foreground for supporting copy
                </code>
              </div>
              <div>
                <p className="label">What we do</p>
                <code className="text-xs text-muted-foreground">
                  .label · Michroma 10px uppercase, 0.22em tracking, silver (eyebrows, spec keys)
                </code>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Founded 2026 · ABN {site.abn}
                </p>
                <code className="text-xs text-muted-foreground">
                  micro · 10px uppercase 0.2em (fact strips)
                </code>
              </div>
            </div>
          </Spec>
          <div className="grid gap-6">
            <Spec title="Display" note="Michroma · .font-display">
              <p className="font-display text-xl tracking-[0.3em]">Services</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Uppercase by the utility. Wordmark, nav links, badges, "01 02 03" step numbers.
              </p>
            </Spec>
            <Spec title="Sans" note="Inter · default">
              <p className="text-lg">Readable headings and body text.</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Weights 400–800 loaded. Prices are bold Inter in accent-tech (the Price component).
              </p>
            </Spec>
            <Spec title="Accent script" note="Caveat · .font-hand">
              <p className="font-hand text-3xl text-primary-soft">— Ben</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Founder sign-off only. One use per page at most.
              </p>
            </Spec>
          </div>
        </div>
      </Section>

      <Section id="colour" label="Tokens" title="Colour">
        <div className="grid gap-6 md:grid-cols-2">
          <Spec title="Core palette" note=":root in styles.css">
            <div className="grid gap-4 sm:grid-cols-2">
              {coreTokens.map((t) => (
                <Swatch key={t.name} name={t.name} use={t.use} value={core[t.name]} />
              ))}
            </div>
          </Spec>
          <Spec title="Text on dark" note="contrast pairs">
            <div className="space-y-3 text-sm">
              <p className="text-foreground">Foreground on background: primary text.</p>
              <p className="text-muted-foreground">
                Muted foreground: supporting copy, labels, captions.
              </p>
              <p className="text-primary-soft">Primary-soft: icons, links, highlighted words.</p>
              <p className="text-chrome text-xl">Chrome gradient: page headings.</p>
              <p className="text-xl font-bold text-accent-tech">
                Accent tech: prices, ticks and the free-preview badge.
              </p>
              <p className="rounded-lg bg-primary px-3 py-2 text-primary-foreground">
                Navy on primary: button text (never white on the cyan).
              </p>
              <p className="text-xs text-destructive">Destructive: "Please enter a valid email".</p>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Change a colour in <code>src/styles.css</code> (<code>:root</code>) and every swatch
              above updates; nothing here is hard-coded.
            </p>
          </Spec>
        </div>
      </Section>

      <Section id="effects" label="Tokens" title="Effects & lines">
        <div className="grid gap-6 md:grid-cols-3">
          <Spec title="Glow" note="--glow · --glow-soft">
            <div className="flex flex-wrap gap-6">
              <div
                className="h-14 w-14 rounded-full bg-primary"
                style={{ boxShadow: "var(--glow)" }}
              />
              <div
                className="h-14 w-14 rounded-lg border border-border bg-surface"
                style={{ boxShadow: "var(--glow-soft)" }}
              />
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              --glow on primary buttons and step numbers; --glow-soft on hovered cards and the
              founder portrait.
            </p>
          </Spec>
          <Spec title="Chrome line" note=".chrome-line">
            <div className="chrome-line my-6" />
            <p className="text-xs text-muted-foreground">
              1px divider under page headers and above the footer. Fades out at both ends.
            </p>
          </Spec>
          <Spec title="Technical layers" note=".tech-grid · .corner-marks · .scanline · .tech-line">
            <div className="tech-grid corner-marks scanline h-28 border border-border p-5">
              <p className="label">01 / Section label</p>
              <div className="tech-line mt-3 max-w-[120px]" aria-hidden="true" />
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Faint grid, corner marks, a slow scan line and a hairline that grows in on scroll.
              Decorative, aria-hidden and subtle: lighting and spacing do the work, not neon.
            </p>
          </Spec>
          <Spec title="Glass" note=".glass · .glass-hover">
            <div className="glass glass-hover p-4 text-xs text-muted-foreground">
              Surface at 70% with 14px blur, 1px border, --radius corners. Hover lifts the border
              and adds --glow-soft.
            </div>
          </Spec>
        </div>
      </Section>

      <Section id="demos" label="Tokens" title="Demo concept themes">
        <p className="-mt-6 mb-8 max-w-2xl text-sm text-muted-foreground">
          The four interactive demos are light themes layered on the same components. Each sets its
          own <code>--demo-*</code> variables via a <code>.demo-&lt;kind&gt;</code> class (café uses
          the defaults).
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {demoKinds.map((kind) => (
            <div key={kind} className={`demo-${kind} glass p-5`}>
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">{demos[kind].name}</h3>
                <Link
                  to="/demo/$kind"
                  params={{ kind }}
                  className="text-xs text-primary-soft hover:underline"
                >
                  {demos[kind].category} demo →
                </Link>
              </div>
              <div className="flex gap-3">
                {demoTokens.map((t) => (
                  <div key={t} className="flex-1">
                    <div
                      className="h-10 rounded-md border border-border"
                      style={{ background: `var(${t})` }}
                    />
                    <code className="mt-1 block truncate text-[10px] text-muted-foreground">
                      {t.replace("--demo-", "")}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="buttons" label="Components" title="Buttons">
        <div className="grid gap-6 md:grid-cols-2">
          <Spec title="Site buttons" note=".btn-primary · .btn-chrome">
            <div className="flex flex-wrap items-center gap-4">
              <button className="btn-primary">Get a free preview</button>
              <button className="btn-chrome">
                Browse templates <ArrowRight className="h-4 w-4" />
              </button>
              <button className="btn-primary" disabled>
                Disabled
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1500);
                }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Click for loading state"}
              </button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Primary for the one main action per screen (free preview, add to cart, checkout).
              Chrome for secondary actions. Both lift 2px on hover. Loading swaps the label for a
              spinner and keeps the width.
            </p>
          </Spec>
          <Spec title="shadcn Button" note='<Button variant="…">'>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="ghost" size="icon" aria-label="Open cart">
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button size="sm">Small</Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Used inside demos, the nav (menu/cart icons) and small utility actions. Site-facing
              calls to action use .btn-primary / .btn-chrome instead.
            </p>
          </Spec>
        </div>
      </Section>

      <Section id="forms" label="Components" title="Form controls">
        <div className="grid gap-6 md:grid-cols-2">
          <Spec title="Fields" note=".field · .label">
            <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
              <label className="block">
                <span className="label mb-2 block">Business name *</span>
                <input className="field" placeholder="Harbour & Grain" />
              </label>
              <label className="block">
                <span className="label mb-2 block">Business type</span>
                <select className="field" defaultValue="">
                  <option value="">Select…</option>
                  <option>Café</option>
                  <option>Trades</option>
                </select>
              </label>
              <label className="block">
                <span className="label mb-2 block">Message</span>
                <textarea className="field" rows={3} placeholder="Tell us about your business" />
              </label>
            </form>
            <p className="mt-5 text-xs text-muted-foreground">
              Labels sit above the field (no floating labels). Focus shows a primary border plus a
              3px soft ring.
            </p>
          </Spec>
          <Spec title="Validation" note='aria-invalid · role="alert"'>
            <label className="block">
              <span className="label mb-2 block">Email *</span>
              <input
                className="field"
                defaultValue="not-an-email"
                aria-invalid={showError || undefined}
                onChange={() => setShowError(false)}
              />
              {showError && (
                <span role="alert" className="mt-1 block text-xs text-destructive">
                  Please enter a valid email
                </span>
              )}
            </label>
            <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
              <li>Errors appear under the field in --destructive, announced to screen readers.</li>
              <li>
                Checking happens on submit (zod); the browser's own popups are off (
                <code>noValidate</code>).
              </li>
              <li>
                Every form carries a hidden "company_website" honeypot: off-screen,{" "}
                <code>tabIndex=-1</code>, <code>aria-hidden</code>. If a bot fills it, the form
                pretends to succeed and saves nothing.
              </li>
              <li>Website fields accept "mysite.com.au"; https:// is added for the visitor.</li>
            </ul>
          </Spec>
        </div>
      </Section>

      <Section id="surfaces" label="Components" title="Surfaces & cards">
        <div className="grid gap-6 md:grid-cols-3">
          <Spec title="Glass card" note=".glass .glass-hover p-6">
            <div className="glass glass-hover flex h-full flex-col p-6">
              <p className="label">Eyebrow</p>
              <h3 className="mt-4 text-sm font-semibold">Card title</h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">
                Supporting copy in muted foreground.
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm text-primary-soft">
                Learn more <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Spec>
          <Spec title="Project card" note="<ProjectCard />">
            {projects[0] && <ProjectCard project={projects[0]} />}
          </Spec>
          <Spec title="Pricing tier" note="pricing.tsx">
            <div className="glass flex h-full flex-col p-6">
              <p className="font-display text-[10px] tracking-[0.25em]">Website Build</p>
              <p className="mt-4 text-3xl text-chrome">A$500</p>
              <p className="text-xs text-muted-foreground">one-off · Free preview first.</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                <li>✓ Up to 5 pages</li>
                <li>✓ Two rounds of revisions</li>
              </ul>
              <button className="btn-chrome mt-6 w-full">Get a free preview</button>
            </div>
          </Spec>
        </div>
      </Section>

      <Section id="feedback" label="Components" title="Feedback & overlays">
        <div className="grid gap-6 md:grid-cols-3">
          <Spec title="Toast" note="sonner · top-center">
            <button className="btn-chrome" onClick={() => toast.success("Added to cart")}>
              Show a toast
            </button>
            <p className="mt-5 text-xs text-muted-foreground">
              Short confirmations only. Form success is shown inline instead (the form is replaced
              by a thank-you line).
            </p>
          </Spec>
          <Spec title="Accordion" note="FAQ · one open at a time">
            <Accordion type="single" collapsible className="glass px-4">
              <AccordionItem value="a" className="border-border">
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  How long does it take?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  About one week for a standard website.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b" className="border-0">
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  Do I own the website?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Yes: content, domain and accounts.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Spec>
          <Spec title="Drawers & motion" note="Sheet · .animate-rise · <Reveal />">
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <strong className="text-foreground">Cart drawer</strong> slides in from the right
                (shadcn Sheet, surface background). Try the cart icon in the nav.
              </li>
              <li>
                <strong className="text-foreground">Phone menu</strong> uses the same right-hand
                drawer with a dimmed backdrop.
              </li>
              <li>
                <strong className="text-foreground">.animate-rise</strong> fades content up on first
                paint, with no JavaScript, for everything above the fold.
              </li>
              <li>
                <strong className="text-foreground">&lt;Reveal&gt;</strong> fades in sections as
                they scroll into view; content already on screen is never hidden.
              </li>
              <li>All motion is disabled for visitors who prefer reduced motion.</li>
            </ul>
          </Spec>
        </div>
      </Section>
    </>
  );
}
