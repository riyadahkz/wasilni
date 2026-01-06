-- 1. Function to check if email or phone already exists in PUBLIC tables
-- This helps we detect conflicts BEFORE creating an Auth user, preventing "orphan" accounts.
CREATE OR REPLACE FUNCTION check_registration_conflict(check_email TEXT, check_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to search users table
AS $$
DECLARE
  email_conflict BOOLEAN;
  phone_conflict BOOLEAN;
BEGIN
  -- Check if email exists in public.users
  SELECT EXISTS (SELECT 1 FROM public.users WHERE email = check_email) INTO email_conflict;
  
  -- Check if phone exists in public.users
  SELECT EXISTS (SELECT 1 FROM public.users WHERE phone_number = check_phone) INTO phone_conflict;

  RETURN jsonb_build_object(
    'email_exists', email_conflict,
    'phone_exists', phone_conflict
  );
END;
$$;

-- Grant access to anonymous users so they can check before registering
GRANT EXECUTE ON FUNCTION check_registration_conflict TO anon, authenticated, service_role;

-- 2. Cleanup Script (Safe version)
-- Removes users from auth.users who do NOT have a record in public.users
-- This fixes the "User already exists" error for failed registrations.
-- WARNING: This deletes incomplete registrations.
DELETE FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.users);
