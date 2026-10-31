ALTER FUNCTION public.my_email() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_company_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_company_member(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.enforce_company_seats() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid) TO authenticated;