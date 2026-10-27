import { describe, expect, it } from "vitest";
import { deliveryLabel, productDetails } from "@/lib/shopify";

describe("product details", () => {
  it("reads the Shopify detail fields, skipping missing ones", () => {
    const details = productDetails({
      details: [
        { key: "audience", value: "Tradies" },
        { key: "includes", value: '["Guide (PDF)","Templates (Word)"]' },
        null,
        { key: "delivery", value: "Instant download" },
      ],
    });
    expect(details).toEqual({
      audience: "Tradies",
      includes: ["Guide (PDF)", "Templates (Word)"],
      delivery: "Instant download",
    });
  });
  it("ignores a malformed list instead of failing the page", () => {
    expect(productDetails({ details: [{ key: "includes", value: "not json" }] }).includes).toEqual(
      [],
    );
  });
  it("falls back to a delivery label when the field is empty", () => {
    expect(deliveryLabel({ handle: "48-hour-website-speed-conversion-audit" })).toBe(
      "Delivered within 48 hours",
    );
    expect(deliveryLabel({ handle: "tradie-website-starter-kit", details: [] })).toBe(
      "Instant download",
    );
  });
});
