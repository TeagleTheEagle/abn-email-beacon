import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EstimateCalculator } from "./EstimateCalculator";

const { insert } = vi.hoisted(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert }) } }));
vi.mock("@/lib/leads", () => ({ newLeadId: () => "test-id", notifyLead: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("guided preview enquiry", () => {
  it("sends the selected business, store and care plan through the existing lead flow", async () => {
    render(<EstimateCalculator guided />);
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Trades" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    const radios = screen.getAllByRole("radio");
    const store = radios[1];
    if (!store) throw new Error("Missing store choice");
    fireEvent.click(store);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByRole("textbox", { name: "Business name" }), { target: { value: "Example Electrical" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "example@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Get my free preview" }));
    await waitFor(() => expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      business_name: "Example Electrical", business_type: "Trades", email: "example@example.com",
      needs: ["Store Setup", "Care Plan"],
      message: "Estimate from the services page: Store Setup + Care Plan — From A$1,200 + A$49/month.",
    })));
  });
});