import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/integrations/supabase/types";
import { withLeadSource, type EnquiryStage, type LeadSource } from "@/lib/enquiry-pipeline";

// Leads are inserted with a client-generated id (RLS allows insert only, so the row can't be read
// back), then the notify-lead function is asked to email the owner about that id.
export const newLeadId = () => crypto.randomUUID();

// Each insert stores only the SHA-256 of a random one-time token; notify-lead requires the token,
// so knowing an enquiry's id and email is not enough to trigger its emails.
const notifyTokens = new Map<string, string>();
async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

// The generated Lovable types are not hand-edited. This single boundary includes the additive
// source column from migration 0006 until Lovable regenerates its database types.
export async function insertLead(
  client: SupabaseClient<Database>,
  payload: TablesInsert<"leads">,
  source: LeadSource,
) {
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  const withSource = {
    ...withLeadSource(payload, source),
    notify_token_hash: await sha256Hex(token),
  };
  const { error } = await client
    .from("leads")
    .insert(withSource as unknown as TablesInsert<"leads">);
  if (!error && payload.id) notifyTokens.set(payload.id, token);
  return { error };
}

interface MembershipResult {
  data: { user_id: string } | null;
  error: { message: string } | null;
}
interface MembershipClient {
  from(table: "owner_memberships"): {
    select(columns: "user_id"): {
      eq(column: "user_id", value: string): { maybeSingle(): Promise<MembershipResult> };
    };
  };
}

export async function checkEnquiryOwner(client: SupabaseClient<Database>, userId: string) {
  // Same generated-type boundary as insertLead; RLS still permits reading only this membership.
  const membershipClient = client as unknown as MembershipClient;
  const { data, error } = await membershipClient
    .from("owner_memberships")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return { isOwner: data?.user_id === userId, error };
}

export type LeadWorkflowUpdate = {
  stage: EnquiryStage;
  assigned_owner_id: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
};

export async function updateLeadWorkflow(
  client: SupabaseClient<Database>,
  id: string,
  payload: LeadWorkflowUpdate,
  expectedUpdatedAt: string,
) {
  try {
    const { data, error } = await client
      .from("leads")
      .update(payload as unknown as TablesInsert<"leads">)
      .eq("id", id)
      .eq("updated_at", expectedUpdatedAt)
      .select("id, updated_at");
    if (error) return { data: null, error };
    const updated = data?.length === 1 ? data[0] : null;
    if (!updated || updated.id !== id) {
      return {
        data: null,
        error: new Error(
          "Enquiry was not updated. It may be missing, changed by another owner, or no longer accessible.",
        ),
      };
    }
    return { data: updated, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Enquiry update failed"),
    };
  }
}

// Best effort: the enquiry is already saved, so a failed email must never fail the form.
export async function notifyLead(client: SupabaseClient<Database>, id: string, email: string) {
  const token = notifyTokens.get(id);
  try {
    const { error } = await client.functions.invoke("notify-lead", {
      body: { id, email, ...(token ? { token } : {}) },
    });
    if (!error) notifyTokens.delete(id);
    if (error) console.warn("Lead saved but notification failed:", error.message);
    return { success: !error };
  } catch (e) {
    console.warn("Lead saved but notification failed:", e);
    return { success: false };
  }
}
