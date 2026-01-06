-- Ensure Admin policies exist and are correct for all key tables

-- 1. Users Table
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    (SELECT user_type FROM users WHERE user_id = auth.uid()) = 'admin'
  );

-- 2. Drivers Table
DROP POLICY IF EXISTS "Admins can manage drivers" ON drivers;
CREATE POLICY "Admins can manage drivers" ON drivers
  FOR ALL USING (
    (SELECT user_type FROM users WHERE user_id = auth.uid()) = 'admin'
  );

-- 3. Companies Table
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
CREATE POLICY "Admins can manage companies" ON companies
  FOR ALL USING (
    (SELECT user_type FROM users WHERE user_id = auth.uid()) = 'admin'
  );

-- 4. Requests Table
DROP POLICY IF EXISTS "Admins can manage all requests" ON requests;
CREATE POLICY "Admins can manage all requests" ON requests
  FOR ALL USING (
    (SELECT user_type FROM users WHERE user_id = auth.uid()) = 'admin'
  );

-- 5. Trips Table
DROP POLICY IF EXISTS "Admins can manage trips" ON trips;
CREATE POLICY "Admins can manage trips" ON trips
  FOR ALL USING (
    (SELECT user_type FROM users WHERE user_id = auth.uid()) = 'admin'
  );
