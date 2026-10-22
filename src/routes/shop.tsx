import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PackageOpen } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { seo } from "@/lib/seo";

const productsQueryOptions = queryOptions({
  queryKey: ["shopify-products"],
  queryFn: () => fetchProducts(),
});

export const Route = createFileRoute("/shop")({
  head: () =>
    seo(
      "/shop",
      "Shop",
      "Teague Industries template shop — instant-download business templates and digital products, secure checkout.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  component: ShopPage,
});

function ShopPage() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);

  return (
    <>
      <PageHeader
        label="Shop"
        title="Instant-download templates"
        sub="Pay securely through our checkout and download straight away."
      />
      {products.length === 0 ? (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <PackageOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product: ShopifyProduct, i) => (
            <Reveal key={product.node.id} delay={i * 0.05} className="h-full">
              <ProductCard product={product} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      )}
      <Reveal className="mx-auto mt-20 max-w-3xl px-6 pb-24 text-center">
        <p className="text-sm text-muted-foreground">
          Need something custom?{" "}
          <a href="/contact" className="text-primary-soft hover:underline">
            Ask about a custom build
          </a>{" "}
          — we make templates and practical tools for Australian business.
        </p>
      </Reveal>
    </>
  );
}
