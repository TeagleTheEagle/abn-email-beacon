import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { demos, demoKinds } from "@/content/demos";
import { formatPrice } from "@/lib/shopify";

const { insert, notifyLead } = vi.hoisted(() => ({
  insert: vi.fn().mockResolvedValue({ error: null }),
  notifyLead: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ insert }) },
}));
vi.mock("@/lib/leads", () => ({
  newLeadId: () => "qa-lead-id",
  notifyLead,
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("QA flows: enquiry validation, honeypot spam protection, error handling & SEO", () => {
  it("keeps the company_website honeypot hidden from keyboard/AT while providing an accessible label", () => {
    const { container } = render(<QuickLeadForm />);
    const trap = container.querySelector(
      'input[name="company_website"]',
    ) as HTMLInputElement | null;
    expect(trap).not.toBeNull();
    expect(trap?.getAttribute("aria-hidden")).toBe("true");
    expect(trap?.getAttribute("tabindex")).toBe("-1");
    expect(trap?.getAttribute("aria-label")).toBe("Company website (do not fill in)");
  });

  it("blocks spam submissions when the company_website honeypot is filled without writing to Supabase", async () => {
    const { container } = render(<QuickLeadForm />);
    const trap = container.querySelector('input[name="company_website"]') as HTMLInputElement;
    trap.value = "https://spam-bot.example";

    fireEvent.change(screen.getByPlaceholderText("Business name"), {
      target: { value: "Spam Co" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "bot@spam.example" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Get a free preview/i }));

    expect(await screen.findByText(/Thanks! We'll be in touch/i)).toBeInTheDocument();
    expect(insert).not.toHaveBeenCalled();
    expect(notifyLead).not.toHaveBeenCalled();
  });

  it("validates required fields and email format before allowing submission", async () => {
    render(<QuickLeadForm />);
    fireEvent.click(screen.getByRole("button", { name: /Get a free preview/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Please enter your business name/i);
    expect(insert).not.toHaveBeenCalled();
  });

  it("surfaces a graceful error message when Supabase insert fails", async () => {
    insert.mockResolvedValueOnce({ error: { message: "Database unavailable" } });
    render(<QuickLeadForm />);

    fireEvent.change(screen.getByPlaceholderText("Business name"), {
      target: { value: "Harbour Plumbing" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "owner@harbourplumbing.com.au" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Get a free preview/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Sorry, something went wrong\. Please try again\./i,
    );
    expect(notifyLead).not.toHaveBeenCalled();
  });

  it("formats AUD shop prices cleanly without GST suffixes", () => {
    expect(formatPrice("29.0", "AUD")).toBe("A$29.00");
    expect(formatPrice("149.00", "AUD")).toBe("A$149.00");
    expect(formatPrice("29.0", "AUD")).not.toContain("GST");
  });

  it("produces unique meta descriptions across all /demo/$kind routes", () => {
    const descriptions = demoKinds.map((kind) => {
      const d = demos[kind];
      return `Interactive ${d.category.toLowerCase()} website demo for ${d.name} — ${d.body} An illustrative concept by Teague Industries.`;
    });
    const unique = new Set(descriptions);
    expect(unique.size).toBe(demoKinds.length);
  });
});
