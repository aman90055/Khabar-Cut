import { NextResponse } from 'next/server';
import { addEntry } from '@/features/live-blogs/actions';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const entry = await addEntry({
      liveBlogId: id,
      content: body.content,
      entryType: body.entryType || 'update',
      isPinned: body.isPinned || false,
    });

    return NextResponse.json(entry);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
