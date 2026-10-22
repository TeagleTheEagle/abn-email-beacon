import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { demos } from "@/content/demos";
import { services } from "@/content/services";
import { seo } from "@/lib/seo";
import { EstimateCalculator } from "@/components/EstimateCalculator";

export const Route = createFileRoute("/services")({
  head: () =>
    seo(
      "/services",
      "Websites and Stores",
      "Website builds, online store setup, smart stores and monthly care plans for Australian small businesses.",
    ),
  component: Services,
});

function Services() {
  return (
    <>
      <PageHeader
        label="Services"
        title="Everything you need to sell online"
        sub="Clear scope, honest pricing and a free preview before you commit."
      />
      <section className="mx-auto mb-16 max-w-6xl px-6">
        <EstimateCalculator guided />
      </section>
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6">
        {services.map((s) => (
          <Reveal key={s.id}>
            <article
              id={s.id}
              className="glass glass-hover scroll-mt-28 grid gap-10 p-8 sm:p-10 md:grid-cols-[1fr_1.2fr]"
            >
              <div>
                <img
                  src={
                    s.id === "website-build"
                      ? demos.cafe.imageSmall
                      : s.id === "care-plan"
                        ? demos.tradie.imageSmall
                        : demos.retail.imageSmall
                  }
                  alt={`${s.title} example: the ${s.id === "website-build" ? demos.cafe.name : s.id === "care-plan" ? demos.tradie.name : demos.retail.name} demo website`}
                  width={640}
                  height={400}
                  loading="lazy"
                  className="mb-6 aspect-video w-full rounded-lg border border-border object-cover"
                />
                <s.icon className="h-9 w-9 text-primary-soft" aria-hidden="true" />
                <h2 className="mt-6 text-lg">{s.title}</h2>
                <p className="mt-4 text-muted-foreground">{s.short}</p>
                <p className="mt-6 font-display text-xl text-chrome">{s.price}</p>
                <p className="label mt-8">Who it's for</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.whoFor}</p>
                <Link to="/contact" className="btn-primary mt-8">
                  {s.price.startsWith("A$") ? "Get a free preview" : "Get a quote"}
                </Link>
              </div>
              <div>
                <p className="label mb-5">What's included</p>
                <ul className="space-y-3">
                  {s.included.map((i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{" "}
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </>
  );
}
