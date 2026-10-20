import { defineTool } from "@lovable.dev/mcp-js";
import { services } from "@/content/services";

export default defineTool({
  name: "list_services",
  title: "List services",
  description: "List Teague Industries' services with price and what's included.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const rows = services.map((s) => ({
      id: s.id, title: s.title, summary: s.short, price: s.price, priceNote: s.priceNote ?? "",
      included: [...s.included], whoFor: s.whoFor,
    }));
    return {
      content: [{ type: "text", text: rows.map((r) => `${r.title} — ${r.price} ${r.priceNote}\n${r.summary}\nIncludes: ${r.included.join("; ")}`).join("\n\n") }],
      structuredContent: { services: rows },
    };
  },
});
