import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartDrawer } from "./CartDrawer";

const cart = vi.hoisted(() => ({
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
  syncCart: vi.fn(),
  getCheckoutUrl: vi.fn(),
  track: vi.fn(),
  open: vi.fn(),
}));

vi.mock("@/stores/cartStore", () => ({
  useCartStore: () => ({
    items: [
      {
        lineId: "line-1",
        variantId: "variant-1",
        variantTitle: "Default Title",
        quantity: 1,
        price: { amount: "29.00", currencyCode: "AUD" },
        selectedOptions: [],
        product: {
          node: {
            title: "Test download",
            images: { edges: [] },
          },
        },
      },
    ],
    isLoading: false,
    isSyncing: false,
    updateQuantity: cart.updateQuantity,
    removeItem: cart.removeItem,
    syncCart: cart.syncCart,
    getCheckoutUrl: cart.getCheckoutUrl,
  }),
}));
vi.mock("@/lib/analytics", () => ({ track: cart.track }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("CartDrawer failure states", () => {
  it("announces a failed quantity update", async () => {
    cart.syncCart.mockResolvedValue({ success: true });
    cart.updateQuantity.mockResolvedValue({ success: false, error: "Quantity unavailable" });
    render(<CartDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Open cart" }));
    fireEvent.click(await screen.findByRole("button", { name: "Increase Test download quantity" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Quantity unavailable");
  });

  it("announces a failed removal", async () => {
    cart.syncCart.mockResolvedValue({ success: true });
    cart.removeItem.mockResolvedValue({ success: false, error: "Could not remove item" });
    render(<CartDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Open cart" }));
    fireEvent.click(await screen.findByRole("button", { name: "Remove Test download" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not remove item");
  });

  it("does not record checkout when no confirmed checkout URL exists", async () => {
    cart.syncCart.mockResolvedValue({ success: true });
    cart.getCheckoutUrl.mockReturnValue(null);
    vi.stubGlobal("open", cart.open);
    render(<CartDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Open cart" }));
    fireEvent.click(await screen.findByRole("button", { name: /Checkout/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Checkout is unavailable/);
    expect(cart.track).not.toHaveBeenCalled();
    expect(cart.open).not.toHaveBeenCalled();
  });
});
