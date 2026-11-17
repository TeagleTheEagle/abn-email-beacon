import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addLineToShopifyCart,
  checkCartExists,
  createShopifyCart,
  removeLineFromShopifyCart,
  updateShopifyCartLine,
} from "./shopify";

function shopifyResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Shopify cart mutations", () => {
  it("returns a Shopify user error instead of reporting a failed addition as successful", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        shopifyResponse({
          data: {
            cartLinesAdd: {
              cart: null,
              userErrors: [{ field: ["lines", "0", "quantity"], message: "Out of stock" }],
            },
          },
        }),
      ),
    );

    const result = await addLineToShopifyCart("cart-1", { variantId: "variant-1", quantity: 1 });

    expect(result).toEqual({ success: false, error: "Out of stock", cartNotFound: false });
  });

  it("rejects an addition response without the matching saved line", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        shopifyResponse({
          data: { cartLinesAdd: { cart: { lines: { edges: [] } }, userErrors: [] } },
        }),
      ),
    );

    const result = await addLineToShopifyCart("cart-1", { variantId: "variant-1", quantity: 1 });

    expect(result.success).toBe(false);
    expect(result).toHaveProperty("error");
  });

  it("rejects missing cart responses for create, update and remove", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(shopifyResponse({ data: {} })));
    vi.stubGlobal("fetch", fetchMock);

    const created = await createShopifyCart([{ variantId: "variant-1", quantity: 1 }]);
    const updated = await updateShopifyCartLine("cart-1", "line-1", 2);
    const removed = await removeLineFromShopifyCart("cart-1", "line-1");

    expect(created.success).toBe(false);
    expect(updated.success).toBe(false);
    expect(removed.success).toBe(false);
  });

  it("does not confuse a malformed cart lookup with an expired cart", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(shopifyResponse({ data: {} })));

    await expect(checkCartExists("cart-1")).rejects.toThrow("invalid response");
  });

  it("returns the checkout URL when an existing cart is refreshed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        shopifyResponse({
          data: {
            cart: {
              id: "cart-1",
              totalQuantity: 2,
              checkoutUrl: "https://jk1j1p-c5.myshopify.com/cart/cart-1",
              lines: {
                edges: [
                  {
                    node: {
                      id: "line-1",
                      quantity: 2,
                      merchandise: { id: "variant-1" },
                    },
                  },
                ],
              },
            },
          },
        }),
      ),
    );

    const result = await checkCartExists("cart-1");

    expect(result.exists).toBe(true);
    expect(result.checkoutUrl).toContain("channel=online_store");
  });

  it("rejects store-unavailable responses instead of treating them as empty data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(shopifyResponse({}, 402)));

    await expect(updateShopifyCartLine("cart-1", "line-1", 2)).rejects.toThrow(
      "Store temporarily unavailable",
    );
  });
});
