-- Drop the existing check constraint
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_status_check;

-- Add the new check constraint allowing 'pending' status
ALTER TABLE trips ADD CONSTRAINT trips_status_check 
CHECK (status IN ('pending', 'active', 'full', 'completed', 'cancelled'));
