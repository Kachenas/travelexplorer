-- ============================================================
-- Admin Role & Approval System
-- ============================================================

-- 1. Add 'admin' to profiles user_type
-- --------------------------------------------------------
ALTER TABLE public.profiles
  DROP CONSTRAINT profiles_user_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN ('customer', 'van_owner', 'hotel_owner', 'tour_operator', 'admin'));

-- 2. Admin RLS policies
-- --------------------------------------------------------

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- Admins can read all vehicles
CREATE POLICY "Admins can read all vehicles"
  ON public.vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- Admins can update any vehicle (for approval)
CREATE POLICY "Admins can update any vehicle"
  ON public.vehicles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- Admins can read all accommodations
CREATE POLICY "Admins can read all accommodations"
  ON public.accommodations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- Admins can update any accommodation (for approval)
CREATE POLICY "Admins can update any accommodation"
  ON public.accommodations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- Admins can read all tours
CREATE POLICY "Admins can read all tours"
  ON public.tours FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- Admins can update any tour (for approval)
CREATE POLICY "Admins can update any tour"
  ON public.tours FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- Admins can read all bookings
CREATE POLICY "Admins can read all bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- Admins can update any booking
CREATE POLICY "Admins can update any booking"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );
