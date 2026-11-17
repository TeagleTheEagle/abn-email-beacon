ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'Website',
  ADD COLUMN IF NOT EXISTS assigned_owner_id uuid,
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'Received',
  ADD COLUMN IF NOT EXISTS next_follow_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_assigned_owner_fkey') THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_assigned_owner_fkey
      FOREIGN KEY (assigned_owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_stage_check') THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_stage_check
      CHECK (stage IN ('Received', 'Contacted', 'Preview sent', 'Approved', 'Paid', 'Launched'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_source_check') THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_source_check CHECK (source IN (
      'Homepage quick form', 'Contact page', 'Call request', 'Estimate calculator',
      'Preview configurator', 'Showroom', 'JARVIS assistant', 'Public MCP', 'Website'
    ));
  END IF;
END $$;

ALTER TABLE public.leads ADD CONSTRAINT leads_notes_length_check
  CHECK (notes IS NULL OR char_length(notes) <= 5000);
GRANT INSERT (source) ON public.leads TO anon, authenticated;
CREATE INDEX IF NOT EXISTS leads_owner_follow_up_idx
  ON public.leads (stage, next_follow_up_at) WHERE stage <> 'Launched';

-- Owner membership is managed only through the service role/migration workflow. No customer can
-- grant themselves ownership. A signed-in user may read only whether their own account is a member.
CREATE TABLE IF NOT EXISTS public.owner_memberships (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_memberships ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.owner_memberships FROM anon, authenticated;
GRANT SELECT ON TABLE public.owner_memberships TO authenticated;
GRANT ALL ON TABLE public.owner_memberships TO service_role;
CREATE POLICY "read_own_owner_membership" ON public.owner_memberships
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.is_enquiry_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.owner_memberships WHERE user_id = (SELECT auth.uid())
  );
$$;
REVOKE ALL ON FUNCTION public.is_enquiry_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_enquiry_owner() TO authenticated;

-- The table grant makes the policy usable; RLS still returns rows only to approved owners.
GRANT SELECT ON public.leads TO authenticated;
CREATE POLICY "owner_read_enquiries" ON public.leads
  FOR SELECT TO authenticated USING (public.is_enquiry_owner());
CREATE POLICY "owner_update_enquiry_workflow" ON public.leads
  FOR UPDATE TO authenticated
  USING (public.is_enquiry_owner()) WITH CHECK (public.is_enquiry_owner());
REVOKE UPDATE ON public.leads FROM authenticated;
GRANT UPDATE (stage, assigned_owner_id, next_follow_up_at, notes)
  ON public.leads TO authenticated;

CREATE OR REPLACE FUNCTION public.set_lead_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER set_lead_updated_at
  BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_lead_updated_at();
