import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch relevant settings from Supabase
    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['ai_credits_used', 'ai_usage_history', 'ai_prompt_templates']);

    const settingsMap = new Map((settings || []).map((s: any) => [s.key, s.value]));

    const creditsUsed = Number(settingsMap.get('ai_credits_used')) || 0;
    const historyVal = settingsMap.get('ai_usage_history');
    const history = Array.isArray(historyVal) ? historyVal : [];

    const prompts = settingsMap.get('ai_prompt_templates') || {
      writer: 'You are an award-winning Indian news editor. Draft a structured report matching the style specifications.',
      seo: 'You are a Senior SEO Engineer. Generate meta tags, keyword densities, and canonical targets.',
      translator: 'You are an expert translator. Translate the text exactly preserving journalistic context.',
    };

    const modelStats = history.reduce((acc: any, log: any) => {
      acc[log.model] = (acc[log.model] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      creditsUsed,
      creditsLimit: 5000,
      history,
      prompts,
      modelStats,
      modelHealth: {
        gemini: 'Active',
        openai: 'Active',
        claude: 'Active',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const { prompts } = await request.json();

    if (!prompts) {
      return NextResponse.json({ error: 'Prompts data is required' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('key', 'ai_prompt_templates')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('settings')
        .update({
          value: prompts,
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'ai_prompt_templates');
    } else {
      await supabase
        .from('settings')
        .insert({
          key: 'ai_prompt_templates',
          value: prompts,
          group: 'ai',
          description: 'AI prompt template libraries',
        });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
