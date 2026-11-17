import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ShopifyProduct } from "@/lib/shopify";
import { Route } from "./product.$handle";

const cart = vi.hoisted(() => ({ addItem: vi.fn(), track: vi.fn() }));
let currentProduct: ShopifyProduct["node"];

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: Record<string, unknown>) => ({
    ...options,
    useParams: () => ({ handle: currentProduct.handle }),
  }),
  notFound: vi.fn(),
  Link: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("@tanstack/react-query", () => ({
  queryOptions: (options: unknown) => options,
  useSuspenseQuery: () => ({ data: currentProduct }),
}));
vi.mock("@/stores/cartStore", () => ({
  useCartStore: (selector: (state: unknown) => unknown) =>
    selector({ addItem: cart.addItem, isLoading: false }),
  cartItemFromVariant: (product: unknown, variant: { id: string }) => ({
    product: { node: product },
    variantId: variant.id,
    quantity: 1,
  }),
}));
vi.mock("@/lib/analytics", () => ({ track: cart.track }));

function product(
  handle: string,
  delivery?: string,
): ShopifyProduct["node"] & { descriptionHtml?: string } {
  return {
    id: "product-1",
    title: handle.includes("audit") ? "48-Hour Website Audit" : "Test download",
    description: "Product description",
    descriptionHtml: "<p>Product description</p>",
    handle,
    priceRange: { minVariantPrice: { amount: "149.00", currencyCode: "AUD" } },
    images: { edges: [] },
    variants: {
      edges: [
        {
          node: {
            id: "variant-1",
            title: "Default Title",
            price: { amount: "149.00", currencyCode: "AUD" },
            availableForSale: true,
            selectedOptions: [],
          },
        },
      ],
    },
    options: [],
    details: [
      { key: "includes", value: '["Written report","Video review"]' },
      { key: "format", value: "PDF and video" },
      ...(delivery ? [{ key: "delivery", value: delivery }] : []),
    ],
  };
}

const ProductPage = (Route as unknown as { component: React.ComponentType }).component;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("product outcomes and promises", () => {
  it("does not claim instant download, lifetime updates or a sample for the 48-hour audit", () => {
    currentProduct = product("48-hour-website-speed-conversion-audit");
    render(<ProductPage />);

    expect(screen.getAllByText(/Delivered within 48 hours/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Instant digital download/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/lifetime file updates/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/metafields/i)).not.toBeInTheDocument();
    expect(screen.getByText(/not a sample of the paid files/i)).toBeInTheDocument();
  });

  it("uses supported instant-download wording only when product metadata says so", () => {
    currentProduct = product("test-download", "Instant download");
    render(<ProductPage />);

    expect(screen.getAllByText(/Instant download/).length).toBeGreaterThan(0);
    expect(screen.getByText("30-day faulty-file support")).toBeInTheDocument();
    expect(screen.queryByText(/lifetime/i)).not.toBeInTheDocument();
  });

  it("shows two labelled pages from the actual conversion playbook file", () => {
    currentProduct = product(
      "shopify-conversion-checkout-optimisation-playbook",
      "Instant download",
    );
    render(<ProductPage />);

    expect(screen.getByRole("img", { name: "Conversion playbook cover page" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Conversion playbook checklist page" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/PDF created 27 October 2026/)).toBeInTheDocument();
  });

  it("shows a failed addition and records no success analytics", async () => {
    currentProduct = product("test-download", "Instant download");
    cart.addItem.mockResolvedValue({ success: false, error: "Shopify rejected the item" });
    render(<ProductPage />);

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Shopify rejected the item");
    expect(screen.queryByText("Added to cart")).not.toBeInTheDocument();
    expect(cart.track).not.toHaveBeenCalledWith("add_to_cart", expect.anything());
  });
});
