-- ============================================================
-- Owner Onboarding & Tour Operator Support
-- Adds: tours table, is_active toggles, tour_operator role, tour bookings
-- ============================================================

-- --------------------------------------------------------
-- 1. Add is_active column to vehicles and accommodations
-- --------------------------------------------------------
ALTER TABLE public.vehicles
  ADD COLUMN is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.accommodations
  ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- --------------------------------------------------------
-- 2. Update profiles.user_type CHECK constraint
-- --------------------------------------------------------
ALTER TABLE public.profiles
  DROP CONSTRAINT profiles_user_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('customer', 'van_owner', 'hotel_owner', 'tour_operator'));

-- --------------------------------------------------------
-- 3. Update bookings.booking_type CHECK constraint
-- --------------------------------------------------------
ALTER TABLE public.bookings
  DROP CONSTRAINT bookings_booking_type_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_booking_type_check
  CHECK (booking_type IN ('van', 'hotel', 'tour', 'bundle'));

-- --------------------------------------------------------
-- 4. tours table
-- --------------------------------------------------------
CREATE TABLE public.tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  location text NOT NULL,
  duration_hours numeric NOT NULL CHECK (duration_hours > 0),
  price_per_person numeric NOT NULL CHECK (price_per_person >= 0),
  max_group_size int NOT NULL CHECK (max_group_size > 0),
  inclusions text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  is_approved boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tours IS 'Tour operator listings';

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- Public read for tours
CREATE POLICY "Tours are publicly readable"
  ON public.tours FOR SELECT
  USING (true);

-- Owners can insert their own tours
CREATE POLICY "Owners can insert tours"
  ON public.tours FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own tours
CREATE POLICY "Owners can update own tours"
  ON public.tours FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Owners can delete their own tours
CREATE POLICY "Owners can delete own tours"
  ON public.tours FOR DELETE
  USING (auth.uid() = owner_id);

-- --------------------------------------------------------
-- 5. Indexes
-- --------------------------------------------------------
CREATE INDEX idx_tours_owner ON public.tours(owner_id);
CREATE INDEX idx_tours_location ON public.tours(location);

-- --------------------------------------------------------
-- 6. updated_at trigger for tours
-- --------------------------------------------------------
CREATE TRIGGER set_tours_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- --------------------------------------------------------
-- 7. Booking policy for tour owners
-- --------------------------------------------------------
CREATE POLICY "Owners can read bookings for their tours"
  ON public.bookings FOR SELECT
  USING (
    booking_type = 'tour'
    AND reference_id IN (
      SELECT id FROM public.tours WHERE owner_id = auth.uid()
    )
  );
