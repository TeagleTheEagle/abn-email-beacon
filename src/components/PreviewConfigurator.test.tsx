import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demos, type DemoKind } from "@/content/demos";
import { PreviewConfigurator } from "./PreviewConfigurator";

const { insert } = vi.hoisted(() => ({
  insert: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ insert }) },
}));
vi.mock("@/lib/leads", () => ({
  newLeadId: () => "configurator-lead-id",
  notifyLead: vi.fn(),
  insertLead: (_client: unknown, payload: object, source: string) => insert({ ...payload, source }),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const industries = ["Tradie / Services", "Hospitality / Cafe", "Boutique / Retail", "Professional"];
const goals = ["More enquiries", "Online bookings", "Digital shop", "Brand refresh"];

function chooseConcept(industry: string, goal: string) {
  fireEvent.click(screen.getByRole("button", { name: industry }));
  fireEvent.click(screen.getByRole("button", { name: goal }));
}

describe("PreviewConfigurator", () => {
  it("offers the requested industry and goal choices in the first two steps", () => {
    render(<PreviewConfigurator />);

    expect(screen.getByRole("heading", { name: "Step 1: Choose your industry" })).toBeVisible();
    for (const industry of industries) {
      expect(screen.getByRole("button", { name: industry })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "Tradie / Services" }));

    expect(screen.getByRole("heading", { name: "Step 2: Choose your goal" })).toBeVisible();
    for (const goal of goals) {
      expect(screen.getByRole("button", { name: goal })).toBeInTheDocument();
    }
  });

  it.each([
    { industry: "Tradie / Services", goal: "More enquiries", kind: "tradie" },
    { industry: "Hospitality / Cafe", goal: "Online bookings", kind: "cafe" },
    { industry: "Boutique / Retail", goal: "Digital shop", kind: "retail" },
    { industry: "Professional", goal: "Brand refresh", kind: "salon" },
  ] satisfies { industry: string; goal: string; kind: DemoKind }[])(
    "shows the $kind instant concept for $industry and $goal",
    ({ industry, goal, kind }) => {
      render(<PreviewConfigurator />);
      const demo = demos[kind];

      chooseConcept(industry, goal);

      expect(screen.getByRole("heading", { name: "Step 3: Instant Concept" })).toBeVisible();
      expect(screen.getByRole("heading", { name: demo.name })).toBeVisible();
      expect(screen.getByText(demo.title)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: `${demo.name} demo preview` })).toHaveAttribute(
        "src",
        demo.imageSmall,
      );
      expect(screen.getByRole("link", { name: "Try interactive demo" })).toHaveAttribute(
        "href",
        `/demo/${kind}`,
      );
      expect(screen.getByRole("button", { name: "Get your custom preview" })).toBeEnabled();
    },
  );

  it("passes the selected concept through the existing custom-preview lead flow", async () => {
    render(<PreviewConfigurator />);
    chooseConcept("Professional", "Brand refresh");

    fireEvent.click(screen.getByRole("button", { name: "Get your custom preview" }));

    const leadRegion = screen.getByRole("region", { name: "Get your custom preview" });
    expect(within(leadRegion).getByText(/Professional · Brand refresh/)).toBeInTheDocument();
    fireEvent.change(within(leadRegion).getByRole("textbox", { name: "Business name" }), {
      target: { value: "Example Advisory" },
    });
    fireEvent.change(within(leadRegion).getByRole("textbox", { name: "Email" }), {
      target: { value: "hello@example.com.au" },
    });
    fireEvent.click(
      within(leadRegion).getByRole("button", { name: "Send my custom preview request" }),
    );

    await waitFor(() =>
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          business_name: "Example Advisory",
          email: "hello@example.com.au",
          message: "Instant preview configurator: Professional · Brand refresh · FORME Studio",
        }),
      ),
    );
    expect(
      await screen.findByText("Thanks! Ben will be in touch within 1–2 business days."),
    ).toBeInTheDocument();
  });
});
