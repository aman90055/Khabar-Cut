// =============================================================================
// /api/admin/crm/leads/[id]/notes — Lead notes (call, email, WhatsApp logs)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const noteSchema = z.object({
  authorId: z.string().min(1),
  type: z.enum(['GENERAL', 'CALL', 'EMAIL', 'WHATSAPP', 'MEETING']).default('GENERAL'),
  content: z.string().min(1),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const notes = await prisma.leadNote.findMany({
      where: { leadId: id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = noteSchema.parse(body);

    const note = await prisma.leadNote.create({
      data: { leadId: id, ...data },
    });

    // Update lastContactedAt on the lead
    await prisma.lead.update({
      where: { id },
      data: { lastContactedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create note' }, { status: 500 });
  }
}
