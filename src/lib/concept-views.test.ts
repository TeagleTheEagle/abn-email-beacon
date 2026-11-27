import { describe, expect, it } from "vitest";
import {
  CONCEPT_VIEWS_PAGE_SIZE,
  loadConceptViewRows,
  summariseConceptViews,
  type ConceptViewRow,
  type ConceptViewsClient,
} from "./concept-views";

describe("summariseConceptViews", () => {
  it("totals views per slug and sorts by most recent view first", () => {
    const rows: ConceptViewRow[] = [
      { slug: "acorn-painting", viewed_at: "2026-11-27T01:00:00Z" },
      { slug: "beauty-at-kylies", viewed_at: "2026-11-27T03:00:00Z" },
      { slug: "acorn-painting", viewed_at: "2026-11-27T05:00:00Z" },
      { slug: "acorn-painting", viewed_at: "2026-11-26T22:00:00Z" },
      { slug: "pizzazz-hair-body-studio", viewed_at: "2026-11-25T09:00:00Z" },
    ];

    expect(summariseConceptViews(rows)).toEqual([
      { slug: "acorn-painting", total: 3, lastViewedAt: "2026-11-27T05:00:00Z" },
      { slug: "beauty-at-kylies", total: 1, lastViewedAt: "2026-11-27T03:00:00Z" },
      { slug: "pizzazz-hair-body-studio", total: 1, lastViewedAt: "2026-11-25T09:00:00Z" },
    ]);
  });

  it("hides the qa-test slug and ignores unreadable timestamps", () => {
    const rows: ConceptViewRow[] = [
      { slug: "qa-test", viewed_at: "2026-11-28T00:00:00Z" },
      { slug: "atlantic-painting", viewed_at: "not a date" },
      { slug: "atlantic-painting", viewed_at: "2026-11-27T00:00:00Z" },
    ];

    expect(summariseConceptViews(rows)).toEqual([
      { slug: "atlantic-painting", total: 1, lastViewedAt: "2026-11-27T00:00:00Z" },
    ]);
  });

  it("breaks ties on the same last-viewed time by slug and handles no views", () => {
    const at = "2026-11-27T00:00:00Z";
    expect(
      summariseConceptViews([
        { slug: "kims-beauty-nail-bar", viewed_at: at },
        { slug: "double-j-smash-repairs", viewed_at: at },
      ]).map((view) => view.slug),
    ).toEqual(["double-j-smash-repairs", "kims-beauty-nail-bar"]);
    expect(summariseConceptViews([])).toEqual([]);
  });
});

describe("loadConceptViewRows", () => {
  function fakeClient(pages: ConceptViewRow[][], failOnPage?: number) {
    const calls: { from: number; to: number; not: string }[] = [];
    let not = "";
    const query = {
      not: (_column: string, _operator: string, value: string) => {
        not = value;
        return query;
      },
      order: () => query,
      range: (from: number, to: number) => {
        calls.push({ from, to, not });
        const page = from / CONCEPT_VIEWS_PAGE_SIZE;
        return Promise.resolve(
          page === failOnPage
            ? { data: null, error: new Error("denied") }
            : { data: pages[page] ?? [], error: null },
        );
      },
    };
    const client = { from: () => ({ select: () => query }) } as unknown as ConceptViewsClient;
    return { client, calls };
  }

  it("pages through every row and excludes qa-test in the query", async () => {
    const full = Array.from({ length: CONCEPT_VIEWS_PAGE_SIZE }, () => ({
      slug: "acorn-painting",
      viewed_at: "2026-11-27T00:00:00Z",
    }));
    const { client, calls } = fakeClient([full, [full[0]!]]);

    const result = await loadConceptViewRows(client);

    expect(result.error).toBeNull();
    expect(result.rows).toHaveLength(CONCEPT_VIEWS_PAGE_SIZE + 1);
    expect(calls.map((call) => call.from)).toEqual([0, CONCEPT_VIEWS_PAGE_SIZE]);
    expect(calls[0]!.not).toBe('("qa-test")');
  });

  it("returns the error and no rows when a read fails", async () => {
    const { client } = fakeClient([], 0);
    const result = await loadConceptViewRows(client);
    expect(result.rows).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
  });
});
