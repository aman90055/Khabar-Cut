import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ data: null }, { status: 401 });
  }

  const dbUser = await prisma.user
    .findUnique({
      where: { authId: user.id },
      include: { role: true },
    })
    .catch(() => null);

  return NextResponse.json({ data: dbUser });
}
