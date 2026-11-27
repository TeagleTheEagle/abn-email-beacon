import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConceptViewsPanel } from "./ConceptViewsPanel";

const api = vi.hoisted(() => ({ load: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/lib/concept-views", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/concept-views")>()),
  loadConceptViewRows: api.load,
}));

afterEach(() => {
  cleanup();
  api.load.mockReset();
});

describe("ConceptViewsPanel", () => {
  it("lists totals per concept page, newest view first, without the test slug", async () => {
    api.load.mockResolvedValue({
      rows: [
        { slug: "acorn-painting", viewed_at: "2026-11-26T00:00:00Z" },
        { slug: "beauty-at-kylies", viewed_at: "2026-11-27T00:00:00Z" },
        { slug: "acorn-painting", viewed_at: "2026-11-25T00:00:00Z" },
        { slug: "qa-test", viewed_at: "2026-11-28T00:00:00Z" },
      ],
      error: null,
    });
    render(<ConceptViewsPanel />);

    expect(screen.getByText(/loading concept page views/i)).toBeInTheDocument();
    const rows = await screen.findAllByRole("row");
    const cells = rows.slice(1).map((row) => row.textContent);
    expect(cells[0]).toContain("beauty-at-kylies1");
    expect(cells[1]).toContain("acorn-painting2");
    expect(screen.queryByText("qa-test")).not.toBeInTheDocument();
  });

  it("shows a friendly empty state", async () => {
    api.load.mockResolvedValue({ rows: [], error: null });
    render(<ConceptViewsPanel />);
    expect(await screen.findByText(/no views yet/i)).toBeInTheDocument();
  });

  it("shows an error state when the read fails", async () => {
    api.load.mockResolvedValue({ rows: [], error: new Error("denied") });
    render(<ConceptViewsPanel />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not load concept page views/i,
    );
  });
});
