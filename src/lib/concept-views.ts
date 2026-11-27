// Views reported by the hidden /concept/*.html prospect pages (public.concept_views).
// Anyone can insert a view; RLS lets only enquiry owners read them.

/** Slugs used for testing the tracker. Hidden from the owner panel; rows are never deleted. */
export const EXCLUDED_CONCEPT_SLUGS: readonly string[] = ["qa-test"];

/** Rows fetched per request. Matches the PostgREST default row cap, so paging is explicit. */
export const CONCEPT_VIEWS_PAGE_SIZE = 1000;
/** Safety stop for the paging loop (100,000 views). */
export const CONCEPT_VIEWS_MAX_PAGES = 100;

export interface ConceptViewRow {
  slug: string;
  viewed_at: string;
}

export interface ConceptViewSummary {
  slug: string;
  total: number;
  lastViewedAt: string;
}

/** Totals per slug, newest last view first (ties by slug), excluding test slugs. */
export function summariseConceptViews(
  rows: readonly ConceptViewRow[],
  excluded: readonly string[] = EXCLUDED_CONCEPT_SLUGS,
): ConceptViewSummary[] {
  const bySlug = new Map<string, { total: number; last: number; lastViewedAt: string }>();
  for (const row of rows) {
    if (excluded.includes(row.slug)) continue;
    const time = Date.parse(row.viewed_at);
    if (Number.isNaN(time)) continue;
    const current = bySlug.get(row.slug);
    if (!current) {
      bySlug.set(row.slug, { total: 1, last: time, lastViewedAt: row.viewed_at });
    } else {
      current.total += 1;
      if (time > current.last) {
        current.last = time;
        current.lastViewedAt = row.viewed_at;
      }
    }
  }
  return [...bySlug.entries()]
    .sort(([slugA, a], [slugB, b]) => b.last - a.last || slugA.localeCompare(slugB))
    .map(([slug, { total, lastViewedAt }]) => ({ slug, total, lastViewedAt }));
}

interface ConceptViewsQuery {
  not(column: "slug", operator: "in", value: string): ConceptViewsQuery;
  order(column: "viewed_at" | "id", options: { ascending: boolean }): ConceptViewsQuery;
  range(from: number, to: number): PromiseLike<ConceptViewsResult>;
}

interface ConceptViewsResult {
  data: ConceptViewRow[] | null;
  error: unknown;
}

export interface ConceptViewsClient {
  from(table: "concept_views"): {
    select(columns: "slug, viewed_at"): ConceptViewsQuery;
  };
}

/** Reads every visible view row page by page. RLS returns rows only to enquiry owners. */
export async function loadConceptViewRows(
  client: ConceptViewsClient,
): Promise<{ rows: ConceptViewRow[]; error: unknown }> {
  const rows: ConceptViewRow[] = [];
  const excludedList = `(${EXCLUDED_CONCEPT_SLUGS.map((slug) => `"${slug}"`).join(",")})`;
  for (let page = 0; page < CONCEPT_VIEWS_MAX_PAGES; page += 1) {
    const from = page * CONCEPT_VIEWS_PAGE_SIZE;
    const { data, error } = await client
      .from("concept_views")
      .select("slug, viewed_at")
      .not("slug", "in", excludedList)
      .order("viewed_at", { ascending: false })
      // Stable tiebreaker so equal timestamps never shift between pages.
      .order("id", { ascending: false })
      .range(from, from + CONCEPT_VIEWS_PAGE_SIZE - 1);
    if (error) return { rows: [], error };
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < CONCEPT_VIEWS_PAGE_SIZE) break;
  }
  return { rows, error: null };
}
