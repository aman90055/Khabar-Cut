import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await request.json();

    const systemPrompt = `You are a Principal SEO Architect at Khabar Cut.
Analyze the article title and content. Generate JSON SEO metadata fields.
Do not wrap responses in markdown syntax blocks, output strictly raw parsed JSON containing keys:
"metaTitle", "metaDescription", "focusKeyword", "keywords", "tags", "slug", "seoScore", "readabilityScore", "internalLinkSuggestions"`;

    const userPrompt = `Title: ${title}
Content: ${content || 'Draft content only'}`;

    const res = await AIService.generate(userPrompt, {
      model: 'gemini',
      systemInstruction: systemPrompt,
    });

    // Parse JSON cleanly
    let seoData = {
      metaTitle: `${title} | Khabar Cut`,
      metaDescription: `Read the latest reports on ${title} at Khabar Cut.`,
      focusKeyword: title.split(' ')[0] || 'news',
      keywords: 'news, india, updates',
      tags: ['News', 'India'],
      slug: 'news-report',
      seoScore: 85,
      readabilityScore: 90,
      internalLinkSuggestions: ['/national', '/business'],
    };

    try {
      const cleanJson = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      seoData = { ...seoData, ...parsed };
    } catch {
      // fallback to basic extraction
    }

    return NextResponse.json(seoData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
