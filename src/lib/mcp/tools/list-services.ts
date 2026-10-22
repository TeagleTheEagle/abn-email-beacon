import { defineTool } from "@lovable.dev/mcp-js";
import { addOns, carePlans, services } from "@/content/services";

export default defineTool({
  name: "list_services",
  title: "List services",
  description: "List Teague Industries' services with price and what's included.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const rows = [...services, ...carePlans.filter((p) => !services.includes(p))].map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.short,
      price: s.price,
      priceNote: s.priceNote ?? "",
      included: [...s.included],
      whoFor: s.whoFor,
    }));
    const extras = addOns.map((a) => ({
      id: a.id,
      title: a.title,
      price: a.price,
      summary: a.summary,
      included: [...a.included],
      note: a.note ?? "",
    }));
    return {
      content: [
        {
          type: "text",
          text: [
            ...rows.map(
              (r) =>
                `${r.title} — ${r.price} ${r.priceNote}\n${r.summary}\nIncludes: ${r.included.join("; ")}`,
            ),
            "Fixed-scope add-ons:",
            ...extras.map(
              (a) =>
                `${a.title} — ${a.price}\n${a.summary}\nIncludes: ${a.included.join("; ")}${a.note ? `\n${a.note}` : ""}`,
            ),
          ].join("\n\n"),
        },
      ],
      structuredContent: { services: rows, addOns: extras },
    };
  },
});
