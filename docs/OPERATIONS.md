# Operational checklist

## Local setup

1. Use the committed `bun.lock` and Bun 1.3+ in CI/Lovable. Do not remove dependency overrides while they still patch known vulnerabilities.
2. Copy required environment names from the deployment configuration, never into Git. Public browser values use `VITE_`; `SUPABASE_SERVICE_ROLE_KEY`, Resend and Google AI keys must remain server-side.
3. Install with `bun install --frozen-lockfile` in CI. Locally, use `npx --yes bun install` if Bun is not installed globally.
4. Start with `npx --yes bun run dev`. Do not submit real forms while testing.

## Release checks

Run the complete commands and retain their exit codes/output:

```sh
npx --yes bun x tsc --noEmit
npx --yes bun run test
npx --yes bun run lint
npx --yes bun run build
npx --yes bun audit
npx --yes bun run test:postgres
```

`test:postgres` requires a disposable PostgreSQL database at the loopback-only
`TEST_DATABASE_URL` (default `postgres://postgres:postgres@127.0.0.1:5432/postgres`). It creates
uniquely named fresh and upgrade databases and drops only those databases on completion. CI provides
a PostgreSQL 16 service. Set `RACE_REPEATS` to change the core race repetitions (default 5, maximum
20). The harness uses independent connections, a synchronisation barrier, anonymous/authenticated/
service-role fixtures, `READ COMMITTED` transactions, and 5-second connection/barrier/statement/lock
timeouts.

CI runs the equivalent Bun commands. Lint errors block release. Fast Refresh warnings in shared UI/helper exports are reviewed separately; do not blanket-suppress them.

Check `.output/public/` for private values without printing those values. Also confirm the generated route tree is current, the sitemap contains only intended public URLs, `/preview/*` stays noindex, and a nonexistent route returns 404.

## Controlled release sequence

1. **Backup first:** with authorised Supabase access, back up `leads`, `profiles`, owner/auth metadata and current function/application versions. Record row counts and verify how restoration will be tested. Do not assume a backup is usable without a restore procedure.
2. **Run isolated checks:** run the application checks above, `scripts/verify-migrations.mjs` in PGlite, and `npx --yes bun run test:postgres` against disposable real PostgreSQL. For a disposable local PGlite dependency injection only, use `npm install --no-save --package-lock=false --ignore-scripts @electric-sql/pglite`, run the script, then restore the frozen dependency tree. PGlite sequential calls do not prove multi-connection production concurrency; the PostgreSQL command is a required release gate.
3. **Test real staging:** apply the complete history through `0007_serialize_lead_submission_rate.sql` to an isolated Supabase/PostgreSQL environment. Verify owner/customer RLS, public inserts, owner membership, concurrent claims and rate-counter increments, plus the complete concurrent enquiry matrix. Review production schema read-only before upgrade.
4. **Apply migrations during low traffic:** apply reviewed migrations `0004`–`0007` in order, with `0005` and `0007` never exposed as separate live enforcement states. Use a migration runner that supports a single transaction for the sequence, or stop until a controlled atomic workflow is available; do not open a window where the faulty `0005` trigger handles traffic alone. The old enquiry forms continue using original columns. The old notification function remains compatible; a migration trigger converts its pre-send timestamp to terminal `unknown` so it cannot leave a pending retry loop. Do not deploy the new function before its schema exists. Verify the actual Lovable runner's transaction boundaries before production writes rather than assuming migrations are grouped.
5. **Create owner access:** create/identify Ben's authorised account, then insert only that UUID into `owner_memberships` through the service-role/migration workflow. Verify a non-owner receives no enquiries and an owner can update only workflow fields.
6. **Deploy the function:** configure `RESEND_API_KEY`, `LEAD_NOTIFY_TO`, optional verified `LEAD_FROM`, and `NOTIFY_SCHEDULER_KEY` without exposing them. Exercise authorised test enquiries and provider logs.
7. **Configure recovery:** store the same scheduler key in Vault as `notify-scheduler-key`, then create the cron query in `supabase/functions/notify-lead/README.md`. Observe `cron.job_run_details`, delivery rows and provider logs. Automatic recovery is not operational before this evidence exists.
8. **Deploy the application:** after schema/function checks pass, deploy through the approved Lovable process. Confirm private sentinels are absent from public assets and production mode/rate-limiter settings are active.
9. **Acceptance:** use authorised test accounts/enquiries/orders to verify owner and customer emails, auth, cart/checkout and downloads. Check mobile and assistive technology separately. Record exact evidence and timestamps.

## Concurrent enquiry rate-limit repair (`0007`)

The original `0005` trigger counted matching leads without serialising concurrent inserts. Independent
transactions could therefore count the same committed rows and all pass. In the first real-PostgreSQL
reproduction, 7 of 8 simultaneous anonymous-role submissions committed; the prior ad-hoc reproduction
also failed twice. `0005` remains unchanged as published history.

`0007_serialize_lead_submission_rate.sql` replaces only `public.enforce_lead_submission_rate()`:

- It takes one transaction-scoped advisory lock keyed by `lower(btrim(email))` plus a dedicated
  namespace string. All application instances and connections use the same database lock.
- Under PostgREST's `READ COMMITTED` isolation, the subsequent count is a new statement snapshot and
  sees rows committed by the previous lock holder. This is why the lock is sufficient here; a lock
  without the new-snapshot behaviour would not be enough.
- The rolling rule remains `created_at >= now() - interval '1 hour'`; the exact boundary is included.
  Case and surrounding-whitespace variants share an allowance. Dots, plus suffixes, and other
  provider-specific aliases are not altered.
