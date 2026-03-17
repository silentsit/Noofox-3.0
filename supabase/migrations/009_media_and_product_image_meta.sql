-- Media library: table + storage bucket for uploads and SEO meta
-- Product image meta: per-URL alt/title for admin products

-- Media table: one row per uploaded image
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  alt TEXT,
  title TEXT,
  caption TEXT,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_created_at ON public.media(created_at DESC);

COMMENT ON TABLE public.media IS 'Uploaded images with SEO meta (alt, title, caption)';

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media is viewable by everyone"
  ON public.media FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage media"
  ON public.media FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE TRIGGER set_media_updated_at
  BEFORE UPDATE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Product image meta: keyed by image URL for alt/title per image
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_meta JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.products.image_meta IS 'Per-image SEO: { "url": { "alt": "", "title": "" } }';

-- Storage bucket for media uploads (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies: public read; authenticated admins can upload/update/delete
CREATE POLICY "Media bucket: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Media bucket: admins insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Media bucket: admins update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Media bucket: admins delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
