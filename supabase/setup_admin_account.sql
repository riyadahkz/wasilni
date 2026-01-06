-- Enable automatic creation of Admin users when added via Supabase Dashboard

-- 1. Create a function to handle new user insertion
CREATE OR REPLACE FUNCTION public.handle_new_dashboard_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users with 'admin' role by default
  -- meaningful defaults for required fields
  INSERT INTO public.users (
    user_id, 
    email, 
    name, 
    user_type, 
    phone_number, 
    is_approved, 
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Admin User'),
    'admin', -- Force Admin role for dashboard-created users
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '07700000000'), -- Dummy phone if not provided
    true, -- Auto approve
    true  -- Auto active
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_dashboard_user();

-- 3. (Optional) If you already created a user and can't login, run this to fix them:
-- UPDATE public.users SET user_type = 'admin', is_approved = true WHERE email = 'YOUR_EMAIL@example.com';
