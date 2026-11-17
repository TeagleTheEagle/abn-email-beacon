import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { insertLead, notifyLead } from "./leads";

type Client = SupabaseClient<Database>;

describe("lead submission helpers", () => {
  it("adds a known source while using the existing lead insert flow", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = { from: () => ({ insert }) } as unknown as Client;

    const { error } = await insertLead(
      client,
      { name: "Alex", business_name: "Example Co", email: "alex@example.com" },
      "Contact page",
    );

    expect(error).toBeNull();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ email: "alex@example.com", source: "Contact page" }),
    );
  });

  it("reports notification failure without invalidating the saved enquiry", async () => {
    const invoke = vi.fn().mockResolvedValue({ error: new Error("Provider unavailable") });
    const client = { functions: { invoke } } as unknown as Client;

    await expect(notifyLead(client, "lead-id", "alex@example.com")).resolves.toEqual({
      success: false,
    });
  });

  it("returns confirmed notification success", async () => {
    const invoke = vi.fn().mockResolvedValue({ error: null });
    const client = { functions: { invoke } } as unknown as Client;

    await expect(notifyLead(client, "lead-id", "alex@example.com")).resolves.toEqual({
      success: true,
    });
  });
});
