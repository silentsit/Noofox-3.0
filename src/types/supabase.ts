/**
 * Supabase database types (public schema).
 * Auto-generated from live schema via Supabase MCP `generate_typescript_types`.
 * Re-generate after schema changes: npm run gen:types
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

export type Database = {
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          action: string;
          created_at: string;
          description: string | null;
          key: string;
          resource: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          description?: string | null;
          key: string;
          resource: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          description?: string | null;
          key?: string;
          resource?: string;
        };
      };
      admin_role_permissions: {
        Row: {
          created_at: string;
          permission_key: string;
          role_key: string;
        };
        Insert: {
          created_at?: string;
          permission_key: string;
          role_key: string;
        };
        Update: {
          created_at?: string;
          permission_key?: string;
          role_key?: string;
        };
      };
      admin_roles: {
        Row: {
          created_at: string;
          description: string | null;
          is_system: boolean;
          key: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          is_system?: boolean;
          key: string;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          is_system?: boolean;
          key?: string;
          name?: string;
        };
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: string;
          ip_address: string | null;
          metadata: Json;
          new_data: Json | null;
          old_data: Json | null;
          resource_id: string | null;
          resource_type: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          new_data?: Json | null;
          old_data?: Json | null;
          resource_id?: string | null;
          resource_type: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          new_data?: Json | null;
          old_data?: Json | null;
          resource_id?: string | null;
          resource_type?: string;
        };
      };
      blog_posts: {
        Row: {
          author_id: string | null;
          content: string;
          created_at: string;
          id: string;
          published: boolean;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          published?: boolean;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          published?: boolean;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
      };
      catalog_faqs: {
        Row: {
          answer: string;
          created_at: string;
          id: string;
          product_id: string;
          question: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          answer: string;
          created_at?: string;
          id?: string;
          product_id: string;
          question: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          answer?: string;
          created_at?: string;
          id?: string;
          product_id?: string;
          question?: string;
          sort_order?: number;
          updated_at?: string;
        };
      };
      catalog_import_meta: {
        Row: {
          created_at: string;
          generated_at: string;
          id: string;
          product_count: number;
          sitemap_url: string;
          source: string;
        };
        Insert: {
          created_at?: string;
          generated_at: string;
          id?: string;
          product_count: number;
          sitemap_url: string;
          source: string;
        };
        Update: {
          created_at?: string;
          generated_at?: string;
          id?: string;
          product_count?: number;
          sitemap_url?: string;
          source?: string;
        };
      };
      catalog_products: {
        Row: {
          breadcrumbs: Json;
          category: string | null;
          created_at: string;
          description_html: string;
          description_text: string;
          id: string;
          images: string[];
          name: string;
          price_max: number;
          price_min: number;
          price_text: string;
          related_slugs: string[];
          review_average_rating: number | null;
          review_count: number;
          seo: Json;
          short_description_html: string;
          short_description_text: string;
          slug: string;
          source_url: string | null;
          structured_data: Json;
          title: string;
          updated_at: string;
          url_path: string;
        };
        Insert: {
          breadcrumbs?: Json;
          category?: string | null;
          created_at?: string;
          description_html?: string;
          description_text?: string;
          id?: string;
          images?: string[];
          name: string;
          price_max: number;
          price_min: number;
          price_text: string;
          related_slugs?: string[];
          review_average_rating?: number | null;
          review_count?: number;
          seo?: Json;
          short_description_html?: string;
          short_description_text?: string;
          slug: string;
          source_url?: string | null;
          structured_data?: Json;
          title: string;
          updated_at?: string;
          url_path: string;
        };
        Update: {
          breadcrumbs?: Json;
          category?: string | null;
          created_at?: string;
          description_html?: string;
          description_text?: string;
          id?: string;
          images?: string[];
          name?: string;
          price_max?: number;
          price_min?: number;
          price_text?: string;
          related_slugs?: string[];
          review_average_rating?: number | null;
          review_count?: number;
          seo?: Json;
          short_description_html?: string;
          short_description_text?: string;
          slug?: string;
          source_url?: string | null;
          structured_data?: Json;
          title?: string;
          updated_at?: string;
          url_path?: string;
        };
      };
      catalog_variants: {
        Row: {
          attributes: Json;
          created_at: string;
          id: string;
          in_stock: boolean;
          label: string;
          per_unit_text: string | null;
          price: number;
          price_html: string;
          product_id: string;
          quantity_text: string;
          regular_price: number | null;
          sku: string | null;
          stock_quantity: number | null;
          updated_at: string;
          variant_id: string;
        };
        Insert: {
          attributes?: Json;
          created_at?: string;
          id?: string;
          in_stock?: boolean;
          label: string;
          per_unit_text?: string | null;
          price: number;
          price_html?: string;
          product_id: string;
          quantity_text: string;
          regular_price?: number | null;
          sku?: string | null;
          stock_quantity?: number | null;
          updated_at?: string;
          variant_id: string;
        };
        Update: {
          attributes?: Json;
          created_at?: string;
          id?: string;
          in_stock?: boolean;
          label?: string;
          per_unit_text?: string | null;
          price?: number;
          price_html?: string;
          product_id?: string;
          quantity_text?: string;
          regular_price?: number | null;
          sku?: string | null;
          stock_quantity?: number | null;
          updated_at?: string;
          variant_id?: string;
        };
      };
      coupon_usages: {
        Row: {
          coupon_id: string;
          created_at: string;
          customer_email: string | null;
          id: string;
          order_id: string;
          user_id: string | null;
        };
        Insert: {
          coupon_id: string;
          created_at?: string;
          customer_email?: string | null;
          id?: string;
          order_id: string;
          user_id?: string | null;
        };
        Update: {
          coupon_id?: string;
          created_at?: string;
          customer_email?: string | null;
          id?: string;
          order_id?: string;
          user_id?: string | null;
        };
      };
      coupons: {
        Row: {
          allow_free_shipping: boolean;
          brand_keys: string[];
          category_slugs: string[];
          code: string;
          created_at: string;
          description: string | null;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          email_allowlist: string[];
          exclude_sale_items: boolean;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          max_discount_amount: number | null;
          min_order_amount: number;
          product_ids: string[];
          starts_at: string | null;
          times_used: number;
          updated_at: string;
          usage_limit: number | null;
          usage_limit_per_user: number | null;
        };
        Insert: {
          allow_free_shipping?: boolean;
          brand_keys?: string[];
          category_slugs?: string[];
          code: string;
          created_at?: string;
          description?: string | null;
          discount_type?: 'percentage' | 'fixed';
          discount_value: number;
          email_allowlist?: string[];
          exclude_sale_items?: boolean;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_discount_amount?: number | null;
          min_order_amount?: number;
          product_ids?: string[];
          starts_at?: string | null;
          times_used?: number;
          updated_at?: string;
          usage_limit?: number | null;
          usage_limit_per_user?: number | null;
        };
        Update: {
          allow_free_shipping?: boolean;
          brand_keys?: string[];
          category_slugs?: string[];
          code?: string;
          created_at?: string;
          description?: string | null;
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          email_allowlist?: string[];
          exclude_sale_items?: boolean;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_discount_amount?: number | null;
          min_order_amount?: number;
          product_ids?: string[];
          starts_at?: string | null;
          times_used?: number;
          updated_at?: string;
          usage_limit?: number | null;
          usage_limit_per_user?: number | null;
        };
      };
      abandoned_carts: {
        Row: {
          coupon_code: string | null;
          created_at: string;
          customer_email: string | null;
          id: string;
          items: Json;
          last_activity_at: string;
          last_email_sent_at: string | null;
          marketing_opt_in: boolean;
          metadata: Json;
          payment_choice: string | null;
          recovered_at: string | null;
          subtotal_amount: number;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          coupon_code?: string | null;
          created_at?: string;
          customer_email?: string | null;
          id?: string;
          items?: Json;
          last_activity_at?: string;
          last_email_sent_at?: string | null;
          marketing_opt_in?: boolean;
          metadata?: Json;
          payment_choice?: string | null;
          recovered_at?: string | null;
          subtotal_amount?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          coupon_code?: string | null;
          created_at?: string;
          customer_email?: string | null;
          id?: string;
          items?: Json;
          last_activity_at?: string;
          last_email_sent_at?: string | null;
          marketing_opt_in?: boolean;
          metadata?: Json;
          payment_choice?: string | null;
          recovered_at?: string | null;
          subtotal_amount?: number;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      email_automations: {
        Row: {
          audience: 'customer' | 'admin' | 'marketing' | 'internal';
          created_at: string;
          delay_minutes: number;
          enabled: boolean;
          event_key: string;
          filters: Json;
          key: string;
          name: string;
          template_key: string;
          updated_at: string;
        };
        Insert: {
          audience?: 'customer' | 'admin' | 'marketing' | 'internal';
          created_at?: string;
          delay_minutes?: number;
          enabled?: boolean;
          event_key: string;
          filters?: Json;
          key: string;
          name: string;
          template_key: string;
          updated_at?: string;
        };
        Update: {
          audience?: 'customer' | 'admin' | 'marketing' | 'internal';
          created_at?: string;
          delay_minutes?: number;
          enabled?: boolean;
          event_key?: string;
          filters?: Json;
          key?: string;
          name?: string;
          template_key?: string;
          updated_at?: string;
        };
      };
      email_broadcasts: {
        Row: {
          coupon_code: string | null;
          created_at: string;
          created_by: string | null;
          html_template: string;
          id: string;
          name: string;
          scheduled_for: string | null;
          segment_key: string;
          sent_count: number;
          status: 'draft' | 'queued' | 'sent' | 'cancelled';
          subject_template: string;
          text_template: string;
          updated_at: string;
        };
        Insert: {
          coupon_code?: string | null;
          created_at?: string;
          created_by?: string | null;
          html_template: string;
          id?: string;
          name: string;
          scheduled_for?: string | null;
          segment_key?: string;
          sent_count?: number;
          status?: 'draft' | 'queued' | 'sent' | 'cancelled';
          subject_template: string;
          text_template: string;
          updated_at?: string;
        };
        Update: {
          coupon_code?: string | null;
          created_at?: string;
          created_by?: string | null;
          html_template?: string;
          id?: string;
          name?: string;
          scheduled_for?: string | null;
          segment_key?: string;
          sent_count?: number;
          status?: 'draft' | 'queued' | 'sent' | 'cancelled';
          subject_template?: string;
          text_template?: string;
          updated_at?: string;
        };
      };
      email_queue: {
        Row: {
          attempts: number;
          automation_key: string | null;
          created_at: string;
          event_key: string;
          failed_at: string | null;
          html_body: string | null;
          id: string;
          last_error: string | null;
          metadata: Json;
          payload: Json;
          recipient_email: string;
          recipient_user_id: string | null;
          send_after: string;
          sent_at: string | null;
          status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
          subject: string | null;
          template_key: string | null;
          text_body: string | null;
          updated_at: string;
        };
        Insert: {
          attempts?: number;
          automation_key?: string | null;
          created_at?: string;
          event_key: string;
          failed_at?: string | null;
          html_body?: string | null;
          id?: string;
          last_error?: string | null;
          metadata?: Json;
          payload?: Json;
          recipient_email: string;
          recipient_user_id?: string | null;
          send_after?: string;
          sent_at?: string | null;
          status?: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
          subject?: string | null;
          template_key?: string | null;
          text_body?: string | null;
          updated_at?: string;
        };
        Update: {
          attempts?: number;
          automation_key?: string | null;
          created_at?: string;
          event_key?: string;
          failed_at?: string | null;
          html_body?: string | null;
          id?: string;
          last_error?: string | null;
          metadata?: Json;
          payload?: Json;
          recipient_email?: string;
          recipient_user_id?: string | null;
          send_after?: string;
          sent_at?: string | null;
          status?: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
          subject?: string | null;
          template_key?: string | null;
          text_body?: string | null;
          updated_at?: string;
        };
      };
      email_subscribers: {
        Row: {
          created_at: string;
          email: string;
          first_name: string | null;
          last_marketing_email_at: string | null;
          last_name: string | null;
          metadata: Json;
          source: string;
          status: 'subscribed' | 'unsubscribed';
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          first_name?: string | null;
          last_marketing_email_at?: string | null;
          last_name?: string | null;
          metadata?: Json;
          source?: string;
          status?: 'subscribed' | 'unsubscribed';
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          first_name?: string | null;
          last_marketing_email_at?: string | null;
          last_name?: string | null;
          metadata?: Json;
          source?: string;
          status?: 'subscribed' | 'unsubscribed';
          updated_at?: string;
          user_id?: string | null;
        };
      };
      email_templates: {
        Row: {
          audience: 'customer' | 'admin' | 'marketing' | 'internal';
          created_at: string;
          description: string | null;
          html_template: string;
          is_active: boolean;
          is_system: boolean;
          key: string;
          name: string;
          subject_template: string;
          text_template: string;
          updated_at: string;
        };
        Insert: {
          audience?: 'customer' | 'admin' | 'marketing' | 'internal';
          created_at?: string;
          description?: string | null;
          html_template: string;
          is_active?: boolean;
          is_system?: boolean;
          key: string;
          name: string;
          subject_template: string;
          text_template: string;
          updated_at?: string;
        };
        Update: {
          audience?: 'customer' | 'admin' | 'marketing' | 'internal';
          created_at?: string;
          description?: string | null;
          html_template?: string;
          is_active?: boolean;
          is_system?: boolean;
          key?: string;
          name?: string;
          subject_template?: string;
          text_template?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          alt: string | null;
          caption: string | null;
          created_at: string;
          file_name: string;
          file_path: string;
          id: string;
          mime_type: string | null;
          size_bytes: number | null;
          title: string | null;
          updated_at: string;
          url: string;
        };
        Insert: {
          alt?: string | null;
          caption?: string | null;
          created_at?: string;
          file_name: string;
          file_path: string;
          id?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          title?: string | null;
          updated_at?: string;
          url: string;
        };
        Update: {
          alt?: string | null;
          caption?: string | null;
          created_at?: string;
          file_name?: string;
          file_path?: string;
          id?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          title?: string | null;
          updated_at?: string;
          url?: string;
        };
      };
      order_timeline: {
        Row: {
          actor_id: string | null;
          created_at: string;
          entry_type: string;
          id: string;
          is_private: boolean;
          message: string;
          metadata: Json;
          order_id: string;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          entry_type?: string;
          id?: string;
          is_private?: boolean;
          message: string;
          metadata?: Json;
          order_id: string;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          entry_type?: string;
          id?: string;
          is_private?: boolean;
          message?: string;
          metadata?: Json;
          order_id?: string;
        };
      };
      orders: {
        Row: {
          attribution_detail: string | null;
          attribution_source: string | null;
          billing_address: Json | null;
          coupon_code: string | null;
          created_at: string;
          crypto_txid: string | null;
          currency_code: string;
          customer_email: string | null;
          discount_amount: number;
          fulfilled_at: string | null;
          id: string;
          internal_notes: Json | null;
          ip_address: string | null;
          items: Json;
          paid_at: string | null;
          payment_gateway: string | null;
          payment_metadata: Json;
          payment_method: string | null;
          payment_reference: string | null;
          refunded_at: string | null;
          shipping_address: Json | null;
          shipping_amount: number;
          status: OrderStatus;
          subtotal_amount: number;
          tax_amount: number;
          total_amount: number;
          tracking_id: string | null;
          updated_at: string;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          attribution_detail?: string | null;
          attribution_source?: string | null;
          billing_address?: Json | null;
          coupon_code?: string | null;
          created_at?: string;
          crypto_txid?: string | null;
          currency_code?: string;
          customer_email?: string | null;
          discount_amount?: number;
          fulfilled_at?: string | null;
          id?: string;
          internal_notes?: Json | null;
          ip_address?: string | null;
          items?: Json;
          paid_at?: string | null;
          payment_gateway?: string | null;
          payment_metadata?: Json;
          payment_method?: string | null;
          payment_reference?: string | null;
          refunded_at?: string | null;
          shipping_address?: Json | null;
          shipping_amount?: number;
          status?: OrderStatus;
          subtotal_amount?: number;
          tax_amount?: number;
          total_amount: number;
          tracking_id?: string | null;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          attribution_detail?: string | null;
          attribution_source?: string | null;
          billing_address?: Json | null;
          coupon_code?: string | null;
          created_at?: string;
          crypto_txid?: string | null;
          currency_code?: string;
          customer_email?: string | null;
          discount_amount?: number;
          fulfilled_at?: string | null;
          id?: string;
          internal_notes?: Json | null;
          ip_address?: string | null;
          items?: Json;
          paid_at?: string | null;
          payment_gateway?: string | null;
          payment_metadata?: Json;
          payment_method?: string | null;
          payment_reference?: string | null;
          refunded_at?: string | null;
          shipping_address?: Json | null;
          shipping_amount?: number;
          status?: OrderStatus;
          subtotal_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          tracking_id?: string | null;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
      };
      products: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_meta: Json;
          images: string[] | null;
          name: string;
          price: number;
          stock_count: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_meta?: Json;
          images?: string[] | null;
          name: string;
          price: number;
          stock_count?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_meta?: Json;
          images?: string[] | null;
          name?: string;
          price?: number;
          stock_count?: number;
          updated_at?: string;
        };
      };
      request_rate_limits: {
        Row: {
          key: string;
          request_count: number;
          scope: string;
          updated_at: string;
          window_start: string;
        };
        Insert: {
          key: string;
          request_count?: number;
          scope: string;
          updated_at?: string;
          window_start: string;
        };
        Update: {
          key?: string;
          request_count?: number;
          scope?: string;
          updated_at?: string;
          window_start?: string;
        };
      };
      social_proof_campaigns: {
        Row: {
          created_at: string;
          delay_ms: number;
          display_mode: 'live' | 'evergreen' | 'mixed';
          evergreen_pool: Json;
          id: string;
          is_active: boolean;
          link_url: string | null;
          max_interval_ms: number;
          message_template: string;
          min_interval_ms: number;
          name: string;
          page_exclude: string[];
          page_include: string[];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          delay_ms?: number;
          display_mode?: 'live' | 'evergreen' | 'mixed';
          evergreen_pool?: Json;
          id?: string;
          is_active?: boolean;
          link_url?: string | null;
          max_interval_ms?: number;
          message_template?: string;
          min_interval_ms?: number;
          name: string;
          page_exclude?: string[];
          page_include?: string[];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          delay_ms?: number;
          display_mode?: 'live' | 'evergreen' | 'mixed';
          evergreen_pool?: Json;
          id?: string;
          is_active?: boolean;
          link_url?: string | null;
          max_interval_ms?: number;
          message_template?: string;
          min_interval_ms?: number;
          name?: string;
          page_exclude?: string[];
          page_include?: string[];
          updated_at?: string;
        };
      };
      user_admin_roles: {
        Row: {
          assigned_by: string | null;
          created_at: string;
          role_key: string;
          user_id: string;
        };
        Insert: {
          assigned_by?: string | null;
          created_at?: string;
          role_key: string;
          user_id: string;
        };
        Update: {
          assigned_by?: string | null;
          created_at?: string;
          role_key?: string;
          user_id?: string;
        };
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          profile_data: Json | null;
          role: 'admin' | 'customer';
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          profile_data?: Json | null;
          role?: 'admin' | 'customer';
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          profile_data?: Json | null;
          role?: 'admin' | 'customer';
          updated_at?: string;
        };
      };
    };
    Functions: {
      append_order_timeline: {
        Args: {
          p_order_id: string;
          p_entry_type: string;
          p_message: string;
          p_is_private?: boolean;
          p_actor_id?: string;
          p_metadata?: Json;
        };
        Returns: string;
      };
      check_admin_permission: {
        Args: { p_user_id: string; p_action: string; p_resource: string };
        Returns: boolean;
      };
      increment_coupon_times_used: {
        Args: { p_coupon_id: string };
        Returns: undefined;
      };
      increment_product_stock: {
        Args: { p_product_id: string; p_delta: number };
        Returns: undefined;
      };
      is_admin_user: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      reconcile_guest_orders: {
        Args: { p_user_id: string; p_email: string };
        Returns: undefined;
      };
    };
  };
};
