/**
 * Supabase database types (public schema).
 * Generate from live schema: npm run gen:types
 * (Requires: supabase link then SUPABASE_PROJECT_ID or --linked)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OrderStatus =
  | 'Pending Payment'
  | 'Processing'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled'
  | 'Refunded'
  | 'Failed';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'customer';
          profile_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'admin' | 'customer';
          profile_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'customer';
          profile_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          description: string | null;
          images: string[];
          image_meta: Record<string, { alt?: string; title?: string }>;
          stock_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          description?: string | null;
          images?: string[];
          image_meta?: Record<string, { alt?: string; title?: string }>;
          stock_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          description?: string | null;
          images?: string[];
          image_meta?: Record<string, { alt?: string; title?: string }>;
          stock_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          file_path: string;
          url: string;
          alt: string | null;
          title: string | null;
          caption: string | null;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          file_path: string;
          url: string;
          alt?: string | null;
          title?: string | null;
          caption?: string | null;
          file_name: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          file_path?: string;
          url?: string;
          alt?: string | null;
          title?: string | null;
          caption?: string | null;
          file_name?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          author_id: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string;
          author_id?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          author_id?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          customer_email: string | null;
          items: Json;
          status: OrderStatus;
          total_amount: number;
          tracking_id: string | null;
          payment_method: string | null;
          billing_address: Json | null;
          shipping_address: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          internal_notes: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          customer_email?: string | null;
          items?: Json;
          status?: OrderStatus;
          total_amount: number;
          tracking_id?: string | null;
          payment_method?: string | null;
          billing_address?: Json | null;
          shipping_address?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          internal_notes?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          customer_email?: string | null;
          items?: Json;
          status?: OrderStatus;
          total_amount?: number;
          tracking_id?: string | null;
          payment_method?: string | null;
          billing_address?: Json | null;
          shipping_address?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          internal_notes?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      reconcile_guest_orders: {
        Args: { p_user_id: string; p_email: string };
        Returns: undefined;
      };
      increment_product_stock: {
        Args: { p_product_id: string; p_delta: number };
        Returns: undefined;
      };
    };
  };
}
