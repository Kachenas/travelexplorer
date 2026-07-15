-- ============================================================
-- Add is_suspended flag and document columns to profiles
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN identification text,
  ADD COLUMN business_permit text,
  ADD COLUMN document text;
