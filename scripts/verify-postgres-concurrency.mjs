import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import postgres from "postgres";

const DEFAULT_URL = "postgres://postgres:postgres@127.0.0.1:5432/postgres";
const baseUrl = new URL(process.env["TEST_DATABASE_URL"] ?? DEFAULT_URL);
if (!["127.0.0.1", "localhost", "::1"].includes(baseUrl.hostname))
  throw new Error("Refusing a non-loopback test database");
const databaseName = `teague_rate_${process.pid}_${Date.now()}`;
const connectionOptions = { max: 1, connect_timeout: 5, idle_timeout: 1 };
const raceRepeats = Number(process.env["RACE_REPEATS"] ?? 5);
assert.ok(Number.isInteger(raceRepeats) && raceRepeats >= 1 && raceRepeats <= 20);
const admin = postgres(baseUrl.href, connectionOptions);
const clients = new Set();
const createdDatabases = [];
let database;
let testUrl = new URL(baseUrl);
testUrl.pathname = `/${databaseName}`;
const migrations = readdirSync("drizzle/migrations")
  .filter((name) => /^\d{4}_.*\.sql$/.test(name))
  .sort();

function connect() {
  const client = postgres(testUrl.href, connectionOptions);
  clients.add(client);
  return client;
}
async function close(client) {
  clients.delete(client);
  await client.end({ timeout: 2 });
}
async function createDatabase(name, migrationNames = migrations) {
  await admin.unsafe(`CREATE DATABASE "${name}"`);
  createdDatabases.push(name);
  const url = new URL(baseUrl);
  url.pathname = `/${name}`;
  const client = postgres(url.href, connectionOptions);
  clients.add(client);
  await client.unsafe("SET client_min_messages = WARNING");
  await client.unsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
    END $$;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, raw_user_meta_data jsonb);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $function$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
    $function$;
  `);
  for (const migrationName of migrationNames)
    await client.unsafe(readFileSync(`drizzle/migrations/${migrationName}`, "utf8"));
  return { client, url };
}
async function setupDatabase() {
  const created = await createDatabase(databaseName);
  database = created.client;
  testUrl = created.url;
}
async function resetLeads() {
  await database`DELETE FROM public.leads`;
}
async function committedCount(email) {
  const rows = await database`
    SELECT count(*)::integer AS count FROM public.leads
    WHERE lower(btrim(email)) = lower(btrim(${email}))
  `;
  return rows[0]?.["count"];
}
async function seedLeads(email, count, createdAtExpression = "now()") {
  for (let index = 0; index < count; index += 1)
    await database.unsafe(
      `INSERT INTO public.leads (name, business_name, email, created_at)
       VALUES ('Seed', 'Existing', $1, ${createdAtExpression})`,
      [email],
    );
}
function barrier(count) {
  let ready = 0;
  let release;
  let timeout;
  const gate = new Promise((resolve, reject) => {
    release = resolve;
    timeout = setTimeout(() => reject(new Error("Synchronisation barrier timed out")), 5000);
  });
  return async () => {
    ready += 1;
    if (ready === count) {
      clearTimeout(timeout);
      release();
    }
    await gate;
  };
}
async function concurrentInserts(emailOrEmails, count = 8) {
  const emails = Array.isArray(emailOrEmails)
    ? emailOrEmails
    : Array.from({ length: count }, () => emailOrEmails);
  const workers = emails.map(() => connect());
  const arrive = barrier(emails.length);
  const started = performance.now();
  const outcomes = await Promise.all(
    workers.map(async (client, index) => {
      try {
        await client.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED");
        await client.unsafe("SET ROLE anon");
        await client.unsafe("SET LOCAL statement_timeout = '5s'; SET LOCAL lock_timeout = '5s'");
        await client`SELECT 1`;
        await arrive();
        await client`
        INSERT INTO public.leads (name, business_name, email)
        VALUES ('Race', ${`Verification ${index}`}, ${emails[index]})
      `;
        await client.unsafe("COMMIT");
        return { outcome: "committed", code: null };
      } catch (error) {
        await client.unsafe("ROLLBACK").catch(() => {});
        return { outcome: "rejected", code: error?.code ?? "unknown" };
      } finally {
        await close(client);
      }
    }),
  );
  const elapsedMs = Math.round(performance.now() - started);
  const committed = outcomes.filter((item) => item.outcome === "committed").length;
  const rejected = outcomes.length - committed;
  const codes = [...new Set(outcomes.map((item) => item.code).filter(Boolean))].sort();
  return { committed, rejected, codes, elapsedMs };
}
function logRace(label, initial, result) {
  console.log(
    JSON.stringify({
      scenario: label,
      isolation: "read committed",
      connections: result.committed + result.rejected,
      initial,
      committed: result.committed,
      rejected: result.rejected,
      errorCodes: result.codes,
      durationMs: result.elapsedMs,
      statementTimeoutMs: 5000,
      lockTimeoutMs: 5000,
      barrierTimeoutMs: 5000,
    }),
  );
}
async function verifyRace(label, email, initial, expectedCommitted, expectedTotal) {
  const result = await concurrentInserts(email);
  const rows = await committedCount(email);
  logRace(label, initial, result);
  console.log(`Committed matching rows: ${rows}`);
  assert.equal(result.committed, expectedCommitted, `${label}: committed submissions`);
  assert.equal(result.rejected, 8 - expectedCommitted, `${label}: rejected submissions`);
  assert.deepEqual(result.codes, ["P0001"], `${label}: rejection cause`);
  assert.equal(rows, expectedTotal, `${label}: committed rows`);
}
async function verifyWindow(
  label,
  createdAtExpression,
  seedCount,
  expectedTotal,
  expectedRejected,
) {
  await resetLeads();
  await database.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED");
  let transactionOpen = true;
  const email = "window@example.test";
  const rejectedCodes = [];
  let committed = 0;
  try {
    for (let index = 0; index < seedCount; index += 1)
      await database.unsafe(
        `INSERT INTO public.leads (name, business_name, email, created_at)
         VALUES ('Seed', 'Window', $1, ${createdAtExpression})`,
        [email],
      );
    for (let index = seedCount; index < 4; index += 1) {
      await database.unsafe("SAVEPOINT submission_attempt");
      try {
        await database`INSERT INTO public.leads (name, business_name, email)
          VALUES ('Boundary', 'Window', ${email})`;
        await database.unsafe("RELEASE SAVEPOINT submission_attempt");
        committed += 1;
      } catch (error) {
        rejectedCodes.push(error?.code ?? "unknown");
        await database.unsafe(
          "ROLLBACK TO SAVEPOINT submission_attempt; RELEASE SAVEPOINT submission_attempt",
        );
      }
    }
    await database.unsafe("COMMIT");
    transactionOpen = false;
  } finally {
    if (transactionOpen) await database.unsafe("ROLLBACK").catch(() => {});
  }
  const rows = await committedCount(email);
  console.log(JSON.stringify({ scenario: label, seedCount, committed, rejectedCodes, rows }));
  assert.equal(rows, expectedTotal);
  assert.equal(rejectedCodes.length, expectedRejected);
  if (expectedRejected) assert.deepEqual([...new Set(rejectedCodes)], ["P0001"]);
}
async function verifyMixedTransactions() {
  await resetLeads();
  const count = 6;
  const workers = Array.from({ length: count }, () => connect());
  const arrive = barrier(count);
  const started = performance.now();
  const outcomes = await Promise.all(
    workers.map(async (client, index) => {
      const shouldCommit = index % 2 === 0;
      try {
        await client.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED; SET ROLE anon");
        await client.unsafe("SET LOCAL statement_timeout = '5s'; SET LOCAL lock_timeout = '5s'");
        await client`SELECT 1`;
        await arrive();
        await client`INSERT INTO public.leads (name, business_name, email)
        VALUES ('Mixed', 'Transaction', 'mixed-transactions@example.test')`;
        await client.unsafe(shouldCommit ? "COMMIT" : "ROLLBACK");
        return { outcome: shouldCommit ? "committed" : "rolledBack", code: null };
      } catch (error) {
        await client.unsafe("ROLLBACK").catch(() => {});
        return { outcome: "rejected", code: error?.code ?? "unknown" };
      } finally {
        await close(client);
      }
    }),
  );
  const summary = {
    scenario: "mixed committing and rolling-back transactions",
    connections: count,
    committed: outcomes.filter((item) => item.outcome === "committed").length,
    rolledBack: outcomes.filter((item) => item.outcome === "rolledBack").length,
    rejected: outcomes.filter((item) => item.outcome === "rejected").length,
    errorCodes: [...new Set(outcomes.map((item) => item.code).filter(Boolean))].sort(),
    durationMs: Math.round(performance.now() - started),
  };
  console.log(JSON.stringify(summary));
  assert.equal(summary.committed, 3);
  assert.equal(summary.committed + summary.rolledBack + summary.rejected, count);
  assert.ok(summary.errorCodes.every((code) => code === "P0001"));
  assert.equal(await committedCount("mixed-transactions@example.test"), 3);
}
async function asRole(role, userId, sql, values = []) {
  await database.unsafe(`SET ROLE ${role}`);
  if (userId) await database`SELECT set_config('request.jwt.claim.sub', ${userId}, false)`;
  try {
    return await database.unsafe(sql, values);
  } finally {
    await database.unsafe("RESET ROLE; RESET request.jwt.claim.sub");
  }
}
async function verifyPermissionsAndClaims() {
  await resetLeads();
  const ownerId = "11111111-1111-4111-8111-111111111111";
  const customerId = "22222222-2222-4222-8222-222222222222";
  const leadId = "33333333-3333-4333-8333-333333333333";
  await database`
    INSERT INTO auth.users (id, raw_user_meta_data)
    VALUES (${ownerId}, '{"full_name":"Existing Owner"}'), (${customerId}, '{}')
  `;
  await database`INSERT INTO public.owner_memberships (user_id) VALUES (${ownerId})`;
  await asRole(
    "anon",
    null,
    "INSERT INTO public.leads (id, name, business_name, email, source) VALUES ($1, 'Valid', 'Public form', 'valid@example.test', 'Contact page')",
    [leadId],
  );
  await assert.rejects(asRole("anon", null, "SELECT * FROM public.leads"));
  const customerLeads = await asRole("authenticated", customerId, "SELECT id FROM public.leads");
  assert.equal(customerLeads.length, 0);
  const otherProfiles = await asRole(
    "authenticated",
    customerId,
    "SELECT id FROM public.profiles WHERE id = $1",
    [ownerId],
  );
  assert.equal(otherProfiles.length, 0);
  await assert.rejects(
    asRole(
      "authenticated",
      customerId,
      "INSERT INTO public.owner_memberships (user_id) VALUES ($1)",
      [customerId],
    ),
  );
  const ownerLeads = await asRole("authenticated", ownerId, "SELECT id FROM public.leads");
  assert.equal(ownerLeads.length, 1);
  await asRole(
    "authenticated",
    ownerId,
    "UPDATE public.leads SET stage = 'Contacted', notes = 'Reviewed' WHERE id = $1",
    [leadId],
  );
  await assert.rejects(
    asRole(
      "authenticated",
      ownerId,
      "UPDATE public.leads SET owner_notification_status = 'sent' WHERE id = $1",
      [leadId],
    ),
  );
  await assert.rejects(
    asRole(
      "anon",
      null,
      "INSERT INTO public.leads (name, business_name, email, owner_notification_status) VALUES ('Invalid', 'Protected', 'protected@example.test', 'sent')",
    ),
  );
  await assert.rejects(
    asRole(
      "anon",
      null,
      "INSERT INTO public.leads (name, business_name, email, created_at) VALUES ('Invalid', 'History bypass', 'history@example.test', now() - interval '2 hours')",
    ),
  );
  const privileges = await database`
    SELECT
      has_table_privilege('anon', 'public.leads', 'SELECT') AS anon_read,
      has_table_privilege('authenticated', 'public.leads', 'SELECT') AS customer_read_grant,
      has_function_privilege('anon', 'public.enforce_lead_submission_rate()', 'EXECUTE') AS anon_execute,
      has_function_privilege('authenticated', 'public.enforce_lead_submission_rate()', 'EXECUTE') AS customer_execute
  `;
  assert.equal(privileges[0]?.["anon_read"], false);
  assert.equal(privileges[0]?.["customer_read_grant"], true);
  assert.equal(privileges[0]?.["anon_execute"], false);
  assert.equal(privileges[0]?.["customer_execute"], false);
  const functionSecurity = await database`
    SELECT prosecdef, proconfig FROM pg_proc
    WHERE oid = 'public.enforce_lead_submission_rate()'::regprocedure
  `;
  assert.equal(functionSecurity[0]?.["prosecdef"], true);
  assert.ok(functionSecurity[0]?.["proconfig"].includes("search_path=public"));

  const count = 8;
  const workers = Array.from({ length: count }, () => connect());
  const arrive = barrier(count);
  const claims = await Promise.all(
    workers.map(async (client) => {
      try {
        await client.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED; SET ROLE service_role");
        await client.unsafe("SET LOCAL statement_timeout = '5s'; SET LOCAL lock_timeout = '5s'");
        await arrive();
        const rows = await client`
        SELECT public.claim_lead_owner_notification(
          ${leadId}, ${crypto.randomUUID()}, now() - interval '2 minutes', 5
        ) AS claimed
      `;
        await client.unsafe("COMMIT");
        return rows[0]?.["claimed"] === true;
      } finally {
        await close(client);
      }
    }),
  );
  assert.equal(claims.filter(Boolean).length, 1);
  const claimState = await database`
    SELECT owner_notification_status, owner_notification_attempts FROM public.leads WHERE id = ${leadId}
  `;
  assert.equal(claimState[0]?.["owner_notification_status"], "processing");
  assert.equal(claimState[0]?.["owner_notification_attempts"], 1);

  const counterWorkers = Array.from({ length: 40 }, () => connect());
  const counterBarrier = barrier(40);
  const counters = await Promise.all(
    counterWorkers.map(async (client) => {
      try {
        await client.unsafe("SET ROLE service_role");
        await counterBarrier();
        const rows = await client`SELECT public.consume_rate_limit('verification-key') AS hits`;
        return Number(rows[0]?.["hits"]);
      } finally {
        await close(client);
      }
    }),
  );
  counters.sort((a, b) => a - b);
  assert.deepEqual(
    counters,
    Array.from({ length: 40 }, (_, index) => index + 1),
  );
  assert.equal(counters.filter((hits) => hits <= 20).length, 20);
  console.log(
    "PASS: RLS, grants, protected fields, public forms, concurrent notification claims, and shared counters",
  );
}
async function verifyUpgrade() {
  const repair = migrations.find((name) => name.startsWith("0007_"));
  assert.ok(repair, "The additive repair migration must exist");
  const created = await createDatabase(
    `${databaseName}_upgrade`,
    migrations.filter((name) => name !== repair),
  );
  database = created.client;
  testUrl = created.url;
  const ownerId = "55555555-5555-4555-8555-555555555555";
  const customerId = "66666666-6666-4666-8666-666666666666";
  await database`
    INSERT INTO auth.users (id, raw_user_meta_data)
    VALUES (${ownerId}, '{"full_name":"Existing Owner"}'), (${customerId}, '{}')
  `;
  await database`INSERT INTO public.owner_memberships (user_id) VALUES (${ownerId})`;
  await seedLeads("upgrade@example.test", 2, "now() - interval '15 minutes'");
  const before = await database`
    SELECT id, owner_notification_status, customer_confirmation_status FROM public.leads ORDER BY id
  `;
  const profilesBefore =
    await database`SELECT full_name FROM public.profiles WHERE id = ${ownerId}`;
  await database.unsafe(readFileSync(`drizzle/migrations/${repair}`, "utf8"));
  const after = await database`
    SELECT id, owner_notification_status, customer_confirmation_status FROM public.leads ORDER BY id
  `;
  assert.deepEqual(after, before, "Existing leads and delivery state must survive unchanged");
  const profilesAfter = await database`SELECT full_name FROM public.profiles WHERE id = ${ownerId}`;
  assert.deepEqual(profilesAfter, profilesBefore, "Existing profiles must survive unchanged");
  const definition = await database`
    SELECT pg_get_functiondef('public.enforce_lead_submission_rate()'::regprocedure) AS definition
  `;
  assert.ok(definition[0]?.["definition"].includes("pg_catalog.pg_advisory_xact_lock"));
  await assert.rejects(asRole("anon", null, "SELECT * FROM public.leads"));
  const customerRows = await asRole("authenticated", customerId, "SELECT id FROM public.leads");
  assert.equal(customerRows.length, 0);
  await assert.rejects(
    asRole(
      "authenticated",
      customerId,
      "INSERT INTO public.owner_memberships (user_id) VALUES ($1)",
      [customerId],
    ),
  );
  const ownerRows = await asRole("authenticated", ownerId, "SELECT id FROM public.leads");
  assert.equal(ownerRows.length, 2);
  await verifyRace("upgrade with existing in-window leads", "upgrade@example.test", 2, 1, 3);
  console.log("PASS: previous-schema upgrade preserves data and installs concurrency protection");
}

try {
  await setupDatabase();
  const version = await database`SHOW server_version`;
  const isolation = await database`SHOW transaction_isolation`;
  console.log(
    `PostgreSQL ${version[0]?.["server_version"]}; default isolation ${isolation[0]?.["transaction_isolation"]}`,
  );
  for (let run = 1; run <= raceRepeats; run += 1) {
    await resetLeads();
    const email = "race@example.test";
    await verifyRace(`empty allowance ${run}/${raceRepeats}`, email, 0, 3, 3);
  }

  await resetLeads();
  await seedLeads("partial@example.test", 2, "now() - interval '30 minutes'");
  await verifyRace("partially used allowance", "partial@example.test", 2, 1, 3);

  await resetLeads();
  await seedLeads("exhausted@example.test", 3);
  await verifyRace("exhausted allowance", "exhausted@example.test", 3, 0, 3);

  await resetLeads();
  const independentEmails = [
    "one@example.test",
    "two@example.test",
    "three@example.test",
    "four@example.test",
  ];
  const independentWork = independentEmails.flatMap((email) =>
    Array.from({ length: 4 }, () => email),
  );
  const independent = await concurrentInserts(independentWork);
  logRace("independent email allowances", 0, independent);
  assert.equal(independent.committed, 12);
  assert.equal(independent.rejected, 4);
  assert.deepEqual(independent.codes, ["P0001"]);
  for (const email of independentEmails) assert.equal(await committedCount(email), 3);

  await resetLeads();
  const holder = connect();
  const unrelated = connect();
  let holderOpen = true;
  let unrelatedOpen = true;
  try {
    await holder.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED; SET ROLE anon");
    await holder`INSERT INTO public.leads (name, business_name, email)
      VALUES ('Held', 'Transaction', 'held@example.test')`;
    await unrelated.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED; SET ROLE anon");
    await unrelated.unsafe("SET LOCAL statement_timeout = '2s'; SET LOCAL lock_timeout = '2s'");
    await unrelated`INSERT INTO public.leads (name, business_name, email)
      VALUES ('Independent', 'Transaction', 'independent@example.test')`;
    await unrelated.unsafe("COMMIT");
    unrelatedOpen = false;
    assert.equal(await committedCount("independent@example.test"), 1);
    await holder.unsafe("ROLLBACK");
    holderOpen = false;
    assert.equal(await committedCount("held@example.test"), 0);
  } finally {
    if (holderOpen) await holder.unsafe("ROLLBACK").catch(() => {});
    if (unrelatedOpen) await unrelated.unsafe("ROLLBACK").catch(() => {});
    await close(holder);
    await close(unrelated);
  }
  console.log(
    "PASS: independent emails retain allowances and do not wait for an unrelated held transaction",
  );

  await resetLeads();
  const lockHolder = connect();
  const timedOut = connect();
  let lockHolderOpen = true;
  let timedOutOpen = true;
  let timeoutCode;
  try {
    await lockHolder.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED; SET ROLE anon");
    await lockHolder`INSERT INTO public.leads (name, business_name, email)
      VALUES ('Held', 'Lock', 'timeout@example.test')`;
    await timedOut.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED; SET ROLE anon");
    await timedOut.unsafe("SET LOCAL statement_timeout = '2s'; SET LOCAL lock_timeout = '100ms'");
    try {
      await timedOut`INSERT INTO public.leads (name, business_name, email)
        VALUES ('Waiter', 'Lock', 'timeout@example.test')`;
      await timedOut.unsafe("COMMIT");
      timedOutOpen = false;
    } catch (error) {
      timeoutCode = error?.code;
      await timedOut.unsafe("ROLLBACK");
      timedOutOpen = false;
    }
    await lockHolder.unsafe("ROLLBACK");
    lockHolderOpen = false;
  } finally {
    if (lockHolderOpen) await lockHolder.unsafe("ROLLBACK").catch(() => {});
    if (timedOutOpen) await timedOut.unsafe("ROLLBACK").catch(() => {});
    await close(lockHolder);
    await close(timedOut);
  }
  assert.equal(timeoutCode, "55P03", "The bounded waiter must fail with lock_not_available");
  assert.equal(await committedCount("timeout@example.test"), 0);
  console.log("PASS: lock timeout completes predictably without consuming capacity");

  await resetLeads();
  await seedLeads("Mixed@Example.test", 2);
  const variants = [
    "mixed@example.test",
    " MIXED@EXAMPLE.TEST ",
    "Mixed@Example.test",
    "mixed@example.test ",
    " MIXED@example.test",
    "mixed@EXAMPLE.TEST",
    " Mixed@example.test",
    "MIXED@EXAMPLE.TEST",
  ];
  const normalised = await concurrentInserts(variants);
  logRace("case and surrounding-whitespace normalisation", 2, normalised);
  assert.equal(normalised.committed, 1);
  assert.equal(normalised.rejected, 7);
  assert.deepEqual(normalised.codes, ["P0001"]);
  assert.equal(await committedCount("mixed@example.test"), 3);

  await verifyWindow("exact rolling-hour boundary", "now() - interval '1 hour'", 2, 3, 1);
  await verifyWindow(
    "just inside rolling hour",
    "now() - interval '59 minutes 59.999999 seconds'",
    3,
    3,
    1,
  );
  await verifyWindow(
    "just outside rolling hour releases capacity",
    "now() - interval '1 hour 1 microsecond'",
    3,
    4,
    0,
  );

  await resetLeads();
  const rollback = connect();
  let rollbackOpen = true;
  try {
    await rollback.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED; SET ROLE anon");
    await rollback`INSERT INTO public.leads (name, business_name, email)
      VALUES ('Rollback', 'Transaction', 'rollback@example.test')`;
    await rollback.unsafe("ROLLBACK");
    rollbackOpen = false;
  } finally {
    if (rollbackOpen) await rollback.unsafe("ROLLBACK").catch(() => {});
    await close(rollback);
  }
  assert.equal(await committedCount("rollback@example.test"), 0);

  const invalid = connect();
  let validationCode;
  try {
    await invalid.unsafe("BEGIN ISOLATION LEVEL READ COMMITTED; SET ROLE anon");
    await invalid`INSERT INTO public.leads (name, business_name, email)
      VALUES ('', 'Invalid', 'invalid@example.test')`;
    await invalid.unsafe("COMMIT");
  } catch (error) {
    validationCode = error?.code;
    await invalid.unsafe("ROLLBACK").catch(() => {});
  } finally {
    await close(invalid);
  }
  assert.ok(
    validationCode && validationCode !== "P0001",
    "Validation failure must be unrelated to rate limiting",
  );
  assert.equal(await committedCount("invalid@example.test"), 0);
  await verifyRace(
    "capacity after rollback and failed validation",
    "rollback@example.test",
    0,
    3,
    3,
  );
  await verifyMixedTransactions();
  console.log("PASS: rolling windows, rollback, failed validation, and mixed transaction outcomes");
  await verifyPermissionsAndClaims();
  await verifyUpgrade();
  console.log("PASS: complete real-PostgreSQL concurrency and migration regression suite");
} finally {
  await Promise.allSettled([...clients].map((client) => client.end({ timeout: 2 })));
  for (const name of createdDatabases) await admin.unsafe(`DROP DATABASE IF EXISTS "${name}"`);
  await admin.end();
}
