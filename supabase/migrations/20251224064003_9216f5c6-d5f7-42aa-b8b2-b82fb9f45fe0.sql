-- Drop existing overly permissive policies on songs table
DROP POLICY IF EXISTS "Authenticated users can insert songs" ON public.songs;
DROP POLICY IF EXISTS "Authenticated users can update songs" ON public.songs;
DROP POLICY IF EXISTS "Authenticated users can delete songs" ON public.songs;

-- Drop existing overly permissive policies on categories table
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;

-- Create new policies that require admin role for songs table
CREATE POLICY "Only admins can insert songs"
ON public.songs FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update songs"
ON public.songs FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete songs"
ON public.songs FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- Create new policies that require admin role for categories table
CREATE POLICY "Only admins can insert categories"
ON public.categories FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update categories"
ON public.categories FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete categories"
ON public.categories FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- Update storage policies for sheet-music bucket to require admin role
DROP POLICY IF EXISTS "Anyone can upload sheet music" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update sheet music" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete sheet music" ON storage.objects;

-- Create admin-only storage policies
CREATE POLICY "Only admins can upload sheet music"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'sheet-music' AND public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update sheet music"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'sheet-music' AND public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete sheet music"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'sheet-music' AND public.is_admin(auth.uid()));