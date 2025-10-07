-- Create storage bucket for puzzle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('puzzle-images', 'puzzle-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload puzzle images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'puzzle-images');

-- Allow everyone to view puzzle images (public bucket)
CREATE POLICY "Anyone can view puzzle images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'puzzle-images');

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own puzzle images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'puzzle-images' AND auth.uid()::text = (storage.foldername(name))[1]);