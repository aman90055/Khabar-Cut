import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json(); // Expected: { question, options: string[], isActive, startDate, endDate }

    if (!body.question || !body.options || body.options.length < 2) {
      return NextResponse.json({ error: 'Question and at least 2 options are required' }, { status: 400 });
    }

    const pollData = {
      question: body.question,
      options: body.options.map((opt: string) => ({ text: opt, votes: 0 })),
      isActive: body.isActive ?? true,
      totalVotes: 0,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
    };

    const settingKey = `poll_${Date.now()}`;
    const now = new Date().toISOString();

    const { data: setting, error } = await supabase
      .from('settings')
      .insert({
        id: crypto.randomUUID(),
        key: settingKey,
        value: pollData,
        group: 'polls',
        description: body.question,
        is_public: true,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: setting });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
