import { NextResponse } from 'next/server';
import { updateLiveBlog } from '@/features/live-blogs/actions';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const blog = await updateLiveBlog(id, { id, status });
    return NextResponse.json(blog);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
