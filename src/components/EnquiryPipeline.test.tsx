import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { EnquiryPipeline } from "./EnquiryPipeline";
import type { EnquiryStage, PipelineLead } from "@/lib/enquiry-pipeline";

const api = vi.hoisted(() => ({
  checkOwner: vi.fn(),
  notify: vi.fn(),
  update: vi.fn(),
  track: vi.fn(),
  from: vi.fn(),
}));

const ownerUser = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "owner@example.com",
} as User;

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: ownerUser,
    loading: false,
  }),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("@/lib/leads", () => ({
  checkEnquiryOwner: api.checkOwner,
  notifyLead: api.notify,
  updateLeadWorkflow: api.update,
}));
vi.mock("@/lib/analytics", () => ({ track: api.track }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: api.from } }));

const lead: PipelineLead = {
  id: "11111111-1111-4111-8111-111111111111",
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
};

function makeLead(overrides: Partial<PipelineLead> = {}): PipelineLead {
  return { ...lead, ...overrides };
}

type RangeResult = {
  data: PipelineLead[];
  count: number | null;
  error: { message: string } | null;
};

function mockLeadQuery(
  records: PipelineLead[],
  onRange?: (from: number, to: number, matching: PipelineLead[]) => Promise<RangeResult>,
) {
  const ranges: Array<[number, number]> = [];
  api.from.mockImplementation(() => ({
    select: () => {
      let stage: EnquiryStage | "all" = "all";
      let followUpBefore: string | null = null;
      let excludeLaunched = false;
      const execute = (from: number, to: number): RangeResult => {
        const matching = records
          .filter((item) => stage === "all" || item.stage === stage)
          .filter(
            (item) =>
              !followUpBefore ||
              (item.next_follow_up_at !== null && item.next_follow_up_at < followUpBefore),
          )
          .filter((item) => !excludeLaunched || item.stage !== "Launched")
          .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
        return { data: matching.slice(from, to + 1), count: matching.length, error: null };
      };
      const query = {
        eq: (_column: string, value: EnquiryStage) => {
          stage = value;
          return query;
        },
        lt: (_column: string, value: string) => {
          followUpBefore = value;
          return query;
        },
        neq: () => {
          excludeLaunched = true;
          return query;
        },
        order: () => query,
        limit: async (limit: number) => execute(0, limit - 1),
        range: async (from: number, to: number) => {
          ranges.push([from, to]);
          if (onRange) {
            const matching = execute(0, records.length - 1).data;
            return onRange(from, to, matching);
          }
          return execute(from, to);
        },
      };
      return query;
    },
  }));
  return ranges;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EnquiryPipeline", () => {
  it("denies a non-owner without querying the private enquiry table", async () => {
    api.checkOwner.mockResolvedValue({ isOwner: false, error: null });
    render(<EnquiryPipeline />);

    expect(await screen.findByRole("heading", { name: "Owner access required" })).toBeVisible();
    expect(api.from).not.toHaveBeenCalled();
  });

  it("loads owner enquiries and saves a stage change without personal analytics data", async () => {
    api.checkOwner.mockResolvedValue({ isOwner: true, error: null });
    api.update.mockResolvedValue({
      data: { id: lead.id, updated_at: "2026-11-17T00:00:00Z" },
      error: null,
    });
    mockLeadQuery([lead]);
    render(<EnquiryPipeline />);

    expect(await screen.findByRole("heading", { name: "Example Co" })).toBeVisible();
    expect(screen.getByText("Contact page")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Current stage"), { target: { value: "Contacted" } });
    fireEvent.click(screen.getByRole("button", { name: "Save workflow" }));

    await vi.waitFor(() =>
      expect(api.update).toHaveBeenCalledWith(
        expect.anything(),
        lead.id,
        expect.objectContaining({ stage: "Contacted", assigned_owner_id: expect.any(String) }),
        lead.updated_at,
      ),
    );
    expect(api.track).toHaveBeenCalledWith("enquiry_stage_changed", {
      previous_stage: "Received",
      next_stage: "Contacted",
    });
  });

  it("paginates the full permitted dataset with an exact total", async () => {
    api.checkOwner.mockResolvedValue({ isOwner: true, error: null });
    const records = Array.from({ length: 205 }, (_, index) =>
      makeLead({
        id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
        business_name: `Business ${index}`,
        created_at: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(),
      }),
    );
    const ranges = mockLeadQuery(records);
    render(<EnquiryPipeline />);

    expect(await screen.findByText("Showing 1–50 of 205")).toBeVisible();
    expect(screen.queryByText("Business 0")).not.toBeInTheDocument();
    for (const text of [
      "Showing 51–100 of 205",
      "Showing 101–150 of 205",
      "Showing 151–200 of 205",
      "Showing 201–205 of 205",
    ]) {
      fireEvent.click(screen.getByRole("button", { name: "Next page" }));
      expect(await screen.findByText(text)).toBeVisible();
    }

    expect(screen.getByText("Business 0")).toBeVisible();
    expect(ranges).toEqual([
      [0, 49],
      [50, 99],
      [100, 149],
      [150, 199],
      [200, 249],
    ]);
  });

  it("resets to the first page when filters change", async () => {
    api.checkOwner.mockResolvedValue({ isOwner: true, error: null });
    const records = Array.from({ length: 75 }, (_, index) =>
      makeLead({
        id: `10000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
        business_name: `Business ${index}`,
        created_at: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(),
        stage: index === 0 ? "Contacted" : "Received",
      }),
    );
    const ranges = mockLeadQuery(records);
    render(<EnquiryPipeline />);

    await screen.findByText("Showing 1–50 of 75");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    await screen.findByText("Showing 51–75 of 75");
    fireEvent.change(screen.getByLabelText("Stage"), { target: { value: "Contacted" } });

    expect(await screen.findByText("Showing 1–1 of 1")).toBeVisible();
    expect(ranges.at(-1)).toEqual([0, 49]);
  });

  it("does not let an older filter response replace a newer result", async () => {
    api.checkOwner.mockResolvedValue({ isOwner: true, error: null });
    const resolvers = new Map<string, (result: RangeResult) => void>();
    mockLeadQuery([lead]);
    render(<EnquiryPipeline />);
    await screen.findByText("Showing 1–1 of 1");

    // Use separate deferred queries to model responses completing out of order.
    api.from.mockImplementation(() => ({
      select: () => {
        let selected = "all";
        const query = {
          eq: (_column: string, value: string) => {
            selected = value;
            return query;
          },
          lt: () => query,
          neq: () => query,
          order: () => query,
          range: () =>
            new Promise<RangeResult>((resolve) => {
              resolvers.set(selected, resolve);
            }),
        };
        return query;
      },
    }));
    fireEvent.change(screen.getByLabelText("Stage"), { target: { value: "Received" } });
    await waitFor(() => expect(resolvers.has("Received")).toBe(true));
    fireEvent.change(screen.getByLabelText("Stage"), { target: { value: "Contacted" } });
    await waitFor(() => expect(resolvers.has("Contacted")).toBe(true));
    resolvers.get("Contacted")?.({
      data: [makeLead({ stage: "Contacted", business_name: "Newest response" })],
      count: 1,
      error: null,
    });
    await screen.findByRole("heading", { name: "Newest response" });
    resolvers.get("Received")?.({ data: [lead], count: 1, error: null });

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Newest response" })).toBeVisible(),
    );
    expect(screen.queryByRole("heading", { name: "Example Co" })).not.toBeInTheDocument();
  });

  it("treats a zero-row workflow update as a failure and preserves entered values", async () => {
    api.checkOwner.mockResolvedValue({ isOwner: true, error: null });
    api.update.mockResolvedValue({ data: null, error: null });
    mockLeadQuery([lead]);
    render(<EnquiryPipeline />);

    await screen.findByRole("heading", { name: "Example Co" });
    fireEvent.change(screen.getByLabelText("Private notes"), {
      target: { value: "Keep this unsaved note" },
    });
    fireEvent.change(screen.getByLabelText("Current stage"), { target: { value: "Contacted" } });
    fireEvent.click(screen.getByRole("button", { name: "Save workflow" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not save/i);
    expect(screen.getByLabelText("Private notes")).toHaveValue("Keep this unsaved note");
    expect(screen.getByRole("button", { name: "Save workflow" })).toBeEnabled();
    expect(api.track).not.toHaveBeenCalled();
  });

  it("allows a repeated save after a network failure without losing the edits", async () => {
    api.checkOwner.mockResolvedValue({ isOwner: true, error: null });
    api.update.mockRejectedValueOnce(new Error("Network offline")).mockResolvedValueOnce({
      data: { id: lead.id, updated_at: "2026-11-17T01:00:00Z" },
      error: null,
    });
    mockLeadQuery([lead]);
    render(<EnquiryPipeline />);

    await screen.findByRole("heading", { name: "Example Co" });
    fireEvent.change(screen.getByLabelText("Private notes"), {
      target: { value: "Retry this note" },
    });
    fireEvent.change(screen.getByLabelText("Current stage"), { target: { value: "Contacted" } });
    fireEvent.click(screen.getByRole("button", { name: "Save workflow" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not save/i);
    expect(screen.getByRole("button", { name: "Save workflow" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Save workflow" }));

    await waitFor(() => expect(api.update).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText("Private notes")).toHaveValue("Retry this note");
    expect(api.track).toHaveBeenCalledTimes(1);
  });

  it("shows an empty state without implying a failed request", async () => {
    api.checkOwner.mockResolvedValue({ isOwner: true, error: null });
    mockLeadQuery([]);
    render(<EnquiryPipeline />);

    expect(await screen.findByText("No enquiries match these filters.")).toBeVisible();
    expect(screen.getByText("Showing 0–0 of 0")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("recovers from a failed load when refreshed", async () => {
    api.checkOwner.mockResolvedValue({ isOwner: true, error: null });
    api.from.mockReturnValue({
      select: () => ({
        eq: () => ({}),
        order: () => ({
          order: () => ({
            range: async () => ({ data: null, count: null, error: { message: "Unavailable" } }),
          }),
        }),
      }),
    });
    render(<EnquiryPipeline />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not load/i);

    mockLeadQuery([lead]);
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    expect(await screen.findByRole("heading", { name: "Example Co" })).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
