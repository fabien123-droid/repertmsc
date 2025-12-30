-- Add audio_path column to songs table
ALTER TABLE public.songs ADD COLUMN audio_path text;

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio files
CREATE POLICY "Audio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-files');

CREATE POLICY "Admins can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-files' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update audio files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audio-files' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete audio files"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio-files' AND public.is_admin(auth.uid()));