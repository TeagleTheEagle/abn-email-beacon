import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  addLineToShopifyCart,
  checkCartExists,
  createShopifyCart,
  removeLineFromShopifyCart,
  updateShopifyCartLine,
  type ShopifyProduct,
  type ShopifyVariant,
} from "@/lib/shopify";

export interface CartItem {
  lineId: string | null; // Shopify cart line ID, null until synced
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find((i) => i.variantId === item.variantId);

        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({
              quantity: item.quantity,
              variantId: item.variantId,
            });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId }],
              });
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) {
              console.error("Cannot update quantity for item without lineId:", existingItem);
              return;
            }
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const currentItems = get().items; // Re-fetch to avoid stale state after async operation
              set({
                items: currentItems.map((i) =>
                  i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i,
                ),
              });
            } else if (result.cartNotFound) {
              clearCart();
            }
          } else {
            const result = await addLineToShopifyCart(cartId, {
              quantity: item.quantity,
              variantId: item.variantId,
            });
            if (result.success) {
              const currentItems = get().items; // Re-fetch to avoid stale state after async operation
              set({ items: [...currentItems, { ...item, lineId: result.lineId ?? null }] });
            } else if (result.cartNotFound) {
              clearCart();
            }
          }
        } catch (error) {
          console.error("Failed to add item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }

        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({
              items: currentItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
            });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter((i) => i.variantId !== variantId);
            if (newItems.length === 0) {
              clearCart();
            } else {
              set({ items: newItems });
            }
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return; // Prevent concurrent sync calls

        set({ isSyncing: true });
        try {
          const exists = await checkCartExists(cartId);
          if (!exists) clearCart();
        } catch (error) {
          console.error("Failed to sync cart with Shopify:", error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }),
    },
  ),
);

export function cartItemFromVariant(product: ShopifyProduct["node"], variant: ShopifyVariant) {
  return {
    product: { node: product },
    variantId: variant.id,
    variantTitle: variant.title,
    price: variant.price,
    quantity: 1,
    selectedOptions: variant.selectedOptions,
  };
}
