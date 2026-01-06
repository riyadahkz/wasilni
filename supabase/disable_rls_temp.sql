-- ===== TEMPORARY FIX: Disable RLS on users table =====
-- This is for DEVELOPMENT ONLY to get registration working
-- Run this in Supabase SQL Editor

-- Option 1: Temporarily disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Note: This makes the users table fully accessible
-- Only use this for development/testing
-- For production, you'll need proper RLS policies with JWT claims
