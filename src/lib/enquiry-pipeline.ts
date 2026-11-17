export const ENQUIRY_STAGES = [
  "Received",
  "Contacted",
  "Preview sent",
  "Approved",
  "Paid",
  "Launched",
] as const;
export type EnquiryStage = (typeof ENQUIRY_STAGES)[number];
export const LEAD_SOURCES = [
  "Homepage quick form",
  "Contact page",
  "Call request",
  "Estimate calculator",
  "Preview configurator",
  "Showroom",
  "JARVIS assistant",
  "Public MCP",
  "Website",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface PipelineLead {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  business_name: string;
  email: string;
  phone: string | null;
  business_type?: string | null | undefined;
  current_website?: string | null | undefined;
  needs?: string[] | undefined;
  message?: string | null | undefined;
  source: LeadSource;
  assigned_owner_id: string | null;
  stage: EnquiryStage;
  next_follow_up_at: string | null;
  notes: string | null;
  owner_notification_status: string;
  customer_confirmation_status: string;
  owner_notification_attempts: number;
  customer_confirmation_attempts: number;
}

export function withLeadSource<T extends object>(payload: T, source: LeadSource) {
  return { ...payload, source };
}

export function isFollowUpOverdue(lead: PipelineLead, now: Date): boolean {
  if (!lead.next_follow_up_at || lead.stage === "Launched") return false;
  const timestamp = Date.parse(lead.next_follow_up_at);
  return Number.isFinite(timestamp) && timestamp < now.getTime();
}

export const ENQUIRY_PAGE_SIZE = 50;

export type EnquiryFilters = {
  overdueOnly: boolean;
  stage: EnquiryStage | "all";
};

export interface EnquiryQuery {
  eq(column: "stage", value: EnquiryStage): EnquiryQuery;
  lt(column: "next_follow_up_at", value: string): EnquiryQuery;
  neq(column: "stage", value: "Launched"): EnquiryQuery;
  order(column: "created_at" | "id", options: { ascending: false }): EnquiryQuery;
  range(
    from: number,
    to: number,
  ): PromiseLike<{ data: unknown; count: number | null; error: { message: string } | null }>;
}

export interface EnquiryClient {
  from(table: "leads"): {
    select(columns: "*", options: { count: "exact" }): EnquiryQuery;
  };
}

export function loadEnquiryPage(
  client: EnquiryClient,
  filters: EnquiryFilters,
  page: number,
  now: Date,
) {
  const safePage = Math.max(0, Math.floor(page));
  const from = safePage * ENQUIRY_PAGE_SIZE;
  let query = client.from("leads").select("*", { count: "exact" });
  if (filters.stage !== "all") query = query.eq("stage", filters.stage);
  if (filters.overdueOnly) {
    // SQL comparison excludes null dates; launched work is never overdue by definition.
    query = query.lt("next_follow_up_at", now.toISOString()).neq("stage", "Launched");
  }
  return query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + ENQUIRY_PAGE_SIZE - 1);
}

export function filterPipelineLeads(
  leads: PipelineLead[],
  filters: EnquiryFilters,
  now: Date,
): PipelineLead[] {
  return leads.filter(
    (lead) =>
      (filters.stage === "all" || lead.stage === filters.stage) &&
      (!filters.overdueOnly || isFollowUpOverdue(lead, now)),
  );
}
