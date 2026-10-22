import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { Price } from "@/components/Price";
import { demos } from "@/content/demos";
import { services } from "@/content/services";
import { seo } from "@/lib/seo";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import templatesStore from "@/assets/work-templates.jpg";

export const Route = createFileRoute("/services")({
  head: () =>
    seo(
      "/services",
      "Websites and Stores",
      "Website builds, online store setup, smart stores and monthly care plans for Australian businesses of every size.",
    ),
  component: Services,
});

// One picture per tier: the café demo for a website, the retail demo for a store, our own templates
// store for the smart store, and the trades demo for the care plan.
function illustration(id: string): { src: string; alt: string } {
  switch (id) {
    case "website-build":
      return { src: demos.cafe.imageSmall, alt: `the ${demos.cafe.name} demo website` };
    case "shopify-store":
      return { src: demos.retail.imageSmall, alt: `the ${demos.retail.name} demo store` };
    case "smart-store":
      return { src: templatesStore, alt: "the Teague Industries templates store on a laptop" };
    default:
      return { src: demos.tradie.imageSmall, alt: `the ${demos.tradie.name} demo website` };
  }
}

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
        {services.map((s) => {
          const picture = illustration(s.id);
          return (
            <Reveal key={s.id}>
              <article
                id={s.id}
                className="glass glass-hover scroll-mt-28 grid gap-10 p-8 sm:p-10 md:grid-cols-[1fr_1.2fr]"
              >
                <div>
                  <img
                    src={picture.src}
                    alt={`${s.title} example: ${picture.alt}`}
                    width={640}
                    height={400}
                    loading="lazy"
                    className="mb-6 aspect-video w-full rounded-lg border border-border object-cover"
                  />
                  <s.icon className="h-9 w-9 text-primary-soft" aria-hidden="true" />
                  <h2 className="mt-6 text-lg">{s.title}</h2>
                  <p className="mt-4 text-muted-foreground">{s.short}</p>
                  <Price price={s.price} monthly={s.monthly} className="mt-6" />
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
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-accent-warm"
                          aria-hidden="true"
                        />{" "}
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
