export type DeliveryKind = "owner" | "customer";
export type DeliveryStatus = "pending" | "processing" | "sent" | "failed" | "unknown" | "skipped";
export type NotificationOutcome = {
  status: "sent" | "failed" | "unknown";
  providerId?: string;
  error?: string;
};

export interface LeadForNotification {
  id: string;
  created_at: string;
  name: string;
  business_name: string;
  email: string;
  phone: string | null;
  business_type: string | null;
  needs: string[] | null;
  current_website: string | null;
  message: string | null;
  notified_at: string | null;
  owner_notification_status: DeliveryStatus;
  owner_notification_attempts: number;
  owner_notification_attempted_at: string | null;
  owner_notification_attempt_id: string | null;
  owner_notification_error: string | null;
  owner_notification_provider_id: string | null;
  customer_confirmation_status: DeliveryStatus;
  customer_confirmation_attempts: number;
  customer_confirmation_attempted_at: string | null;
  customer_confirmation_attempt_id: string | null;
  customer_confirmation_error: string | null;
  customer_confirmation_provider_id: string | null;
  notify_token_hash?: string | null;
}

export interface NotificationStore {
  findLead(id: string, email: string): Promise<LeadForNotification | null>;
  claim(
    kind: DeliveryKind,
    id: string,
    staleBefore: Date,
    maxAttempts: number,
  ): Promise<string | null>;
  mark(
    kind: DeliveryKind,
    id: string,
    attemptId: string,
    outcome: NotificationOutcome,
  ): Promise<void>;
  skipCustomer(id: string, reason: string): Promise<void>;
}

export interface NotificationDependencies {
  store: NotificationStore;
  sendEmail: (
    payload: Record<string, unknown>,
    idempotencyKey: string,
  ) => Promise<{ id: string | null }>;
  ownerEmail: string;
  from: string;
  customerConfirmationEnabled: boolean;
  schedulerKey?: string;
  /** True when the request carries a signed-in enquiry owner's session (manual resend). */
  isOwner?: (request: Request) => Promise<boolean>;
  now?: () => Date;
}

export class ProviderResponseError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ProviderResponseError";
  }
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const MAX_ATTEMPTS = 5;
const LEASE_MS = 2 * 60 * 1000;
// Unscheduled (visitor) requests may only notify for a just-submitted enquiry; older retries need the scheduler key.
const FRESH_LEAD_MS = 10 * 60 * 1000;
const PROVIDER_IDEMPOTENCY_MS = 24 * 60 * 60 * 1000;
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Access-Control-Allow-Origin": "*" } });
const statusOf = (lead: LeadForNotification, kind: DeliveryKind) =>
  kind === "owner" ? lead.owner_notification_status : lead.customer_confirmation_status;
const attemptsOf = (lead: LeadForNotification, kind: DeliveryKind) =>
  kind === "owner" ? lead.owner_notification_attempts : lead.customer_confirmation_attempts;
const attemptedAtOf = (lead: LeadForNotification, kind: DeliveryKind) =>
  kind === "owner" ? lead.owner_notification_attempted_at : lead.customer_confirmation_attempted_at;
const esc = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );

