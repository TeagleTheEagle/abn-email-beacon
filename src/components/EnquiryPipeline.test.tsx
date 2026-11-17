import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { EnquiryPipeline } from "./EnquiryPipeline";

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

const lead = {
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
    api.update.mockResolvedValue({ error: null });
    api.from.mockReturnValue({
      select: () => ({
        order: () => ({ limit: () => Promise.resolve({ data: [lead], error: null }) }),
      }),
    });
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
      ),
    );
    expect(api.track).toHaveBeenCalledWith("enquiry_stage_changed", {
      previous_stage: "Received",
      next_stage: "Contacted",
    });
  });
});
