import { afterEach, describe, expect, it, vi } from "vitest";
import requestPreview from "./request-preview";

const api = vi.hoisted(() => ({ insert: vi.fn(), notify: vi.fn() }));
vi.mock("@lovable.dev/mcp-js", () => ({
  defineTool: (options: unknown) => options,
  ToolError: class ToolError extends Error {},
}));
vi.mock("../supabase", () => ({
  supabaseAnon: () => ({ from: () => ({ insert: api.insert }) }),
}));
vi.mock("@/lib/leads", () => ({
  newLeadId: () => "11111111-1111-4111-8111-111111111111",
  notifyLead: api.notify,
  insertLead: (_client: unknown, payload: unknown, source: string) =>
    api.insert({ ...(payload as object), source }),
}));

const handler = (
  requestPreview as unknown as {
    handler: (input: {
      name: string;
      business_name: string;
      email: string;
      message?: string;
    }) => Promise<unknown>;
  }
).handler;

afterEach(() => vi.clearAllMocks());

describe("public MCP enquiry", () => {
  it("uses the permitted lead flow with source and existing AI message marker", async () => {
    api.insert.mockResolvedValue({ error: null });
    await handler({
      name: "Alex",
      business_name: "Example Co",
      email: "alex@example.com",
      message: "Website enquiry",
    });
    expect(api.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "Public MCP",
        message: "[Sent via AI assistant] Website enquiry",
      }),
    );
    expect(api.notify).toHaveBeenCalled();
  });

  it("does not notify when the enquiry insert fails", async () => {
    api.insert.mockResolvedValue({ error: new Error("Insert rejected") });
    await expect(
      handler({ name: "Alex", business_name: "Example Co", email: "alex@example.com" }),
    ).rejects.toThrow("Couldn't send the enquiry");
    expect(api.notify).not.toHaveBeenCalled();
  });
});
