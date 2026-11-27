import { carePlans, services, type Service } from "@/content/services";
import { site } from "@/content/site";
import { SITE_URL } from "@/lib/seo";

// Include every visible care tier once; prices are shared with the calculator and cards.
export function serviceCatalog(path: "/services" | "/pricing") {
  const tiers = [...new Map([...services, ...carePlans].map((tier) => [tier.id, tier])).values()];
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: `${site.name} services`,
    url: `${SITE_URL}${path}`,
    itemListElement: tiers.map((tier: Service) => ({
      "@type": "Offer",
      url: `${SITE_URL}/services#${tier.monthly ? "care-plan" : tier.id}`,
      description: `${tier.price}${tier.monthly ? "/month" : ""}. Prices in AUD; no GST is charged.`,
      priceCurrency: "AUD",
      ...(!/^From\s/i.test(tier.price) ? { price: tier.fromAud } : {}),
      priceSpecification: {
        "@type": tier.monthly ? "UnitPriceSpecification" : "PriceSpecification",
        priceCurrency: "AUD",
        ...(/^From\s/i.test(tier.price) ? { minPrice: tier.fromAud } : { price: tier.fromAud }),
        valueAddedTaxIncluded: false,
        ...(tier.monthly ? { billingDuration: "P1M", unitText: "month" } : {}),
      },
      itemOffered: {
        "@type": "Service",
        name: tier.title,
        description: tier.short,
        provider: { "@type": "Organization", name: site.name, url: SITE_URL },
        areaServed: { "@type": "Country", name: "Australia" },
      },
    })),
  };
}
