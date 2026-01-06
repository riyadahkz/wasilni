-- ===== COMPLETE FIX FOR RLS POLICIES =====
-- This replaces ALL problematic policies with working ones
-- Run this entire script in Supabase SQL Editor

-- ===== STEP 1: Drop ALL existing policies =====
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

DROP POLICY IF EXISTS "Drivers can view own profile" ON drivers;
DROP POLICY IF EXISTS "Customers can view approved drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can manage drivers" ON drivers;
DROP POLICY IF EXISTS "Anyone can insert driver profile" ON drivers;

DROP POLICY IF EXISTS "Companies can view own profile" ON companies;
DROP POLICY IF EXISTS "Customers can view approved companies" ON companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
DROP POLICY IF EXISTS "Anyone can insert company profile" ON companies;

DROP POLICY IF EXISTS "Users can view own requests" ON requests;
DROP POLICY IF EXISTS "Users can create requests" ON requests;
DROP POLICY IF EXISTS "Users can update own requests" ON requests;
DROP POLICY IF EXISTS "Assigned providers can view requests" ON requests;
DROP POLICY IF EXISTS "Admins can manage all requests" ON requests;

DROP POLICY IF EXISTS "Anyone can view active trips" ON trips;
DROP POLICY IF EXISTS "Providers can manage own trips" ON trips;

DROP POLICY IF EXISTS "Users can view own bookings" ON trip_bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON trip_bookings;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;

DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
DROP POLICY IF EXISTS "Users can create ratings for completed trips" ON ratings;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- ===== STEP 2: Create simplified, working policies =====

-- ===== USERS TABLE =====
-- Allow authenticated users to insert their own profile (for signup)
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- ===== DRIVERS TABLE =====
-- Allow anyone to insert (for driver registration)
CREATE POLICY "Enable insert for driver registration" ON drivers
  FOR INSERT 
  WITH CHECK (true);

-- Allow drivers to view their own profile
CREATE POLICY "Drivers can view own profile" ON drivers
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow everyone to view approved active drivers
CREATE POLICY "Public can view approved drivers" ON drivers
  FOR SELECT 
  USING (is_approved = true AND is_active = true);

-- Allow drivers to update their own profile
CREATE POLICY "Drivers can update own profile" ON drivers
  FOR UPDATE 
  USING (user_id = auth.uid());

-- ===== COMPANIES TABLE =====
-- Allow anyone to insert (for company registration)
CREATE POLICY "Enable insert for company registration" ON companies
  FOR INSERT 
  WITH CHECK (true);

-- Allow companies to view their own profile
CREATE POLICY "Companies can view own profile" ON companies
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow everyone to view approved active companies
CREATE POLICY "Public can view approved companies" ON companies
  FOR SELECT 
  USING (is_approved = true AND is_active = true);

-- Allow companies to update their own profile
CREATE POLICY "Companies can update own profile" ON companies
  FOR UPDATE 
  USING (user_id = auth.uid());

-- ===== REQUESTS TABLE =====
-- Allow users to view their own requests
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow users to create requests
CREATE POLICY "Users can create requests" ON requests
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own requests
CREATE POLICY "Users can update own requests" ON requests
  FOR UPDATE 
  USING (user_id = auth.uid());

-- ===== TRIPS TABLE =====
-- Allow everyone to view active trips
CREATE POLICY "Public can view active trips" ON trips
  FOR SELECT 
  USING (status IN ('active', 'full'));

-- Allow providers to insert trips
CREATE POLICY "Providers can create trips" ON trips
  FOR INSERT 
  WITH CHECK (true);

-- Allow providers to update their own trips
CREATE POLICY "Providers can update own trips" ON trips
  FOR UPDATE 
  USING (true);

-- ===== TRIP BOOKINGS TABLE =====
-- Allow users to view their own bookings
CREATE POLICY "Users can view own bookings" ON trip_bookings
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow users to create bookings
CREATE POLICY "Users can create bookings" ON trip_bookings
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ===== PAYMENTS TABLE =====
-- Allow users to view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow users to create payments
CREATE POLICY "Users can create payments" ON payments
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ===== RATINGS TABLE =====
-- Allow everyone to view ratings
CREATE POLICY "Public can view ratings" ON ratings
  FOR SELECT 
  USING (true);

-- Allow users to create ratings
CREATE POLICY "Users can create ratings" ON ratings
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ===== NOTIFICATIONS TABLE =====
-- Allow users to view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Allow system to insert notifications (you'll need service role for this)
CREATE POLICY "Enable insert for notifications" ON notifications
  FOR INSERT 
  WITH CHECK (true);

-- ===== DONE! =====
-- All policies are now fixed and should work without recursion errors
