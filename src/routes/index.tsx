import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin,
  BadgeCheck,
  Eye,
  ArrowRight,
  Check,
  Clock,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProjectCard } from "@/components/ProjectCard";
import { WebsitePreview } from "@/components/WebsitePreview";
import { Button } from "@/components/ui/button";
import earth from "@/assets/earth-horizon.webp";
import founder from "@/assets/founder.webp.asset.json";
import { faqs, site } from "@/content/site";
import { ProjectJourney } from "@/components/ProjectJourney";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { demos } from "@/content/demos";
import { seo, SITE_URL, OG_IMAGE } from "@/lib/seo";
import { QuickLeadForm } from "@/components/QuickLeadForm";

export const Route = createFileRoute("/")({
  head: () => {
    const base = seo(
      "/",
      "Websites and Stores for Australian Small Businesses",
      "Websites from A$500, online stores and smart tools for small businesses on Sydney's Lower North Shore and across Australia. Free preview first.",
    );
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: "Teague Industries",
            url: SITE_URL,
            image: OG_IMAGE,
            email: site.email,
            taxID: site.abn,
            founder: { "@type": "Person", name: "Ben Teague" },
            address: { "@type": "PostalAddress", addressRegion: "NSW", addressCountry: "AU" },
            areaServed: [
              ...site.suburbs.map((s) => ({ "@type": "Place", name: `${s}, NSW` })),
              { "@type": "Country", name: "Australia" },
            ],
            priceRange: "A$500+",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  return (
    <>
      <section className="home-hero">
        <img
          src={earth}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1088}
          className="hero-earth"
        />
        <div className="hero-shade" />
        <div className="home-hero-inner">
          <div className="min-w-0 animate-rise">
            <p className="label text-primary-soft">Sydney · Australia</p>
            <h1 className="hero-heading mt-5">
              Websites and Stores.
              <br />
              <span className="text-primary-soft">Built for your next chapter.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              A better home for your business online. Custom websites, online stores and smart tools
              — with a free preview before you pay.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <span>
                Websites <strong className="text-primary-soft">A$500</strong>
              </span>
              <span>
                Stores <strong className="text-primary-soft">from A$1,200</strong>
              </span>
            </div>
            <div className="mt-7 max-w-md">
              <QuickLeadForm />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary-soft" /> No payment upfront
              </span>
              <Link to="/work" className="inline-flex items-center gap-1 text-primary-soft">
                Explore our work <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="min-w-0 animate-rise">
            <WebsitePreview />
            <p className="mt-3 text-right text-xs text-muted-foreground">
              Interactive concepts · Not client projects
            </p>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-surface/60 px-6 py-6">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: "Australian based",
              detail: "Sydney’s Lower North Shore · Australia-wide",
            },
            { icon: BadgeCheck, title: "ABN registered", detail: site.abn },
            { icon: Eye, title: "Free preview first", detail: "Only pay if you want to go ahead" },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex items-center gap-4 sm:justify-center">
              <Icon className="h-6 w-6 shrink-0 text-primary-soft" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Section
        label="See what's possible"
        title="Your business. A better first impression."
        action={
          <Link to="/work" className="inline-flex items-center gap-2 text-sm text-primary-soft">
            All work <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <p className="mb-8 max-w-2xl text-muted-foreground">
          Explore a café, trades business, salon or store. These are working concepts, not client
          case studies.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {projects
            .filter((p) => p.demoKind)
            .map((project, i) => (
              <Reveal key={project.title} delay={i * 0.06}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
        </div>
      </Section>
      <Section label="Our services" title="A clear scope. An honest price." surface>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 0.05} className="h-full">
              <article className="glass glass-hover flex h-full flex-col overflow-hidden">
                <img
                  src={
                    i === 0
                      ? demos.cafe.imageSmall
                      : i === 3
                        ? demos.tradie.imageSmall
                        : demos.retail.imageSmall
                  }
                  alt={`${service.title} illustrative example`}
                  width={640}
                  height={400}
                  loading="lazy"
                  className="service-card-image"
                />
                <div className="flex flex-1 flex-col p-6">
                  <service.icon className="h-6 w-6 text-primary-soft" />
                  <h3 className="mt-4 text-xl">{service.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{service.short}</p>
                  <p className="mt-5 text-2xl font-bold text-primary-soft">
                    {service.price}
                    <span className="text-sm font-normal">
                      {service.id === "care-plan" ? "/mo" : ""}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {service.id === "website-build"
                      ? "One-off · Free preview first"
                      : service.id === "care-plan"
                        ? "Monthly"
                        : "Setup fee · Platform plan separate"}
                  </p>
                  <ul className="mb-6 mt-6 flex-1 space-y-3">
                    {service.included.map((item) => (
                      <li key={item} className="flex gap-2 text-xs text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-soft" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="h-11">
                    <Link to="/services" hash={service.id}>
                      Explore service <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          All prices in AUD. Not GST registered.{" "}
          <Link to="/pricing" className="text-primary-soft underline underline-offset-4">
            Full pricing details
          </Link>
        </p>
      </Section>
      <Section label="Simple from the start" title="Preview. Approve. Launch.">
        <ProjectJourney />
        <div className="mt-10 grid gap-5 border-t border-border pt-6 sm:grid-cols-3">
          {[
            { icon: Clock, title: "About one week", text: "Standard website · 5–7 business days" },
            {
              icon: Check,
              title: "Two revision rounds",
              text: "In scope; extra work quoted first",
            },
            { icon: ShieldCheck, title: "It’s yours", text: "Your content, domain and accounts" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-1 h-5 w-5 shrink-0 text-primary-soft" />
              <div>
                <h3 className="text-base">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <section className="border-y border-border bg-surface/50 px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
          <img
            src={founder.url}
            alt="Ben Teague, founder"
            width={768}
            height={1152}
            loading="lazy"
            className="mx-auto aspect-[4/5] w-full max-w-[240px] rounded-lg border border-border object-cover object-top"
          />
          <div className="min-w-0">
            <p className="label">Meet the founder</p>
            <h2 className="mt-4 text-3xl">Hi, I’m Ben.</h2>
            <blockquote className="mt-5 border-l-2 border-primary pl-4 text-xl text-primary-soft">
              “I’d rather show you than sell you.”
            </blockquote>
            <p className="mt-5 max-w-xl text-muted-foreground">
              You work directly with me, from your first message to launch. No account managers, no
              jargon — just a website or store built around your business.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/about">
                  <UserRound /> Meet Ben
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <a href={`mailto:${site.email}`}>
                  Email Ben <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Section label="Smart Store Setup" title="Less admin. More time for your business.">
        <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {[
            {
              t: "Product descriptions, drafted for you",
              b: "Clear, search-friendly copy for every product, ready for you to check and approve.",
            },
            {
              t: "Related products, recommended",
              b: "“You may also like” suggestions on product and cart pages to help customers find more of what they need.",
            },
            {
              t: "Common questions, answered",
              b: "Live chat for FAQs and order-tracking questions, even outside business hours.",
            },
            {
              t: "Follow-up emails, automated",
              b: "Welcome, abandoned-cart and post-purchase emails that go out on their own.",
            },
          ].map((item) => (
            <div key={item.t} className="border-t border-border pt-6">
              <h3 className="text-xl">{item.t}</h3>
              <p className="mt-3 text-muted-foreground">{item.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Built on the store platform’s own tools. No extra monthly app fees from us.
        </p>
      </Section>
      <section className="border-y border-border bg-surface px-6 py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="label">The digital shop</p>
            <h2 className="mt-3 text-3xl">Tools for your next chapter.</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Templates, guides and practical resources for Australian businesses and creators.
            </p>
          </div>
          <Button asChild size="lg" variant="outline" className="h-12">
            <Link to="/shop">
              Explore our products <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
      <Section label="Good questions" title="Before we get started.">
        <div className="max-w-3xl">
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`f${i}`}>
                <AccordionTrigger className="text-left text-base hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
      <CtaBand />
    </>
  );
}

function Section({
  label,
  title,
  children,
  action,
  surface = false,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  surface?: boolean;
}) {
  return (
    <section
      className={`px-6 py-16 sm:py-20 ${surface ? "border-y border-border bg-surface/40" : ""}`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-5">
          <div className="min-w-0">
            <p className="label">{label}</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-border px-6 py-16 text-center sm:py-20">
      <img
        src={earth}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1088}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="relative">
        <p className="label">Your next chapter starts here</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl sm:text-4xl">Ready for a better website?</h2>
        <p className="mt-4 text-muted-foreground">Free preview first. No obligation.</p>
        <Button asChild size="lg" className="mt-7 h-12">
          <Link to="/contact">
            Get a free preview <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
