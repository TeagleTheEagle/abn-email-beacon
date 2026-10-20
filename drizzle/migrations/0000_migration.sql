CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  business_name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_type text,
  needs text[] NOT NULL DEFAULT '{}',
  current_website text,
  message text
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (char_length(name) BETWEEN 1 AND 100 AND char_length(business_name) BETWEEN 1 AND 150 AND char_length(email) BETWEEN 3 AND 255 AND coalesce(char_length(message),0) <= 2000);