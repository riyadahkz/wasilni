-- Create admin_reviews table
CREATE TABLE IF NOT EXISTS public.admin_reviews (
  review_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  target_id uuid NOT NULL,
  target_type character varying NOT NULL CHECK (target_type IN ('user', 'driver', 'company', 'trip', 'vehicle')),
  action character varying NOT NULL CHECK (action IN ('approve', 'reject', 'comment')),
  note text,
  admin_id uuid REFERENCES public.users(user_id),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_reviews_pkey PRIMARY KEY (review_id)
);

-- Ensure RLS is enabled
ALTER TABLE public.admin_reviews ENABLE ROW LEVEL SECURITY;

-- Allow admins to do everything
CREATE POLICY "Admins can do everything on admin_reviews"
ON public.admin_reviews
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.user_id = auth.uid()
    AND users.user_type = 'admin'
  )
);

-- Ensure is_approved/active columns exist on relevant tables if they don't already
-- (Most already have them based on schema, but adding checks/defaults here for safety)

-- Users (already has is_approved)
-- Drivers (already has is_approved)
-- Companies (already has is_approved)
-- Trips (has status, but maybe we want specific approval? status 'active' implies approved usually, but let's stick to status)
-- Vehicles (has is_active, maybe add is_approved if strictly needed, or use is_active)

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'is_approved') THEN
        ALTER TABLE public.vehicles ADD COLUMN is_approved boolean DEFAULT false;
    END IF;
END $$;
