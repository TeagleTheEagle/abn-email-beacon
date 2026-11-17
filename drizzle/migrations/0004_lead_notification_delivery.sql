-- Repair the repository migration gap without assuming whether production already has this column.
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notified_at timestamptz;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS owner_notification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS owner_notification_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS owner_notification_attempted_at timestamptz,
  ADD COLUMN IF NOT EXISTS owner_notification_attempt_id uuid,
  ADD COLUMN IF NOT EXISTS owner_notification_error text,
  ADD COLUMN IF NOT EXISTS owner_notification_provider_id text,
  ADD COLUMN IF NOT EXISTS customer_confirmation_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS customer_confirmation_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customer_confirmation_attempted_at timestamptz,
  ADD COLUMN IF NOT EXISTS customer_confirmation_attempt_id uuid,
  ADD COLUMN IF NOT EXISTS customer_confirmation_error text,
  ADD COLUMN IF NOT EXISTS customer_confirmation_provider_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_owner_notification_status_check'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_owner_notification_status_check
      CHECK (owner_notification_status IN ('pending', 'processing', 'sent', 'failed', 'unknown', 'skipped'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_customer_confirmation_status_check'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_customer_confirmation_status_check
      CHECK (customer_confirmation_status IN ('pending', 'processing', 'sent', 'failed', 'unknown', 'skipped'));
  END IF;
END $$;

-- The old function wrote notified_at before sending. That is evidence of an attempt, not proof of
-- arrival. Preserve it as a terminal unknown state for manual review instead of risking duplicates.
UPDATE public.leads
SET
  owner_notification_status = 'unknown',
  owner_notification_attempts = 5,
  owner_notification_error = 'Legacy notified_at was written before sending; delivery outcome is unknown'
WHERE notified_at IS NOT NULL AND owner_notification_status = 'pending';

-- Do not send confirmations for historical enquiries when confirmation tracking is introduced.
UPDATE public.leads
SET
  customer_confirmation_status = 'skipped',
  customer_confirmation_error = 'Historical enquiry when confirmation tracking was introduced'
WHERE customer_confirmation_status = 'pending';

-- Public visitors may still submit the original enquiry fields, but cannot mark their own delivery
-- state as sent or otherwise suppress/trigger delivery. The service role retains full access.
REVOKE INSERT ON public.leads FROM anon, authenticated;
GRANT INSERT (
  id, name, business_name, email, phone, business_type, current_website, message, needs
) ON public.leads TO anon, authenticated;

CREATE INDEX IF NOT EXISTS leads_notification_review_idx
  ON public.leads (owner_notification_status, customer_confirmation_status, created_at DESC);

-- Claim functions run in one UPDATE statement. A fresh processing lease cannot be stolen; an
-- abandoned lease becomes claimable after the caller-supplied stale threshold. Attempt ids prevent
-- a slow previous worker from overwriting a newer attempt's result.
CREATE OR REPLACE FUNCTION public.claim_lead_owner_notification(
  p_lead_id uuid,
  p_attempt_id uuid,
  p_stale_before timestamptz,
  p_max_attempts integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.leads
  SET
    owner_notification_status = 'processing',
    owner_notification_attempts = owner_notification_attempts + 1,
    owner_notification_attempted_at = now(),
    owner_notification_attempt_id = p_attempt_id,
    owner_notification_error = NULL
  WHERE id = p_lead_id
    AND notified_at IS NULL
    AND owner_notification_attempts < p_max_attempts
    AND (
      owner_notification_status IN ('pending', 'failed', 'unknown')
      OR (
        owner_notification_status = 'processing'
        AND owner_notification_attempted_at <= p_stale_before
      )
    );
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_lead_customer_confirmation(
  p_lead_id uuid,
  p_attempt_id uuid,
  p_stale_before timestamptz,
  p_max_attempts integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.leads
  SET
    customer_confirmation_status = 'processing',
    customer_confirmation_attempts = customer_confirmation_attempts + 1,
    customer_confirmation_attempted_at = now(),
    customer_confirmation_attempt_id = p_attempt_id,
    customer_confirmation_error = NULL
  WHERE id = p_lead_id
    AND customer_confirmation_attempts < p_max_attempts
    AND (
      customer_confirmation_status IN ('pending', 'failed', 'unknown')
      OR (
        customer_confirmation_status = 'processing'
        AND customer_confirmation_attempted_at <= p_stale_before
      )
    );
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_lead_owner_notification(uuid, uuid, timestamptz, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_lead_customer_confirmation(uuid, uuid, timestamptz, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_lead_owner_notification(uuid, uuid, timestamptz, integer)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_lead_customer_confirmation(uuid, uuid, timestamptz, integer)
  TO service_role;

-- Transition compatibility: if the old edge function writes its pre-send timestamp after this
-- migration but before the new function is deployed, do not leave the new state stuck at pending.
CREATE OR REPLACE FUNCTION public.mark_legacy_notification_attempt()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.notified_at IS NOT NULL AND NEW.owner_notification_status = 'pending' THEN
    NEW.owner_notification_status = 'unknown';
    NEW.owner_notification_attempts = 5;
    NEW.owner_notification_error = 'Legacy function recorded a pre-send attempt; delivery outcome is unknown';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER mark_legacy_notification_attempt
  BEFORE UPDATE OF notified_at ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.mark_legacy_notification_attempt();
