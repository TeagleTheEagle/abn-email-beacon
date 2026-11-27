CREATE TABLE public.concept_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]{1,80}$'),
  viewed_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.concept_views TO anon, authenticated;
GRANT SELECT ON public.concept_views TO authenticated;
GRANT ALL ON public.concept_views TO service_role;
ALTER TABLE public.concept_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a concept view" ON public.concept_views FOR INSERT TO anon, authenticated WITH CHECK (slug ~ '^[a-z0-9-]{1,80}$');
CREATE POLICY "Owners read concept views" ON public.concept_views FOR SELECT TO authenticated USING (public.is_enquiry_owner());
CREATE INDEX concept_views_slug_idx ON public.concept_views (slug, viewed_at DESC);