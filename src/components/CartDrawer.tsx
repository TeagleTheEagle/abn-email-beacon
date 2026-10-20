import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "AUD";

  // Avoid hydration mismatch: cart state is restored from browser storage.
  useEffect(() => setMounted(true), []);

  // Sync cart with Shopify when drawer opens (catches edge cases)
  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary-soft"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-4.5 w-4.5" />
          {mounted && totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-background">
              {totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col border-l border-border bg-surface sm:max-w-lg">
        <SheetHeader className="shrink-0 text-left">
          <SheetTitle className="font-display text-sm tracking-[0.25em] text-foreground">YOUR CART</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {totalItems === 0 ? "Your cart is empty." : `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart.`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-4">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
                {items.map((item) => {
                  const image = item.product.node.images?.edges?.[0]?.node;
                  return (
                    <div key={item.variantId} className="flex gap-4 rounded-xl border border-border bg-surface-2 p-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background">
                        {image && <img src={image.url} alt={item.product.node.title} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium text-foreground">{item.product.node.title}</h4>
                        {item.variantTitle !== "Default Title" ? (
                          <p className="truncate text-xs text-muted-foreground">{item.variantTitle}</p>
                        ) : item.selectedOptions.length > 0 ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.selectedOptions.map((o) => o.value).join(" • ")}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm text-chrome">{formatPrice(item.price.amount, item.price.currencyCode)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <button
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          onClick={() => removeItem(item.variantId)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-foreground"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm text-foreground">{item.quantity}</span>
                          <button
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-foreground"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 shrink-0 space-y-4 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg text-chrome">{formatPrice(totalPrice.toFixed(2), currency)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full !py-3 disabled:opacity-50"
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Checkout <ExternalLink className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-muted-foreground">Checkout is handled securely by Shopify.</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
