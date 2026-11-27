import type { ShopifyProduct } from "@/lib/shopify";

export function productSeoTitle(product: Pick<ShopifyProduct["node"], "title" | "seo">) {
  return product.seo?.title?.trim() || product.title;
}
