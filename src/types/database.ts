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
export type Coupon = Database['public']['Tables']['coupons']['Row'];
export type CouponInsert = Database['public']['Tables']['coupons']['Insert'];
export type CouponUpdate = Database['public']['Tables']['coupons']['Update'];
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];
export type EmailAutomation = Database['public']['Tables']['email_automations']['Row'];
export type EmailQueueJob = Database['public']['Tables']['email_queue']['Row'];
export type EmailBroadcast = Database['public']['Tables']['email_broadcasts']['Row'];
export type EmailSubscriber = Database['public']['Tables']['email_subscribers']['Row'];
export type AbandonedCart = Database['public']['Tables']['abandoned_carts']['Row'];
export type SocialProofCampaign = Database['public']['Tables']['social_proof_campaigns']['Row'];
export type RequestRateLimit = Database['public']['Tables']['request_rate_limits']['Row'];

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  variation_id?: string;
  cost?: number;
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
  subtotal_amount?: number;
  shipping_amount?: number;
  tax_amount?: number;
  discount_amount?: number;
  coupon_code?: string | null;
  tracking_id: string | null;
  payment_method: string | null;
  payment_reference?: string | null;
  payment_gateway?: string | null;
  payment_metadata?: Record<string, unknown> | null;
  currency_code?: 'USD';
  attribution_source?: string | null;
  attribution_detail?: string | null;
  crypto_txid?: string | null;
  billing_address: Address | null;
  shipping_address: Address | null;
  ip_address: string | null;
  user_agent: string | null;
  internal_notes: unknown[] | null;
  paid_at?: string | null;
  fulfilled_at?: string | null;
  refunded_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface OrderTimelineEntry {
  id: string;
  order_id: string;
  entry_type: 'system' | 'note';
  message: string;
  is_private: boolean;
  actor_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SupabaseDatabase {
  public: Database['public'];
}
