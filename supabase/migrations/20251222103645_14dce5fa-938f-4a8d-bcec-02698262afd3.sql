-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  lyrics TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Public read access for categories (everyone can see categories)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- Public read access for songs (everyone can see songs)
CREATE POLICY "Songs are viewable by everyone" 
ON public.songs 
FOR SELECT 
USING (true);

-- Only authenticated users can manage categories
CREATE POLICY "Authenticated users can insert categories" 
ON public.categories 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories" 
ON public.categories 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete categories" 
ON public.categories 
FOR DELETE 
TO authenticated 
USING (true);

-- Only authenticated users can manage songs
CREATE POLICY "Authenticated users can insert songs" 
ON public.songs 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update songs" 
ON public.songs 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete songs" 
ON public.songs 
FOR DELETE 
TO authenticated 
USING (true);

-- Create storage bucket for sheet music files
INSERT INTO storage.buckets (id, name, public) VALUES ('sheet-music', 'sheet-music', true);

-- Storage policies for sheet music bucket
CREATE POLICY "Sheet music files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sheet-music');

CREATE POLICY "Authenticated users can upload sheet music" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'sheet-music');

CREATE POLICY "Authenticated users can update sheet music" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'sheet-music');

CREATE POLICY "Authenticated users can delete sheet music" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'sheet-music');

-- Insert some default categories
INSERT INTO public.categories (name) VALUES 
  ('Louange'),
  ('Adoration'),
  ('Cantiques'),
  ('Gospel');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();