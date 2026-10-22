import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";
import { newLeadId, notifyLead } from "@/lib/leads";

export default defineTool({
  name: "request_free_preview",
  title: "Request a free preview",
  description: "Send Teague Industries a free website/store preview enquiry for a business.",
  inputSchema: {
    name: z.string().trim().min(1).max(100).describe("Contact person's name."),
    business_name: z.string().trim().min(1).max(150).describe("Business name."),
    email: z.string().trim().email().max(255).describe("Contact email."),
    phone: z.string().trim().max(30).optional().describe("Contact phone (optional)."),
    message: z.string().trim().max(2000).optional().describe("What the business needs (optional)."),
  },
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  handler: async ({ name, business_name, email, phone, message }) => {
    const client = supabaseAnon();
    const id = newLeadId();
    const { error } = await client.from("leads").insert({
      id,
      name,
      business_name,
      email,
      phone: phone || null,
      needs: [],
      message: `[Sent via AI assistant] ${message ?? ""}`.trim(),
    });
    if (error) throw new ToolError("Couldn't send the enquiry. Please try again.");
    await notifyLead(client, id);
    return {
      content: [
        {
          type: "text",
          text: "Enquiry sent. Teague Industries will be in touch about the free preview.",
        },
      ],
    };
  },
});
