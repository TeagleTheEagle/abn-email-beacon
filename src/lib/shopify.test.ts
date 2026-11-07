import { describe, expect, it } from "vitest";
import { deliveryLabel, normaliseStoreCopy, productDetails } from "@/lib/shopify";

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
  it("normalises platform references and bare canonical domain in store copy", () => {
    expect(
      normaliseStoreCopy(
        "Plug leaks across your Shopify store. Based on teagueindustries.com.au/demo/tradie.",
      ),
    ).toBe(
      "Plug leaks across your online store. Based on www.teagueindustries.com.au/demo/tradie.",
    );
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
