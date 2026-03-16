/**
 * Blog post type for frontend and admin (matches blog_posts table).
 */

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPostWithAuthor extends BlogPost {
  author_email?: string | null;
}
