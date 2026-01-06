-- ===== Iraqi Transportation Application Database Schema =====
-- Complete schema with RLS policies and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== Users Table =====
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'driver', 'company', 'admin')),
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Drivers Table =====
CREATE TABLE drivers (
  driver_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type VARCHAR(100),
  vehicle_plate VARCHAR(50),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Companies Table =====
CREATE TABLE companies (
  company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('tourism', 'transport', 'both')),
  contact_info JSONB,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  active_services TEXT[],
  is_active BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Requests Table =====
CREATE TABLE requests (
  request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('trip', 'tourism', 'private', 'fixed_line', 'taxi')),
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  origin_coordinates JSONB,
  destination_coordinates JSONB,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  assigned_to UUID,
  assigned_type VARCHAR(20) CHECK (assigned_type IN ('driver', 'company')),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  passenger_count INTEGER DEFAULT 1,
  price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Trips Table (Pre-arranged offers from drivers/companies) =====
CREATE TABLE trips (
  trip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL,
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('driver', 'company')),
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  origin_coordinates JSONB,
  destination_coordinates JSONB,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  vehicle_type VARCHAR(100),
  amenities TEXT[],
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Trip Bookings Table (Link customers to trips) =====
CREATE TABLE trip_bookings (
  booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(trip_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  seats_booked INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Payments Table =====
CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(request_id) ON DELETE SET NULL,
  trip_booking_id UUID REFERENCES trip_bookings(booking_id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'zain_cash', 'nasswallet', 'mastercard')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  commission_amount DECIMAL(10, 2) DEFAULT 0.00,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Ratings Table =====
CREATE TABLE ratings (
  rating_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  rated_id UUID NOT NULL,
  rated_type VARCHAR(20) CHECK (rated_type IN ('driver', 'company')),
  request_id UUID REFERENCES requests(request_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Notifications Table =====
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== Create Indexes for Performance =====
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_is_active ON drivers(is_active);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_is_active ON companies(is_active);
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_assigned_to ON requests(assigned_to);
CREATE INDEX idx_trips_provider ON trips(provider_id, provider_type);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_ratings_rated ON ratings(rated_id, rated_type);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ===== Triggers for Updated_at =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_bookings_updated_at BEFORE UPDATE ON trip_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== Row Level Security (RLS) Policies =====

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- Drivers policies
CREATE POLICY "Drivers can view own profile" ON drivers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Customers can view approved drivers" ON drivers
  FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Admins can manage drivers" ON drivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- Companies policies
CREATE POLICY "Companies can view own profile" ON companies
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Customers can view approved companies" ON companies
  FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Admins can manage companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- Requests policies
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create requests" ON requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Assigned providers can view requests" ON requests
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Admins can manage all requests" ON requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trips policies (Everyone can view active trips)
CREATE POLICY "Anyone can view active trips" ON trips
  FOR SELECT USING (status = 'active' OR status = 'full');

CREATE POLICY "Providers can manage own trips" ON trips
  FOR ALL USING (
    (provider_type = 'driver' AND provider_id IN (SELECT driver_id FROM drivers WHERE user_id = auth.uid())) OR
    (provider_type = 'company' AND provider_id IN (SELECT company_id FROM companies WHERE user_id = auth.uid()))
  );

-- Trip bookings policies
CREATE POLICY "Users can view own bookings" ON trip_bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON trip_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for completed trips" ON ratings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
