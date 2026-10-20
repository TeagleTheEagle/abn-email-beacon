import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { formatPrice, fetchProduct, type ShopifyProduct, type ShopifyVariant } from "@/lib/shopify";
import { cartItemFromVariant, useCartStore } from "@/stores/cartStore";
import { seo, SITE_URL } from "@/lib/seo";
import { track } from "@/lib/analytics";

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-32 text-center">
      <h1 className="text-2xl text-chrome">Product not found</h1>
      <p className="mt-3 text-muted-foreground">This product may have been removed.</p>
      <Link to="/shop" className="btn-primary mt-8">Back to shop</Link>
    </div>
  );
}

const productQueryOptions = (handle: string) =>
  queryOptions({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProduct(handle),
  });

export const Route = createFileRoute("/product/$handle")({
  head: (ctx) => {
    const product = (ctx as unknown as { loaderData?: ShopifyProduct["node"] | null }).loaderData;
    const path = product ? `/product/${product.handle}` : "/shop";
    const title = product?.title ?? "Product";
    const description =
      product?.description?.slice(0, 155) ||
      "Instant-download templates and digital products from Teague Industries.";
    const base = seo(path, title, description);
    const image = product?.images.edges[0]?.node.url;
    if (image && image.startsWith("https://")) {
      base.meta.push(
        { property: "og:image", content: image },
        { name: "twitter:image", content: image },
      );
    }
    if (!product) return base;
    // Product rich result (price and availability in Google search listings).
    const inStock = product.variants.edges.some((v) => v.node.availableForSale);
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            description: product.description,
            image: product.images.edges.map((e) => e.node.url),
            url: `${SITE_URL}${path}`,
            brand: { "@type": "Brand", name: "Teague Industries" },
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}${path}`,
              price: product.priceRange.minVariantPrice.amount,
              priceCurrency: product.priceRange.minVariantPrice.currencyCode,
              availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              seller: { "@type": "Organization", name: "Teague Industries" },
            },
          }),
        },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQueryOptions(params.handle));
    // A real 404 (not a 200 "not found" page) so search engines don't index dead product URLs.
    if (!product) throw notFound();
    return product;
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQueryOptions(handle));
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const [justAdded, setJustAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  if (!product) return null;

  const variants = product.variants.edges.map((v) => v.node);
  const hasOptions = product.options.length > 0 && variants.length > 1;
  const defaultVariant = variants.find((v) => v.availableForSale) ?? variants[0];
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? (defaultVariant as ShopifyVariant | undefined);

  const images = product.images.edges.map((e) => e.node);
  const outOfStock = !selectedVariant?.availableForSale;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem(cartItemFromVariant(product, selectedVariant));
    track("add_to_cart", { currency: selectedVariant.price.currencyCode, value: Number(selectedVariant.price.amount), items: [{ item_name: product.title, price: Number(selectedVariant.price.amount), quantity: 1 }] });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const selectOption = (name: string, value: string) => {
    const wanted =
      selectedVariant?.selectedOptions.map((o) => (o.name === name ? { ...o, value } : o)) ??
      variants[0]?.selectedOptions.map((o) => ({ ...o }));
    if (!wanted) return;
    const match = variants.find(
      (v) => v.selectedOptions.every((o) => wanted.some((n) => n.name === o.name && n.value === o.value)),
    );
    if (match) setSelectedVariantId(match.id);
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-32 lg:pt-40">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 font-display text-[10px] tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> BACK TO SHOP
        </Link>

        <Reveal className="mt-8 grid gap-10 pb-24 lg:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-surface-2">
              {images[activeImage] ? (
                <img
                  src={images[activeImage].url}
                  alt={images[activeImage].altText ?? product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-display text-5xl text-muted-foreground/40">TI</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.url}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                      i === activeImage ? "border-primary-soft" : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl leading-snug text-foreground sm:text-3xl">{product.title}</h1>
            {selectedVariant && (
              <p className="mt-4 text-xl text-chrome">
                {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
              </p>
            )}
            {outOfStock && (
              <p className="mt-3 font-display text-[10px] tracking-[0.25em] text-muted-foreground">OUT OF STOCK</p>
            )}

            {hasOptions &&
              product.options.map((option) => (
                <div key={option.name} className="mt-6">
                  <p className="font-display text-[10px] tracking-[0.25em] text-muted-foreground">
                    {option.name.toUpperCase()}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const active = selectedVariant?.selectedOptions.some(
                        (o) => o.name === option.name && o.value === value,
                      );
                      return (
                        <button
                          key={value}
                          onClick={() => selectOption(option.name, value)}
                          className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                            active
                              ? "border-primary-soft text-foreground"
                              : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            <button
              onClick={handleAddToCart}
              disabled={isLoading || outOfStock}
              className="btn-primary mt-8 !px-10 !py-4 !text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="h-4 w-4" /> Added to cart
                </>
              ) : outOfStock ? (
                "Sold out"
              ) : (
                "Add to cart"
              )}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Instant download. Checkout is handled securely by Shopify.
            </p>

            {product.descriptionHtml ? (
              <div
                className="mt-10 space-y-3 border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-6 [&_h2]:text-base [&_h2]:text-foreground [&_h3]:mt-5 [&_h3]:text-foreground [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5"
                // Content comes from the owner's own Shopify store admin.
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : product.description ? (
              <div className="mt-10 border-t border-border pt-8">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </>
  );
}
