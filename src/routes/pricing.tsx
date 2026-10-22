import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { Price } from "@/components/Price";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import { CarePlans } from "@/components/CarePlans";
import { AddOns } from "@/components/AddOns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { services } from "@/content/services";
import { faqs } from "@/content/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () =>
    seo(
      "/pricing",
      "Pricing",
      "Website builds from A$500 with a free preview first. Store, smart store and care plan quotes to suit your business.",
    ),
  component: Pricing,
});

// The money questions from the shared FAQ list, so this page answers them without a second copy.
const pricingFaqs = faqs.filter((f) =>
  /cost|pay|platform|owns|changes|own my domain|preview include/i.test(f.q),
);

// The three builds get the big cards; the Care Plans have their own comparison below.
const builds = services.filter((s) => !s.monthly);

function Pricing() {
  return (
    <>
      <PageHeader
        label="Pricing"
        title="Honest, simple pricing"
        sub="See a free preview first. Pay only when you're happy."
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
        {builds.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.08}>
            <div
              className={`glass glass-hover relative flex h-full flex-col p-7 ${s.popular ? "border-primary/60 shadow-[var(--glow-soft)]" : ""}`}
            >
              {s.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                  Most popular
                </span>
              )}
              <h2 className="text-xs tracking-[0.2em]">{s.title}</h2>
              <Price price={s.price} monthly={s.monthly} size="lg" className="mt-6" />
              {s.priceNote && !s.monthly && (
                <p className="mt-2 text-xs text-muted-foreground">{s.priceNote}</p>
              )}
              <ul className="mt-8 flex-1 space-y-3">
                {s.included.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent-tech"
                      aria-hidden="true"
                    />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className={`${s.popular ? "btn-primary" : "btn-chrome"} mt-8`}>
                {s.price.startsWith("A$") ? "Get a free preview" : "Get a quote"}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-16 max-w-6xl px-6">
        <CarePlans />
      </Reveal>
      <Reveal className="mx-auto mt-16 max-w-6xl px-6">
        <AddOns />
      </Reveal>
      <Reveal className="mx-auto mt-16 max-w-5xl px-6">
        <EstimateCalculator />
      </Reveal>
      <Reveal className="mx-auto mt-16 max-w-5xl px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="glass corner-marks p-8">
            <p className="label">Why A$500?</p>
            <h2 className="mt-4 text-2xl">Because you see it before you pay for it.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              There is no office, no account manager and no sales call. You brief me in two minutes,
              I build the preview, and I only finish what you have already said yes to. That keeps
              the price fixed and the work focused on your business.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Nothing is due until you approve the preview. Stores and Smart Stores start from the
              prices shown because every catalogue is different; you get a fixed quote with the
              preview.
            </p>
          </div>
          <div>
            <p className="label">Money questions</p>
            <Accordion type="single" collapsible className="mt-2">
              {pricingFaqs.map((faq, i) => (
                <AccordionItem key={faq.q} value={`p${i}`}>
                  <AccordionTrigger className="text-left text-base hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </Reveal>
      <Reveal className="mx-auto mt-14 max-w-2xl space-y-3 px-6 text-center text-sm text-muted-foreground">
        <p>Prices in AUD. Teague Industries is not registered for GST, so no GST is charged.</p>
        <p>
          Not sure what you need?{" "}
          <Link to="/contact" className="text-primary-soft hover:underline">
            Get a free preview
          </Link>{" "}
          and we'll recommend the right option.
        </p>
      </Reveal>
    </>
  );
}
