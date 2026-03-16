-- Blog posts: editable content with rich text (HTML/JSON from Tiptap)
-- See plan: blog_posts (id, title, slug, content, author_id, published, created_at, updated_at)

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX idx_blog_posts_created_at ON public.blog_posts(created_at DESC);

COMMENT ON TABLE public.blog_posts IS 'Blog posts; content stores HTML or JSON from Tiptap editor';

CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published blog posts are viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (published = true OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can manage blog posts"
  ON public.blog_posts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
