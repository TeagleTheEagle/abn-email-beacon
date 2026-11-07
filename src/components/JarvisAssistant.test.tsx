import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  JarvisAssistant,
  extractBusinessName,
  generateJarvisReply,
  getPagePrompts,
} from "./JarvisAssistant";

const { insert, navigate } = vi.hoisted(() => ({
  insert: vi.fn().mockResolvedValue({ error: null }),
  navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  useLocation: () => "/",
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ insert }) },
}));
vi.mock("@/lib/leads", () => ({ newLeadId: () => "jarvis-lead-id", notifyLead: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("JarvisAssistant", () => {
  it("matches industry queries to the corresponding showroom demo", () => {
    const reply = generateJarvisReply("Do you have a plumber or tradie website demo?");
    expect(reply.text).toContain("Plumbing & Trades");
    expect(reply.actions.some((a) => a.to === "/demos/plumbing-trades")).toBe(true);
  });

  it("answers pricing questions with exact figures from services.ts", () => {
    const reply = generateJarvisReply("How much does a website or store cost?");
    expect(reply.text).toContain("A$500");
    expect(reply.text).toContain("From A$1,200");
    expect(reply.text).toContain("From A$2,000");
  });

  it("tailors greeting and quick prompts to the pricing page", () => {
    const page = getPagePrompts("/pricing");
    expect(page.greeting).toContain("free working preview");
    expect(page.prompts.some((p) => p.label === "What’s in a Care Plan?")).toBe(true);
  });

  it("tailors greeting to a specific showroom demo page", () => {
    const page = getPagePrompts("/demos/barbershop");
    expect(page.greeting).toContain("Barbershop");
    expect(page.prompts.some((p) => p.label === "Brand this demo for me")).toBe(true);
  });

  it("falls back to default prompts on the home page", () => {
    const page = getPagePrompts("/");
    expect(page.prompts.some((p) => p.label === "Free preview")).toBe(true);
    expect(page.prompts.some((p) => p.label === "Book a 15-min call")).toBe(true);
  });

  it("extracts a business name from chat text for form auto-fill", () => {
    expect(extractBusinessName("I run Apex Electrical in Mosman")).toBe("Apex Electrical");
    expect(extractBusinessName("my cafe is called The Daily Grind")).toBe("The Daily Grind");
    expect(extractBusinessName("How much does a website cost?")).toBeNull();
  });

  it("opens the chat panel and submits an inline free-preview request to Supabase", async () => {
    render(<JarvisAssistant />);
    fireEvent.click(screen.getByRole("button", { name: "Ask JARVIS AI Assistant" }));
    expect(screen.getByRole("region", { name: "JARVIS AI Website Assistant" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Request Free Preview Here/i }));
    fireEvent.change(screen.getByPlaceholderText("Your business name"), {
      target: { value: "Sydney Harbour Plumbing" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your email address"), {
      target: { value: "ben@harbourplumbing.com.au" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send my free preview request" }));

    await waitFor(() =>
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "jarvis-lead-id",
          business_name: "Sydney Harbour Plumbing",
          email: "ben@harbourplumbing.com.au",
          needs: ["Website"],
        }),
      ),
    );
  });
});
