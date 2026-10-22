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
import { BeforeAfter } from "@/components/BeforeAfter";
import { Price } from "@/components/Price";
import { productsQueryOptions } from "@/lib/product-queries";
import { formatPrice, shopifyImage, type ShopifyProduct } from "@/lib/shopify";
import templatesStore from "@/assets/work-templates.jpg";

// The product given the oversized showcase. Falls back to whatever Shopify lists first.
const FEATURED_HANDLE = "48-hour-website-speed-conversion-audit";

export const Route = createFileRoute("/")({
  head: () => {
    const base = seo(
      "/",
      "Websites and Stores for All Australian Businesses",
      "Websites from A$500, online stores and smart tools for businesses of every size on Sydney's Lower North Shore and across Australia. Free preview first.",
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
  // Products further down are a bonus, never a wait: give Shopify 1.5s (usually answered from the
  // server cache) and render without them if it's slower. Loader data reaches the browser, so server
  // and client render the same thing; the query cache alone would not.
  loader: async ({ context }) => {
    await Promise.race([
      context.queryClient.prefetchQuery(productsQueryOptions),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
    const products = context.queryClient.getQueryData(productsQueryOptions.queryKey) ?? [];
    const featured = products.find((p) => p.node.handle === FEATURED_HANDLE) ?? products[0] ?? null;
    const covers = products.filter((p) => p !== featured).slice(0, 4);
    return { featured, covers };
  },
  component: Home,
});

// Page order: lead with the website offer (packages, what's under them, examples, process), then
// the people, then the audit for those who already have a site, then the shop.
function Home() {
  return (
    <>
      <section className="home-hero scanline">
        <img
          src={earth}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1088}
          className="hero-earth"
        />
        <div className="hero-shade" />
        <div className="tech-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="home-hero-inner">
          <div className="min-w-0 animate-rise">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="label">Teague Industries / Built in Sydney / {site.est}</p>
              <span className="label inline-flex items-center rounded-[2px] border border-accent-tech/40 bg-accent-tech/10 px-2.5 py-1 !text-[9px] !text-accent-tech">
                Free preview first
              </span>
            </div>
            <h1 className="hero-heading mt-6">
              Websites and Stores.
              <br />
              <span className="text-primary-soft">Built for your next chapter.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Custom websites from <strong className="text-accent-tech">A$500</strong> and online
              stores from <strong className="text-accent-tech">A$1,200</strong> for Australian
              businesses of every size — with a free preview before you pay.
            </p>
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
            <div className="corner-marks p-3">
              <WebsitePreview />
            </div>
            <div className="mt-2 flex items-center justify-between gap-4 px-3 text-xs text-muted-foreground">
              <span className="label !text-[9px]">LAT 33.84 S / LON 151.21 E</span>
              <span>Interactive concept · click around · not a client project</span>
            </div>
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
      <Section index="01" label="Services" title="A clear scope. An honest price." surface>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 0.05} className="h-full">
              <article className="glass glass-hover flex h-full flex-col overflow-hidden">
                <img
                  src={
                    i === 0
                      ? demos.cafe.imageSmall
                      : i === 1
                        ? demos.retail.imageSmall
                        : i === 2
                          ? templatesStore
                          : demos.tradie.imageSmall
                  }
                  alt={`${service.title} illustrative example`}
                  width={640}
                  height={400}
                  loading="lazy"
                  className="service-card-image"
                />
                <div className="flex flex-1 flex-col p-6">
                  <p className="label !text-[9px]">Service 0{i + 1}</p>
                  <h3 className="mt-3 text-xl">{service.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{service.short}</p>
                  <Price price={service.price} monthly={service.monthly} className="mt-5" />
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
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-tech" />
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
          All prices in AUD. No GST is charged.{" "}
          <Link to="/pricing" className="text-primary-soft underline underline-offset-4">
            Full pricing details
          </Link>
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-8">
          <p className="label">Works with</p>
          {[
            "Google Maps",
            "Google Business Profile",
            "Instagram",
            "PayPal",
            "Apple Pay",
            "Google Pay",
          ].map((name) => (
            <span
              key={name}
              className="text-sm font-semibold tracking-wide text-muted-foreground/80"
            >
              {name}
            </span>
          ))}
        </div>
      </Section>
      <Section index="02" label="Engineering" title="Under the hood.">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="corner-marks p-3">
              <div className="relative aspect-[4/3] overflow-hidden border border-border bg-surface-2">
                <img
                  src={demos.salon.image}
                  alt="Close-up of the salon demo's header and booking section"
                  width={1024}
                  height={640}
                  loading="lazy"
                  className="absolute left-0 top-0 w-[180%] max-w-none origin-top-left"
                />
                <span className="label absolute bottom-3 left-3 rounded-[2px] bg-background/80 px-2 py-1 !text-[9px] backdrop-blur">
                  Detail · 180%
                </span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-lg text-muted-foreground">
              Looks are the easy part. Every build ships with the things you don’t see.
            </p>
            <dl className="mt-8 divide-y divide-border border-y border-border">
              <SpecRow k="Mobile-first" v="Laid out for phones first, then desktop" />
              <SpecRow
                k="Search-ready"
                v="Titles, descriptions and structured data on every page"
              />
              <SpecRow k="Secure" v="HTTPS on your own domain" />
              <SpecRow k="Fast" v="Optimised images and self-hosted fonts" />
              <SpecRow k="Yours" v="Your content, domain and accounts, from day one" />
            </dl>
          </Reveal>
        </div>
      </Section>
      <Section
        index="03"
        label="Smart Store Setup"
        title="Less admin. More time for your business."
      >
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
      <Section
        index="04"
        label="The difference"
        title="From “we really should fix the website” to this."
        surface
      >
        <p className="mb-8 max-w-2xl text-muted-foreground">
          The same café, before and after. One is a page people leave. The other is a place they
          want to visit. Both are illustrative concepts, not client sites.
        </p>
        <BeforeAfter />
      </Section>
      <Section
        index="05"
        label="Work"
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
      <Section index="06" label="Process" title="Preview. Approve. Launch." surface>
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
          <div className="corner-marks mx-auto w-full max-w-[264px] p-3">
            <img
              src={founder.url}
              alt="Ben Teague, founder"
              width={768}
              height={1152}
              loading="lazy"
              className="aspect-[4/5] w-full border border-border object-cover object-top"
            />
          </div>
          <div className="min-w-0">
            <p className="label">Meet the founder</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">Hi, I’m Ben.</h2>
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
      <FeaturedProduct />
      <ShopStrip />
      <Section index="09" label="Good questions" title="Before we get started.">
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
  index,
  label,
  title,
  children,
  action,
  surface = false,
}: {
  index?: string;
  label: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  surface?: boolean;
}) {
  return (
    <section
      className={`px-6 py-16 sm:py-24 ${surface ? "border-y border-border bg-surface/40" : ""}`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-5">
          <div className="min-w-0">
            <p className="label">{index ? `${index} / ${label}` : label}</p>
            <h2 className="mt-4 text-4xl sm:text-5xl">{title}</h2>
            <div className="tech-line mt-6 max-w-[160px]" aria-hidden="true" />
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

// A row of an engineering-style specification sheet.
function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-baseline gap-4 py-3 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
      <dt className="label !text-[9px]">{k}</dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-border px-6 py-16 text-center sm:py-24">
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
        <h2 className="mx-auto mt-4 max-w-2xl text-4xl sm:text-5xl">Ready for a better website?</h2>
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

// One product, nearly a screen tall: a huge cover on one side and a specification sheet on the other.
// It sits after the website offer because it's for people who already have a site.
function FeaturedProduct() {
  const { featured } = Route.useLoaderData();
  if (!featured) return null;
  const node = featured.node;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const audit = node.handle.includes("audit");
  const firstSentence = node.description.split(/(?<=\.)\s/)[0] ?? node.description;
  return (
    <section className="border-y border-border bg-surface px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <Link
            to="/product/$handle"
            params={{ handle: node.handle }}
            className="group corner-marks block p-4"
            aria-label={`View ${node.title}`}
          >
            <div className="cinematic-scale relative aspect-square overflow-hidden border border-border bg-surface-2">
              {image && (
                <img
                  src={shopifyImage(image.url, 900)}
                  srcSet={`${shopifyImage(image.url, 600)} 600w, ${shopifyImage(image.url, 900)} 900w, ${shopifyImage(image.url, 1200)} 1200w`}
                  sizes="(max-width: 1023px) 92vw, 640px"
                  alt={image.altText || node.title}
                  width={900}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              )}
              {/* Callouts fade in on hover, like labels on a drawing. */}
              <Callout className="left-[7%] top-[9%]">
                01 / {audit ? "Video review" : "Digital download"}
              </Callout>
              <Callout className="bottom-[9%] right-[7%]">Teague Industries · Sydney</Callout>
            </div>
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="label">07 / {audit ? "Already have a website?" : "Featured"}</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">{node.title}</h2>
          <p className="mt-5 max-w-lg text-muted-foreground">{firstSentence}</p>
          <dl className="mt-8 divide-y divide-border border-y border-border">
            <SpecRow k="Format" v={audit ? "Video review + 1-page roadmap" : "Digital download"} />
            <SpecRow k="Delivery" v={audit ? "Within 48 hours" : "Instant"} />
            <SpecRow k="Price" v={formatPrice(price.amount, price.currencyCode)} />
            <SpecRow k="Made by" v="Teague Industries, Sydney" />
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/product/$handle" params={{ handle: node.handle }} className="btn-primary">
              Explore product <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="btn-chrome">
              All products
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Callout({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className={`label pointer-events-none absolute inline-flex items-center gap-2 rounded-[2px] border border-primary/40 bg-background/80 px-2.5 py-1 !text-[9px] !text-primary-soft opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

// The shop's covers are the most striking pictures on the site, so the home page shows a few of
// them. Renders with just the heading and button if Shopify hasn't answered.
function ShopStrip() {
  const picks = Route.useLoaderData().covers;
  return (
    <Section
      index="08"
      label="The digital shop"
      title="Tools for your next chapter."
      action={
        <Button asChild size="lg" variant="outline" className="h-12">
          <Link to="/shop">
            Explore our products <ArrowRight />
          </Link>
        </Button>
      }
    >
      <p className="max-w-xl text-muted-foreground">
        Templates, guides and practical resources for Australian businesses and creators.
      </p>
      {picks.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {picks.map((product, i) => (
            <Reveal key={product.node.id} delay={i * 0.05} className="h-full">
              <ProductCover product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}

function ProductCover({ product }: { product: ShopifyProduct }) {
  const node = product.node;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  return (
    <Link
      to="/product/$handle"
      params={{ handle: node.handle }}
      className="glass glass-hover group flex h-full flex-col overflow-hidden"
    >
      <div className="aspect-square overflow-hidden bg-surface-2">
        {image && (
          <img
            src={shopifyImage(image.url, 500)}
            srcSet={`${shopifyImage(image.url, 320)} 320w, ${shopifyImage(image.url, 500)} 500w, ${shopifyImage(image.url, 700)} 700w`}
            sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 270px"
            alt={image.altText || node.title}
            width={500}
            height={500}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-sm font-medium leading-snug">{node.title}</span>
        <span className="mt-auto text-sm font-semibold text-accent-tech">
          {formatPrice(price.amount, price.currencyCode)}
        </span>
      </div>
    </Link>
  );
}
