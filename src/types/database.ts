/**
 * Convenience types derived from Supabase schema.
 * Full schema: @/types/supabase (Database).
 */

import type { Database } from './supabase';

export type UserRole = Database['public']['Tables']['users']['Row']['role'];
export type UserProfile = Database['public']['Tables']['users']['Row'];

export type Product = Database['public']['Tables']['products']['Row'];
export type Media = Database['public']['Tables']['media']['Row'];
export type ProductImageMeta = Record<string, { alt?: string; title?: string }>;

export type OrderStatus = Database['public']['Tables']['orders']['Row']['status'];

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_email: string | null;
  items: OrderItem[];
  status: OrderStatus;
  total_amount: number;
  tracking_id: string | null;
  payment_method: string | null;
  billing_address: Address | null;
  shipping_address: Address | null;
  ip_address: string | null;
  user_agent: string | null;
  internal_notes: unknown[] | null;
  created_at: string;
  updated_at?: string;
}

export interface SupabaseDatabase {
  public: Database['public'];
}
