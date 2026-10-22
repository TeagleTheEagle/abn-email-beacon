import { createFileRoute, Link } from "@tanstack/react-router";
import { site } from "@/content/site";
import { Users, Cpu, Sunrise } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { seo } from "@/lib/seo";
import founderAsset from "@/assets/founder.webp.asset.json";

export const Route = createFileRoute("/about")({
  head: () => seo("/about", "About", "Teague Industries is an Australian business founded in 2026 to help small businesses get online properly."),
  component: About,
});

const values = [
  { icon: Users, t: "People", d: "Real support, in plain English." },
  { icon: Cpu, t: "Technology", d: "Modern, fast and built around you." },
  { icon: Sunrise, t: "A Brighter Tomorrow", d: "Helping local businesses grow." },
];

function About() {
  return (
    <>
      <PageHeader label="About" title="Our story" />
      <Reveal className="mx-auto max-w-2xl px-6 text-center text-lg text-muted-foreground">
        <p>
          Teague Industries is an Australian business founded in 2026 to help small businesses get online properly — with honest pricing, a free preview first, and practical modern tools.
        </p>
      </Reveal>
      <div className="mx-auto mt-20 grid max-w-5xl gap-6 px-6 md:grid-cols-3">
        {values.map(({ icon: I, t, d }, i) => (
          <Reveal key={t} delay={i * 0.08}>
            <div className="glass glass-hover h-full p-8 text-center">
              <I className="mx-auto h-8 w-8 text-primary-soft" aria-hidden="true" />
              <h2 className="mt-6 text-xs tracking-[0.2em]">{t}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-20 max-w-5xl px-6">
        <div className="glass glass-hover flex flex-col gap-10 p-8 md:flex-row md:items-stretch md:gap-12 md:p-12">
          <div className="mx-auto w-full max-w-[280px] shrink-0 md:mx-0 md:w-[380px]">
            <div
              role="img"
              aria-label="Ben Teague, founder of Teague Industries"
              className="overflow-hidden rounded-2xl border border-border"
              style={{ aspectRatio: "4 / 5", boxShadow: "var(--glow-soft)" }}
            >
              <img src={founderAsset.url} alt="Ben Teague" width={768} height={1152} className="h-full w-full object-cover object-top" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="label">Meet the Founder</p>
            <h2 className="mt-3 text-xl md:text-2xl">Ben Teague</h2>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Founder · Websites and Stores</p>
            <blockquote className="mt-6 border-l-2 border-primary pl-4 text-lg text-primary-soft md:text-xl">
              “I’d rather show you than sell you.”
            </blockquote>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>Hi, I’m Ben. I started Teague Industries in 2026 because too many great local businesses are hard to find online, stuck with no website, an outdated one, or a quote they can’t afford.</p>
              <p>So I do it differently. I build your website or store first and show you a free preview. You only pay if you want to go ahead. You deal with me directly from first message to launch, with no account managers and no jargon.</p>
              <p>When I’m not building for clients, I’m making the templates and tools in our store, so any business can get set up properly, whatever the budget.</p>
            </div>
            <p className="font-hand mt-4 text-2xl text-primary-soft">— Ben</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>Founded 2026</span>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span>Based in Australia</span>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span>ABN 64 813 107 974</span>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span>Free preview first</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary">Get a free preview</Link>
              <a href={`mailto:${site.email}`} className="btn-chrome">Email Ben</a>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
