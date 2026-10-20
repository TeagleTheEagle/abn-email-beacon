import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, BadgeCheck, Eye, ArrowRight, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Starfield } from "@/components/Starfield";
import { Reveal } from "@/components/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProjectCard } from "@/components/ProjectCard";
import earth from "@/assets/earth-horizon.jpg";
import { faqs, site, steps } from "@/content/site";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { seo } from "@/lib/seo";
import { QuickLeadForm } from "@/components/QuickLeadForm";

export const Route = createFileRoute("/")({
  head: () => seo("/", "Websites & Shopify Stores for Australian Small Businesses", "Websites, Shopify stores and AI-powered tools for Australian small businesses. See a free preview before you pay a cent."),
  component: Home,
});

const fade = (d: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: d, ease: "easeOut" as const },
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-40 pt-28 text-center">
        <img
          src={earth}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1088}
          className="animate-drift pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_70%] opacity-90"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
        <Starfield className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="animate-flare pointer-events-none absolute left-1/2 top-[58%] h-40 w-[36rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <motion.div {...fade(0)}>
            <Logo glow className="h-28 w-28 sm:h-40 sm:w-40" />
          </motion.div>
          <motion.p {...fade(0.15)} className="mt-8 font-display text-base tracking-[0.3em] text-chrome sm:text-2xl sm:tracking-[0.4em]">
            Teague Industries
          </motion.p>
          <motion.p {...fade(0.25)} className="label mt-4 !text-[9px] sm:!text-[11px]">{site.tagline}</motion.p>
          <motion.h1 {...fade(0.4)} className="mt-12 max-w-3xl text-2xl text-foreground sm:text-4xl lg:text-5xl">
            We build online stores that sell.
          </motion.h1>
          <motion.p {...fade(0.5)} className="mt-6 max-w-xl text-muted-foreground sm:text-lg">
            Websites, Shopify stores and AI-powered tools for Australian small businesses. See a free preview before you pay a cent.
          </motion.p>
          <motion.div {...fade(0.6)} className="mt-10 flex w-full flex-col items-center gap-4">
            <QuickLeadForm />
            <Link to="/work" className="text-sm text-primary-soft hover:underline">or see our work →</Link>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        <div className="chrome-line absolute inset-x-6 bottom-24" />
        <div className="absolute bottom-6 left-6 z-10 hidden border-l border-foreground/40 pl-3 text-left sm:block">
          <p className="font-display text-[9px] tracking-[0.3em] text-foreground">Teague Industries</p>
          <p className="label mt-1 !text-[9px]">{site.est}</p>
        </div>
      </section>

      {/* TRUST */}
      <section className="px-6">
        <Reveal className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            { icon: MapPin, t: "Built in Australia" },
            { icon: BadgeCheck, t: "ABN registered" },
            { icon: Eye, t: "Free preview before you pay" },
          ].map(({ icon: I, t }) => (
            <div key={t} className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <I className="h-4 w-4 text-primary-soft" aria-hidden="true" /> {t}
            </div>
          ))}
        </Reveal>
      </section>

      {/* SERVICES */}
      <Section label="What we do" title="Services">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <Link to="/services" hash={s.id} className="glass glass-hover flex h-full flex-col p-6">
                <s.icon className="h-7 w-7 text-primary-soft" aria-hidden="true" />
                <h3 className="mt-6 text-xs tracking-[0.2em]">{s.title}</h3>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{s.short}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-primary-soft">Learn more <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:gap-6">
          <span><span className="text-foreground">Websites from A$500</span> · one-off</span>
          <span className="hidden sm:inline">|</span>
          <span>Shopify &amp; AI stores: free quote</span>
          <span className="hidden sm:inline">|</span>
          <Link to="/pricing" className="text-primary-soft hover:underline">See pricing</Link>
        </Reveal>
      </Section>

      {/* AI DETAIL */}
      <Section label="Smart Store Setup" title="What the AI actually does">
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { t: "Writes your product descriptions", b: "Clear, search-friendly descriptions drafted for every product, ready for you to check and approve." },
            { t: "Recommends related products", b: "\"You may also like\" suggestions on product and cart pages to lift order size." },
            { t: "Answers common questions", b: "Live chat that replies to FAQs and order-tracking questions at any hour." },
            { t: "Sends emails automatically", b: "Welcome, abandoned-cart and post-purchase emails that go out on their own." },
          ].map((x, i) => (
            <Reveal key={x.t} delay={i * 0.06} className="glass p-6">
              <h3 className="text-xs tracking-[0.2em]">{x.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{x.b}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Built on Shopify's own tools, so no extra monthly app fees from us.</p>
      </Section>

      {/* HOW IT WORKS */}
      <Section label="The process" title="How it works">
        <div className="relative grid gap-10 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-primary to-transparent shadow-[var(--glow)] md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-background font-display text-xs text-primary-soft shadow-[var(--glow)]">
                {s.n}
              </div>
              <h3 className="mt-6 text-sm tracking-[0.2em]">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* WORK */}
      <Section label="Portfolio" title="Our work">
        <div className="grid gap-6 md:grid-cols-3">
          {projects.slice(0, 2).map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}><ProjectCard project={p} /></Reveal>
          ))}
          <Reveal delay={0.16}>
            <Link to="/contact" className="glass glass-hover flex h-full flex-col justify-center p-8 text-center">
              <p className="label">Founding clients</p>
              <h3 className="mt-4 text-sm tracking-[0.2em]">Your business could be here</h3>
              <p className="mt-3 text-sm text-muted-foreground">We're taking on our first client projects now. Get a free preview and be one of our first case studies.</p>
              <span className="mt-6 inline-flex items-center justify-center gap-1 text-sm text-primary-soft">Get a free preview <ArrowRight className="h-4 w-4" /></span>
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* TEMPLATES */}
      <section className="px-6 py-20">
        <Reveal className="glass mx-auto max-w-4xl p-10 text-center sm:p-14">
          <p className="label">Templates</p>
          <h2 className="mt-4 text-xl sm:text-2xl">Prefer to DIY?</h2>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            Ready-made invoices, quotes, agreements and website kits — built for Australian businesses. Download and go.
          </p>
          <a href={site.storeUrl} target="_blank" rel="noopener noreferrer" className="btn-chrome mt-8">
            Browse templates <ExternalLink className="h-4 w-4" />
          </a>
        </Reveal>
      </section>

      {/* FAQ */}
      <Section label="Questions" title="FAQ">
        <Reveal className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="glass px-6">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`f${i}`} className="border-border last:border-0">
                <AccordionTrigger className="text-left text-base hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Section>

      <CtaBand />
    </>
  );
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-14 text-center">
          <p className="label">{label}</p>
          <h2 className="mt-4 text-xl text-chrome sm:text-3xl">{title}</h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[40rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
      <Reveal className="relative">
        <h2 className="mx-auto max-w-2xl text-xl sm:text-3xl">Ready to see your business online?</h2>
        <Link to="/contact" className="btn-primary mt-10">Get a free preview</Link>
      </Reveal>
    </section>
  );
}
