-- ============================================================
-- Create public storage buckets for listing images
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('vehicle-images', 'vehicle-images', true, 10485760, ARRAY['image/jpeg', 'image/png']),
  ('accommodation-images', 'accommodation-images', true, 10485760, ARRAY['image/jpeg', 'image/png']),
  ('tour-images', 'tour-images', true, 10485760, ARRAY['image/jpeg', 'image/png']);

-- Allow authenticated users to upload to their own paths
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('vehicle-images', 'accommodation-images', 'tour-images'));

-- Allow public read access
CREATE POLICY "Public can view listing images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id IN ('vehicle-images', 'accommodation-images', 'tour-images'));

-- Allow owners to delete their own uploads
CREATE POLICY "Authenticated users can delete their listing images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('vehicle-images', 'accommodation-images', 'tour-images'));
