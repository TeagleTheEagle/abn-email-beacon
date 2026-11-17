import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const migrations = readdirSync("drizzle/migrations")
  .filter((name) => /^\d{4}_.*\.sql$/.test(name))
  .sort((a, b) => a.localeCompare(b));
assert.ok(migrations.length > 0, "Migration discovery must find the numbered SQL history");
const ownerId = "11111111-1111-4111-8111-111111111111";
const customerId = "22222222-2222-4222-8222-222222222222";
const leadId = "33333333-3333-4333-8333-333333333333";

async function database() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, raw_user_meta_data jsonb);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
  `);
  return db;
}
async function apply(db, names) {
  for (const name of names) {
    await db.exec(readFileSync(`drizzle/migrations/${name}`, "utf8"));
  }
}
async function asUser(db, id, sql, values = []) {
  await db.query("SET ROLE authenticated");
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id]);
  try {
    return await db.query(sql, values);
  } finally {
    await db.query("RESET ROLE");
    await db.query("RESET request.jwt.claim.sub");
  }
}
async function expectFailure(action, label) {
  await assert.rejects(action, undefined, label);
}

const fresh = await database();
await apply(fresh, migrations);
await fresh.query("INSERT INTO auth.users (id, raw_user_meta_data) VALUES ($1, '{}'), ($2, '{}')", [
  ownerId,
  customerId,
]);
await fresh.query("INSERT INTO public.owner_memberships (user_id) VALUES ($1)", [ownerId]);
const ownerMembershipComment = await fresh.query(
  "SELECT obj_description('public.owner_memberships'::regclass) AS comment",
);
assert.equal(
  ownerMembershipComment.rows[0].comment,
  "Accounts allowed to view and manage enquiries in the owner pipeline. Managed only by the site owner.",
  "Every discovered migration, including documentation-only follow-ups, is applied",
);
await fresh.query("RESET ROLE");
await fresh.query("SET ROLE anon");
await fresh.query(
  `INSERT INTO public.leads (id, name, business_name, email, source)
   VALUES ($1, 'Alex', 'Example Co', 'alex@example.com', 'Contact page')`,
  [leadId],
);
await fresh.query("RESET ROLE");

const ownerRows = await asUser(fresh, ownerId, "SELECT id FROM public.leads");
assert.equal(ownerRows.rows.length, 1, "Approved owner can read enquiries");
const customerRows = await asUser(fresh, customerId, "SELECT id FROM public.leads");
assert.equal(customerRows.rows.length, 0, "Ordinary customer receives no enquiries");
await asUser(
  fresh,
  ownerId,
  "UPDATE public.leads SET stage = 'Contacted', notes = 'Called' WHERE id = $1",
  [leadId],
);
await expectFailure(
  () =>
    asUser(
      fresh,
      ownerId,
      "UPDATE public.leads SET owner_notification_status = 'sent' WHERE id = $1",
      [leadId],
    ),
  "Owner cannot update delivery fields",
);
await expectFailure(
  () =>
    asUser(fresh, customerId, "INSERT INTO public.owner_memberships (user_id) VALUES ($1)", [
      customerId,
    ]),
  "Customer cannot grant owner membership",
);
const otherProfile = await asUser(
  fresh,
  customerId,
  "SELECT id FROM public.profiles WHERE id = $1",
  [ownerId],
);
assert.equal(otherProfile.rows.length, 0, "Customer cannot read another profile");
await expectFailure(async () => {
  await fresh.query("SET ROLE anon");
  await fresh.query("SELECT * FROM public.leads");
}, "Anonymous user cannot read enquiries").finally(async () => {
  await fresh.query("RESET ROLE");
});
await expectFailure(async () => {
  await fresh.query("SET ROLE anon");
  await fresh.query(
    `INSERT INTO public.leads (name, business_name, email, owner_notification_status)
       VALUES ('Eve', 'Invalid', 'eve@example.com', 'sent')`,
  );
}, "Public insert cannot set delivery state").finally(async () => {
  await fresh.query("RESET ROLE");
});

await fresh.query("SET ROLE service_role");
const firstClaim = await fresh.query(
  "SELECT public.claim_lead_owner_notification($1, $2, now() - interval '2 minutes', 5) AS claimed",
  [leadId, ownerId],
);
const competingClaim = await fresh.query(
  "SELECT public.claim_lead_owner_notification($1, $2, now() - interval '2 minutes', 5) AS claimed",
  [leadId, customerId],
);
assert.equal(firstClaim.rows[0].claimed, true);
assert.equal(competingClaim.rows[0].claimed, false, "Fresh claim blocks a competing attempt");
const staleClaim = await fresh.query(
  "SELECT public.claim_lead_owner_notification($1, $2, now() + interval '2 minutes', 5) AS claimed",
  [leadId, customerId],
);
assert.equal(staleClaim.rows[0].claimed, true, "Abandoned claim can be recovered");
const counter = await fresh.query("SELECT public.consume_rate_limit('test-key') AS hits");
assert.equal(counter.rows[0].hits, 1);
await fresh.query(
  `INSERT INTO public.leads (id, name, business_name, email)
   VALUES ('44444444-4444-4444-8444-444444444444', 'Legacy', 'Transition Lead', 'legacy@example.com')`,
);
await fresh.query(
  "UPDATE public.leads SET notified_at = now() WHERE id = '44444444-4444-4444-8444-444444444444'",
);
const transition = await fresh.query(
  "SELECT owner_notification_status, owner_notification_attempts FROM public.leads WHERE id = '44444444-4444-4444-8444-444444444444'",
);
assert.equal(transition.rows[0].owner_notification_status, "unknown");
assert.equal(transition.rows[0].owner_notification_attempts, 5);
await fresh.query("RESET ROLE");

const upgrade = await database();
await upgrade.query("INSERT INTO auth.users (id, raw_user_meta_data) VALUES ($1, $2)", [
  ownerId,
  { full_name: "Existing Owner" },
]);
await apply(upgrade, migrations.slice(0, 3));
await upgrade.query("ALTER TABLE public.leads ADD notified_at timestamptz");
await upgrade.query(
  `INSERT INTO public.leads (id, name, business_name, email, notified_at)
   VALUES ($1, 'Existing', 'Existing Lead', 'existing@example.com', '2026-11-01T00:00:00Z')`,
  [leadId],
);
await apply(upgrade, migrations.slice(3));
const upgraded = await upgrade.query(
  "SELECT notified_at, owner_notification_status, owner_notification_attempts, customer_confirmation_status FROM public.leads WHERE id = $1",
  [leadId],
);
assert.equal(upgraded.rows[0].owner_notification_status, "unknown");
assert.equal(upgraded.rows[0].owner_notification_attempts, 5);
assert.equal(upgraded.rows[0].customer_confirmation_status, "skipped");
assert.ok(upgraded.rows[0].notified_at, "Legacy timestamp is preserved");
const backfilled = await upgrade.query("SELECT full_name FROM public.profiles WHERE id = $1", [
  ownerId,
]);
assert.equal(backfilled.rows[0].full_name, "Existing Owner", "Existing account backfill survives");

console.log(
  "PASS: fresh migration history, additive upgrade, data retention, RLS/grants, claims and counter smoke checks",
);
console.log(
  "LIMIT: PGlite sequential calls are not proof of multi-connection production concurrency",
);
await fresh.close();
await upgrade.close();
