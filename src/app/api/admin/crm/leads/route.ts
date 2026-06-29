// =============================================================================
// /api/admin/crm/leads — Lead CRM API
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  designation: z.string().optional(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EMAIL', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'EVENT', 'PARTNER', 'OTHER']).default('WEBSITE'),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'DORMANT']).default('NEW'),
  pipelineStage: z.number().default(0),
  value: z.number().optional(),
  currency: z.string().default('INR'),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
  expectedCloseAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          notes_list: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 3 },
          followups: { where: { deletedAt: null, isDone: false }, orderBy: { dueAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    const data = leads.map((lead) => ({
      ...lead,
      value: lead.value ? Number(lead.value) : null,
    }));

    // Pipeline stats
    const pipelineStats = await prisma.lead.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
      _sum: { value: true },
    });

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      pipelineStats: pipelineStats.map((s) => ({
        status: s.status,
        count: s._count,
        totalValue: Number(s._sum.value || 0),
      })),
    });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = leadSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        ...data,
        expectedCloseAt: data.expectedCloseAt ? new Date(data.expectedCloseAt) : undefined,
        tags: data.tags || [],
      },
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create lead error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create lead' }, { status: 500 });
  }
}
