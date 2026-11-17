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
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

export type CartOperationResult = { success: true } | { success: false; error: string };

const NETWORK_ERROR = "Could not reach the store. Check your connection and try again.";
const failure = (error: string): CartOperationResult => ({ success: false, error });

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  requiresSync: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<CartOperationResult>;
  updateQuantity: (variantId: string, quantity: number) => Promise<CartOperationResult>;
  removeItem: (variantId: string) => Promise<CartOperationResult>;
  clearCart: () => void;
  syncCart: () => Promise<CartOperationResult>;
  getCheckoutUrl: () => string | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => {
      // Shopify mutations are serialised. Two fast clicks must not create competing carts or
      // calculate quantities from the same stale snapshot.
      let queue: Promise<unknown> = Promise.resolve();
      const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
        const result = queue.then(operation, operation);
        queue = result.catch(() => undefined);
        return result;
      };
      const recreateCart = async (items: CartItem[]): Promise<CartOperationResult> => {
        const result = await createShopifyCart(
          items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        );
        if (!result.success) return failure(result.error);
        const lines = new Map(result.lines.map((line) => [line.variantId, line]));
        const confirmedItems = items.map((item) => {
          const line = lines.get(item.variantId);
          if (!line) throw new Error("Shopify omitted a recreated cart line");
          return { ...item, quantity: line.quantity, lineId: line.lineId };
        });
        set({
          items: confirmedItems,
          cartId: result.cartId,
          checkoutUrl: result.checkoutUrl,
        });
        return { success: true };
      };
      const reconcileCart = async (
        cartId: string,
        additionalItems: CartItem[] = [],
      ): Promise<boolean> => {
        try {
          const result = await checkCartExists(cartId);
          if (!result.exists) {
            set({ items: [], cartId: null, checkoutUrl: null, requiresSync: false });
            return true;
          }
          const currentItems = get().items;
          const knownItems = [...currentItems];
          for (const item of additionalItems) {
            if (!knownItems.some((known) => known.variantId === item.variantId))
              knownItems.push(item);
          }
          // Unknown remote lines cannot be rendered safely without their product details.
          if (
            result.lines.some(
              (line) => !knownItems.some((item) => item.variantId === line.variantId),
            )
          ) {
            set({ requiresSync: true });
            return false;
          }
          const confirmedItems = knownItems.flatMap((item) => {
            const line = result.lines.find((candidate) => candidate.variantId === item.variantId);
            return line ? [{ ...item, lineId: line.lineId, quantity: line.quantity }] : [];
          });
          if (confirmedItems.length === 0) {
            set({ items: [], cartId: null, checkoutUrl: null, requiresSync: false });
          } else {
            set({
              items: confirmedItems,
              cartId,
              checkoutUrl: result.checkoutUrl,
              requiresSync: false,
            });
          }
          return true;
        } catch {
          set({ requiresSync: true });
          return false;
        }
      };

      return {
        items: [],
        cartId: null,
        checkoutUrl: null,
        isLoading: false,
        isSyncing: false,
        requiresSync: false,

        addItem: (item) =>
          enqueue(async (): Promise<CartOperationResult> => {
            if (!Number.isInteger(item.quantity) || item.quantity < 1)
              return failure("Choose a valid quantity.");
            let operationCartId: string | null = null;
            let expectedQuantity = item.quantity;
            set({ isLoading: true });
            try {
              if (get().requiresSync && get().cartId) {
                const reconciled = await reconcileCart(get().cartId!);
                if (!reconciled)
                  return failure("We could not confirm your cart. Refresh before trying again.");
              }
              const { items, cartId } = get();
              const existing = items.find((candidate) => candidate.variantId === item.variantId);
              const nextQuantity = (existing?.quantity ?? 0) + item.quantity;
              operationCartId = cartId;
              expectedQuantity = nextQuantity;

              if (!cartId) {
                const nextItems = existing
                  ? items.map((candidate) =>
                      candidate.variantId === item.variantId
                        ? { ...candidate, quantity: nextQuantity }
                        : candidate,
                    )
                  : [...items, { ...item, lineId: null }];
                return await recreateCart(nextItems);
              }

              if (existing) {
                if (!existing.lineId) return failure("Please refresh your cart and try again.");
                const result = await updateShopifyCartLine(cartId, existing.lineId, nextQuantity);
                if (result.success) {
                  set({
                    items: get().items.map((candidate) =>
                      candidate.variantId === item.variantId
                        ? { ...candidate, quantity: nextQuantity }
                        : candidate,
                    ),
                  });
                  return { success: true };
                }
                if (!result.cartNotFound) return failure(result.error);

                const nextItems = items.map((candidate) =>
                  candidate.variantId === item.variantId
                    ? { ...candidate, quantity: nextQuantity }
                    : candidate,
                );
                set({ items: [], cartId: null, checkoutUrl: null });
                return await recreateCart(nextItems);
              }

              const result = await addLineToShopifyCart(cartId, {
                quantity: item.quantity,
                variantId: item.variantId,
              });
              if (result.success) {
                if (!result.lineId) return failure("The store did not confirm the new cart item.");
                set({ items: [...get().items, { ...item, lineId: result.lineId }] });
                return { success: true };
              }
              if (!result.cartNotFound) return failure(result.error);

              const nextItems = [...items, { ...item, lineId: null }];
              set({ items: [], cartId: null, checkoutUrl: null });
              return await recreateCart(nextItems);
            } catch {
              if (operationCartId) {
                set({ requiresSync: true });
                if (await reconcileCart(operationCartId, [{ ...item, lineId: null }])) {
                  const confirmed = get().items.find(
                    (candidate) => candidate.variantId === item.variantId,
                  );
                  if (confirmed?.quantity === expectedQuantity) return { success: true };
                }
              }
              return failure(NETWORK_ERROR);
            } finally {
              set({ isLoading: false });
            }
          }),

        updateQuantity: (variantId, quantity) => {
          if (quantity <= 0) return get().removeItem(variantId);
          return enqueue(async (): Promise<CartOperationResult> => {
            if (!Number.isInteger(quantity) || quantity > 99)
              return failure("Choose a quantity between 1 and 99.");
            const { items, cartId } = get();
            const item = items.find((candidate) => candidate.variantId === variantId);
            if (!item) return failure("That item is no longer in your cart.");
            if (!item.lineId || !cartId) return failure("Please refresh your cart and try again.");
            set({ isLoading: true });
            try {
              if (get().requiresSync && !(await reconcileCart(cartId)))
                return failure("We could not confirm your cart. Refresh before trying again.");
              const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
              if (result.success) {
                set({
                  items: get().items.map((candidate) =>
                    candidate.variantId === variantId ? { ...candidate, quantity } : candidate,
                  ),
                });
                return { success: true };
              }
              if (!result.cartNotFound) return failure(result.error);

              const nextItems = items.map((candidate) =>
                candidate.variantId === variantId ? { ...candidate, quantity } : candidate,
              );
              set({ items: [], cartId: null, checkoutUrl: null });
              return await recreateCart(nextItems);
            } catch {
              set({ requiresSync: true });
              if (await reconcileCart(cartId)) {
                const confirmed = get().items.find(
                  (candidate) => candidate.variantId === variantId,
                );
                if (confirmed?.quantity === quantity) return { success: true };
              }
              return failure(NETWORK_ERROR);
            } finally {
              set({ isLoading: false });
            }
          });
        },

        removeItem: (variantId) =>
          enqueue(async (): Promise<CartOperationResult> => {
            const { items, cartId, clearCart } = get();
            const item = items.find((candidate) => candidate.variantId === variantId);
            if (!item) return { success: true };
            if (!item.lineId || !cartId) return failure("Please refresh your cart and try again.");
            set({ isLoading: true });
            try {
              if (get().requiresSync && !(await reconcileCart(cartId)))
                return failure("We could not confirm your cart. Refresh before trying again.");
              const result = await removeLineFromShopifyCart(cartId, item.lineId);
              if (!result.success && result.cartNotFound) {
                clearCart();
                return { success: true };
              }
              if (!result.success) return failure(result.error);
              const nextItems = get().items.filter(
                (candidate) => candidate.variantId !== variantId,
              );
              if (nextItems.length === 0) clearCart();
              else set({ items: nextItems });
              return { success: true };
            } catch {
              set({ requiresSync: true });
              if (await reconcileCart(cartId)) {
                if (!get().items.some((candidate) => candidate.variantId === variantId))
                  return { success: true };
              }
              return failure(NETWORK_ERROR);
            } finally {
              set({ isLoading: false });
            }
          }),

        clearCart: () => set({ items: [], cartId: null, checkoutUrl: null, requiresSync: false }),
        getCheckoutUrl: () => get().checkoutUrl,

        syncCart: () =>
          enqueue(async (): Promise<CartOperationResult> => {
            const { cartId, isSyncing } = get();
            if (!cartId || isSyncing) return { success: true };
            set({ isSyncing: true });
            try {
              return (await reconcileCart(cartId)) ? { success: true } : failure(NETWORK_ERROR);
            } finally {
              set({ isSyncing: false });
            }
          }),
      };
    },
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
        requiresSync: state.requiresSync,
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