- Commit and rollback release the lock. Rejected, invalid, and rolled-back inserts add no lead and
  consume no capacity. There is no counter row to expire or reconcile.
- Unrelated emails use different keys and remain concurrent; a hash collision can briefly serialise
  two emails but never merges allowances. Each trigger takes at most one lock, avoiding multi-lock
  ordering deadlocks. Lock/statement timeout errors fail the insert without consuming capacity.
- Existing in-window leads are counted directly, so upgrade requires no counter backfill. Public
  column grants still exclude `created_at` and delivery fields, preventing caller-controlled history
  or delivery-state bypass. The function remains `SECURITY DEFINER` with `search_path=public` and no
  execute grant to public/anon/authenticated. The existing shared API counters are unchanged.

Run the real regression suite with `npx --yes bun run test:postgres`. On 17 November 2026, PostgreSQL
18.6 with eight independent connections per core race passed five consecutive runs: exactly **3
committed / 5 rejected with SQLSTATE P0001** each time. Two existing leads plus eight concurrent
requests produced **1 committed / 7 rejected**; an exhausted allowance produced **0 / 8**. Four
independent emails produced three committed leads each. The suite also passed normalisation, exact/
inside/outside window boundaries, validation failure, rollback, mixed outcomes, non-blocking unrelated
emails, fresh/upgrade preservation, RLS/grants, eight-way notification claims, and forty-way shared
counter increments. A held-lock waiter also failed predictably with SQLSTATE `55P03`, and public
caller-supplied historical timestamps remained forbidden. No sleeps or sequential PGlite substitutions
are used.

Residual limits: the test uses plain PostgreSQL with minimal Supabase-compatible roles/auth fixtures,
not a hosted Supabase environment, and does not establish production schema parity. The proof targets
`READ COMMITTED`, the PostgREST transaction default; using stricter transaction snapshots for lead
inserts requires separate verification. The count query has no new expression index, so large-lead
performance must still be observed during staging. CI is configured for PostgreSQL 16, and the same
suite also passed locally against PostgreSQL 16.15.

## Recovery during release

- If migration validation fails, stop before application/function deployment and preserve existing data. Restore only through the approved backup/recovery procedure; do not improvise destructive down-migrations.
- If the new function fails, disable the scheduler with the reviewed `cron.unschedule('retry-lead-notifications')`, restore the prior function version and leave the additive schema in place. The transition trigger protects old-function writes.
- If the new application fails, restore the prior application version while retaining schema/data. Verify public enquiry inserts and old notification behaviour before reopening traffic.
- Reconcile `unknown` email outcomes against Resend logs. Idempotency is retained for 24 hours; older unknown outcomes require reconciliation before retry.

## Deployment dependencies

1. Inspect production schema read-only before applying migrations. Do not assume the repository gap equals production state.
2. Apply additive migrations `0004_lead_notification_delivery`, `0005_shared_abuse_controls`, `0006_owner_enquiry_pipeline`, and `0007_serialize_lead_submission_rate` through the Lovable migration workflow, observing the atomic `0005`+`0007` release requirement above.
3. Deploy `notify-lead` after its migration. Configure function secrets through Lovable/Supabase, never in source.
4. Assign Ben's authorised account in `owner_memberships` using its actual UUID. This is intentionally not hard-coded.
5. Configure and observe the retry scheduler using `supabase/functions/notify-lead/README.md`. **Pending, not configured locally.**
6. Set hosting/WAF limits and Google AI billing caps at the provider. Code limits complement, not replace, those settings. **Pending external verification.**
7. Configure Google OAuth redirect URLs and test with authorised accounts. **Not verified live.**

Production access remains a separate rollout blocker. Use secure authenticated tooling to inspect the
live database project, migration history/schema drift, backup and recovery availability, intended owner
authentication account, deployed notification-function version, retry backlog/scheduler, and Lovable
publication state. Do not request or paste credentials into chat. None of these live checks is replaced
by the isolated concurrency proof.

## Product fulfilment

The public catalogue read-only check on 17 November 2026 returned nine products with delivery metadata aligned to the audit's 48-hour service and digital products' instant-download labels. This is not attachment evidence.

For every product advertised as an instant download:

1. In Shopify → Apps → Digital Products, open the product and record the attached filename, file size/version and intended public handle.
2. Compare it with the approved local file. The renamed tracker should use `Enquiry-Quote-Tracker.zip` and its contents should use the new name.
3. Confirm the audit has no misleading digital attachment or instant-delivery label.
4. With explicit authorisation, use a controlled test product/order and test customer. Do not charge a real customer.
5. Complete checkout, verify the delivery email and actual downloaded file, and check that analytics records one purchase at most.
6. Record the result and date. A product page, metadata field, local ZIP or checkout response alone is not delivery proof.

## Notification recovery

- A saved enquiry is not invalid when email fails.
- Open `/enquiries` with the authorised owner account.
- Filter/review `failed` and `unknown` owner/customer states, attempt counts and errors.
- Retry through the owner control or scheduler. A successful owner send is not repeated when only the customer confirmation retries.
- Treat `unknown` as uncertain provider acceptance. Use Resend logs and the stable idempotency key for reconciliation; do not blindly force a send.
- Fresh processing claims return 202; five attempts return 409. Legacy pre-send timestamps are marked terminal unknown for review rather than assumed successful.

## Incident recovery

- If notifications fail after release, keep enquiry inserts enabled and roll back the edge function deployment while retaining the schema/data.
- If cart mutations misbehave, do not show success from local state. Preserve confirmed cart data and disable checkout until Shopify confirms a cart/checkout URL.
- Never drop leads, profiles, orders or migration history as a recovery shortcut.
- Keep a log of checks and external actions with secrets and customer personal information redacted.
