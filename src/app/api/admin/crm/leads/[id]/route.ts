// =============================================================================
// /api/admin/crm/leads/[id] — Lead update + notes + follow-ups
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  designation: z.string().optional(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EMAIL', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'EVENT', 'PARTNER', 'OTHER']).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'DORMANT']).optional(),
  pipelineStage: z.number().optional(),
  value: z.number().optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
  expectedCloseAt: z.string().datetime().optional(),
  lostReason: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: {
        notes_list: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        followups: { where: { deletedAt: null }, orderBy: { dueAt: 'asc' } },
      },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...lead, value: lead.value ? Number(lead.value) : null },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.status === 'WON' || data.status === 'LOST') {
      updateData.closedAt = new Date();
    }
    if (data.status) {
      updateData.lastContactedAt = new Date();
    }
    if (data.expectedCloseAt) {
      updateData.expectedCloseAt = new Date(data.expectedCloseAt);
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete lead' }, { status: 500 });
  }
}
