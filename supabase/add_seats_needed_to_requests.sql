-- Add seats_needed column to requests table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'seats_needed') THEN
        ALTER TABLE public.requests ADD COLUMN seats_needed INTEGER DEFAULT 1;
    END IF;
END $$;
