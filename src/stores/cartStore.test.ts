import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
});
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";
import { cartItemFromVariant, useCartStore } from "./cartStore";

const api = vi.hoisted(() => ({
  create: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  check: vi.fn(),
}));

vi.mock("@/lib/shopify", () => ({
  createShopifyCart: api.create,
  addLineToShopifyCart: api.add,
  updateShopifyCartLine: api.update,
  removeLineFromShopifyCart: api.remove,
  checkCartExists: api.check,
}));

const variant: ShopifyVariant = {
  id: "variant-1",
  title: "Default Title",
  price: { amount: "29.00", currencyCode: "AUD" },
  availableForSale: true,
  selectedOptions: [],
};
const product: ShopifyProduct["node"] = {
  id: "product-1",
  title: "Test download",
  description: "Test product",
  handle: "test-download",
  priceRange: { minVariantPrice: variant.price },
  images: { edges: [] },
  variants: { edges: [{ node: variant }] },
  options: [],
};
const item = cartItemFromVariant(product, variant);

function createdCart(quantity = 1) {
  return {
    success: true,
    cartId: "cart-new",
    checkoutUrl: "https://checkout.example/cart-new",
    lines: [{ variantId: variant.id, lineId: "line-new", quantity }],
  };
}

function savedItem(quantity = 1) {
  return { ...item, quantity, lineId: "line-old" };
}

beforeEach(() => {
  vi.clearAllMocks();
  useCartStore.setState({
    items: [],
    cartId: null,
    checkoutUrl: null,
    isLoading: false,
    isSyncing: false,
    requiresSync: false,
  });
  api.create.mockResolvedValue(createdCart());
  api.add.mockResolvedValue({ success: true, lineId: "line-new", cartNotFound: false });
  api.update.mockResolvedValue({ success: true, cartNotFound: false });
  api.remove.mockResolvedValue({ success: true, cartNotFound: false });
  api.check.mockImplementation(() =>
    Promise.resolve({
      exists: true,
      checkoutUrl: "https://checkout.example/cart-old",
      lines: useCartStore.getState().items.map((cartItem) => ({
        lineId: cartItem.lineId ?? "line-old",
        variantId: cartItem.variantId,
        quantity: cartItem.quantity,
      })),
    }),
  );
});

describe("cart operations", () => {
  it("returns success only after Shopify confirms a new cart and line", async () => {
    const result = await useCartStore.getState().addItem(item);

    expect(result).toEqual({ success: true });
    expect(useCartStore.getState()).toMatchObject({
      cartId: "cart-new",
      checkoutUrl: "https://checkout.example/cart-new",
      isLoading: false,
    });
    expect(useCartStore.getState().items[0]).toMatchObject({ lineId: "line-new", quantity: 1 });
  });

  it("keeps the cart unchanged and returns a useful error on network failure", async () => {
    api.create.mockRejectedValue(new Error("Network unavailable"));

    const result = await useCartStore.getState().addItem(item);

    expect(result).toEqual({
      success: false,
      error: "Could not reach the store. Check your connection and try again.",
    });
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  it("returns Shopify rejection details without adding a local item", async () => {
    api.create.mockResolvedValue({ success: false, error: "This item is out of stock." });

    const result = await useCartStore.getState().addItem(item);

    expect(result).toEqual({ success: false, error: "This item is out of stock." });
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("recreates an expired cart without dropping the requested addition", async () => {
    useCartStore.setState({
      items: [savedItem(2)],
      cartId: "cart-expired",
      checkoutUrl: "https://checkout.example/cart-expired",
    });
    api.update.mockResolvedValue({
      success: false,
      error: "Cart not found",
      cartNotFound: true,
    });
    api.create.mockResolvedValue(createdCart(3));

    const result = await useCartStore.getState().addItem(item);

    expect(result).toEqual({ success: true });
    expect(api.create).toHaveBeenCalledWith([{ variantId: variant.id, quantity: 3 }]);
    expect(useCartStore.getState()).toMatchObject({ cartId: "cart-new" });
    expect(useCartStore.getState().items[0]).toMatchObject({ quantity: 3, lineId: "line-new" });
  });

  it("serialises rapid additions so no cart or quantity update is lost", async () => {
    const first = useCartStore.getState().addItem(item);
    const second = useCartStore.getState().addItem(item);
    await Promise.all([first, second]);

    expect(api.create).toHaveBeenCalledTimes(1);
    expect(api.update).toHaveBeenCalledWith("cart-new", "line-new", 2);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  it("retains the confirmed quantity when an update fails", async () => {
    useCartStore.setState({ items: [savedItem(2)], cartId: "cart-old" });
    api.update.mockResolvedValue({ success: false, error: "Quantity unavailable" });

    const result = await useCartStore.getState().updateQuantity(variant.id, 3);

    expect(result).toEqual({ success: false, error: "Quantity unavailable" });
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it("retains an item when removal fails", async () => {
    useCartStore.setState({ items: [savedItem()], cartId: "cart-old" });
    api.remove.mockRejectedValue(new Error("Network unavailable"));

    const result = await useCartStore.getState().removeItem(variant.id);

    expect(result.success).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().cartId).toBe("cart-old");
  });

  it("keeps a persisted cart during a sync outage and refreshes its checkout URL", async () => {
    useCartStore.setState({ items: [savedItem()], cartId: "cart-old", checkoutUrl: null });
    api.check.mockRejectedValueOnce(new Error("Network unavailable"));
    const failed = await useCartStore.getState().syncCart();
    expect(failed.success).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(1);

    const synced = await useCartStore.getState().syncCart();
    expect(synced).toEqual({ success: true });
    expect(useCartStore.getState().checkoutUrl).toBe("https://checkout.example/cart-old");
  });

  it("reconciles an accepted addition after a timeout before allowing another mutation", async () => {
    useCartStore.setState({ items: [], cartId: "cart-old" });
    api.add.mockRejectedValue(new Error("Provider timeout"));
    api.check.mockResolvedValue({
      exists: true,
      checkoutUrl: "https://checkout.example/cart-old",
      lines: [{ lineId: "line-confirmed", variantId: variant.id, quantity: 1 }],
    });

    const result = await useCartStore.getState().addItem(item);

    expect(result).toEqual({ success: true });
    expect(api.check).toHaveBeenCalledWith("cart-old");
    expect(useCartStore.getState().items[0]).toMatchObject({
      lineId: "line-confirmed",
      quantity: 1,
    });
  });

  it("does not retry an uncertain addition while reconciliation is unavailable", async () => {
    useCartStore.setState({ items: [], cartId: "cart-old" });
    api.add.mockRejectedValue(new Error("Provider timeout"));
    api.check.mockRejectedValue(new Error("Network unavailable"));

    await useCartStore.getState().addItem(item);
    const retry = await useCartStore.getState().addItem(item);

    expect(retry.success).toBe(false);
    expect(api.add).toHaveBeenCalledTimes(1);
  });

  it("clears only a cart that Shopify confirms is missing", async () => {
    useCartStore.setState({ items: [savedItem()], cartId: "cart-old" });
    api.check.mockResolvedValue({ exists: false });

    const result = await useCartStore.getState().syncCart();

    expect(result).toEqual({ success: true });
    expect(useCartStore.getState()).toMatchObject({ items: [], cartId: null, checkoutUrl: null });
  });
});
