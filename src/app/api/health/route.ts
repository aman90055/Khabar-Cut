import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_request: Request) {
  const { error } = await supabase.from('articles').select('id', { head: true, count: 'exact' });
  const isDatabaseConnected = !error;

  return NextResponse.json({
    status: isDatabaseConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      supabase: isDatabaseConnected ? 'connected' : 'disconnected',
    },
  });
}
