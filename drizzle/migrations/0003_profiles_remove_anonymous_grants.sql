-- Profiles are private account data; anonymous clients have no table privileges.
REVOKE ALL ON public.profiles FROM anon;
