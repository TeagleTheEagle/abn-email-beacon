import { describe, expect, it } from "vitest";
import {
  ENQUIRY_STAGES,
  filterPipelineLeads,
  isFollowUpOverdue,
  withLeadSource,
  type PipelineLead,
} from "./enquiry-pipeline";

function lead(overrides: Partial<PipelineLead> = {}): PipelineLead {
  return {
    id: "lead-1",
    created_at: "2026-11-10T00:00:00Z",
    updated_at: "2026-11-10T00:00:00Z",
    name: "Alex",
    business_name: "Example Co",
    email: "alex@example.com",
    phone: null,
    source: "Contact page",
    assigned_owner_id: null,
    stage: "Received",
    next_follow_up_at: null,
    notes: null,
    owner_notification_status: "sent",
    customer_confirmation_status: "skipped",
    owner_notification_attempts: 1,
    customer_confirmation_attempts: 0,
    ...overrides,
  };
}

describe("enquiry pipeline", () => {
  it("keeps the exact manual workflow stages", () => {
    expect(ENQUIRY_STAGES).toEqual([
      "Received",
      "Contacted",
      "Preview sent",
      "Approved",
      "Paid",
      "Launched",
    ]);
  });

  it("records a bounded known source without changing the existing lead payload", () => {
    expect(withLeadSource({ business_name: "Example Co" }, "Homepage quick form")).toEqual({
      business_name: "Example Co",
      source: "Homepage quick form",
    });
  });

  it("filters overdue follow-ups without hiding launched work", () => {
    const now = new Date("2026-11-17T00:00:00Z");
    expect(isFollowUpOverdue(lead({ next_follow_up_at: "2026-11-16T00:00:00Z" }), now)).toBe(true);
    expect(
      isFollowUpOverdue(
        lead({ next_follow_up_at: "2026-11-16T00:00:00Z", stage: "Launched" }),
        now,
      ),
    ).toBe(false);
    expect(isFollowUpOverdue(lead({ next_follow_up_at: null }), now)).toBe(false);
  });

  it("combines overdue and stage filters", () => {
    const leads = [
      lead({ id: "one", next_follow_up_at: "2026-11-16T00:00:00Z" }),
      lead({ id: "two", stage: "Contacted", next_follow_up_at: "2026-11-18T00:00:00Z" }),
    ];
    const filtered = filterPipelineLeads(
      leads,
      { overdueOnly: true, stage: "all" },
      new Date("2026-11-17T00:00:00Z"),
    );
    expect(filtered.map((item) => item.id)).toEqual(["one"]);
  });
});
