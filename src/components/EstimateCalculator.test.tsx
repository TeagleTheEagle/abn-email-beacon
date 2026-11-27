import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EstimateCalculator } from "./EstimateCalculator";

const { insert } = vi.hoisted(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert }) } }));
vi.mock("@/lib/leads", () => ({
  newLeadId: () => "test-id",
  notifyLead: vi.fn(),
  insertLead: (_client: unknown, payload: object, source: string) => insert({ ...payload, source }),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("guided preview enquiry", () => {
  it("requires a business type before continuing and clears the linked error on selection", () => {
    render(<EstimateCalculator guided />);
    const continueButton = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(continueButton);
    const message = screen.getByText("Choose your type of business to continue.");
    expect(continueButton).toHaveAttribute("aria-describedby", message.id);
    expect(screen.getByRole("group", { name: "1. What kind of business?" })).toHaveAttribute(
      "aria-describedby",
      message.id,
    );
    expect(
      screen.getByRole("list", { name: "Preview progress" }).firstElementChild,
    ).toHaveAttribute("aria-current", "step");
    fireEvent.click(screen.getByRole("button", { name: "Trades" }));
    expect(screen.queryByText("Choose your type of business to continue.")).not.toBeInTheDocument();
    fireEvent.click(continueButton);
    expect(screen.getByRole("group", { name: "2. What do you need?" })).toBeVisible();
  });
  it("sends the selected business, store and care plan through the existing lead flow", async () => {
    render(<EstimateCalculator guided />);
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Trades" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    const radios = screen.getAllByRole("radio");
    const store = radios[1];
    if (!store) throw new Error("Missing store choice");
    fireEvent.click(store);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("radio", { name: /^Care Plan · Essentials/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Business name" }), {
      target: { value: "Example Electrical" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "example@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Get my free preview" }));
    await waitFor(() =>
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          business_name: "Example Electrical",
          business_type: "Trades",
          email: "example@example.com",
          needs: ["Store Setup", "Care Plan · Essentials"],
          message:
            "Estimate from the services page: Store Setup + Care Plan · Essentials — From A$1,200 + A$49/month.",
        }),
      ),
    );
  });
});
