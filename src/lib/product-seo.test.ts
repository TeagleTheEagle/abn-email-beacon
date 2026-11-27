import { describe, expect, it } from "vitest";
import { productSeoTitle } from "./product-seo";

describe("product SEO title", () => {
  it("uses Shopify's SEO title without renaming the product", () => {
    const product = {
      title: "Australian Invoice, Quote & Service Agreement Templates",
      seo: { title: "Australian Business Templates", description: null },
    };
    expect(productSeoTitle(product)).toBe("Australian Business Templates");
    expect(product.title).toBe("Australian Invoice, Quote & Service Agreement Templates");
  });
  it("falls back to the product name when SEO is absent or blank", () => {
    expect(productSeoTitle({ title: "Store Conversion & Checkout Optimisation Playbook" })).toBe(
      "Store Conversion & Checkout Optimisation Playbook",
    );
    expect(
      productSeoTitle({
        title: "Australian Website Launch & Copywriting Kit",
        seo: { title: "  ", description: null },
      }),
    ).toBe("Australian Website Launch & Copywriting Kit");
  });
});
