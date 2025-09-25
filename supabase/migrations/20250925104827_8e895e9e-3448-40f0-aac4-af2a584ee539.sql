-- Drop the restrictive policy for viewing animal images
DROP POLICY IF EXISTS "Users can view their animal images" ON storage.objects;

-- Create a new policy allowing public access to animal images since bucket is public
CREATE POLICY "Public access to animal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'animal-images');