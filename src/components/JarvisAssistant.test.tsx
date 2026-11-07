import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  JarvisAssistant,
  buildPersonalisedDemoUrl,
  extractBusinessName,
  extractDemoPersonalisation,
  extractSuburb,
  generateJarvisReply,
  getPagePrompts,
} from "./JarvisAssistant";
import { DemoSite } from "./DemoSite";

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
    expect(extractBusinessName("Apex Electrical, Mosman")).toBe("Apex Electrical");
    expect(extractBusinessName("The Daily Grind Cafe")).toBe("The Daily Grind Cafe");
    expect(extractBusinessName("How much does a website cost?")).toBeNull();
  });

  it("extracts business name, suburb and demo slug for the Instant Demo Personaliser", () => {
    const bondi = extractDemoPersonalisation("I run Bondi Barber in Bondi");
    expect(bondi).toEqual({
      businessName: "Bondi Barber",
      suburb: "Bondi",
      demoSlug: "barbershop",
      url: "/demo/barbershop?biz=Bondi+Barber&loc=Bondi",
    });

    const mosman = extractDemoPersonalisation("Apex Electrical, Mosman");
    expect(mosman).toEqual({
      businessName: "Apex Electrical",
      suburb: "Mosman",
      demoSlug: "tradie",
      url: "/demo/tradie?biz=Apex+Electrical&loc=Mosman",
    });
  });

  it("generates a Personalised Demo Card with query params and Launch/Official Preview actions", () => {
    const reply = generateJarvisReply("I run Bondi Barber in Bondi");
    expect(reply.text).toContain(
      "I've configured a live preview specifically for Bondi Barber in Bondi.",
    );
    expect(reply.card?.title).toBe("Bondi Barber — Interactive Demo");
    expect(reply.card?.subtitle).toBe("Customised for Bondi · Live interactive prototype");
    expect(reply.card?.to).toBe("/demo/barbershop?biz=Bondi+Barber&loc=Bondi");
    expect(reply.card?.ctaLabel).toBe("Launch Bondi Barber Preview");
    expect(reply.card?.secondaryCtaLabel).toBe("Request Official Free Preview");
    expect(reply.actions.some((a) => a.label === "Launch Bondi Barber Preview")).toBe(true);
    expect(reply.actions.some((a) => a.label === "Request Official Free Preview")).toBe(true);
  });

  it("falls back cleanly when no suburb is provided in a personalised demo request", () => {
    expect(extractSuburb("The Daily Grind Cafe")).toBeNull();
    expect(buildPersonalisedDemoUrl("cafe", "The Daily Grind Cafe", null)).toBe(
      "/demo/cafe?biz=The+Daily+Grind+Cafe",
    );

    const reply = generateJarvisReply("The Daily Grind Cafe");
    expect(reply.text).toContain(
      "I've configured a live preview specifically for The Daily Grind Cafe.",
    );
    expect(reply.card?.title).toBe("The Daily Grind Cafe — Interactive Demo");
    expect(reply.card?.subtitle).toBe("Customised for Australia · Live interactive prototype");
    expect(reply.card?.to).toBe("/demo/cafe?biz=The+Daily+Grind+Cafe");
  });

  it("dynamically overwrites DemoSite hero headline and brand name when biz and loc are provided", () => {
    render(<DemoSite kind="barbershop" businessName="Bondi Barber" location="Bondi" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Bondi Barber — Bondi" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Barbershop · Bondi")).toBeInTheDocument();
  });

  it("attaches a rich demo card with palette, price and features to industry matches", () => {
    const reply = generateJarvisReply("Do you have a barbershop website demo?");
    expect(reply.card?.kind).toBe("demo");
    expect(reply.card?.title).toBe("Luxury Barbershop");
    expect(reply.card?.price).toContain("A$500");
    expect(reply.card?.features.length).toBe(3);
    expect(reply.card?.palette?.accent).toBeTruthy();
    expect(reply.card?.to).toBe("/demos/barbershop");
  });

  it("attaches a service card to pricing replies", () => {
    const reply = generateJarvisReply("How much does a website cost?");
    expect(reply.card?.kind).toBe("service");
    expect(reply.card?.title).toBe("Website Build");
    expect(reply.card?.price).toContain("A$500");
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
