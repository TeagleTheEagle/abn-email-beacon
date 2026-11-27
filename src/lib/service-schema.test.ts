import { describe, expect, it } from "vitest";
import { services, carePlans } from "@/content/services";
import { serviceCatalog } from "./service-schema";

describe("service structured data", () => {
  it.each(["/services", "/pricing"] as const)(
    "uses the visible tiers and current prices on %s",
    (path) => {
      const catalog = serviceCatalog(path);
      const tiers = [
        ...new Map([...services, ...carePlans].map((tier) => [tier.id, tier])).values(),
      ];
      expect(JSON.parse(JSON.stringify(catalog))).toEqual(catalog);
      expect(catalog.itemListElement).toHaveLength(tiers.length);
      for (const tier of tiers) {
        const offer = catalog.itemListElement.find(
          (entry) => entry.itemOffered.name === tier.title,
        );
        expect(offer?.priceCurrency).toBe("AUD");
        expect(offer?.priceSpecification.valueAddedTaxIncluded).toBe(false);
        if (/^From\s/i.test(tier.price)) {
          expect(offer?.price).toBeUndefined();
          const spec = offer?.priceSpecification;
          expect(spec && "minPrice" in spec ? spec.minPrice : undefined).toBe(tier.fromAud);
        } else {
          const spec = offer?.priceSpecification;
          expect(spec && "price" in spec ? spec.price : undefined).toBe(tier.fromAud);
        }
        if (tier.monthly) expect(offer?.priceSpecification.billingDuration).toBe("P1M");
      }
    },
  );
});
