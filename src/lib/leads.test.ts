import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { insertLead, notifyLead, updateLeadWorkflow, type LeadWorkflowUpdate } from "./leads";

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

const workflow: LeadWorkflowUpdate = {
  stage: "Contacted",
  assigned_owner_id: "22222222-2222-4222-8222-222222222222",
  next_follow_up_at: null,
  notes: "Called",
};

function workflowClient(result: { data: unknown; error: Error | null }) {
  const select = vi.fn().mockResolvedValue(result);
  const eqUpdatedAt = vi.fn().mockReturnValue({ select });
  const eqId = vi.fn().mockReturnValue({ eq: eqUpdatedAt });
  const update = vi.fn().mockReturnValue({ eq: eqId });
  const client = { from: () => ({ update }) } as unknown as Client;
  return { client, update, eqId, eqUpdatedAt, select };
}

describe("confirmed enquiry workflow updates", () => {
  it("returns the intended updated row and applies optimistic concurrency", async () => {
    const updated = { id: "lead-id", updated_at: "2026-11-17T01:00:00Z" };
    const fixture = workflowClient({ data: [updated], error: null });

    const result = await updateLeadWorkflow(
      fixture.client,
      "lead-id",
      workflow,
      "2026-11-17T00:00:00Z",
    );

    expect(result).toEqual({ data: updated, error: null });
    expect(fixture.eqId).toHaveBeenCalledWith("id", "lead-id");
    expect(fixture.eqUpdatedAt).toHaveBeenCalledWith("updated_at", "2026-11-17T00:00:00Z");
    expect(fixture.select).toHaveBeenCalledWith("id, updated_at");
  });

  it.each([
    ["a missing or inaccessible record", []],
    ["an edit made stale by another owner", []],
  ])("treats %s as an unconfirmed save", async (_label, data) => {
    const fixture = workflowClient({ data, error: null });

    const result = await updateLeadWorkflow(
      fixture.client,
      "lead-id",
      workflow,
      "2026-11-17T00:00:00Z",
    );

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toMatch(/not updated/i);
  });

  it("does not treat an ambiguous multi-row response as success", async () => {
    const fixture = workflowClient({
      data: [
        { id: "lead-id", updated_at: "2026-11-17T01:00:00Z" },
        { id: "lead-id", updated_at: "2026-11-17T01:00:00Z" },
      ],
      error: null,
    });

    const result = await updateLeadWorkflow(
      fixture.client,
      "lead-id",
      workflow,
      "2026-11-17T00:00:00Z",
    );
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
  });

  it("preserves a rejected update error", async () => {
    const rejected = new Error("Permission denied");
    const fixture = workflowClient({ data: null, error: rejected });

    const result = await updateLeadWorkflow(
      fixture.client,
      "lead-id",
      workflow,
      "2026-11-17T00:00:00Z",
    );
    expect(result).toEqual({ data: null, error: rejected });
  });

  it("returns a network failure instead of reporting success", async () => {
    const fixture = workflowClient({ data: null, error: null });
    fixture.select.mockRejectedValue(new Error("Network offline"));

    const result = await updateLeadWorkflow(
      fixture.client,
      "lead-id",
      workflow,
      "2026-11-17T00:00:00Z",
    );
    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Network offline");
  });
});
