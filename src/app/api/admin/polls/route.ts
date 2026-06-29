import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json(); // Expected: { question, options: string[], isActive, startDate, endDate }

    if (!body.question || !body.options || body.options.length < 2) {
      return NextResponse.json({ error: 'Question and at least 2 options are required' }, { status: 400 });
    }

    const pollData = {
      question: body.question,
      options: body.options.map((opt: string) => ({ text: opt, votes: 0 })),
      isActive: body.isActive ?? true,
      totalVotes: 0,
      startDate: body.startDate,
      endDate: body.endDate,
    };

    const settingKey = `poll_${Date.now()}`;

    const setting = await prisma.setting.create({
      data: {
        key: settingKey,
        value: pollData,
        group: 'polls',
        description: body.question,
        isPublic: true,
      },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
