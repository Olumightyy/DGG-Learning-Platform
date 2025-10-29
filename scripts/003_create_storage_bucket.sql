-- Create storage bucket for submissions
-- Note: This needs to be run in Supabase dashboard or via API
-- The bucket should be named 'submissions' and set to public

-- After creating the bucket, add RLS policies:
-- CREATE POLICY "Allow authenticated users to upload" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'submissions');

-- CREATE POLICY "Allow users to view their submissions" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'submissions');

-- CREATE POLICY "Allow users to delete their submissions" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (bucket_id = 'submissions');
