-- Drop ALL potential existing policies on trips to avoid conflicts
DROP POLICY IF EXISTS "Providers can manage own trips" ON trips;
DROP POLICY IF EXISTS "Anyone can view active trips" ON trips;
DROP POLICY IF EXISTS "Providers can view own trips" ON trips;
DROP POLICY IF EXISTS "Providers can insert own trips" ON trips;
DROP POLICY IF EXISTS "Providers can update own trips" ON trips;
DROP POLICY IF EXISTS "Providers can delete own trips" ON trips;

-- Re-create separate policies for better control

-- SELECT: Anyone can view active trips, Providers can view their own
CREATE POLICY "Anyone can view active trips" ON trips
  FOR SELECT USING (status = 'active' OR status = 'full');

CREATE POLICY "Providers can view own trips" ON trips
  FOR SELECT USING (
    (provider_type = 'driver' AND provider_id IN (SELECT driver_id FROM drivers WHERE user_id = auth.uid())) OR
    (provider_type = 'company' AND provider_id IN (SELECT company_id FROM companies WHERE user_id = auth.uid()))
  );

-- INSERT: Providers can create trips for themselves
CREATE POLICY "Providers can insert own trips" ON trips
  FOR INSERT WITH CHECK (
    (provider_type = 'driver' AND provider_id IN (SELECT driver_id FROM drivers WHERE user_id = auth.uid())) OR
    (provider_type = 'company' AND provider_id IN (SELECT company_id FROM companies WHERE user_id = auth.uid()))
  );

-- UPDATE: Providers can update their own trips
CREATE POLICY "Providers can update own trips" ON trips
  FOR UPDATE USING (
    (provider_type = 'driver' AND provider_id IN (SELECT driver_id FROM drivers WHERE user_id = auth.uid())) OR
    (provider_type = 'company' AND provider_id IN (SELECT company_id FROM companies WHERE user_id = auth.uid()))
  );

-- DELETE: Providers can delete their own trips
CREATE POLICY "Providers can delete own trips" ON trips
  FOR DELETE USING (
    (provider_type = 'driver' AND provider_id IN (SELECT driver_id FROM drivers WHERE user_id = auth.uid())) OR
    (provider_type = 'company' AND provider_id IN (SELECT company_id FROM companies WHERE user_id = auth.uid()))
  );
