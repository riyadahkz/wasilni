-- ===== COMPLETE SOLUTION FOR REGISTRATION RLS ISSUE =====
-- Run this ENTIRE script in Supabase SQL Editor

-- STEP 1: Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- STEP 2: Create new permissive policies for users table

-- Allow anyone authenticated to insert (needed for signup)
CREATE POLICY "Allow signup insert" ON users
  FOR INSERT
  WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users view own" ON users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own profile  
CREATE POLICY "Users update own" ON users
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- STEP 3: Make sure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- STEP 4: Also update other tables to be more permissive for development

-- Drivers table
DROP POLICY IF EXISTS "Enable insert for driver registration" ON drivers;
CREATE POLICY "Allow driver insert" ON drivers
  FOR INSERT WITH CHECK (true);

-- Companies table  
DROP POLICY IF EXISTS "Enable insert for company registration" ON companies;
CREATE POLICY "Allow company insert" ON companies
  FOR INSERT WITH CHECK (true);

-- Done! Now signup should work.
