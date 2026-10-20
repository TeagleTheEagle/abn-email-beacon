// Emails the owner when a new enquiry (lead) arrives, and sends the enquirer a short confirmation.
// Called by the site's forms right after they insert the lead. It only emails for a lead that really
// exists in the database (looked up with the service role), so it can't be used to send arbitrary mail.
//
// Secrets (Lovable Cloud → Secrets):
//   RESEND_API_KEY   required — from resend.com
//   LEAD_NOTIFY_TO   optional — where owner alerts go (default: the site email)
//   LEAD_FROM        optional — a verified sender like "Teague Industries <hello@teagueindustries.com.au>".
//                    Until a domain is verified in Resend, alerts go out from onboarding@resend.dev
//                    (which can only reach the Resend account's own email) and no auto-reply is sent.
import { createClient } from "npm:@supabase/supabase-js@2";

const DEFAULT_TO = "benteaguey6@gmail.com";
const FALLBACK_FROM = "Teague Industries <onboarding@resend.dev>";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function sendEmail(apiKey: string, payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return json({ error: "RESEND_API_KEY is not set" }, 500);

  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "A lead id is required" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: lead, error } = await db
    .from("leads")
    .select("id, created_at, name, business_name, email, phone, business_type, needs, current_website, message")
    .eq("id", id)
    .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!lead) return json({ error: "Lead not found" }, 404);

  const to = Deno.env.get("LEAD_NOTIFY_TO") || DEFAULT_TO;
  const from = Deno.env.get("LEAD_FROM") || FALLBACK_FROM;
  const rows: Array<[string, string | null | undefined]> = [
    ["Name", lead.name],
    ["Business", lead.business_name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Business type", lead.business_type],
    ["Needs", (lead.needs ?? []).join(", ")],
    ["Current website", lead.current_website],
    ["Message", lead.message],
    ["Received", new Date(lead.created_at).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })],
  ];
  const filled = rows.filter(([, v]) => v && String(v).trim());
  const text = filled.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<p>New enquiry from <strong>${esc(lead.business_name)}</strong>. Reply to this email to answer them.</p>
<table style="border-collapse:collapse">${filled
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${esc(k)}</td><td style="padding:4px 0">${esc(String(v))}</td></tr>`)
    .join("")}</table>`;

  await sendEmail(apiKey, {
    from,
    to: [to],
    reply_to: lead.email,
    subject: `New enquiry: ${lead.business_name} (${lead.name})`,
    text,
    html,
  });

  // Only send the confirmation from a verified sender; onboarding@resend.dev can't reach customers.
  let confirmed = false;
  if (Deno.env.get("LEAD_FROM")) {
    const first = lead.name.trim().split(/\s+/)[0] || "there";
    await sendEmail(apiKey, {
      from,
      to: [lead.email],
      reply_to: to,
      subject: "Thanks — we've got your enquiry",
      text: `Hi ${first},\n\nThanks for getting in touch about ${lead.business_name}. I've got your details and will reply within 1–2 business days, usually sooner.\n\nIf you'd like to add anything in the meantime, just reply to this email.\n\nBen\nTeague Industries\nwww.teagueindustries.com.au`,
    });
    confirmed = true;
  }

  return json({ ok: true, confirmed });
});
