-- Drop the old constraint
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_service_type_check;

-- Add the new constraint with all valid service types
ALTER TABLE public.requests ADD CONSTRAINT requests_service_type_check 
CHECK (service_type IN ('taxi', 'delivery', 'trip_booking', 'trip', 'tourism', 'private', 'fixed_line'));
