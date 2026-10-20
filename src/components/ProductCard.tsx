import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { cartItemFromVariant, useCartStore } from "@/stores/cartStore";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const [justAdded, setJustAdded] = useState(false);

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const firstAvailable = node.variants.edges.find((v) => v.node.availableForSale)?.node ?? node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const outOfStock = !firstAvailable?.availableForSale;

  const handleAddToCart = async () => {
    if (!firstAvailable) return;
    await addItem(cartItemFromVariant(node, firstAvailable));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="glass glass-hover group flex h-full flex-col overflow-hidden rounded-2xl">
      <Link to="/product/$handle" params={{ handle: node.handle }} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? node.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-3xl text-muted-foreground/40">TI</span>
            </div>
          )}
          {outOfStock && (
            <span className="absolute right-3 top-3 rounded-full bg-surface px-3 py-1 font-display text-[9px] tracking-[0.2em] text-muted-foreground">
              SOLD OUT
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link to="/product/$handle" params={{ handle: node.handle }} className="text-sm font-medium leading-snug text-foreground hover:text-primary-soft">
          {node.title}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-sm text-chrome">{formatPrice(price.amount, price.currencyCode)}</span>
          <button
            onClick={handleAddToCart}
            disabled={isLoading || outOfStock}
            className="btn-primary !gap-1.5 !px-3.5 !py-2 !text-[11px] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : justAdded ? (
              "Added ✓"
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
