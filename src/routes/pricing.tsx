import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import { services } from "@/content/services";
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

function Pricing() {
  return (
    <>
      <PageHeader
        label="Pricing"
        title="Honest, simple pricing"
        sub="See a free preview first. Pay only when you're happy."
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
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
              <p className="mt-6 font-display text-2xl text-chrome">{s.price}</p>
              {s.priceNote && <p className="mt-2 text-xs text-muted-foreground">{s.priceNote}</p>}
              <ul className="mt-8 flex-1 space-y-3">
                {s.included.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{" "}
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
      <Reveal className="mx-auto mt-16 max-w-5xl px-6">
        <EstimateCalculator />
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
