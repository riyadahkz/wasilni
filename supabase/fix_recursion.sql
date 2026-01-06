-- Fix Infinite Recursion by using a SECURITY DEFINER function

-- 1. Create a helper function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This runs with the privileges of the creator (postgres), bypassing RLS
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE user_id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Users Table Policy to avoid self-referencing recursion
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    is_admin()
  );

-- 3. Update other tables for consistency (optional but good for performance)
DROP POLICY IF EXISTS "Admins can manage drivers" ON drivers;
CREATE POLICY "Admins can manage drivers" ON drivers
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
CREATE POLICY "Admins can manage companies" ON companies
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage all requests" ON requests;
CREATE POLICY "Admins can manage all requests" ON requests
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage trips" ON trips;
CREATE POLICY "Admins can manage trips" ON trips
  FOR ALL USING (
    is_admin()
  );
