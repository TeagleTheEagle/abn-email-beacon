import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoEnquiryModal } from "./DemoEnquiryModal";
import { getShowroomDesign } from "@/content/showroom";

const { insert, notifyLead } = vi.hoisted(() => ({
  insert: vi.fn().mockResolvedValue({ error: null }),
  notifyLead: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert }) } }));
vi.mock("@/lib/leads", () => ({ newLeadId: () => "test-id", notifyLead }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("showroom enquiry", () => {
  it("prefills the chosen design and sends it through the existing lead flow", async () => {
    const design = getShowroomDesign("barbershop");
    render(<DemoEnquiryModal designs={[design]} open onOpenChange={() => {}} />);
    const message = screen.getByLabelText("Message") as HTMLTextAreaElement;
    await waitFor(() => expect(message.value).toContain("Luxury Barbershop"));
    fireEvent.change(screen.getByLabelText("Name *"), { target: { value: "Sam" } });
    fireEvent.change(screen.getByLabelText("Business name *"), {
      target: { value: "Sam's Barbers" },
    });
    fireEvent.change(screen.getByLabelText("Email *"), { target: { value: "sam@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Get my free preview" }));

    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    const row = insert.mock.calls[0]?.[0] as { message: string; needs: string[] };
    expect(row.message).toContain("Showroom design: Luxury Barbershop (design 01)");
    expect(row.needs).toEqual(["Website"]);
    expect(notifyLead).toHaveBeenCalledWith(expect.anything(), "test-id");
    expect(await screen.findByText("Thanks, we've got it.")).toBeTruthy();
  });

  it("asks for an online store when a shortlisted design is an e-commerce one", async () => {
    const designs = [getShowroomDesign("cafe"), getShowroomDesign("boutique-ecommerce")];
    render(<DemoEnquiryModal designs={designs} open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByLabelText("Name *"), { target: { value: "Sam" } });
    fireEvent.change(screen.getByLabelText("Business name *"), { target: { value: "Sam's" } });
    fireEvent.change(screen.getByLabelText("Email *"), { target: { value: "sam@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Get my free preview" }));

    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    const row = insert.mock.calls[0]?.[0] as { message: string; needs: string[] };
    expect(row.needs).toEqual(["Website", "Online store"]);
    expect(row.message).toContain("Boutique E-Commerce Store (design 11)");
  });
});
