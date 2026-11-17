// Sends owner and customer emails for a saved enquiry. Delivery state is claimed atomically in
// Postgres, so browser retries and scheduled/manual retries cannot send the same recipient twice.
// Secrets: RESEND_API_KEY, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.
// LEAD_NOTIFY_TO overrides the owner recipient. LEAD_FROM enables customer confirmations only when
// it is a verified sender. AI-originated enquiries retain their existing no-confirmation behaviour.
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleNotifyLead,
  ProviderResponseError,
  type DeliveryKind,
  type LeadForNotification,
  type NotificationOutcome,
  type NotificationStore,
} from "./handler.ts";

const DEFAULT_TO = "benteaguey6@gmail.com";
const FALLBACK_FROM = "Teague Industries <onboarding@resend.dev>";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 500) =>
  Response.json(body, {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

async function sendEmail(apiKey: string, payload: Record<string, unknown>, idempotencyKey: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });
  const responseText = await response.text();
  if (!response.ok)
    throw new ProviderResponseError(
      response.status,
      `Resend ${response.status}: ${responseText.slice(0, 300)}`,
    );
  let id: string | null = null;
  try {
    const parsed: unknown = JSON.parse(responseText);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as { id?: unknown })["id"] === "string"
    )
      id = (parsed as { id: string })["id"];
  } catch {
    // A provider id is useful for reconciliation, but a 2xx response still confirms acceptance.
  }
  return { id };
}

function createStore(url: string, serviceRoleKey: string): NotificationStore {
  const db = createClient(url, serviceRoleKey);
  const fields =
    "id, created_at, name, business_name, email, phone, business_type, needs, current_website, message, notified_at, owner_notification_status, owner_notification_attempts, owner_notification_attempted_at, owner_notification_attempt_id, owner_notification_error, owner_notification_provider_id, customer_confirmation_status, customer_confirmation_attempts, customer_confirmation_attempted_at, customer_confirmation_attempt_id, customer_confirmation_error, customer_confirmation_provider_id";
  return {
    async findLead(id, email) {
      const { data, error } = await db
        .from("leads")
        .select(fields)
        .eq("id", id)
        .eq("email", email)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as LeadForNotification | null) ?? null;
    },
    async claim(kind: DeliveryKind, id: string, staleBefore: Date, maxAttempts: number) {
      const attemptId = crypto.randomUUID();
      const { data, error } = await db.rpc(
        kind === "owner" ? "claim_lead_owner_notification" : "claim_lead_customer_confirmation",
        {
          p_lead_id: id,
          p_attempt_id: attemptId,
          p_stale_before: staleBefore.toISOString(),
          p_max_attempts: maxAttempts,
        },
      );
      if (error) throw new Error(error.message);
      return data === true ? attemptId : null;
    },
    async mark(kind: DeliveryKind, id: string, attemptId: string, outcome: NotificationOutcome) {
      const prefix = kind === "owner" ? "owner_notification" : "customer_confirmation";
      const patch = {
        [`${prefix}_status`]: outcome.status,
        [`${prefix}_error`]: outcome.error ?? null,
        [`${prefix}_provider_id`]: outcome.providerId ?? null,
        ...(kind === "owner" && outcome.status === "sent"
          ? { notified_at: new Date().toISOString() }
          : {}),
      };
      const { error } = await db
        .from("leads")
        .update(patch)
        .eq("id", id)
        .eq(`${prefix}_attempt_id`, attemptId);
      if (error) throw new Error(error.message);
    },
    async skipCustomer(id: string, reason: string) {
      const { error } = await db
        .from("leads")
        .update({
          customer_confirmation_status: "skipped",
          customer_confirmation_error: reason,
        })
        .eq("id", id)
        .eq("customer_confirmation_status", "pending");
      if (error) throw new Error(error.message);
    },
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!apiKey || !url || !serviceRoleKey)
    return json({ error: "Notification service is not configured" }, 500);
  try {
    const response = await handleNotifyLead(request, {
      store: createStore(url, serviceRoleKey),
      sendEmail: (payload, key) => sendEmail(apiKey, payload, key),
      ownerEmail: Deno.env.get("LEAD_NOTIFY_TO") || DEFAULT_TO,
      from: Deno.env.get("LEAD_FROM") || FALLBACK_FROM,
      customerConfirmationEnabled: Boolean(Deno.env.get("LEAD_FROM")),
      schedulerKey: Deno.env.get("NOTIFY_SCHEDULER_KEY"),
    });
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(cors)) headers.set(key, value);
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error("notify-lead failed:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Could not process notification" }, 500);
  }
});
