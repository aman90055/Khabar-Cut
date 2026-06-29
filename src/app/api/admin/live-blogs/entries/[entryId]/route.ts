import { NextResponse } from 'next/server';
import { pinEntry, deleteEntry } from '@/features/live-blogs/actions';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const { isPinned } = await request.json();

    const entry = await pinEntry(entryId, isPinned);
    return NextResponse.json(entry);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;

    await deleteEntry(entryId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
