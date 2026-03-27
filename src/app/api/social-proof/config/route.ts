import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Public: active campaign config for the storefront widget. */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('social_proof_campaigns')
    .select(
      'id, name, display_mode, message_template, link_url, delay_ms, min_interval_ms, max_interval_ms, page_include, page_exclude, evergreen_pool'
    )
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ campaign: null });
  }

  return NextResponse.json({ campaign: data });
}
