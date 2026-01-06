-- Function to decrement available seats when a booking is accepted
CREATE OR REPLACE FUNCTION update_seats_on_booking_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the old status was not 'accepted' and the new one is 'accepted'
    IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        -- Check if it is a trip booking (has trip_id)
        IF NEW.trip_id IS NOT NULL THEN
            UPDATE public.trips
            SET available_seats = available_seats - NEW.seats_needed
            WHERE trip_id = NEW.trip_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on update of requests table
DROP TRIGGER IF EXISTS on_booking_accepted ON public.requests;
CREATE TRIGGER on_booking_accepted
AFTER UPDATE ON public.requests
FOR EACH ROW
EXECUTE FUNCTION update_seats_on_booking_approval();
