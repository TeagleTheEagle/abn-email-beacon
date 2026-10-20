import { defineTool } from "@lovable.dev/mcp-js";
import { faqs } from "@/content/site";

export default defineTool({
  name: "list_faqs",
  title: "List FAQs",
  description: "List frequently asked questions and answers about working with Teague Industries.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n") }],
    structuredContent: { faqs: faqs.map((f) => ({ question: f.q, answer: f.a })) },
  }),
});
