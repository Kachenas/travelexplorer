-- ============================================================
-- Create private storage bucket for owner verification documents
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('owner-documents', 'owner-documents', false, 10485760, ARRAY['image/jpeg', 'image/png']);

-- Allow authenticated users to upload within their own user_id/ prefix
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'owner-documents'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Allow authenticated users to read their own documents
CREATE POLICY "Users can read their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'owner-documents'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'owner-documents'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );
