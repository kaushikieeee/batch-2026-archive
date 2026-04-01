-- Run this in the Supabase Dashboard -> SQL Editor!
-- Fix to allow uploads since your app relies on a custom users table rather than Supabase Auth natively.

DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;

CREATE POLICY "Anon Upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'batchof2026');

CREATE POLICY "Anon Update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'batchof2026');

CREATE POLICY "Anon Delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'batchof2026');
