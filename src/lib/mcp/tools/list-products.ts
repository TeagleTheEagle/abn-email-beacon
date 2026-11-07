import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { SITE_URL } from "@/lib/seo";
import { fetchProducts, formatPrice } from "@/lib/shopify";

export default defineTool({
  name: "list_products",
  title: "List shop products",
  description: "List products for sale in the Teague Industries shop, with price and link.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async () => {
    const edges = await fetchProducts();
    if (!edges) throw new ToolError("The shop is unavailable right now.");
    const rows = edges.map(({ node }) => ({
      title: node.title,
      price: formatPrice(
        node.priceRange.minVariantPrice.amount,
        node.priceRange.minVariantPrice.currencyCode,
      ),
      url: `${SITE_URL}/product/${node.handle}`,
      description: node.description,
    }));
    return {
      content: [
        {
          type: "text",
          text: rows.length
            ? rows.map((r) => `${r.title} — ${r.price} — ${r.url}`).join("\n")
            : "No products listed.",
        },
      ],
      structuredContent: { products: rows },
    };
  },
});
