import { queryOptions } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/shopify";

// Shared by /shop and the home page so both read the same cache entry. staleTime stops the browser
// asking Shopify again the moment a page mounts with data the server already rendered.
export const productsQueryOptions = queryOptions({
  queryKey: ["shopify-products"],
  queryFn: () => fetchProducts(),
  staleTime: 60_000,
});
