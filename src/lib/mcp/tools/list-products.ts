import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { storefrontApiRequest, STOREFRONT_QUERY, formatPrice } from "@/lib/shopify";

const SITE = "https://www.teagueindustries.com.au";

type Node = { title: string; handle: string; description: string; priceRange: { minVariantPrice: { amount: string; currencyCode: string } } };

export default defineTool({
  name: "list_products",
  title: "List shop products",
  description: "List products for sale in the Teague Industries shop, with price and link.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async () => {
    const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 50 });
    if (!data) throw new ToolError("The shop is unavailable right now.");
    const edges = (data?.data?.products?.edges ?? []) as { node: Node }[];
    const rows = edges.map(({ node }) => ({
      title: node.title,
      price: formatPrice(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode),
      url: `${SITE}/product/${node.handle}`,
      description: node.description,
    }));
    return {
      content: [{ type: "text", text: rows.length ? rows.map((r) => `${r.title} — ${r.price} — ${r.url}`).join("\n") : "No products listed." }],
      structuredContent: { products: rows },
    };
  },
});
