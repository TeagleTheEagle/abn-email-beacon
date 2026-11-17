-- Serialise only submissions for the same normalised email. Under PostgreSQL READ COMMITTED
-- (used by PostgREST), the count runs as a new statement after the lock is acquired, so it sees
-- rows committed by the previous lock holder. The transaction-scoped lock is always released by
-- commit or rollback; no capacity counter survives a failed insert.
CREATE OR REPLACE FUNCTION public.enforce_lead_submission_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email text;
  recent_submissions integer;
BEGIN
  normalized_email := pg_catalog.lower(pg_catalog.btrim(NEW.email));

  -- A hash collision can only serialise unrelated emails briefly; it cannot merge allowances.
  -- Each trigger takes at most one lock, giving a consistent single-lock ordering.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('lead_submission_rate:' || normalized_email, 0)
  );

  SELECT count(*) INTO recent_submissions
  FROM public.leads
  WHERE pg_catalog.lower(pg_catalog.btrim(email)) = normalized_email
    AND created_at >= now() - interval '1 hour';

  IF recent_submissions >= 3 THEN
    RAISE EXCEPTION 'Too many enquiries for this email. Please wait and try again.'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_lead_submission_rate() FROM PUBLIC, anon, authenticated;
