import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Credits Used setting
    const creditsUsedSetting = await prisma.setting.findUnique({
      where: { key: 'ai_credits_used' },
    }).catch(() => null);
    const creditsUsed = Number(creditsUsedSetting?.value) || 0;

    // History logs
    const historySetting = await prisma.setting.findUnique({
      where: { key: 'ai_usage_history' },
    }).catch(() => null);
    const history = Array.isArray(historySetting?.value) ? historySetting.value : [];

    // Prompts setting
    const promptsSetting = await prisma.setting.findUnique({
      where: { key: 'ai_prompt_templates' },
    }).catch(() => null);
    const prompts = promptsSetting?.value || {
      writer: 'You are an award-winning Indian news editor. Draft a structured report matching the style specifications.',
      seo: 'You are a Senior SEO Engineer. Generate meta tags, keyword densities, and canonical targets.',
      translator: 'You are an expert translator. Translate the text exactly preserving journalistic context.',
    };

    // Calculate model usages
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompts } = await request.json();
    if (!prompts) {
      return NextResponse.json({ error: 'Prompts data is required' }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: 'ai_prompt_templates' },
      update: { value: prompts },
      create: {
        key: 'ai_prompt_templates',
        value: prompts,
        group: 'ai',
        description: 'AI prompt template libraries',
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
