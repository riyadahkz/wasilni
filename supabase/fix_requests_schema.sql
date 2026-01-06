-- Ensure requests table has all required columns
-- This script checks for the existence of each column and adds it if missing

DO $$
BEGIN
    -- 1. Check/Add trip_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'trip_id') THEN
        ALTER TABLE public.requests ADD COLUMN trip_id UUID REFERENCES public.trips(trip_id);
    END IF;

    -- 2. Check/Add user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'user_id') THEN
        ALTER TABLE public.requests ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    -- 3. Check/Add seats_needed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'seats_needed') THEN
        ALTER TABLE public.requests ADD COLUMN seats_needed INTEGER DEFAULT 1;
    END IF;

    -- 4. Check/Add status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'status') THEN
        ALTER TABLE public.requests ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    -- 5. Check/Add notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'notes') THEN
        ALTER TABLE public.requests ADD COLUMN notes TEXT;
    END IF;

     -- 6. Check/Add created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'created_at') THEN
        ALTER TABLE public.requests ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

END $$;
