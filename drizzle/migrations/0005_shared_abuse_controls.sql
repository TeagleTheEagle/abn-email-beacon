-- Shared fixed-window counters for the public AI endpoint. Keys contain only a one-way hash and
-- time bucket, never a raw IP address. Old rows are removed on each call to bound table growth.
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.api_rate_limits FROM anon, authenticated;
GRANT ALL ON TABLE public.api_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(p_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_hits integer;
BEGIN
  DELETE FROM public.api_rate_limits WHERE updated_at < now() - interval '1 day';
  INSERT INTO public.api_rate_limits (key, hits)
  VALUES (p_key, 1)
  ON CONFLICT (key) DO UPDATE
    SET hits = public.api_rate_limits.hits + 1,
        updated_at = now()
  RETURNING hits INTO current_hits;
  RETURN current_hits;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text) TO service_role;

-- Direct public lead inserts (browser forms and the public MCP tool) share a server-side limit.
-- The browser honeypot remains useful, but this trigger does not depend on JavaScript or headers.
CREATE OR REPLACE FUNCTION public.enforce_lead_submission_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_submissions integer;
BEGIN
  SELECT count(*) INTO recent_submissions
  FROM public.leads
  WHERE lower(email) = lower(NEW.email)
    AND created_at >= now() - interval '1 hour';

  IF recent_submissions >= 3 THEN
    RAISE EXCEPTION 'Too many enquiries for this email. Please wait and try again.'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_lead_submission_rate() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER enforce_lead_submission_rate
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.enforce_lead_submission_rate();
