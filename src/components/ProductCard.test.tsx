import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";

const { addItem, track } = vi.hoisted(() => ({ addItem: vi.fn(), track: vi.fn() }));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("@/stores/cartStore", () => ({
  useCartStore: (selector: (state: { addItem: typeof addItem; isLoading: boolean }) => unknown) =>
    selector({ addItem, isLoading: false }),
  cartItemFromVariant: (_product: unknown, variant: { id: string }) => ({ variantId: variant.id }),
}));
vi.mock("@/lib/analytics", () => ({ track }));

const product: ShopifyProduct = {
  node: {
    id: "product-1",
    title: "Test download",
    description: "Test product",
    handle: "test-download",
    priceRange: { minVariantPrice: { amount: "29.00", currencyCode: "AUD" } },
    images: { edges: [] },
    variants: {
      edges: [
        {
          node: {
            id: "variant-1",
            title: "Default Title",
            price: { amount: "29.00", currencyCode: "AUD" },
            availableForSale: true,
            selectedOptions: [],
          },
        },
      ],
    },
    options: [],
  },
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ProductCard cart feedback", () => {
  it("shows Added and records analytics only after a confirmed addition", async () => {
    addItem.mockResolvedValue({ success: true });
    render(<ProductCard product={product} />);

    fireEvent.click(screen.getByRole("button", { name: /Add to cart/ }));
    expect(await screen.findByRole("button", { name: "Added ✓" })).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith(
      "add_to_cart",
      expect.objectContaining({ currency: "AUD", value: 29 }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an accessible error and no success event when the addition fails", async () => {
    addItem.mockResolvedValue({ success: false, error: "This item is out of stock." });
    render(<ProductCard product={product} />);

    fireEvent.click(screen.getByRole("button", { name: /Add to cart/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("This item is out of stock.");
    expect(screen.queryByText("Added ✓")).not.toBeInTheDocument();
    expect(track).not.toHaveBeenCalledWith("add_to_cart", expect.anything());
  });
});
