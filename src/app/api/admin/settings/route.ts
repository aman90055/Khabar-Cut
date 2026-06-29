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

    const settings = await prisma.setting.findMany({
      orderBy: { group: 'asc' },
    }).catch(() => []);

    return NextResponse.json({ data: settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: { role: true },
    });

    if (!dbUser || dbUser.role.level > 1) { // CEO or Super Admin only
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json(); // Expected: Record<string, { value: any, group: string, description?: string }>

    const operations = Object.entries(body).map(([key, data]: [string, any]) => {
      return prisma.setting.upsert({
        where: { key },
        create: {
          key,
          value: data.value,
          group: data.group || 'general',
          description: data.description || null,
          isPublic: data.isPublic ?? false,
        },
        update: {
          value: data.value,
        },
      });
    });

    await prisma.$transaction(operations);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
