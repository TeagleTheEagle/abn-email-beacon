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
```

CI runs the equivalent Bun commands. Lint errors block release. Fast Refresh warnings in shared UI/helper exports are reviewed separately; do not blanket-suppress them.

Check `.output/public/` for private values without printing those values. Also confirm the generated route tree is current, the sitemap contains only intended public URLs, `/preview/*` stays noindex, and a nonexistent route returns 404.

## Controlled release sequence

1. **Backup first:** with authorised Supabase access, back up `leads`, `profiles`, owner/auth metadata and current function/application versions. Record row counts and verify how restoration will be tested. Do not assume a backup is usable without a restore procedure.
2. **Run isolated checks:** run the application checks above and `scripts/verify-migrations.mjs` in PGlite. For a disposable local dependency injection only, use `npm install --no-save --package-lock=false --ignore-scripts @electric-sql/pglite`, run the script, then restore the normal dependency tree with the same install flags. PGlite sequential calls do not prove multi-connection production concurrency.
3. **Test real staging:** apply the complete history to an isolated Supabase/PostgreSQL environment. Verify owner/customer RLS, public inserts, owner membership, concurrent claims and rate-counter increments. Review production schema read-only before upgrade.
4. **Apply migrations during low traffic:** the old enquiry forms continue using original columns. The old notification function remains compatible; a migration trigger converts its pre-send timestamp to terminal `unknown` so it cannot leave a pending retry loop. Do not deploy the new function before its schema exists.
5. **Create owner access:** create/identify Ben's authorised account, then insert only that UUID into `owner_memberships` through the service-role/migration workflow. Verify a non-owner receives no enquiries and an owner can update only workflow fields.
6. **Deploy the function:** configure `RESEND_API_KEY`, `LEAD_NOTIFY_TO`, optional verified `LEAD_FROM`, and `NOTIFY_SCHEDULER_KEY` without exposing them. Exercise authorised test enquiries and provider logs.
7. **Configure recovery:** store the same scheduler key in Vault as `notify-scheduler-key`, then create the cron query in `supabase/functions/notify-lead/README.md`. Observe `cron.job_run_details`, delivery rows and provider logs. Automatic recovery is not operational before this evidence exists.
8. **Deploy the application:** after schema/function checks pass, deploy through the approved Lovable process. Confirm private sentinels are absent from public assets and production mode/rate-limiter settings are active.
9. **Acceptance:** use authorised test accounts/enquiries/orders to verify owner and customer emails, auth, cart/checkout and downloads. Check mobile and assistive technology separately. Record exact evidence and timestamps.

## Recovery during release

- If migration validation fails, stop before application/function deployment and preserve existing data. Restore only through the approved backup/recovery procedure; do not improvise destructive down-migrations.
- If the new function fails, disable the scheduler with the reviewed `cron.unschedule('retry-lead-notifications')`, restore the prior function version and leave the additive schema in place. The transition trigger protects old-function writes.
- If the new application fails, restore the prior application version while retaining schema/data. Verify public enquiry inserts and old notification behaviour before reopening traffic.
- Reconcile `unknown` email outcomes against Resend logs. Idempotency is retained for 24 hours; older unknown outcomes require reconciliation before retry.

## Deployment dependencies

1. Inspect production schema read-only before applying migrations. Do not assume the repository gap equals production state.
2. Apply additive migrations `0004_lead_notification_delivery`, `0005_shared_abuse_controls`, and `0006_owner_enquiry_pipeline` through the Lovable migration workflow.
3. Deploy `notify-lead` after its migration. Configure function secrets through Lovable/Supabase, never in source.
4. Assign Ben's authorised account in `owner_memberships` using its actual UUID. This is intentionally not hard-coded.
5. Configure and observe the retry scheduler using `supabase/functions/notify-lead/README.md`. **Pending, not configured locally.**
6. Set hosting/WAF limits and Google AI billing caps at the provider. Code limits complement, not replace, those settings. **Pending external verification.**
7. Configure Google OAuth redirect URLs and test with authorised accounts. **Not verified live.**

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
