-- Enable RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policies if any to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own driver profile" ON drivers;
DROP POLICY IF EXISTS "Users can insert their own company profile" ON companies;

-- Allow authenticated users to insert into drivers table
CREATE POLICY "Users can insert their own driver profile"
ON drivers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert into companies table
CREATE POLICY "Users can insert their own company profile"
ON companies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also ensure users can read their own profile
CREATE POLICY "Users can view their own driver profile"
ON drivers FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR (SELECT user_type FROM users WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Users can view their own company profile"
ON companies FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR (SELECT user_type FROM users WHERE user_id = auth.uid()) = 'admin');

-- Allow updates
CREATE POLICY "Users can update their own driver profile"
ON drivers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile"
ON companies FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
