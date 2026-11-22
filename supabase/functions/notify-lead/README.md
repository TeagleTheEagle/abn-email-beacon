# Lead notification operations

## Local implementation

`handler.ts` tracks owner notifications and customer confirmations separately. Postgres claim functions in `drizzle/migrations/0004_lead_notification_delivery.sql` provide atomic leases and attempt ids.

- Maximum attempts per recipient: **5**.
- Abandoned processing lease: **2 minutes**.
- Resend request timeout: **10 seconds**.
- Every retry within 24 hours uses the same `teague-lead-<lead UUID>-<owner|customer>` Resend idempotency key.
- Resend's official documentation states that idempotency keys are retained for **24 hours**. An `unknown` outcome at or beyond that window returns HTTP 409 and requires provider reconciliation before another send.
- A provider rejection is `failed`; a timeout/network exception is `unknown` because acceptance is uncertain.
- `notified_at` is retained for compatibility and is now written only after owner acceptance.
- AI-assistant enquiries keep the existing behaviour: owner notification only, no customer confirmation.
- The visitor's form remains successful when notification fails because the enquiry is already saved.

## Production state

The following are **pending**, not configured or verified by the local change:

1. Inspect the deployed `leads` schema read-only and record whether `notified_at` or any delivery columns already exist.
2. Review and apply migration `0004_lead_notification_delivery.sql` through Lovable's migration workflow. Do not edit the original lead/profile migrations or generated snapshots by hand.
3. Deploy the `notify-lead` edge function after the migration.
4. Confirm `RESEND_API_KEY`, `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist as function secrets. Set `LEAD_NOTIFY_TO` to the approved owner mailbox.
5. Customer confirmations remain off until `LEAD_FROM` is a verified sender. Do not set it merely to make a test pass.
6. Use Resend provider logs/reconciliation to resolve `unknown` rows before manually exceeding the retry bound. A stable idempotency key makes normal retries safe, but cannot deduplicate against emails sent by the old function.

## Finding and retrying failures

The owner-only enquiry workflow should show `owner_notification_status`, `customer_confirmation_status`, attempts, errors and provider ids. Query through an authorised owner session or the Supabase dashboard; do not expose these fields publicly.

Retry a failed/unknown delivery by invoking `notify-lead` with the saved lead `id` and `email`. Unscheduled invocations only process enquiries created within the last **10 minutes**; older enquiries return HTTP 404 unless the call carries the scheduler credential (`scheduled: true` with `Authorization: Bearer <NOTIFY_SCHEDULER_KEY>`). An already successful owner send is not repeated when only customer confirmation is retried. Fresh `processing` rows return HTTP 202. Rows at five attempts return HTTP 409.

## Optional scheduler — prepared, not configured

Browser invocation is the initial attempt, not automatic recovery. Automatic recovery is **not operational** until this scheduler is configured and a successful run is observed.

1. Enable/review `pg_cron`, `pg_net` and Supabase Vault in the target environment.
2. Generate a random scheduler secret. Store the same value as the `NOTIFY_SCHEDULER_KEY` function secret and as a Vault secret named `notify-scheduler-key`. Do not print it or commit it.
3. The function accepts `scheduled: true` only with `Authorization: Bearer <NOTIFY_SCHEDULER_KEY>`. Wrong/missing credentials return 401. Ordinary browser submissions do not use scheduled mode.
4. Review the following query, replacing only `PROJECT_REF`. It uses Vault rather than embedding the secret in the cron definition and includes stale claims older than two minutes. Retry `unknown` rows only within Resend's 24-hour idempotency window.

```sql
WITH scheduler_secret AS (
  SELECT decrypted_secret
  FROM vault.decrypted_secrets
  WHERE name = 'notify-scheduler-key'
  LIMIT 1
), due AS (
  SELECT id, email
  FROM public.leads
  WHERE
    (
      owner_notification_status IN ('failed', 'unknown')
      AND owner_notification_attempts < 5
      AND (
        owner_notification_status <> 'unknown'
        OR owner_notification_attempted_at >= now() - interval '24 hours'
      )
    )
    OR (
      owner_notification_status = 'sent'
      AND customer_confirmation_status IN ('failed', 'unknown')
      AND customer_confirmation_attempts < 5
      AND (
        customer_confirmation_status <> 'unknown'
        OR customer_confirmation_attempted_at >= now() - interval '24 hours'
      )
    )
    OR (
      owner_notification_status = 'processing'
      AND owner_notification_attempted_at < now() - interval '2 minutes'
      AND owner_notification_attempts < 5
    )
    OR (
      owner_notification_status = 'sent'
      AND customer_confirmation_status = 'processing'
      AND customer_confirmation_attempted_at < now() - interval '2 minutes'
      AND customer_confirmation_attempts < 5
    )
  ORDER BY created_at
  LIMIT 50
)
SELECT net.http_post(
  url := 'https://PROJECT_REF.supabase.co/functions/v1/notify-lead',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || scheduler_secret.decrypted_secret
  ),
  body := jsonb_build_object('id', due.id, 'email', due.email, 'scheduled', true)
)
FROM due CROSS JOIN scheduler_secret;
```

5. Schedule the reviewed query with `cron.schedule('retry-lead-notifications', '*/5 * * * *', $$ ... $$)`.
6. Verify `cron.job_run_details` shows successful invocation, due rows advance to `sent`, and Resend's provider log shows the expected idempotent result. Test a missing/wrong scheduler credential separately; it must not send.

Do not mark the scheduler active based only on creating the cron row.

## Evidence limits

Vitest exercises the lifecycle with an in-memory store and mocked sender. It does not prove that Resend delivered email, that production matches the migrations, or that concurrent SQL claims work against PostgreSQL. Those require an isolated Supabase/PostgreSQL integration run and then authorised test-environment verification.