function ownerPayload(lead: LeadForNotification, to: string, from: string) {
  const rows: Array<[string, string | null | undefined]> = [
    ["Name", lead.name],
    ["Business", lead.business_name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Business type", lead.business_type],
    ["Needs", (lead.needs ?? []).join(", ")],
    ["Current website", lead.current_website],
    ["Message", lead.message],
    [
      "Received",
      new Date(lead.created_at).toLocaleString("en-AU", { timeZone: "Australia/Sydney" }),
    ],
  ];
  const filled = rows.filter(([, value]) => value && String(value).trim());
  return {
    from,
    to: [to],
    reply_to: lead.email,
    subject: `New enquiry: ${lead.business_name} (${lead.name})`,
    text: filled.map(([key, value]) => `${key}: ${value}`).join("\n"),
    html: `<p>New enquiry from <strong>${esc(lead.business_name)}</strong>. Reply to this email to answer them.</p><table style="border-collapse:collapse">${filled.map(([key, value]) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${esc(key)}</td><td style="padding:4px 0">${esc(String(value))}</td></tr>`).join("")}</table>`,
  };
}

function customerPayload(lead: LeadForNotification, to: string, from: string) {
  const first = lead.name.trim().split(/\s+/)[0] || "there";
  return {
    from,
    to: [lead.email],
    reply_to: to,
    subject: "Thanks — we've got your enquiry",
    text: `Hi ${first},\n\nThanks for getting in touch about ${lead.business_name}. I've got your details and will reply within 1–2 business days, usually sooner.\n\nIf you'd like to add anything in the meantime, just reply to this email.\n\nBen\nTeague Industries\nwww.teagueindustries.com.au`,
  };
}

async function deliver(
  kind: DeliveryKind,
  lead: LeadForNotification,
  payload: Record<string, unknown>,
  deps: NotificationDependencies,
) {
  if (statusOf(lead, kind) === "sent") return { status: "sent" as const, http: 200 };
  if (attemptsOf(lead, kind) >= MAX_ATTEMPTS) return { status: statusOf(lead, kind), http: 409 };
  const now = deps.now?.() ?? new Date();
  const attemptedAt = attemptedAtOf(lead, kind);
  const attemptedAtMs = attemptedAt ? Date.parse(attemptedAt) : Number.NaN;
  if (
    statusOf(lead, kind) === "unknown" &&
    attemptsOf(lead, kind) > 0 &&
    (!Number.isFinite(attemptedAtMs) || now.getTime() - attemptedAtMs >= PROVIDER_IDEMPOTENCY_MS)
  )
    return { status: "unknown" as const, http: 409 };
  const attemptId = await deps.store.claim(
    kind,
    lead.id,
    new Date(now.getTime() - LEASE_MS),
    MAX_ATTEMPTS,
  );
  if (!attemptId) return { status: statusOf(lead, kind), http: 202 };
  try {
    const sent = await deps.sendEmail(payload, `teague-lead-${lead.id}-${kind}`);
    await deps.store.mark(kind, lead.id, attemptId, {
      status: "sent",
      ...(sent.id ? { providerId: sent.id } : {}),
    });
    return { status: "sent" as const, http: 200 };
  } catch (error) {
    const uncertain = !(error instanceof ProviderResponseError);
    const message = error instanceof Error ? error.message : "Email provider failed";
    await deps.store.mark(kind, lead.id, attemptId, {
      status: uncertain ? "unknown" : "failed",
      error:
        `${uncertain ? "Delivery outcome unknown; retry uses the same provider key" : "Provider rejected the message"}: ${message}`.slice(
          0,
          500,
        ),
    });
    return { status: uncertain ? ("unknown" as const) : ("failed" as const), http: 502 };
  }
}

export async function handleNotifyLead(request: Request, deps: NotificationDependencies) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 2048) return json({ error: "Request too large" }, 413);
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ error: "Invalid JSON body" }, 400);
  const scheduled = (body as { scheduled?: unknown })["scheduled"] === true;
  if (scheduled) {
    const expected = deps.schedulerKey;
    if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`)
      return json({ error: "Unauthorised scheduler request" }, 401);
  }
  const id = (body as { id?: unknown })["id"];
  const email = (body as { email?: unknown })["email"];
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id))
    return json({ error: "A lead id is required" }, 400);
  if (typeof email !== "string" || email.length < 3 || email.length > 255)
    return json({ error: "Lead not found" }, 404);

  // A signed-in owner may resend any enquiry from the pipeline, like the scheduler.
  const trusted = scheduled || (deps.isOwner ? await deps.isOwner(request) : false);
  const token = (body as { token?: unknown })["token"];
  if (!trusted && (typeof token !== "string" || token.length < 32 || token.length > 128))
    return json({ error: "Lead not found" }, 404);
  const lead = await deps.store.findLead(id, email.trim());
  if (!lead) return json({ error: "Lead not found" }, 404);
  if (!trusted) {
    // Only the visitor who inserted the enquiry holds the token whose hash was stored with it.
    if (!lead.notify_token_hash || lead.notify_token_hash !== (await sha256Hex(token as string)))
      return json({ error: "Lead not found" }, 404);
    const createdMs = Date.parse(lead.created_at);
    const nowMs = (deps.now?.() ?? new Date()).getTime();
    if (!Number.isFinite(createdMs) || nowMs - createdMs > FRESH_LEAD_MS)
      return json({ error: "Lead not found" }, 404);
  }
  const owner = await deliver("owner", lead, ownerPayload(lead, deps.ownerEmail, deps.from), deps);
  if (owner.http !== 200) return json({ ok: false, owner: owner.status }, owner.http);

  const viaAgent = (lead.message ?? "").startsWith("[Sent via AI assistant]");
  if (!deps.customerConfirmationEnabled || viaAgent) {
    await deps.store.skipCustomer(
      id,
      viaAgent ? "AI assistant enquiry: confirmation disabled" : "Verified sender not configured",
    );
    return json({ ok: true, owner: owner.status, customer: "skipped", confirmed: false });
  }
  const customer = await deliver(
    "customer",
    lead,
    customerPayload(lead, deps.ownerEmail, deps.from),
    deps,
  );
  return json(
    {
      ok: customer.http === 200,
      owner: owner.status,
      customer: customer.status,
      confirmed: customer.status === "sent",
    },
    customer.http,
  );
}
