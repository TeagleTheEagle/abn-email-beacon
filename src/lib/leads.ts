import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Leads are inserted with a client-generated id (RLS allows insert only, so the row can't be read
// back), then the notify-lead function is asked to email the owner about that id.
export const newLeadId = () => crypto.randomUUID();

// Best effort: the enquiry is already saved, so a failed email must never fail the form.
export async function notifyLead(client: SupabaseClient<Database>, id: string) {
  try {
    const { error } = await client.functions.invoke("notify-lead", { body: { id } });
    if (error) console.warn("Lead saved but notification failed:", error.message);
  } catch (e) {
    console.warn("Lead saved but notification failed:", e);
  }
}
