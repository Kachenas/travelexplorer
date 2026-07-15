-- ============================================================
-- Fix: infinite recursion in admin RLS policies on profiles
--
-- The admin policies used an inline EXISTS subquery on profiles,
-- which triggered the same RLS check recursively. Solution: use
-- a SECURITY DEFINER function that bypasses RLS.
-- ============================================================

-- 1. Create a SECURITY DEFINER function to check admin status
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$$;

-- 2. Drop the recursive policies and recreate with is_admin()
-- --------------------------------------------------------

-- profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- vehicles
DROP POLICY IF EXISTS "Admins can read all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can update any vehicle" ON public.vehicles;

CREATE POLICY "Admins can read all vehicles"
  ON public.vehicles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any vehicle"
  ON public.vehicles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- accommodations
DROP POLICY IF EXISTS "Admins can read all accommodations" ON public.accommodations;
DROP POLICY IF EXISTS "Admins can update any accommodation" ON public.accommodations;

CREATE POLICY "Admins can read all accommodations"
  ON public.accommodations FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any accommodation"
  ON public.accommodations FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- tours
DROP POLICY IF EXISTS "Admins can read all tours" ON public.tours;
DROP POLICY IF EXISTS "Admins can update any tour" ON public.tours;

CREATE POLICY "Admins can read all tours"
  ON public.tours FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any tour"
  ON public.tours FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- bookings
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update any booking" ON public.bookings;

CREATE POLICY "Admins can read all bookings"
  ON public.bookings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any booking"
  ON public.bookings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
