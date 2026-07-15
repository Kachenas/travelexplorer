-- ============================================================
-- Add contact_number to profiles + admin RPC for profile+email
-- ============================================================

-- 1. Add contact_number column
ALTER TABLE public.profiles ADD COLUMN contact_number text;

-- 2. SECURITY DEFINER function to fetch profile + email (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_profile_with_email(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  SELECT json_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'nationality', p.nationality,
    'user_type', p.user_type,
    'is_suspended', p.is_suspended,
    'contact_number', p.contact_number,
    'identification', p.identification,
    'business_permit', p.business_permit,
    'document', p.document,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'email', u.email
  )
  INTO result
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = target_user_id;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_profile_with_email(uuid) TO authenticated;
