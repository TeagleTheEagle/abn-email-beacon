-- Allow signed-in users to use the existing own-profile policies.
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Pin function resolution to prevent unsafe search-path lookup.
ALTER FUNCTION public.on_auth_user_created() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.on_auth_user_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Bring accounts created before the profile schema into the new profile structure.
INSERT INTO public.profiles (id, full_name, business_name, phone)
SELECT id, raw_user_meta_data->>'full_name', raw_user_meta_data->>'business_name', raw_user_meta_data->>'phone'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
