// =============================================================================
// /api/admin/crm/leads — Lead CRM API (Supabase)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const adminSupabase = createAdminClient();

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  source: z.enum(['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EMAIL', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'EVENT', 'PARTNER', 'OTHER']).default('WEBSITE'),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'DORMANT']).default('NEW'),
  pipelineStage: z.number().default(0),
  value: z.number().optional().nullable(),
  currency: z.string().default('INR'),
  assignedTo: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  expectedCloseAt: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    let queryBuilder = adminSupabase
      .from('leads')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }
    if (assignedTo) {
      queryBuilder = queryBuilder.eq('assigned_to', assignedTo);
    }
    if (source) {
      queryBuilder = queryBuilder.eq('source', source);
    }
    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: leads, count, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) {
      console.error('Supabase get leads error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const total = count || 0;

    // Fetch all active leads for pipelineStats aggregation
    const { data: allActiveLeads } = await adminSupabase
      .from('leads')
      .select('status, value')
      .is('deleted_at', null);

    const statsMap: Record<string, { count: number; totalValue: number }> = {};
    for (const lead of allActiveLeads || []) {
      const st = lead.status || 'NEW';
      if (!statsMap[st]) {
        statsMap[st] = { count: 0, totalValue: 0 };
      }
      statsMap[st].count += 1;
      statsMap[st].totalValue += Number(lead.value || 0);
    }

    const pipelineStats = Object.keys(statsMap).map((st) => ({
      status: st,
      count: statsMap[st].count,
      totalValue: statsMap[st].totalValue,
    }));

    // Map rows to both camelCase and snake_case for full frontend compatibility
    const formattedData = (leads || []).map((lead: any) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      designation: lead.designation,
      source: lead.source,
      status: lead.status,
      pipelineStage: lead.pipeline_stage ?? 0,
      pipeline_stage: lead.pipeline_stage ?? 0,
      value: lead.value ? Number(lead.value) : null,
      currency: lead.currency || 'INR',
      assignedTo: lead.assigned_to,
      assigned_to: lead.assigned_to,
      city: lead.city,
      state: lead.state,
      notes: lead.notes,
      tags: lead.tags || [],
      lastContactedAt: lead.last_contacted_at,
      last_contacted_at: lead.last_contacted_at,
      expectedCloseAt: lead.expected_close_at,
      expected_close_at: lead.expected_close_at,
      createdAt: lead.created_at,
      created_at: lead.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      pipelineStats,
    });
  } catch (error: any) {
    console.error('Get leads error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = leadSchema.parse(body);

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();

    const insertPayload: Record<string, any> = {
      id: newId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      designation: data.designation || null,
      source: data.source,
      status: data.status,
      pipeline_stage: data.pipelineStage,
      value: data.value ?? null,
      currency: data.currency,
      assigned_to: data.assignedTo || null,
      tags: data.tags || [],
      city: data.city || null,
      state: data.state || null,
      notes: data.notes || null,
      expected_close_at: data.expectedCloseAt ? new Date(data.expectedCloseAt).toISOString() : null,
      created_at: now,
      updated_at: now,
    };

    const { data: createdLead, error } = await adminSupabase
      .from('leads')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase create lead error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formattedLead = {
      ...createdLead,
      pipelineStage: createdLead.pipeline_stage,
      assignedTo: createdLead.assigned_to,
      createdAt: createdLead.created_at,
    };

    return NextResponse.json({ success: true, data: formattedLead }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Create lead error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create lead' }, { status: 500 });
  }
}
