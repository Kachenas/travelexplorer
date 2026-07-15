-- ============================================================
-- Grant table-level permissions to anon and authenticated roles
-- RLS policies handle row-level access; these grants allow
-- the roles to reach the tables in the first place.
-- ============================================================

-- profiles
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- vehicles
GRANT SELECT ON public.vehicles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;

-- accommodations
GRANT SELECT ON public.accommodations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.accommodations TO authenticated;

-- tours
GRANT SELECT ON public.tours TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tours TO authenticated;

-- places
GRANT SELECT ON public.places TO anon, authenticated;
GRANT INSERT, UPDATE ON public.places TO authenticated;

-- bookings
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
