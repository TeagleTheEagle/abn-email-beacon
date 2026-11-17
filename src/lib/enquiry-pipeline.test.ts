import { describe, expect, it } from "vitest";
import {
  ENQUIRY_PAGE_SIZE,
  ENQUIRY_STAGES,
  filterPipelineLeads,
  isFollowUpOverdue,
  loadEnquiryPage,
  withLeadSource,
  type EnquiryClient,
  type EnquiryQuery,
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

function fakeEnquiryClient(leads: PipelineLead[]): EnquiryClient {
  return {
    from: (table) => {
      expect(table).toBe("leads");
      return {
        select: (columns, options) => {
          expect(columns).toBe("*");
          expect(options).toEqual({ count: "exact" });
          let stage: string | null = null;
          let followUpBefore: string | null = null;
          let excludeLaunched = false;
          const query: EnquiryQuery = {
            eq: (column, value) => {
              expect(column).toBe("stage");
              stage = value;
              return query;
            },
            lt: (column, value) => {
              expect(column).toBe("next_follow_up_at");
              followUpBefore = value;
              return query;
            },
            neq: (column, value) => {
              expect(column).toBe("stage");
              expect(value).toBe("Launched");
              excludeLaunched = true;
              return query;
            },
            order: () => query,
            range: async (from, to) => {
              const matching = leads
                .filter((item) => !stage || item.stage === stage)
                .filter(
                  (item) =>
                    !followUpBefore ||
                    (item.next_follow_up_at !== null && item.next_follow_up_at < followUpBefore),
                )
                .filter((item) => !excludeLaunched || item.stage !== "Launched")
                .sort(
                  (a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id),
                );
              return {
                data: matching.slice(from, to + 1),
                count: matching.length,
                error: null,
              };
            },
          };
          return query;
        },
      };
    },
  };
}

describe("database-side enquiry pages", () => {
  it("finds overdue enquiries older than the newest 200 and reports the full total", async () => {
    const records = Array.from({ length: 225 }, (_, index) =>
      lead({
        id: `lead-${String(index).padStart(3, "0")}`,
        created_at: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(),
        next_follow_up_at: index < 15 ? "2026-11-16T00:00:00Z" : "2026-11-18T00:00:00Z",
      }),
    );

    const result = await loadEnquiryPage(
      fakeEnquiryClient(records),
      { stage: "all", overdueOnly: true },
      0,
      new Date("2026-11-17T00:00:00Z"),
    );

    expect(result.error).toBeNull();
    expect(result.count).toBe(15);
    expect(result.data).toHaveLength(15);
    expect(
      (result.data as PipelineLead[]).every((item) => item.created_at < "2026-02-01T00:00:00.000Z"),
    ).toBe(true);
  });

  it("uses deterministic tie-breaking across the page boundary without duplicates", async () => {
    const records = Array.from({ length: ENQUIRY_PAGE_SIZE + 3 }, (_, index) =>
      lead({ id: `same-time-${String(index).padStart(3, "0")}` }),
    );
    const client = fakeEnquiryClient(records);
    const filters = { stage: "all", overdueOnly: false } as const;
    const now = new Date("2026-11-17T00:00:00Z");

    const first = await loadEnquiryPage(client, filters, 0, now);
    const second = await loadEnquiryPage(client, filters, 1, now);
    const firstIds = (first.data as PipelineLead[]).map((item) => item.id);
    const secondIds = (second.data as PipelineLead[]).map((item) => item.id);

    expect(first.count).toBe(ENQUIRY_PAGE_SIZE + 3);
    expect(firstIds).toHaveLength(ENQUIRY_PAGE_SIZE);
    expect(secondIds).toEqual(["same-time-002", "same-time-001", "same-time-000"]);
    expect(new Set([...firstIds, ...secondIds]).size).toBe(ENQUIRY_PAGE_SIZE + 3);
  });

  it("applies stage and overdue filters together while excluding launched enquiries", async () => {
    const records = [
      ...Array.from({ length: 210 }, (_, index) =>
        lead({
          id: `launched-${index}`,
          stage: "Launched",
          next_follow_up_at: "2026-11-01T00:00:00Z",
        }),
      ),
      lead({
        id: "older-contacted",
        stage: "Contacted",
        next_follow_up_at: "2026-11-01T00:00:00Z",
      }),
      lead({
        id: "older-received",
        stage: "Received",
        next_follow_up_at: "2026-11-01T00:00:00Z",
      }),
    ];

    const result = await loadEnquiryPage(
      fakeEnquiryClient(records),
      { stage: "Contacted", overdueOnly: true },
      0,
      new Date("2026-11-17T00:00:00Z"),
    );

    expect(result.count).toBe(1);
    expect(result.data).toEqual([expect.objectContaining({ id: "older-contacted" })]);
  });
});
